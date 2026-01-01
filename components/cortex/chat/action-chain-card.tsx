'use client';

/**
 * ActionChainCard Component
 *
 * Container for displaying multi-intent action chains with:
 * - Header showing source (AI/local) and action count
 * - Original user input
 * - Stacked ActionItem components for each action
 * - Collapsible AI reasoning section
 * - Dismiss button
 *
 * Epic: E3 (UI Components)
 * Story: E3.S1 (ActionChainCard component)
 */

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, X, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { IntentChain } from '@/lib/cortex/types';
import { ActionItem } from './action-item';

interface ActionChainCardProps {
  chain: IntentChain;
  onConfirmAction: (actionId: string) => void;
  onSkipAction: (actionId: string) => void;
  onRetryAction: (actionId: string) => void;
  onDismissChain: () => void;
}

/**
 * Animation variants for the card container
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
 * Stagger animation for action items
 */
const listVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.15 },
  },
};

export function ActionChainCard({
  chain,
  onConfirmAction,
  onSkipAction,
  onRetryAction,
  onDismissChain,
}: ActionChainCardProps) {
  const [showReasoning, setShowReasoning] = useState(false);

  const actionCount = chain.actions.length;
  const completedCount = chain.actions.filter(
    (a) => a.status === 'success' || a.status === 'skipped'
  ).length;
  const isFromAI = chain.meta.source === 'ai';
  const hasReasoning = !!chain.meta.aiReasoning;

  // Determine overall chain state for styling
  const getChainStatusStyle = () => {
    switch (chain.status) {
      case 'executing':
        return 'border-blue-300 bg-blue-50/50';
      case 'completed':
        return 'border-green-300 bg-green-50/50';
      case 'partial':
        return 'border-amber-300 bg-amber-50/50';
      case 'failed':
        return 'border-red-300 bg-red-50/50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'rounded-xl border shadow-sm overflow-hidden',
        getChainStatusStyle()
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/80">
        <div className="flex items-center gap-3">
          {/* Source badge */}
          {isFromAI ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">AI</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-600">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Lokaal</span>
            </div>
          )}

          {/* Action count */}
          <span className="text-sm font-medium text-slate-900">
            {actionCount} {actionCount === 1 ? 'actie' : 'acties'} gedetecteerd
          </span>

          {/* Progress indicator */}
          {chain.status === 'executing' && (
            <span className="text-xs text-slate-500">
              ({completedCount}/{actionCount} voltooid)
            </span>
          )}
        </div>

        {/* Dismiss button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismissChain}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Original input */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
        <p className="text-sm text-slate-600 italic">
          &ldquo;{chain.originalInput}&rdquo;
        </p>
      </div>

      {/* Action items */}
      <motion.div
        variants={listVariants}
        initial="initial"
        animate="animate"
        className="p-4 space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {chain.actions.map((action, index) => (
            <motion.div key={action.id} variants={itemVariants} layout>
              <ActionItem
                action={action}
                sequence={index + 1}
                totalActions={actionCount}
                onConfirm={() => onConfirmAction(action.id)}
                onSkip={() => onSkipAction(action.id)}
                onRetry={() => onRetryAction(action.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* AI Reasoning (collapsible) */}
      {hasReasoning && (
        <div className="border-t border-slate-200">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Redenering
            </span>
            {showReasoning ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {showReasoning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 bg-slate-50 text-sm text-slate-600">
                  {chain.meta.aiReasoning}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Processing time footer */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs text-slate-400">
          Verwerkt in {chain.meta.processingTimeMs}ms
        </p>
      </div>
    </motion.div>
  );
}
