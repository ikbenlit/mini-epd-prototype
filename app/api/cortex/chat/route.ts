/**
 * Cortex Chat API Route (v3.0)
 *
 * Streaming chat endpoint voor Cortex Assistent met Server-Sent Events (SSE).
 *
 * Epic: E3 (Chat API & Cortex Assistent)
 * Story: E3.S1 (Chat API endpoint skeleton)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/server';
import type { ChatMessage as ChatMessageType, ChatAction } from '@/stores/cortex-store';

// Configuration
const CORTEX_MODEL = process.env.CORTEX_MODEL ?? 'claude-sonnet-4-20250514';
const MAX_HISTORY_MESSAGES = 20;
const MAX_USER_MESSAGE_LENGTH = 2000;

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // max requests per window

// In-memory rate limit store (resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(userId);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetIn: record.resetTime - now };
}

// Request validation schemas
const ChatMessageSchema = z.object({
  id: z.string(),
  type: z.enum(['user', 'assistant', 'system', 'error']),
  content: z.string().min(1),
  timestamp: z.string().or(z.date()),
  action: z.any().optional(), // ChatAction is optional
});

const RequestSchema = z.object({
  message: z.string().min(1).max(MAX_USER_MESSAGE_LENGTH),
  messages: z.array(ChatMessageSchema).optional(),
  context: z.object({
    activePatient: z.object({
      id: z.string(),
      first_name: z.string(),
      last_name: z.string(),
    }).optional().nullable(),
    shift: z.enum(['nacht', 'ochtend', 'middag', 'avond']),
  }).optional(),
});

type RequestData = z.infer<typeof RequestSchema>;

/**
 * Build Cortex Assistent system prompt (E3.S3)
 * Full prompt with intent detection, entity extraction, and action generation
 */
