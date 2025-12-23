/**
 * AI Intent Classifier (Fallback)
 *
 * Uses Claude Haiku for intent classification when local classifier
 * has confidence < 0.8. Server-side only.
 */

import { z } from 'zod';
import type { SwiftIntent, ExtractedEntities } from './types';
import type { VerpleegkundigCategory } from '@/lib/types/report';

// Zod schema for AI response validation
const AIIntentResponseSchema = z.object({
  intent: z.enum(['dagnotitie', 'zoeken', 'overdracht', 'unknown']),
  confidence: z.number().min(0).max(1),
  entities: z.object({
    patientName: z.string().optional(),
    category: z.enum(['medicatie', 'adl', 'gedrag', 'incident', 'observatie']).optional(),
    content: z.string().optional(),
  }).optional(),
  reasoning: z.string().optional(),
});

type AIIntentResponse = z.infer<typeof AIIntentResponseSchema>;

export interface AIClassificationResult {
  intent: SwiftIntent;
  confidence: number;
  entities: ExtractedEntities;
  source: 'ai';
  processingTimeMs: number;
  reasoning?: string;
}

const INTENT_CLASSIFIER_SYSTEM_PROMPT = `Je bent een intent classifier voor een Nederlands EPD (Elektronisch Patiënten Dossier) systeem genaamd Swift.

Je taak is om de intentie van een zorgmedewerker te classificeren in één van deze categorieën:

1. **dagnotitie** - Gebruiker wil een notitie/rapportage maken over een patiënt
   Voorbeelden: "notitie jan medicatie", "marie had een rustige nacht", "schrijf observatie voor piet"

2. **zoeken** - Gebruiker wil een patiënt zoeken of informatie opvragen
   Voorbeelden: "zoek jan", "wie is marie", "dossier van piet"

3. **overdracht** - Gebruiker wil een overdracht/samenvatting van de dienst
   Voorbeelden: "overdracht", "wat moet ik weten", "dienst afronden"

4. **unknown** - Intentie is onduidelijk of past niet in bovenstaande categorieën

Voor dagnotitie, extraheer ook:
- patientName: de naam van de patiënt (indien genoemd)
- category: de categorie (medicatie, adl, gedrag, incident, observatie)
- content: eventuele inhoud van de notitie

Voor zoeken, extraheer:
- patientName: de naam die gezocht wordt

Antwoord ALLEEN met een JSON object in dit formaat:
{
  "intent": "dagnotitie" | "zoeken" | "overdracht" | "unknown",
  "confidence": 0.0-1.0,
  "entities": {
    "patientName": "naam" (optioneel),
    "category": "medicatie" | "adl" | "gedrag" | "incident" | "observatie" (optioneel),
    "content": "inhoud" (optioneel)
  },
  "reasoning": "korte uitleg" (optioneel)
}`;

/**
 * Classify user input using Claude Haiku AI.
 * Should only be called server-side (API routes).
 */
export async function classifyIntentWithAI(input: string): Promise<AIClassificationResult> {
  const startTime = performance.now();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY ontbreekt in environment');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 256,
        temperature: 0,
        system: INTENT_CLASSIFIER_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Classificeer deze input: "${input}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Claude API error:', errorBody);
      throw new Error(`Claude API fout: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.content?.[0]?.text;

    if (!rawText) {
      throw new Error('Geen response van Claude API');
    }

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonText = rawText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }

    const parsed = JSON.parse(jsonText.trim());
    const validated = AIIntentResponseSchema.parse(parsed);

    const processingTimeMs = performance.now() - startTime;

    return {
      intent: validated.intent as SwiftIntent,
      confidence: validated.confidence,
      entities: {
        patientName: validated.entities?.patientName,
        category: validated.entities?.category as VerpleegkundigCategory | undefined,
        content: validated.entities?.content,
      },
      source: 'ai',
      processingTimeMs,
      reasoning: validated.reasoning,
    };
  } catch (error) {
    const processingTimeMs = performance.now() - startTime;

    // If AI fails, return unknown with low confidence
    console.error('AI classification error:', error);

    return {
      intent: 'unknown',
      confidence: 0,
      entities: {},
      source: 'ai',
      processingTimeMs,
    };
  }
}

/**
 * Check if we should use AI fallback based on local classification result.
 */
export function shouldUseAIFallback(localConfidence: number): boolean {
  return localConfidence < 0.8;
}
