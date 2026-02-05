import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { MediaAnalysis, getPerspectiveLabel, getPerspectiveDescription } from '@/lib/types';
import { findSeedData } from '@/lib/seedData';

export const runtime = 'nodejs';
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isRateLimit = lastError.message?.includes('429') ||
                          lastError.message?.includes('rate') ||
                          lastError.message?.includes('overloaded');

      // Only retry on rate limits or overloaded errors
      if (!isRateLimit || attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const { title, level } = await request.json();

    if (!title || typeof level !== 'number' || level < 0 || level > 10) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid request. Title and level (0-10) are required.' },
        { status: 400 }
      );
    }

    // Check seed data first (for pre-populated popular titles)
    const seeded = findSeedData(title, level);
    if (seeded) {
      console.log(`Serving seed data for: ${title} at level ${level}`);
      return NextResponse.json({ status: 'success', data: seeded });
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

    // Parse JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.substring(0, 500));
      return NextResponse.json(
        { status: 'error', error: `JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown'}. Check server logs.` },
        { status: 500 }
      );
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
