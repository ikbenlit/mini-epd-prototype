'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

import type { ChatMessage } from './use-docs-chat'

interface ChatMessagesProps {
  messages: ChatMessage[]
  isStreaming: boolean
}

/**
 * Message list component with auto-scroll and streaming cursor
 *
 * UI Specs (uit FO):
 * - User messages: rechts, bg-amber-100, rounded
 * - Assistant messages: links, bg-slate-100, rounded
 * - Streaming: pulserende cursor ▊
 */
export function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-3"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={isStreaming && message.role === 'assistant' && message === messages[messages.length - 1]}
        />
      ))}
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
  isStreaming: boolean
}

function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
          isUser
            ? 'bg-amber-100 text-amber-900 rounded-br-md'
            : 'bg-slate-100 text-slate-900 rounded-bl-md'
        )}
      >
        <MessageContent content={message.content} isStreaming={isStreaming} />
      </div>
    </div>
  )
}

interface MessageContentProps {
  content: string
  isStreaming: boolean
}

function MessageContent({ content, isStreaming }: MessageContentProps) {
  if (!content && isStreaming) {
    return <StreamingCursor />
  }

  // Split content into paragraphs and render with proper spacing
  const paragraphs = content.split('\n\n')

  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, idx) => (
        <p key={idx} className="whitespace-pre-wrap leading-relaxed">
          {renderInlineFormatting(paragraph)}
          {isStreaming && idx === paragraphs.length - 1 && <StreamingCursor />}
        </p>
      ))}
    </div>
  )
}

/**
 * Render basic inline formatting (bold, bullet points)
 */
function renderInlineFormatting(text: string) {
  // Handle bullet points
  const lines = text.split('\n')

  return lines.map((line, idx) => {
    const isBullet = line.startsWith('• ') || line.startsWith('- ')

    if (isBullet) {
      return (
        <span key={idx} className="block pl-2">
          {line}
          {idx < lines.length - 1 && '\n'}
        </span>
      )
    }

    // Handle **bold** text
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    const formatted = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partIdx} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })

    return (
      <span key={idx}>
        {formatted}
        {idx < lines.length - 1 && '\n'}
      </span>
    )
  })
}

/**
 * Pulsating streaming cursor
 */
function StreamingCursor() {
  return (
    <span className="inline-block w-2 h-4 ml-0.5 bg-amber-500 animate-pulse rounded-sm" />
  )
}
