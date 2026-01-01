/**
 * Intent Orchestrator (Layer 2)
 *
 * AI-powered intent classification for Cortex V2.
 * Handles complex inputs: multi-intent, context-dependent pronouns, relative time.
 * Uses Claude 3.5 Haiku for intelligent classification.
 *
 * Called when Reflex Arc (Layer 1) escalates due to:
 * - Multi-intent detected (e.g., "zeg jan af en maak notitie")
 * - Context-dependent pronouns (e.g., "maak notitie voor hem")
 * - Relative time expressions (e.g., "plan afspraak morgen")
 * - Low confidence or ambiguous classification
 */

import { z } from 'zod';
import type {
  CortexContext,
  CortexIntent,
  IntentChain,
  ExtractedEntities,
} from './types';

// =============================================================================
// E2.S1 — System Prompt for Orchestrator
// =============================================================================

/**
 * System prompt for the Intent Orchestrator.
 *
 * Key features:
 * - Multi-intent detection (splits "X en Y" into separate actions)
 * - Pronoun resolution (hij/zij → active patient)
 * - Relative time handling (morgen → concrete date)
 * - Confidence scoring with thresholds
 * - JSON-only output format
 */
export const ORCHESTRATOR_SYSTEM_PROMPT = `Je bent de Intent Orchestrator voor Cortex, een Nederlands EPD (Elektronisch Patiënten Dossier) systeem voor GGZ-instellingen.

## Je Taak
Analyseer de gebruikersinput en extraheer ALLE intenties, ook als er meerdere zijn in één zin.
Retourneer altijd valid JSON zonder markdown formatting.

## Context die je krijgt
Je ontvangt context over:
- Actieve patiënt (wie de gebruiker momenteel bekijkt)
- Agenda vandaag (afspraken voor deze dag)
- Recente acties (wat er net is gedaan)
- Huidige weergave (waar in de applicatie)
- Dienst (nacht/ochtend/middag/avond)

## Intent Types

1. **dagnotitie** - Verpleegkundige notitie/rapportage maken
   Entities:
   - patientName: naam van de patiënt
   - patientResolution: 'explicit' | 'context' | 'pronoun'
   - category: 'medicatie' | 'adl' | 'gedrag' | 'incident' | 'observatie'
   - content: inhoud van de notitie
   Voorbeelden: "notitie jan medicatie", "schrijf observatie voor piet"

2. **zoeken** - Patiënt zoeken of informatie opvragen
   Entities:
   - patientName: naam die gezocht wordt
   - query: zoekterm
   Voorbeelden: "zoek jan", "wie is marie"

3. **overdracht** - Dienst overdracht bekijken
   Entities: (geen specifieke entities)
   Voorbeelden: "overdracht", "wat moet ik weten"

4. **agenda_query** - Agenda/afspraken opvragen
   Entities:
   - dateRange: { start, end, label }
   - patientName: specifieke patiënt (optioneel)
   Voorbeelden: "agenda vandaag", "afspraken volgende week"

5. **create_appointment** - Afspraak maken/plannen
   Entities:
   - patientName: patiënt voor de afspraak
   - patientResolution: 'explicit' | 'context' | 'pronoun'
   - date: datum (YYYY-MM-DD)
   - time: tijd (HH:mm)
   - appointmentType: 'intake' | 'behandeling' | 'follow-up' | 'telefonisch' | 'huisbezoek' | 'online' | 'crisis' | 'overig'
   - location: 'praktijk' | 'online' | 'thuis'
   Voorbeelden: "maak afspraak met jan morgen 14:00", "plan intake"

6. **cancel_appointment** - Afspraak annuleren
   Entities:
   - patientName: patiënt van de afspraak
   - patientResolution: 'explicit' | 'context' | 'pronoun'
   - identifier: afspraak-identificatie (tijd, datum, of beide)
   Voorbeelden: "annuleer afspraak jan", "zeg de afspraak van 14:00 af"

7. **reschedule_appointment** - Afspraak verzetten
   Entities:
   - patientName: patiënt van de afspraak
   - identifier: huidige afspraak
   - newDate: nieuwe datum
   - newTime: nieuwe tijd
   Voorbeelden: "verzet 14:00 naar 15:00", "verplaats afspraak naar dinsdag"

## Multi-Intent Detectie
Let op signaalwoorden die meerdere acties aangeven:
- "en" - bijv. "zeg jan af EN maak notitie"
- "daarna" / "dan" - sequentie van acties
- "ook" / "ook nog" - toevoeging
- "eerst" / "vervolgens" - volgorde

Splits deze in aparte actions met oplopende sequence nummers.

## Pronoun Resolution
Gebruik de context om voornaamwoorden op te lossen:
- "hij" / "hem" / "zijn" → actieve mannelijke patiënt
- "zij" / "haar" → actieve vrouwelijke patiënt
- "die afspraak" / "deze afspraak" → meest recente afspraak in context
- "deze patiënt" / "die patiënt" → actieve patiënt

Vul patientResolution in:
- 'explicit': naam expliciet genoemd
- 'context': afgeleid uit huidige weergave/context
- 'pronoun': opgelost via voornaamwoord

## Relatieve Tijd
Los relatieve tijdsaanduidingen op naar concrete datums (gebruik de huidige datum die je krijgt):
- "morgen" → volgende dag
- "overmorgen" → dag na morgen
- "volgende week" → begin volgende week
- "over X dagen" → bereken datum
- "komende maandag" → eerstvolgende maandag

## Confidence Scores
- >= 0.9: Zeer zeker, alle entities duidelijk geëxtraheerd
- 0.7 - 0.9: Redelijk zeker, hoofdintent duidelijk
- 0.5 - 0.7: Onzeker, mogelijk clarificatie nodig
- < 0.5: Onduidelijk, stel clarificationQuestion

## Destructieve Acties
Zet requiresConfirmation=true voor:
- cancel_appointment (annuleren van afspraken)
- Elke actie met potentieel grote impact

## Output Format
Antwoord ALLEEN met valid JSON (geen markdown code blocks, geen uitleg):

{
  "actions": [
    {
      "intent": "cancel_appointment",
      "confidence": 0.92,
      "entities": {
        "patientName": "Jan",
        "patientResolution": "explicit"
      },
      "requiresConfirmation": true,
      "confirmationMessage": "Afspraak van Jan annuleren?"
    },
    {
      "intent": "dagnotitie",
      "confidence": 0.88,
      "entities": {
        "patientName": "Jan",
        "patientResolution": "pronoun",
        "content": "griep"
      },
      "requiresConfirmation": false
    }
  ],
  "reasoning": "Input bevat 'en' wat wijst op twee acties: eerst annuleren, dan notitie maken. 'Hij' verwijst naar Jan uit eerste actie.",
  "needsClarification": false,
  "clarificationQuestion": null,
  "clarificationOptions": null
}

## Clarification
Als de intentie onduidelijk is, vraag om verduidelijking:
{
  "actions": [],
  "reasoning": "Onduidelijk of gebruiker notitie of afspraak bedoelt",
  "needsClarification": true,
  "clarificationQuestion": "Wil je een notitie maken of een afspraak inplannen?",
  "clarificationOptions": ["Notitie maken", "Afspraak inplannen"]
}

## Belangrijke Regels
1. Retourneer ALLEEN JSON, geen markdown code blocks of uitleg
2. Bij twijfel: stel clarificationQuestion met concrete options
3. Behoud volgorde van acties zoals in de input
4. Als er geen actieve patiënt is en er wordt verwezen met "hij/zij", vraag om verduidelijking
5. Elke action moet minimaal intent en confidence hebben
`;

