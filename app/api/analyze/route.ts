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
1. Search for information about "${title}" including plot, themes, reviews, AND any controversies or cultural discourse surrounding it
2. Analyze BOTH the on-screen content AND the meta-level context:
   - ON-SCREEN: What happens in the story, characters, themes, explicit content
   - META/SUBTEXT: Casting decisions, production choices, cultural messaging, industry politics, public controversies, what critics and audiences from this perspective have said
3. Provide a rating from 1-10 where:
   - For levels 0-4 (progressive): Higher scores mean more inclusive/progressive content
   - For levels 5-10 (conservative): Higher scores mean more family-friendly/traditional content

Focus on aspects relevant to the ${perspectiveLabel} viewpoint:

ON-SCREEN CONTENT:
${level <= 4 ?
  '- LGBTQ+ characters and relationships\n- Diverse casting and representation\n- Progressive themes and messages\n- Subversion of traditional gender roles' :
  '- Traditional family structures\n- Religious or moral messaging\n- Sexual content, violence, language\n- Respect for traditional values'}

META/SUBTEXT (equally important):
${level <= 4 ?
  '- Hiring of diverse cast/crew\n- Studio support for progressive causes\n- Breaking industry barriers\n- Cultural impact on representation' :
  '- Race-swapping from source material\n- Perceived political agenda in casting/writing\n- Changes made for "diversity" over story\n- Controversy and backlash from traditional audiences\n- Actor/director political statements'}

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "title": "exact title of the media",
  "type": "movie" or "tv_show",
  "year": "release year if known",
  "summary": "2-3 sentences covering BOTH the story content AND the meta/cultural context from this perspective",
  "rating": number from 1-10,
  "ratingExplanation": "brief explanation considering both content and subtext",
  "concerns": [
    {"issue": "specific concern", "severity": "low|moderate|high", "details": "brief details"}
  ],
  "positives": ["positive aspect 1", "positive aspect 2"],
  "sources": [
    {"title": "source name", "url": "source url"}
  ]
}

Include 2-4 concerns (mix of on-screen and meta issues) and 2-4 positives. Include 2-4 real source URLs.`;

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