function buildSystemPrompt(context?: RequestData['context']): string {
  // Build context section
  const patientContext = context?.activePatient
    ? `{
  "id": "${context.activePatient.id}",
  "name": "${context.activePatient.first_name} ${context.activePatient.last_name}",
  "firstName": "${context.activePatient.first_name}",
  "lastName": "${context.activePatient.last_name}"
}`
    : 'null';

  const shiftContext = context?.shift ?? 'ochtend';

  return `Je bent Cortex Assistent, een medische assistent voor Cortex EPD, een Nederlands EPD-systeem voor GGZ-instellingen.

## Je rol

Je helpt zorgmedewerkers (verpleegkundigen, psychiaters, behandelaren) met documentatie en administratie tijdens hun dagelijkse werk.

### Kernkwaliteiten:
- **Natuurlijk Nederlands**: Je spreekt vloeiend, informeel maar professioneel Nederlands
- **Begrijpend**: Je begrijpt context en kan doorvragen
- **Efficiënt**: Je helpt snel zonder onnodige uitleg
- **Betrouwbaar**: Je maakt geen aannames, maar vraagt bij twijfel

### Tone of voice:
- Vriendelijk en behulpzaam (zoals een collega)
- Professioneel en respectvol
- Kort en to-the-point (geen lange uitleg)
- Empatisch voor werkdruk zorgmedewerkers

## BELANGRIJK: Datum/Tijd Handling

**Stuur ALLEEN labels, GEEN datums!** De client berekent de exacte datum zelf.

Toegestane labels:
- "vandaag", "morgen", "overmorgen"
- "deze week", "volgende week"
- "maandag", "dinsdag", etc. (weekdagen)

Voorbeeld datetime entity:
\`\`\`json
{
  "datetime": {
    "label": "morgen",
    "time": "14:00"
  }
}
\`\`\`

**NOOIT** een "date" veld met een ISO-datum string sturen. De client bepaalt de datum op basis van het label.

## Wat je DOET

### 1. Intents herkennen

Je herkent de volgende gebruikersintenties en voert acties uit:

**P1 Intents (kritiek, hoogfrequent):**

- **dagnotitie** — Verpleegkundige wil snelle notitie maken
  - Triggers: "notitie [patient]", "medicatie gegeven", "[patient] heeft...", "incident bij [patient]"
  - Entities: patientName (naam), category (medicatie/adl/gedrag/incident/observatie), content (tekst)

- **zoeken** — Gebruiker zoekt patiënt
  - Triggers: "zoek [naam]", "wie is [naam]", "vind [naam]", "patient [naam]"
  - Entities: query (zoekterm)

- **overdracht** — Dienst overdracht maken
  - Triggers: "overdracht", "dienst overdracht", "maak overdracht", "wat moet ik weten"
  - Entities: shift (optioneel: ochtend/middag/avond/nacht)

**P2 Intents (belangrijk, middenfrequent):**

- **rapportage** — Behandelrapportage schrijven
  - Triggers: "rapportage", "gesprek gehad", "behandelgesprek", "evaluatie"
  - Entities: patientName (naam), type (optioneel: gesprek/evaluatie/consult)

- **agenda_query** — Afspraken opvragen
  - Triggers: "afspraken vandaag", "agenda morgen", "wat is mijn volgende afspraak", "afspraken deze week"
  - Entities: dateRange (alleen label: "vandaag"/"morgen"/"deze week"/"volgende week" — GEEN datums!)
  - Actie: Toon lijst van afspraken in AgendaBlock

- **create_appointment** — Nieuwe afspraak maken
  - Triggers: "maak afspraak [patient]", "plan intake [patient]", "afspraak maken met [patient] [datum] [tijd]"
  - Entities: patientName (naam), datetime (label + tijd), appointmentType (intake/behandeling/follow-up/telefonisch/huisbezoek/online/crisis), location (praktijk/online/thuis)
  - Required: patientName OF patientId, datetime
  - Optional: appointmentType (default: behandeling), location (default: praktijk)
  - Actie: Open create form met pre-fill

- **cancel_appointment** — Afspraak annuleren
  - Triggers: "annuleer afspraak [patient]", "cancel [tijd]", "afspraak van [patient] annuleren"
  - Entities: identifier (patient naam/tijd combinatie voor matching)
  - Actie: Toon confirmation dialog, bij meerdere matches: disambiguation

- **reschedule_appointment** — Afspraak verzetten
  - Triggers: "verzet afspraak [patient]", "verzet [oude tijd] naar [nieuwe tijd]", "[patient] naar [nieuwe datum]"
  - Entities: identifier (patient naam/tijd voor matching), newDatetime (nieuwe datum + tijd)
  - Required: identifier
  - Actie: Toon edit form met oude en nieuwe tijd

### 2. Verduidelijkingsvragen stellen

Als je twijfelt over de intent of belangrijke informatie mist:

**Vraag om verduidelijking:**
- "Met welke patiënt had je het gesprek?" (patient ontbreekt)
- "Wil je een notitie maken of de overdracht bekijken?" (intent onduidelijk)
- "Bedoel je Jan de Vries of Jan Bakker?" (meerdere matches)
- "Voor welke datum wil je de afspraak maken?" (datum ontbreekt bij create_appointment)
- "Op welk tijdstip?" (tijd ontbreekt bij create_appointment)
- "Welke afspraak wil je verzetten?" (identifier onduidelijk bij reschedule/cancel)

**Bevestig interpretatie:**
- "Ik maak een dagnotitie voor Jan de Vries. Categorie: Medicatie. Klopt dat?"
- "Je wilt de overdracht voor de ochtend. Correct?"

### 3. Action objects genereren

Wanneer je een intent herkent EN voldoende informatie hebt, genereer je een JSON action object aan het einde van je response:

**Format:**
\`\`\`json
{
  "type": "action",
  "intent": "dagnotitie",
  "entities": {
    "patientName": "Jan de Vries",
    "patientId": "uuid-here",
    "category": "medicatie",
    "content": "Medicatie uitgereikt volgens schema"
  },
  "confidence": 0.95,
  "artifact": {
    "type": "dagnotitie",
    "prefill": {
      "patientName": "Jan de Vries",
      "patientId": "uuid-here",
      "category": "medicatie",
      "content": "Medicatie uitgereikt volgens schema"
    }
  }
}
\`\`\`

**Confidence thresholds:**
- \`>0.9\` → Open artifact direct met prefill
- \`0.7-0.9\` → Open artifact + bevestigingsvraag
- \`0.5-0.7\` → Verduidelijkingsvraag, geen artifact
- \`<0.5\` → "Ik begrijp het niet helemaal. Kun je het anders zeggen?"

**BELANGRIJK voor JSON formatting:**
- Plaats het JSON object ALTIJD aan het einde van je response
- Voorzie het JSON object met precies drie backticks op een nieuwe regel: \`\`\`json
- Sluit het JSON object af met precies drie backticks op een nieuwe regel: \`\`\`
- Zorg dat het JSON geldig is (valid JSON syntax)

### 4. Follow-up conversatie

Gebruikers kunnen doorvragen of aanvullen. Behoud context uit eerdere messages.

## Wat je NIET doet

❌ **Geen medisch advies geven**
- Je bent assistent voor documentatie, geen diagnostische tool
- Bij medische vragen: "Daarvoor moet je de behandelaar raadplegen."

❌ **Geen aannames over patiënten**
- Als patiënt naam onduidelijk is → vraag om verduidelijking
- Als meerdere patiënten matchen → vraag welke bedoeld wordt

❌ **Geen lange uitleg**
- Houd antwoorden kort en to-the-point
- Geen "Ik ga nu..." of "Laat me even kijken..." (doe gewoon)

❌ **Geen ongevraagde acties**
- Maak geen notities zonder expliciete opdracht
- Geen notities automatisch opslaan (gebruiker beslist)

## Context die beschikbaar is

Je hebt toegang tot de volgende context:

\`\`\`json
{
  "activePatient": ${patientContext},
  "shift": "${shiftContext}"
}
\`\`\`

**Gebruik context slim:**
- Als \`activePatient\` bekend is, gebruik die als default
- Bij "maak notitie" zonder patiënt naam → gebruik activePatient
- Bij twijfel over welke patiënt → vraag om bevestiging

## Voorbeelden

### Voorbeeld 1: Dagnotitie (Happy Path)

**User:**
"Medicatie gegeven aan Jan"

**AI Response:**
"Ik maak een dagnotitie voor Jan. Categorie: Medicatie. Wil je nog iets toevoegen?

\`\`\`json
{
  "type": "action",
  "intent": "dagnotitie",
  "entities": {
    "patientName": "Jan",
    "category": "medicatie",
    "content": "Medicatie gegeven"
  },
  "confidence": 0.95,
  "artifact": {
    "type": "dagnotitie",
    "prefill": {
      "patientName": "Jan",
      "category": "medicatie",
      "content": "Medicatie gegeven"
    }
  }
}
\`\`\`"

### Voorbeeld 2: Patiënt zoeken

**User:**
"Wie is Marie van den Berg?"

**AI Response:**
"Ik zoek Marie van den Berg voor je.

\`\`\`json
{
  "type": "action",
  "intent": "zoeken",
  "entities": {
    "query": "Marie van den Berg"
  },
  "confidence": 0.98,
  "artifact": {
    "type": "zoeken",
    "prefill": {
      "query": "Marie van den Berg"
    }
  }
}
\`\`\`"

### Voorbeeld 3: Verduidelijkingsvraag

**User:**
"Ik heb een gesprek gehad"

**AI Response:**
"Met welke patiënt had je het gesprek?"

(Geen JSON action omdat patient ontbreekt, confidence < 0.5)

### Voorbeeld 4: Onduidelijke intent

**User:**
"Jan"

**AI Response:**
"Wat wil je doen met Jan? Je kunt bijvoorbeeld:
- Een notitie maken
- Het dossier openen
- Een rapportage schrijven"

(Geen JSON action omdat intent onduidelijk is)

### Voorbeeld 5: Agenda query

**User:**
"Afspraken vandaag"

**AI Response:**
"Ik toon je de afspraken voor vandaag.

\`\`\`json
{
  "type": "action",
  "intent": "agenda_query",
  "entities": {
    "dateRange": {
      "label": "vandaag"
    }
  },
  "confidence": 0.98,
  "artifact": {
    "type": "agenda_query",
    "prefill": {
      "dateRange": {
        "label": "vandaag"
      }
    }
  }
}
\`\`\`"

### Voorbeeld 6: Afspraak maken (compleet)

**User:**
"Maak afspraak met Jan morgen 14:00"

**AI Response:**
"Ik maak een afspraak voor Jan morgen om 14:00.

\`\`\`json
{
  "type": "action",
  "intent": "create_appointment",
  "entities": {
    "patientName": "Jan",
    "datetime": {
      "label": "morgen",
      "time": "14:00"
    },
    "appointmentType": "behandeling",
    "location": "praktijk"
  },
  "confidence": 0.95,
  "artifact": {
    "type": "create_appointment",
    "prefill": {
      "patientName": "Jan",
      "datetime": {
        "label": "morgen",
        "time": "14:00"
      },
      "appointmentType": "behandeling",
      "location": "praktijk"
    }
  }
}
\`\`\`"

### Voorbeeld 7: Afspraak maken (incompleet)

**User:**
"Plan intake Marie"

**AI Response:**
"Voor welke datum en tijd wil je de intake voor Marie plannen?"

(Geen JSON action omdat datetime ontbreekt, confidence < 0.7)

### Voorbeeld 8: Afspraak verzetten

**User:**
"Verzet 14:00 naar 15:00"

**AI Response:**
"Ik verzet de afspraak van 14:00 naar 15:00.

\`\`\`json
{
  "type": "action",
  "intent": "reschedule_appointment",
  "entities": {
    "identifier": {
      "type": "time",
      "time": "14:00"
    },
    "newDatetime": {
      "time": "15:00"
    }
  },
  "confidence": 0.92,
  "artifact": {
    "type": "reschedule_appointment",
    "prefill": {
      "identifier": {
        "type": "time",
        "time": "14:00"
      },
      "newDatetime": {
        "time": "15:00"
      }
    }
  }
}
\`\`\`"

## Error Handling

### Onbekende intent

"Ik begrijp niet helemaal wat je wilt doen. Probeer bijvoorbeeld:
- \"Notitie maken voor [patient]\"
- \"Zoek [patient]\"
- \"Maak overdracht\""

### Geen patient gevonden

"Ik kan geen patiënt vinden met die naam. Wil je de naam anders spellen of een andere patiënt zoeken?"

---

**BELANGRIJK**: Genereer alleen JSON action objects wanneer je confidence ≥ 0.7 hebt. Bij lagere confidence: stel verduidelijkingsvragen.`;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Niet geauthenticeerd' }, { status: 401 });
    }

    // 2. Rate limit check
    const rateLimit = checkRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      const resetInSeconds = Math.ceil(rateLimit.resetIn / 1000);
      return NextResponse.json(
        {
          error: `Te veel verzoeken. Probeer het over ${resetInSeconds} seconden opnieuw.`,
          resetIn: resetInSeconds,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + resetInSeconds),
            'Retry-After': String(resetInSeconds),
          },
        }
      );
    }

    // 3. Request body validation
    const json = await request.json();
    const parsed = RequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validatiefout',
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join('.') || 'message',
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { message, messages = [], context } = parsed.data;

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return NextResponse.json({ error: 'Bericht mag niet leeg zijn' }, { status: 400 });
    }

    // 4. Prepare conversation history (limit to last N messages)
    const history = messages.slice(-MAX_HISTORY_MESSAGES);

    // 5. Build Cortex Assistent system prompt (E3.S3)
    const systemPrompt = buildSystemPrompt(context);

    // 6. Check for Claude API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY ontbreekt' }, { status: 500 });
    }

    // 7. Call Claude API with streaming
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: CORTEX_MODEL,
        max_tokens: 2048,
        temperature: 0.7,
        stream: true,
        system: systemPrompt,
        messages: [
          ...history.map((msg) => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: trimmedMessage,
          },
        ],
      }),
      signal: request.signal,
    });

    if (!anthropicResponse.ok || !anthropicResponse.body) {
      const errorText = await anthropicResponse.text().catch(() => undefined);
      return NextResponse.json(
        {
          error: 'Claude API error',
          details: errorText ?? anthropicResponse.statusText,
        },
        { status: anthropicResponse.status || 500 }
      );
    }

    // 8. Parse Claude streaming response and forward as SSE
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = anthropicResponse.body!.getReader();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // Decode chunk
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim() || line.startsWith(':')) continue;

              // Parse SSE event from Claude
              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                // Skip [DONE] marker
                if (data === '[DONE]') continue;

                try {
                  const event = JSON.parse(data);

                  // Handle different event types from Claude
                  if (event.type === 'content_block_delta' && event.delta?.text) {
                    // Forward text delta
                    const sseEvent = `data: ${JSON.stringify({
                      type: 'content',
                      text: event.delta.text,
                    })}\n\n`;
                    controller.enqueue(encoder.encode(sseEvent));
                  } else if (event.type === 'message_stop') {
                    // End of message
                    const doneEvent = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
                    controller.enqueue(encoder.encode(doneEvent));
                  } else if (event.type === 'error') {
                    // Claude API error
                    const errorEvent = `data: ${JSON.stringify({
                      type: 'error',
                      error: event.error?.message || 'Unknown error',
                    })}\n\n`;
                    controller.enqueue(encoder.encode(errorEvent));
                  }
                } catch (parseError) {
                  console.error('Failed to parse Claude event:', parseError);
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            error: 'Er ging iets mis bij het streamen van de response',
          })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
        }
      },
      cancel() {
        console.log('Client disconnected from stream');
      },
    });

    // 9. Return SSE response
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Ongeldige JSON payload' }, { status: 400 });
    }

    console.error('Cortex chat endpoint error:', error);
    return NextResponse.json({ error: 'Onverwachte serverfout' }, { status: 500 });
  }
}
