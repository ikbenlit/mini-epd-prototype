'use client';

/**
 * ClarificationCard Component
 *
 * Displays clarification questions from the AI when user input is ambiguous.
 * Shows:
 * - Question text
 * - Multiple choice options as buttons
 * - Original input for context
 * - Dismiss option
 *
 * Epic: E3 (UI Components)
 * Story: E3.S3 (ClarificationCard component)
 */

import { HelpCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClarificationCardProps {
  question: string;
  options: string[];
  originalInput: string;
  onSelectOption: (option: string) => void;
  onDismiss: () => void;
}

/**
 * Animation variants for the card
 */
const cardVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

export function ClarificationCard({
  question,
  options,
  originalInput,
  onSelectOption,
  onDismiss,
}: ClarificationCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="rounded-xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200 bg-amber-100/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-200">
            <HelpCircle className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-sm font-medium text-amber-900">
            Verduidelijking nodig
          </span>
        </div>

        {/* Dismiss button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-7 w-7 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Original input context */}
        <div className="text-xs text-amber-700">
          <span className="font-medium">Je zei:</span>{' '}
          <span className="italic">&ldquo;{originalInput}&rdquo;</span>
        </div>

        {/* Question */}
        <p className="text-sm font-medium text-amber-900">{question}</p>

        {/* Options grid */}
        <div
          className={cn(
            'grid gap-2',
            options.length <= 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
          )}
        >
          {options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => onSelectOption(option)}
              className={cn(
                'justify-start h-auto py-2.5 px-3',
                'border-amber-300 bg-white hover:bg-amber-100 hover:border-amber-400',
                'text-amber-900 text-sm font-medium',
                'transition-colors'
              )}
            >
              {option}
            </Button>
          ))}
        </div>

        {/* Cancel link */}
        <div className="text-center">
          <button
            onClick={onDismiss}
            className="text-xs text-amber-600 hover:text-amber-800 underline underline-offset-2"
          >
            Annuleren
          </button>
        </div>
      </div>
    </motion.div>
  );
}
