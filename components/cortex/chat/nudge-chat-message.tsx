'use client';

/**
 * NudgeChatMessage Component
 *
 * Displays a protocol-based nudge suggestion in the chat.
 * Shows protocol metadata, clinical rationale, and accept/dismiss buttons.
 *
 * Epic: E4 (Nudge)
 */

import { useEffect, useState, useCallback } from 'react';
import { Lightbulb, BookOpen, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NudgeSuggestion } from '@/lib/cortex/types';

interface NudgeChatMessageProps {
  suggestion: NudgeSuggestion;
  onAccept: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
}

/**
 * Priority-based styling for the nudge message
 */
const PRIORITY_STYLES = {
  low: {
    container: 'bg-slate-50 border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    text: 'text-slate-700',
    icon: 'text-slate-500',
    progress: 'bg-slate-300',
  },
  medium: {
    container: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    text: 'text-amber-900',
    icon: 'text-amber-600',
    progress: 'bg-amber-400',
  },
  high: {
    container: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-800',
    text: 'text-red-900',
    icon: 'text-red-600',
    progress: 'bg-red-400',
  },
};

/**
 * Get button text based on suggested intent
 */
function getAcceptButtonText(intent: string): string {
  switch (intent) {
    case 'create_appointment':
      return 'Ja, inplannen';
    case 'dagnotitie':
      return 'Ja, notitie maken';
    case 'cancel_appointment':
      return 'Ja, annuleren';
    default:
      return 'Ja, uitvoeren';
  }
}

export function NudgeChatMessage({
  suggestion,
  onAccept,
  onDismiss,
}: NudgeChatMessageProps) {
  const [progress, setProgress] = useState(100);
  const styles = PRIORITY_STYLES[suggestion.priority];
  const protocol = suggestion.suggestion.protocol;

  // Memoize dismiss handler
  const handleDismiss = useCallback(() => {
    onDismiss(suggestion.id);
  }, [onDismiss, suggestion.id]);

  // Countdown effect
  useEffect(() => {
    if (!suggestion.expiresAt) return;

    const expiresAt = new Date(suggestion.expiresAt).getTime();
    const createdAt = new Date(suggestion.createdAt).getTime();
    const total = expiresAt - createdAt;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        handleDismiss();
        clearInterval(interval);
        return;
      }

      setProgress((remaining / total) * 100);
    }, 1000);

    return () => clearInterval(interval);
  }, [suggestion.expiresAt, suggestion.createdAt, handleDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'self-start max-w-[90%] rounded-2xl rounded-tl-sm border p-4',
        styles.container
      )}
    >
      {/* Header with icon and dismiss */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className={cn('w-5 h-5', styles.icon)} />
          <span className={cn('text-sm font-medium', styles.text)}>
            Protocol Suggestie
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className={cn(
            'p-1 rounded-md hover:bg-black/5 transition-colors',
            styles.text
          )}
          aria-label="Sluiten"
        >
          <X className="w-4 h-4 opacity-50 hover:opacity-100" />
        </button>
      </div>

      {/* Protocol badge */}
      {protocol && (
        <div className="mb-3">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
              styles.badge
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{protocol.name}</span>
            {protocol.reference && (
              <span className="opacity-75">{protocol.reference}</span>
            )}
          </div>
        </div>
      )}

      {/* Suggestion message */}
      <p className={cn('font-medium mb-2', styles.text)}>
        {suggestion.suggestion.message}
      </p>

      {/* Clinical rationale */}
      {protocol?.rationale && (
        <p className={cn('text-sm opacity-80 mb-4', styles.text)}>
          {protocol.rationale}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onAccept(suggestion.id)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          {getAcceptButtonText(suggestion.suggestion.intent)}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className={styles.text}
        >
          Later
        </Button>
      </div>

      {/* Countdown progress bar */}
      <div className="mt-3 h-1 bg-white/50 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', styles.progress)}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}
