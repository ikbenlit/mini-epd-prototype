/**
 * AI Intent Classifier (Fallback)
 *
 * Uses Claude Haiku for intent classification when local classifier
 * has confidence < 0.8. Server-side only.
 */

import { z } from 'zod';
import type { CortexIntent, ExtractedEntities } from './types';
import type { VerpleegkundigCategory } from '@/lib/types/report';

// Zod schema for AI response validation
const AIIntentResponseSchema = z.object({
  intent: z.enum([
    'dagnotitie',
    'zoeken',
    'overdracht',
    'agenda_query',
    'create_appointment',
    'cancel_appointment',
    'reschedule_appointment',
    'unknown',
  ]),
  confidence: z.number().min(0).max(1),
  entities: z.object({
    patientName: z.string().optional(),
    category: z.enum(['medicatie', 'adl', 'gedrag', 'incident', 'observatie']).optional(),
    content: z.string().optional(),
    query: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    identifier: z.string().optional(),
  }).optional(),
  reasoning: z.string().optional(),
});

type AIIntentResponse = z.infer<typeof AIIntentResponseSchema>;

export interface AIClassificationResult {
  intent: CortexIntent;
  confidence: number;
  entities: ExtractedEntities;
  source: 'ai';
  processingTimeMs: number;
  reasoning?: string;
}

const INTENT_CLASSIFIER_SYSTEM_PROMPT = `Je bent een intent classifier voor een Nederlands EPD (Elektronisch Patiënten Dossier) systeem genaamd Cortex.

Je taak is om de intentie van een zorgmedewerker te classificeren in één van deze categorieën:

1. **dagnotitie** - Gebruiker wil een notitie/rapportage maken over een patiënt
   Voorbeelden: "notitie jan medicatie", "marie had een rustige nacht", "schrijf observatie voor piet"

2. **zoeken** - Gebruiker wil een patiënt zoeken of informatie opvragen
   Voorbeelden: "zoek jan", "wie is marie", "dossier van piet"

3. **overdracht** - Gebruiker wil een overdracht/samenvatting van de dienst
   Voorbeelden: "overdracht", "wat moet ik weten", "dienst afronden"

4. **agenda_query** - Gebruiker wil afspraken opvragen of de agenda zien
   Voorbeelden: "afspraken vandaag", "wat is mijn volgende afspraak", "agenda volgende week"

5. **create_appointment** - Gebruiker wil een afspraak maken of plannen
   Voorbeelden: "maak afspraak met jan morgen 14:00", "plan intake volgende week"

6. **cancel_appointment** - Gebruiker wil een afspraak annuleren
   Voorbeelden: "annuleer afspraak jan", "zeg afspraak af"

7. **reschedule_appointment** - Gebruiker wil een afspraak verzetten
   Voorbeelden: "verzet 14:00 naar 15:00", "verplaats afspraak naar dinsdag"

8. **unknown** - Intentie is onduidelijk of past niet in bovenstaande categorieën

Voor dagnotitie, extraheer ook:
- patientName: de naam van de patiënt (indien genoemd)
- category: de categorie (medicatie, adl, gedrag, incident, observatie)
- content: eventuele inhoud van de notitie

Voor zoeken, extraheer:
- patientName: de naam die gezocht wordt

Voor agenda_query, extraheer:
- query: het relevante datum-/tijd-bereik of scope (bijv. "vandaag", "volgende week")
- patientName: de patiëntnaam als die expliciet genoemd is
- date: een expliciete datum als losse waarde (bijv. "2025-01-05")
- time: een expliciete tijd (24-uurs, bijv. "14:00")

Voor create_appointment, extraheer:
- patientName: de patiëntnaam als die expliciet genoemd is
- query: datum/tijd/type/locatie details in vrije tekst (bijv. "morgen 14:00 intake")
- date: een expliciete datum als losse waarde (bijv. "2025-01-05")
- time: een expliciete tijd (24-uurs, bijv. "14:00")

Voor cancel_appointment, extraheer:
- patientName: de patiëntnaam als die expliciet genoemd is
- query: afspraakdetails in vrije tekst (bijv. "afspraak om 14:00", "afspraak van vrijdag")
- identifier: een expliciete afspraak-id indien genoemd

Voor reschedule_appointment, extraheer:
- patientName: de patiëntnaam als die expliciet genoemd is
- query: huidige + nieuwe datum/tijd in vrije tekst (bijv. "14:00 naar 15:00")
- date: de nieuwe expliciete datum indien genoemd
- time: de nieuwe expliciete tijd indien genoemd

Antwoord ALLEEN met een JSON object in dit formaat:
{
  "intent": "dagnotitie" | "zoeken" | "overdracht" | "agenda_query" | "create_appointment" | "cancel_appointment" | "reschedule_appointment" | "unknown",
  "confidence": 0.0-1.0,
  "entities": {
    "patientName": "naam" (optioneel),
    "category": "medicatie" | "adl" | "gedrag" | "incident" | "observatie" (optioneel),
    "content": "inhoud" (optioneel),
    "query": "vrije tekst voor planning" (optioneel),
    "date": "YYYY-MM-DD" (optioneel),
    "time": "HH:MM" (optioneel),
    "identifier": "id" (optioneel)
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

    // Build entities object with backward compatibility
    const entities: ExtractedEntities = {
      patientName: validated.entities?.patientName,
      category: validated.entities?.category as VerpleegkundigCategory | undefined,
      content: validated.entities?.content,
      query: validated.entities?.query,
      // Legacy fields for backward compatibility
      date: validated.entities?.date,
      time: validated.entities?.time,
    };

    // For agenda intents, we'll rely on local entity extraction
    // AI just provides the basic fields (patientName, date, time)
    // and the local extractor will structure them properly

    return {
      intent: validated.intent as CortexIntent,
      confidence: validated.confidence,
      entities,
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
