import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getSession } from '@/lib/auth/server'
import { detectCategories } from '@/lib/docs/category-detector'
import { loadKnowledgeSections } from '@/lib/docs/knowledge-loader'
import { buildSystemPrompt } from '@/lib/docs/prompt-builder'
import { detectQuestionType } from '@/lib/docs/question-type-detector'
import { loadClientContext } from '@/lib/docs/client-context-loader'
import { buildClientPrompt, buildClientErrorPrompt } from '@/lib/docs/client-prompt-builder'

const DOCS_ASSISTANT_MODEL = process.env.DOCS_ASSISTANT_MODEL ?? 'claude-sonnet-4-20250514'
const MAX_HISTORY_MESSAGES = 10
const MAX_USER_MESSAGE_LENGTH = 2000

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // max requests per window

// In-memory rate limit store (resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitStore.get(userId)

  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetIn: record.resetTime - now }
}

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})

const RequestSchema = z.object({
  messages: z.array(ChatMessageSchema).optional(),
  userMessage: z.string().min(1).max(MAX_USER_MESSAGE_LENGTH),
  clientId: z.string().uuid().optional(), // UUID van actieve patiënt
})

type ChatMessage = z.infer<typeof ChatMessageSchema>

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Niet geauthenticeerd' }, { status: 401 })
    }

    // Check rate limit
    const rateLimit = checkRateLimit(session.user.id)
    if (!rateLimit.allowed) {
      const resetInSeconds = Math.ceil(rateLimit.resetIn / 1000)
      return NextResponse.json(
        {
          error: `Te veel verzoeken. Probeer het over ${resetInSeconds} seconden opnieuw.`,
          resetIn: resetInSeconds
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + resetInSeconds),
            'Retry-After': String(resetInSeconds),
          }
        }
      )
    }

    const json = await request.json()
    const parsed = RequestSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validatiefout',
          details: parsed.error.issues.map(issue => ({
            field: issue.path.join('.') || 'userMessage',
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    const rawUserMessage = parsed.data.userMessage.trim()
    if (!rawUserMessage) {
      return NextResponse.json(
        { error: 'Vraag mag niet leeg zijn' },
        { status: 400 }
      )
    }

    const history = (parsed.data.messages ?? [])
      .map(normalizeMessage)
      .filter((message): message is ChatMessage => Boolean(message))
      .slice(-MAX_HISTORY_MESSAGES)

    const conversation: ChatMessage[] = [...history, { role: 'user', content: rawUserMessage }]

    // Detect question type and build appropriate prompt
    const clientId = parsed.data.clientId
    const questionType = detectQuestionType(rawUserMessage, !!clientId)

    let systemPrompt: string

    if (questionType === 'client' && clientId) {
      // Client-specific question: load client context
      const clientContext = await loadClientContext(clientId)

      if (clientContext) {
        systemPrompt = buildClientPrompt(clientContext)
      } else {
        // Client not found or error loading
        systemPrompt = buildClientErrorPrompt()
      }
    } else {
      // Documentation question: use existing knowledge base flow
      const categories = detectCategories(rawUserMessage)
      const knowledgeSections = await loadKnowledgeSections(categories)
      systemPrompt = buildSystemPrompt(knowledgeSections)
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY ontbreekt' },
        { status: 500 }
      )
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: DOCS_ASSISTANT_MODEL,
        max_tokens: 1024,
        temperature: 0.2,
        stream: true,
        system: systemPrompt,
        messages: conversation,
      }),
      signal: request.signal,
    })

    if (!anthropicResponse.ok || !anthropicResponse.body) {
      const errorText = await anthropicResponse.text().catch(() => undefined)
      return NextResponse.json(
        {
          error: 'Claude API error',
          details: errorText ?? anthropicResponse.statusText,
        },
        { status: anthropicResponse.status || 500 }
      )
    }

    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, no-transform',
      Connection: 'keep-alive',
    })

    return new Response(anthropicResponse.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Ongeldige JSON payload' }, { status: 400 })
    }

    console.error('Docs chat endpoint error:', error)
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    )
  }
}

function normalizeMessage(message: ChatMessage): ChatMessage | null {
  if (!message?.content) return null
  const trimmed = message.content.trim()
  if (!trimmed) return null

  return {
    role: message.role,
    content: trimmed.slice(0, 4000),
  }
}
