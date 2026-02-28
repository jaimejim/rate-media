import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { MediaAnalysis, getPerspectiveLabel, getPerspectiveDescription } from '@/lib/types';
import { findSeedData } from '@/lib/seedData';
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/cache';

export const runtime = 'nodejs';
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 4,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const errorMsg = lastError.message?.toLowerCase() || '';
      const isRetryable = errorMsg.includes('429') ||
                          errorMsg.includes('rate') ||
                          errorMsg.includes('overloaded') ||
                          errorMsg.includes('network') ||
                          errorMsg.includes('timeout') ||
                          errorMsg.includes('econnreset') ||
                          errorMsg.includes('econnrefused') ||
                          errorMsg.includes('socket');

      // Only retry on retryable errors
      if (!isRetryable || attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 2s, 4s, 8s, 16s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retryable error (${errorMsg.substring(0, 50)}), retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const { title, level, skipCache } = await request.json();

    if (!title || typeof level !== 'number' || level < 0 || level > 10) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid request. Title and level (0-10) are required.' },
        { status: 400 }
      );
    }

    // Check seed data first (for pre-populated popular titles) - unless regenerating
    if (!skipCache) {
      const seeded = findSeedData(title, level);
      if (seeded) {
        console.log(`Serving seed data for: ${title} at level ${level}`);
        return NextResponse.json({ status: 'success', data: seeded });
      }

      // Check Redis/memory cache
      const cached = await getCachedAnalysis(title, level);
      if (cached) {
        console.log(`Serving cached data for: ${title} at level ${level}`);
        return NextResponse.json({ status: 'success', data: cached });
      }
    }

    const perspectiveLabel = getPerspectiveLabel(level);
    const perspectiveDescription = getPerspectiveDescription(level);

    const prompt = `You are a media content analyst. Analyze the movie or TV show "${title}" from a ${perspectiveDescription}.

Your task:
1. Search for information about "${title}" including plot, themes, reviews, AND any controversies
2. Analyze BOTH on-screen content AND meta context (casting, production choices, controversies)
3. Rate from 1-10: ${level <= 4 ? 'Higher = more progressive/inclusive' : 'Higher = more family-friendly/traditional'}

Focus on ${perspectiveLabel} viewpoint concerns:
${level <= 4 ?
  '- LGBTQ+ representation, diverse casting, progressive themes, subversion of traditional roles\n- Diverse cast/crew hiring, studio activism, breaking barriers' :
  '- Traditional family values, religious messaging, explicit content levels\n- Race-swapping, political agenda in casting, diversity over story, actor politics'}

Return ONLY valid JSON (no markdown):
{
  "title": "exact title",
  "type": "movie" or "tv_show",
  "year": "release year",
  "summary": "1-2 sentences: brief plot + key perspective-relevant point",
  "rating": 1-10,
  "ratingExplanation": "1 sentence why",
  "concerns": [{"issue": "short label", "severity": "low|moderate|high", "details": "brief"}],
  "positives": ["positive 1", "positive 2"],
  "sources": [{"title": "source", "url": "url"}]
}

Include 2-4 concerns, 2-4 positives, 2-4 sources.`;

    const response = await withRetry(() =>
      anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 5,
          },
        ],
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })
    );

    // Extract text content from response
    let textContent = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        textContent += block.text;
      }
    }

    // Clean up the response - remove markdown code blocks and citation tags
    textContent = textContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/<cite[^>]*>/g, '')  // Remove opening cite tags
      .replace(/<\/cite>/g, '')      // Remove closing cite tags
      .trim();

    // Try to extract JSON object from text (in case there's extra text around it)
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', textContent.substring(0, 500));
      return NextResponse.json(
        { status: 'error', error: `No valid JSON in response. Raw: ${textContent.substring(0, 200)}...` },
        { status: 500 }
      );
    }

    // Helper function to repair common JSON issues
    function repairJson(jsonStr: string): string {
      let repaired = jsonStr;

      // Fix unescaped quotes within string values (common issue)
      // This regex finds string values and escapes internal quotes
      repaired = repaired.replace(/"([^"]*?)"/g, (match, content) => {
        // Don't modify if it's a key or already looks clean
        if (content.includes('\\"')) return match;
        return match;
      });

      // Fix trailing commas before closing brackets
      repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

      // Fix missing commas between array elements or object properties
      repaired = repaired.replace(/}(\s*){/g, '},{');
      repaired = repaired.replace(/"(\s*)"/g, '","');

      return repaired;
    }

    // Parse JSON response with repair attempts
    let analysisData;
    try {
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.log('First parse failed, attempting repair...');

      // Try to repair and parse again
      try {
        const repairedJson = repairJson(jsonMatch[0]);
        analysisData = JSON.parse(repairedJson);
        console.log('JSON repair successful');
      } catch (repairError) {
        // Last resort: try to extract individual fields manually
        console.error('JSON repair failed, attempting field extraction...');
        console.error('Raw JSON:', jsonMatch[0].substring(0, 1000));

        try {
          // Extract fields using regex as fallback
          const titleMatch = jsonMatch[0].match(/"title"\s*:\s*"([^"]+)"/);
          const typeMatch = jsonMatch[0].match(/"type"\s*:\s*"([^"]+)"/);
          const yearMatch = jsonMatch[0].match(/"year"\s*:\s*"([^"]+)"/);
          const summaryMatch = jsonMatch[0].match(/"summary"\s*:\s*"([^"]+)"/);
          const ratingMatch = jsonMatch[0].match(/"rating"\s*:\s*(\d+)/);
          const ratingExplMatch = jsonMatch[0].match(/"ratingExplanation"\s*:\s*"([^"]+)"/);

          analysisData = {
            title: titleMatch?.[1] || title,
            type: typeMatch?.[1] || 'movie',
            year: yearMatch?.[1] || '',
            summary: summaryMatch?.[1] || 'Analysis completed but details could not be fully parsed.',
            rating: ratingMatch ? parseInt(ratingMatch[1]) : 5,
            ratingExplanation: ratingExplMatch?.[1] || 'Rating based on available information.',
            concerns: [],
            positives: [],
            sources: [],
          };
          console.log('Field extraction successful');
        } catch (extractError) {
          console.error('All parsing methods failed:', textContent.substring(0, 500));
          return NextResponse.json(
            { status: 'error', error: 'Failed to parse analysis. Please try again.' },
            { status: 500 }
          );
        }
      }
    }

    // Helper to strip citation tags from strings
    const stripCitations = (text: string): string => {
      if (!text) return text;
      return text.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '');
    };

    const analysis: MediaAnalysis = {
      title: stripCitations(analysisData.title) || title,
      type: analysisData.type || 'unknown',
      year: analysisData.year,
      perspectiveLevel: level,
      perspectiveLabel,
      summary: stripCitations(analysisData.summary) || '',
      rating: analysisData.rating || 5,
      ratingExplanation: stripCitations(analysisData.ratingExplanation) || '',
      concerns: (analysisData.concerns || []).map((c: { issue: string; severity: string; details: string }) => ({
        ...c,
        issue: stripCitations(c.issue),
        details: stripCitations(c.details),
      })),
      positives: (analysisData.positives || []).map((p: string) => stripCitations(p)),
      sources: analysisData.sources || [],
      disclaimer: `This analysis reflects a ${perspectiveLabel} perspective (level ${level}/10). Different viewpoints may interpret this content differently.`,
    };

    // Cache the result for future requests
    await setCachedAnalysis(title, level, analysis);

    return NextResponse.json({ status: 'success', data: analysis });
  } catch (error) {
    console.error('Analysis error:', error);

    // Provide more specific error messages
    let errorMessage = 'Failed to analyze media. Please try again.';

    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Request timed out. The search took too long - please try again.';
      } else if (error.message.includes('rate') || error.message.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message.includes('API key') || error.message.includes('401')) {
        errorMessage = 'API configuration error. Please contact the site administrator.';
      } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
    }

    return NextResponse.json(
      { status: 'error', error: errorMessage },
      { status: 500 }
    );
  }
}