// =============================================================================
// E2.S2 — Context Formatting for AI
// =============================================================================

/** Dutch labels for shift types */
const SHIFT_LABELS: Record<string, string> = {
  nacht: 'nachtdienst',
  ochtend: 'ochtenddienst',
  middag: 'middagdienst',
  avond: 'avonddienst',
};

/** Dutch labels for view types */
const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'patient-detail': 'Patiëntdossier',
  agenda: 'Agenda',
  reports: 'Rapportages',
  chat: 'Chat',
};

/**
 * Format CortexContext into a readable string for the AI prompt.
 *
 * Uses emoji for visual structure and handles null values gracefully.
 * Limits agenda items and recent intents to avoid token bloat.
 *
 * @param context - The CortexContext to format
 * @returns Formatted string for inclusion in AI prompt
 */
export function formatContextForPrompt(context: CortexContext): string {
  const lines: string[] = [];

  // Active patient
  if (context.activePatient) {
    lines.push(
      `🧑 Actieve patiënt: ${context.activePatient.name} (ID: ${context.activePatient.id})`
    );
    if (context.activePatient.recentNotes?.length) {
      const notes = context.activePatient.recentNotes.slice(0, 3);
      lines.push(`   Recente notities: ${notes.join(', ')}`);
    }
    if (context.activePatient.upcomingAppointments?.length) {
      const upcoming = context.activePatient.upcomingAppointments[0];
      const dateStr = upcoming.date.toLocaleDateString('nl-NL', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      lines.push(`   Eerstvolgende afspraak: ${dateStr} (${upcoming.type})`);
    }
  } else {
    lines.push('🧑 Actieve patiënt: Geen');
  }

  // Current view
  const viewLabel = VIEW_LABELS[context.currentView] || context.currentView;
  lines.push(`📍 Huidige weergave: ${viewLabel}`);

  // Time and shift
  const timeStr = context.currentTime.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const shiftLabel = SHIFT_LABELS[context.shift] || context.shift;
  lines.push(`⏰ Tijd: ${timeStr} (${shiftLabel})`);

  // Today's agenda (max 5 items)
  if (context.agendaToday.length > 0) {
    lines.push('📅 Agenda vandaag:');
    const agendaItems = context.agendaToday.slice(0, 5);
    for (const apt of agendaItems) {
      lines.push(`   - ${apt.time}: ${apt.patientName} (${apt.type})`);
    }
    if (context.agendaToday.length > 5) {
      lines.push(`   ... en ${context.agendaToday.length - 5} meer`);
    }
  } else {
    lines.push('📅 Agenda vandaag: Geen afspraken');
  }

  // Recent intents (max 3 items)
  if (context.recentIntents.length > 0) {
    lines.push('🕐 Recente acties:');
    const recentItems = context.recentIntents.slice(0, 3);
    for (const recent of recentItems) {
      const patientPart = recent.patientName ? ` (${recent.patientName})` : '';
      lines.push(`   - ${recent.intent}${patientPart}`);
    }
  }

  return lines.join('\n');
}

// =============================================================================
// E2.S3 — AI Classification with Orchestrator
// =============================================================================

/** Result from AI classification */
export interface AIClassificationResult {
  chain: IntentChain;
  model: string;
  tokensUsed: number;
  processingTimeMs: number;
  needsClarification: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: string[];
}

/** Parsed action from AI response */
interface ParsedAction {
  intent: string;
  confidence: number;
  entities: Record<string, unknown>;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

/** Parsed response from AI */
interface ParsedResponse {
  actions: ParsedAction[];
  reasoning?: string;
  needsClarification: boolean;
  clarificationQuestion?: string | null;
  clarificationOptions?: string[] | null;
}

/**
 * Classify user input using the Intent Orchestrator (Layer 2).
 *
 * Uses Claude 3.5 Haiku for intelligent multi-intent classification.
 * Called when Reflex Arc escalates due to complexity.
 *
 * @param input - User input string
 * @param context - Current application context
 * @returns Classification result with IntentChain
 * @throws Error if API call fails (caller should handle fallback)
 */
export async function classifyWithOrchestrator(
  input: string,
  context: CortexContext
): Promise<AIClassificationResult> {
  const startTime = performance.now();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY ontbreekt in environment');
  }

  // Format context for AI
  const contextPrompt = formatContextForPrompt(context);
  const currentDate = new Date().toISOString().split('T')[0];

  const userMessage = `## Context
${contextPrompt}

## Huidige datum
${currentDate}

## Gebruikersinput
"${input}"

Analyseer en extraheer alle intenties.`;

  // Call Claude API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      temperature: 0, // Deterministic output for consistent parsing
      system: ORCHESTRATOR_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[Orchestrator] Claude API error:', response.status, errorBody);
    throw new Error(`Claude API fout: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.content?.[0]?.text;

  if (!rawText) {
    throw new Error('Geen response van Claude API');
  }

  const processingTimeMs = performance.now() - startTime;
  const tokensUsed =
    (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

  // Parse AI response with Zod validation (E2.S4)
  const parsed = parseAIResponse(rawText);

  // Build IntentChain from parsed actions
  const chain: IntentChain = {
    id: crypto.randomUUID(),
    originalInput: input,
    createdAt: new Date(),
    actions: parsed.actions.map((action, index) => ({
      id: crypto.randomUUID(),
      sequence: index + 1,
      intent: action.intent as CortexIntent,
      confidence: action.confidence,
      entities: action.entities as ExtractedEntities,
      status: 'pending' as const,
      requiresConfirmation: action.requiresConfirmation || false,
      confirmationMessage: action.confirmationMessage,
    })),
    status: 'pending',
    meta: {
      source: 'ai',
      processingTimeMs,
      aiReasoning: parsed.reasoning,
    },
  };

  return {
    chain,
    model: 'claude-3-5-haiku-20241022',
    tokensUsed,
    processingTimeMs,
    needsClarification: parsed.needsClarification,
    clarificationQuestion: parsed.clarificationQuestion || undefined,
    clarificationOptions: parsed.clarificationOptions || undefined,
  };
}

// =============================================================================
// E2.S4 — IntentChain Parsing with Zod Validation
// =============================================================================

/** Valid intent types for Zod schema */
const VALID_INTENTS = [
  'dagnotitie',
  'zoeken',
  'overdracht',
  'agenda_query',
  'create_appointment',
  'cancel_appointment',
  'reschedule_appointment',
  'unknown',
] as const;

/** Valid categories for dagnotitie */
const VALID_CATEGORIES = [
  'medicatie',
  'adl',
  'gedrag',
  'incident',
  'observatie',
] as const;

/** Valid patient resolution types */
const VALID_RESOLUTIONS = ['explicit', 'context', 'pronoun'] as const;

/** Zod schema for entities in an action */
const EntitiesSchema = z
  .object({
    patientName: z.string().optional(),
    patientId: z.string().optional(),
    patientResolution: z.enum(VALID_RESOLUTIONS).optional(),
    category: z.enum(VALID_CATEGORIES).optional(),
    content: z.string().optional(),
    query: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    identifier: z.string().optional(),
    newDate: z.string().optional(),
    newTime: z.string().optional(),
    appointmentType: z.string().optional(),
    location: z.string().optional(),
  })
  .passthrough(); // Allow additional fields

/** Zod schema for a single action */
const ActionSchema = z.object({
  intent: z.enum(VALID_INTENTS).catch('unknown'),
  confidence: z.number().min(0).max(1).catch(0.5),
  entities: EntitiesSchema.optional().default({}),
  requiresConfirmation: z.boolean().optional().default(false),
  confirmationMessage: z.string().optional(),
});

/** Zod schema for the complete AI response */
const AIResponseSchema = z.object({
  actions: z.array(ActionSchema).min(1).catch([
    { intent: 'unknown' as const, confidence: 0, entities: {}, requiresConfirmation: false },
  ]),
  reasoning: z.string().optional(),
  needsClarification: z.boolean().optional().default(false),
  clarificationQuestion: z.string().nullable().optional(),
  clarificationOptions: z.array(z.string()).nullable().optional(),
});

/** Type inferred from Zod schema */
type AIResponseType = z.infer<typeof AIResponseSchema>;

/**
 * Strip markdown code blocks from AI response.
 *
 * @param text - Raw text that may contain markdown
 * @returns Clean JSON text
 */
function stripMarkdownCodeBlocks(text: string): string {
  let cleaned = text.trim();

  // Remove ```json prefix
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  // Remove ``` suffix
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

/**
 * Parse AI response with Zod validation.
 *
 * Handles edge cases:
 * - Markdown code blocks (```json ... ```)
 * - Invalid JSON (returns fallback)
 * - Missing required fields (uses defaults)
 * - Unknown intent types (maps to 'unknown')
 *
 * @param rawText - Raw text from Claude API
 * @returns Validated and parsed response
 */
export function parseAIResponse(rawText: string): ParsedResponse {
  const jsonText = stripMarkdownCodeBlocks(rawText);

  // Try to parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    console.error(
      '[Orchestrator] JSON parse error:',
      error instanceof Error ? error.message : error,
      'Raw text:',
      jsonText.slice(0, 200)
    );
    return createFallbackResponse('JSON parse error');
  }

  // Validate with Zod schema
  const validation = AIResponseSchema.safeParse(parsed);

  if (!validation.success) {
    console.error(
      '[Orchestrator] Zod validation failed:',
      validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    );

    // Try partial extraction if actions array exists
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'actions' in parsed &&
      Array.isArray((parsed as { actions: unknown }).actions)
    ) {
      return extractPartialResponse(parsed as { actions: unknown[] });
    }

    return createFallbackResponse('Schema validation failed');
  }

  return mapToParseResponse(validation.data);
}

