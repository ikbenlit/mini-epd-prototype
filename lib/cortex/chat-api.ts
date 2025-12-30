/**
 * Cortex Chat API Client
 *
 * Client-side helper voor het aanroepen van de Cortex chat API met streaming support.
 *
 * Epic: E3 (Chat API & Cortex Assistent)
 * Story: E3.S1 (Chat API endpoint skeleton)
 */

import type { ChatMessage } from '@/stores/cortex-store';

export interface ChatContext {
  activePatient?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  shift: 'nacht' | 'ochtend' | 'middag' | 'avond';
}

export interface StreamEvent {
  type: 'content' | 'done' | 'error';
  text?: string;
  error?: string;
}

/**
 * Send a chat message and receive streaming response via SSE
 */
export async function sendChatMessage(
  message: string,
  messages: ChatMessage[],
  context?: ChatContext,
  onChunk?: (text: string) => void,
  onDone?: () => void,
  onError?: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch('/api/cortex/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        messages,
        context,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || 'API request failed');
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Read SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events (separated by \n\n)
      const events = buffer.split('\n\n');

      // Keep the last incomplete event in the buffer
      buffer = events.pop() || '';

      // Process complete events
      for (const eventStr of events) {
        if (!eventStr.trim()) continue;

        // Parse SSE event (format: "data: {...}")
        const dataMatch = eventStr.match(/^data: (.+)$/);
        if (!dataMatch) continue;

        try {
          const event: StreamEvent = JSON.parse(dataMatch[1]);

          if (event.type === 'content' && event.text) {
            onChunk?.(event.text);
          } else if (event.type === 'done') {
            onDone?.();
          } else if (event.type === 'error') {
            onError?.(event.error || 'Unknown error');
          }
        } catch (parseError) {
          console.error('Failed to parse SSE event:', parseError);
        }
      }
    }
  } catch (error) {
    console.error('Chat API error:', error);
    onError?.(error instanceof Error ? error.message : 'Unknown error');
  }
}
