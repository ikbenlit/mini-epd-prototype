'use client';

/**
 * NudgeToast Component
 *
 * Proactive suggestion toast that appears after successful actions.
 * Features:
 * - Countdown progress bar with auto-dismiss
 * - Priority-based styling (low/medium/high)
 * - Accept and dismiss actions
 * - Framer Motion animations
 *
 * Epic: E4 (Nudge MVP)
 * Story: E4.S3 (NudgeToast component)
 */

import { useEffect, useState, useCallback } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NudgeSuggestion } from '@/lib/cortex/types';

interface NudgeToastProps {
  suggestion: NudgeSuggestion;
  onAccept: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
}

/**
 * Animation variants for the toast container
 */
const containerVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

/**
 * Priority-based styling for the toast
 */
const PRIORITY_STYLES = {
  low: {
    container: 'bg-slate-50 border-slate-200',
    text: 'text-slate-700',
    icon: 'text-slate-500',
    progress: 'bg-slate-300',
  },
  medium: {
    container: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    icon: 'text-amber-600',
    progress: 'bg-amber-400',
  },
  high: {
    container: 'bg-red-50 border-red-200',
    text: 'text-red-800',
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

export function NudgeToast({ suggestion, onAccept, onDismiss }: NudgeToastProps) {
  const [progress, setProgress] = useState(100);
  const styles = PRIORITY_STYLES[suggestion.priority];

  // Memoize dismiss handler to avoid effect re-runs
  const handleDismiss = useCallback(() => {
    onDismiss(suggestion.id);
  }, [onDismiss, suggestion.id]);

  // Auto-dismiss countdown effect
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
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'rounded-lg border p-4 shadow-sm',
        styles.container
      )}
    >
      {/* Header: Icon + Message + Dismiss */}
      <div className="flex items-start gap-3">
        <Lightbulb className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium', styles.text)}>
            {suggestion.suggestion.message}
          </p>
          <p className={cn('text-sm mt-1 opacity-75', styles.text)}>
            {suggestion.suggestion.rationale}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className={cn(
            'flex-shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors',
            styles.text
          )}
          aria-label="Sluiten"
        >
          <X className="h-4 w-4 opacity-50 hover:opacity-100" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
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

      {/* Progress bar countdown */}
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