/**
 * Extract partial response when full validation fails.
 * Attempts to salvage valid actions from malformed response.
 */
function extractPartialResponse(parsed: { actions: unknown[] }): ParsedResponse {
  const validActions: ParsedAction[] = [];

  for (const action of parsed.actions) {
    const actionValidation = ActionSchema.safeParse(action);
    if (actionValidation.success) {
      validActions.push({
        intent: actionValidation.data.intent,
        confidence: actionValidation.data.confidence,
        entities: actionValidation.data.entities,
        requiresConfirmation: actionValidation.data.requiresConfirmation,
        confirmationMessage: actionValidation.data.confirmationMessage,
      });
    }
  }

  if (validActions.length === 0) {
    return createFallbackResponse('No valid actions found');
  }

  return {
    actions: validActions,
    reasoning: (parsed as { reasoning?: string }).reasoning,
    needsClarification: false,
  };
}

/**
 * Map validated Zod response to ParsedResponse interface.
 */
function mapToParseResponse(data: AIResponseType): ParsedResponse {
  return {
    actions: data.actions.map((a) => ({
      intent: a.intent,
      confidence: a.confidence,
      entities: a.entities,
      requiresConfirmation: a.requiresConfirmation,
      confirmationMessage: a.confirmationMessage,
    })),
    reasoning: data.reasoning,
    needsClarification: data.needsClarification,
    clarificationQuestion: data.clarificationQuestion,
    clarificationOptions: data.clarificationOptions,
  };
}

