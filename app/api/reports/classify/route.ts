import { NextRequest, NextResponse } from 'next/server';

const CLASSIFICATION_PROMPT = `
Je bent een classificatie-assistent voor een GGZ EPD-systeem.

Classificeer de volgende rapportage als één van deze types:

**Behandeladvies:**
- Bevat een concreet behandelplan of voorstel
- Noemt doelen, interventies, aanpak
- Woorden zoals: "advies", "plan", "traject", "sessies", "behandeling"

**Vrije notitie:**
- Alles wat niet duidelijk een behandeladvies is
- Algemene observaties, opmerkingen, aantekeningen

Return ALLEEN JSON:
{
  "type": "behandeladvies" | "vrije_notitie",
  "confidence": 0.0-1.0,
  "reasoning": "optionele uitleg"
}`;

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || content.length < 20) {
      return NextResponse.json(
        { error: 'Content moet minimaal 20 karakters bevatten' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY ontbreekt' },
        { status: 500 }
      );
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 256,
        temperature: 0,
        system: CLASSIFICATION_PROMPT,
        messages: [
          { role: 'user', content: content.trim() },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      throw new Error(`Claude API error: ${errorBody}`);
    }

    const data = await anthropicResponse.json();
    const rawText = data?.content?.[0]?.text ?? '';
    const parsed = JSON.parse(rawText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('AI classification error:', error);
    return NextResponse.json({
      type: 'vrije_notitie',
      confidence: 0.5,
      reasoning: 'AI classificatie mislukt. Kies handmatig een type.',
    });
  }
}
