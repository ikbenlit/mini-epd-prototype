/**
 * Swift Chat API Route (v3.0)
 *
 * Streaming chat endpoint voor Swift Medical Scribe met Server-Sent Events (SSE).
 *
 * Epic: E3 (Chat API & Medical Scribe)
 * Story: E3.S1 (Chat API endpoint skeleton)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/server';
import type { ChatMessage as ChatMessageType, ChatAction } from '@/stores/swift-store';

// Configuration
const SWIFT_MODEL = process.env.SWIFT_MODEL ?? 'claude-sonnet-4-20250514';
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
 * Build simple system prompt for E3.S2
 * Medical scribe prompt with intent detection will be added in E3.S3
 */
function buildSimpleSystemPrompt(context?: RequestData['context']): string {
  const patientContext = context?.activePatient
    ? `De actieve patiënt is ${context.activePatient.first_name} ${context.activePatient.last_name}.`
    : 'Er is momenteel geen patiënt geselecteerd.';

  const shiftContext = context?.shift ? `De huidige dienst is: ${context.shift}.` : '';

  return `Je bent een behulpzame medische assistent voor Swift, een Nederlands GGZ EPD systeem.

Je taak is om zorgmedewerkers te helpen met documentatie en administratieve taken.

Context:
${patientContext}
${shiftContext}

Communicatie:
- Gebruik Nederlands
- Wees vriendelijk en professioneel
- Geef duidelijke en beknopte antwoorden
- Vraag om verduidelijking bij onduidelijke vragen

BELANGRIJK: Dit is een eenvoudige versie. Intent detection en medical scribe functionaliteit komen in de volgende stap.`;
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

    // 5. Build system prompt (simple version for E3.S2, medical scribe prompt comes in E3.S3)
    const systemPrompt = buildSimpleSystemPrompt(context);

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
        model: SWIFT_MODEL,
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

    console.error('Swift chat endpoint error:', error);
    return NextResponse.json({ error: 'Onverwachte serverfout' }, { status: 500 });
  }
}