/**
 * Create fallback response when parsing fails.
 */
function createFallbackResponse(reason: string): ParsedResponse {
  return {
    actions: [{ intent: 'unknown', confidence: 0, entities: {} }],
    reasoning: reason,
    needsClarification: false,
  };
}

// =============================================================================
// E2.S6 — Graceful Fallback
// =============================================================================

import type { LocalClassificationResult } from './types';

/** Default timeout for AI calls (5 seconds) */
export const AI_TIMEOUT_MS = 5000;

/** Confidence cap when falling back to Reflex result */
export const FALLBACK_CONFIDENCE_CAP = 0.6;

/**
 * Build fallback IntentChain when AI fails.
 *
 * Uses Reflex result as best-effort classification with capped confidence.
 * Called when:
 * - Anthropic API returns error (503, timeout, etc.)
 * - JSON parsing fails
 * - Any unexpected error during AI classification
 *
 * @param input - Original user input
 * @param reflexResult - Result from Reflex Arc classification
 * @returns IntentChain with single action from Reflex result
 */
export function buildFallbackChain(
  input: string,
  reflexResult: LocalClassificationResult
): IntentChain {
  return {
    id: crypto.randomUUID(),
    originalInput: input,
    createdAt: new Date(),
    actions:
      reflexResult.intent !== 'unknown'
        ? [
            {
              id: crypto.randomUUID(),
              sequence: 1,
              intent: reflexResult.intent,
              confidence: Math.min(
                reflexResult.confidence,
                FALLBACK_CONFIDENCE_CAP
              ),
              entities: {} as ExtractedEntities,
              status: 'pending',
              requiresConfirmation: false,
            },
          ]
        : [],
    status: reflexResult.intent !== 'unknown' ? 'pending' : 'failed',
    meta: {
      source: 'local',
      processingTimeMs: reflexResult.processingTimeMs,
      aiReasoning: 'AI onbeschikbaar - teruggevallen op lokale classificatie',
    },
  };
}

