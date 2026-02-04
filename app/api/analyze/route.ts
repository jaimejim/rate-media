import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { MediaAnalysis, getPerspectiveLabel, getPerspectiveDescription } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { title, level } = await request.json();

    if (!title || typeof level !== 'number' || level < 0 || level > 10) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid request. Title and level (0-10) are required.' },
        { status: 400 }
      );
    }

    const perspectiveLabel = getPerspectiveLabel(level);
    const perspectiveDescription = getPerspectiveDescription(level);

    const prompt = `You are a media content analyst. Analyze the movie or TV show "${title}" from a ${perspectiveDescription}.

Your task:
1. Search for information about "${title}" including its plot, themes, content warnings, and reviews
2. Evaluate the content from the specified perspective (level ${level}/10 where 0=progressive/LGBTQ-friendly and 10=traditional/conservative)
3. Provide a rating from 1-10 where:
   - For levels 0-4 (progressive): Higher scores mean more inclusive/progressive content
   - For levels 5-10 (conservative): Higher scores mean more family-friendly/traditional content

Focus on aspects relevant to the ${perspectiveLabel} viewpoint such as:
${level <= 4 ?
  '- LGBTQ+ representation and positive portrayal\n- Diversity and inclusivity\n- Progressive social messages\n- Challenging traditional norms' :
  '- Traditional family values\n- Religious/moral content\n- Sexual content and violence levels\n- Language appropriateness\n- Messages about marriage, family, and faith'}

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "title": "exact title of the media",
  "type": "movie" or "tv_show",
  "year": "release year if known",
  "summary": "2-3 sentence summary of the content from the specified perspective",
  "rating": number from 1-10,
  "ratingExplanation": "brief explanation of the rating from this perspective",
  "concerns": [
    {"issue": "specific concern", "severity": "low|moderate|high", "details": "brief details"}
  ],
  "positives": ["positive aspect 1", "positive aspect 2"],
  "sources": [
    {"title": "source name", "url": "source url"}
  ]
}

Include 2-4 concerns and 2-4 positives. Include 2-4 real source URLs from your web search.`;

    const response = await anthropic.messages.create({
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
    });

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
    return NextResponse.json(
      { status: 'error', error: 'Failed to analyze media. Please try again.' },
      { status: 500 }
    );
  }
}
