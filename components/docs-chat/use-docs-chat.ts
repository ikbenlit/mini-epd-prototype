'use client'

import { useCallback, useState } from 'react'

/**
 * Chat message type
 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

/**
 * Hook state
 */
interface UseDocsChatState {
  messages: ChatMessage[]
  isLoading: boolean
  isStreaming: boolean
  error: string | null
  isRateLimited: boolean
  rateLimitResetTime: number | null // timestamp when rate limit resets
}

/**
 * Hook return type
 */
interface UseDocsChatReturn extends UseDocsChatState {
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  clearError: () => void
  clearRateLimit: () => void
}

/**
 * Generate unique message ID
 */
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Welcome message shown on first load
 */
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hallo! Ik ben je EPD assistent. Stel me een vraag over het systeem of kies een onderwerp hieronder.',
}

/**
 * Custom hook for docs chat functionality
 *
 * Features:
 * - Message state management
 * - Streaming responses from Claude API
 * - Loading and error states
 * - Welcome message on init
 *
 * @example
 * const { messages, isLoading, sendMessage } = useDocsChat()
 * await sendMessage("Hoe maak ik een intake aan?")
 */
export function useDocsChat(): UseDocsChatReturn {
  const [state, setState] = useState<UseDocsChatState>({
    messages: [WELCOME_MESSAGE],
    isLoading: false,
    isStreaming: false,
    error: null,
    isRateLimited: false,
    rateLimitResetTime: null,
  })

  const sendMessage = useCallback(async (content: string) => {
    const trimmedContent = content.trim()
    if (!trimmedContent) return

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmedContent,
    }

    // Prepare assistant message placeholder
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
    }

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, assistantMessage],
      isLoading: true,
      isStreaming: false,
      error: null,
    }))

    try {
      // Get message history (excluding welcome and current messages)
      const history = state.messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/docs/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          userMessage: trimmedContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Handle rate limit specifically
        if (response.status === 429) {
          const resetIn = errorData.resetIn ?? 60 // default 60 seconds
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isRateLimited: true,
            rateLimitResetTime: Date.now() + (resetIn * 1000),
            messages: prev.messages.filter((m) => m.id !== assistantMessage.id),
          }))
          return
        }

        throw new Error(errorData.error || `Fout: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Geen response body ontvangen')
      }

      // Start streaming
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isStreaming: true,
      }))

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)

            // Handle content_block_delta events
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              accumulatedContent += parsed.delta.text

              setState((prev) => ({
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: accumulatedContent }
                    : m
                ),
              }))
            }
          } catch {
            // Ignore parse errors for non-JSON lines
          }
        }
      }

      // Streaming complete
      setState((prev) => ({
        ...prev,
        isStreaming: false,
      }))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Er ging iets mis'

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        error: errorMessage,
        // Remove empty assistant message on error
        messages: prev.messages.filter(
          (m) => m.id !== assistantMessage.id || m.content.length > 0
        ),
      }))
    }
  }, [state.messages])

  const clearMessages = useCallback(() => {
    setState({
      messages: [WELCOME_MESSAGE],
      isLoading: false,
      isStreaming: false,
      error: null,
      isRateLimited: false,
      rateLimitResetTime: null,
    })
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const clearRateLimit = useCallback(() => {
    setState((prev) => ({ ...prev, isRateLimited: false, rateLimitResetTime: null }))
  }, [])

  return {
    ...state,
    sendMessage,
    clearMessages,
    clearError,
    clearRateLimit,
  }
}