/**
 * Build simple IntentChain from Reflex result.
 *
 * Used when Reflex handles the classification without escalation.
 *
 * @param input - Original user input
 * @param result - Result from Reflex Arc classification
 * @returns IntentChain with single action
 */
export function buildChainFromReflex(
  input: string,
  result: LocalClassificationResult
): IntentChain {
  return {
    id: crypto.randomUUID(),
    originalInput: input,
    createdAt: new Date(),
    actions:
      result.intent !== 'unknown'
        ? [
            {
              id: crypto.randomUUID(),
              sequence: 1,
              intent: result.intent,
              confidence: result.confidence,
              entities: {} as ExtractedEntities,
              status: 'pending',
              requiresConfirmation: false,
            },
          ]
        : [],
    status: result.intent !== 'unknown' ? 'pending' : 'failed',
    meta: {
      source: 'local',
      processingTimeMs: result.processingTimeMs,
    },
  };
}

/**
 * Wrapper for classifyWithOrchestrator with timeout protection.
 *
 * Ensures AI classification doesn't hang indefinitely.
 * On timeout, caller should use buildFallbackChain.
 *
 * @param input - User input to classify
 * @param context - Current application context
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns Classification result or throws on timeout/error
 */
export async function classifyWithTimeout(
  input: string,
  context: CortexContext,
  timeoutMs: number = AI_TIMEOUT_MS
): Promise<AIClassificationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Note: The actual fetch in classifyWithOrchestrator doesn't use this signal yet
    // This wrapper provides the timeout structure for future enhancement
    const result = await Promise.race([
      classifyWithOrchestrator(input, context),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`AI classificatie timeout na ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);

    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('[Orchestrator] Request timed out after', timeoutMs, 'ms');
    }

    throw error; // Re-throw for caller to handle fallback
  }
}
