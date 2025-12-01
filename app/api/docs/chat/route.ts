import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getSession } from '@/lib/auth/server'
import { detectCategories } from '@/lib/docs/category-detector'
import { loadKnowledgeSections } from '@/lib/docs/knowledge-loader'
import { buildSystemPrompt } from '@/lib/docs/prompt-builder'

const DOCS_ASSISTANT_MODEL = process.env.DOCS_ASSISTANT_MODEL ?? 'claude-3-5-sonnet-20240620'
const MAX_HISTORY_MESSAGES = 10
const MAX_USER_MESSAGE_LENGTH = 2000

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})

const RequestSchema = z.object({
  messages: z.array(ChatMessageSchema).optional(),
  userMessage: z.string().min(1).max(MAX_USER_MESSAGE_LENGTH),
})

type ChatMessage = z.infer<typeof ChatMessageSchema>

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Niet geauthenticeerd' }, { status: 401 })
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

    const categories = detectCategories(rawUserMessage)
    const knowledgeSections = await loadKnowledgeSections(categories)
    const systemPrompt = buildSystemPrompt(knowledgeSections)

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
