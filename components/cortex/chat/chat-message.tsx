'use client';

/**
 * Chat Message Component (v3.0)
 *
 * Displays individual chat messages with styling per message type.
 * Supports user, assistant, system, and error message types.
 *
 * Epic: E2 (Chat Panel & Messages)
 * Story: E2.S2 (ChatMessage component)
 */

import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/stores/cortex-store';
import { getConfidenceLabel } from '@/lib/cortex/action-parser';

// Message styling configuration per type
const MESSAGE_STYLES = {
  user: {
    container: 'self-end bg-amber-50 border-amber-200 text-slate-900',
    borderRadius: 'rounded-2xl rounded-tr-sm',
    maxWidth: 'max-w-[80%]',
  },
  assistant: {
    container: 'self-start bg-slate-100 border-slate-200 text-slate-900',
    borderRadius: 'rounded-2xl rounded-tl-sm',
    maxWidth: 'max-w-[85%]',
  },
  system: {
    container: 'self-center bg-transparent border-transparent text-slate-500 text-sm italic',
    borderRadius: 'rounded-lg',
    maxWidth: 'max-w-[90%]',
  },
  error: {
    container: 'self-start bg-red-50 border-red-200 text-red-900',
    borderRadius: 'rounded-2xl',
    maxWidth: 'max-w-[80%]',
  },
} as const;

interface ChatMessageProps {
  message: ChatMessageType;
  showTimestamp?: boolean;
}

export function ChatMessage({ message, showTimestamp = false }: ChatMessageProps) {
  // Nudge messages are handled by NudgeChatMessage component
  // This shouldn't be called for nudge type, but guard just in case
  if (message.type === 'nudge') {
    return null;
  }

  const styles = MESSAGE_STYLES[message.type];

  // Don't show border for system messages
  const showBorder = message.type !== 'system';

  return (
    <div
      className={cn(
        'flex flex-col px-4 py-2.5 border transition-all',
        styles.container,
        styles.borderRadius,
        styles.maxWidth,
        !showBorder && 'border-none px-0 py-1'
      )}
    >
      {/* Message content */}
      <div className="whitespace-pre-wrap break-words leading-relaxed">
        {message.content}
      </div>

      {/* Action badge (E3.S4) - show if action was detected */}
      {message.action && message.type === 'assistant' && (
        <div className="mt-2 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-medium text-slate-700">
              {message.action.intent === 'dagnotitie' && 'Dagnotitie'}
              {message.action.intent === 'zoeken' && 'Patiënt zoeken'}
              {message.action.intent === 'overdracht' && 'Overdracht'}
              {message.action.intent === 'unknown' && 'Onbekend'}
            </span>
            {message.action.confidence >= 0.7 && (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            )}
            <span className="text-slate-500">
              {getConfidenceLabel(message.action.confidence)}
            </span>
          </div>
        </div>
      )}

      {/* Timestamp (optional) */}
      {showTimestamp && message.timestamp && (
        <div className="text-xs text-slate-400 mt-1.5">
          {format(message.timestamp, 'HH:mm', { locale: nl })}
        </div>
      )}
    </div>
  );
}
