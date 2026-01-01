'use client';

/**
 * ActionItem Component
 *
 * Displays a single action in a multi-intent chain with:
 * - Sequence number badge
 * - Status icon (pending, confirming, executing, success, failed, skipped)
 * - Intent label (Dutch)
 * - Confidence badge with color coding
 * - Entity summary
 * - Confirmation/retry buttons
 *
 * Epic: E3 (UI Components)
 * Story: E3.S2 (ActionItem sub-component)
 */

import {
  Circle,
  AlertCircle,
  Loader2,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { IntentAction, IntentActionStatus } from '@/lib/cortex/types';
import {
  INTENT_LABELS,
  STATUS_STYLES,
  getConfidenceStyle,
  formatEntitySummary,
} from '@/lib/cortex/intent-labels';

interface ActionItemProps {
  action: IntentAction;
  sequence: number;
  totalActions: number;
  onConfirm: () => void;
  onSkip: () => void;
  onRetry: () => void;
}

/**
 * Status icons mapped to each action status
 */
const STATUS_ICONS: Record<IntentActionStatus, React.ReactNode> = {
  pending: <Circle className="w-4 h-4" />,
  confirming: <AlertCircle className="w-4 h-4" />,
  executing: <Loader2 className="w-4 h-4 animate-spin" />,
  success: <Check className="w-4 h-4" />,
  failed: <X className="w-4 h-4" />,
  skipped: <X className="w-4 h-4" />,
};

export function ActionItem({
  action,
  sequence,
  totalActions,
  onConfirm,
  onSkip,
  onRetry,
}: ActionItemProps) {
  const statusStyle = STATUS_STYLES[action.status];
  const confidenceStyle = getConfidenceStyle(action.confidence);
  const intentLabel = INTENT_LABELS[action.intent] || action.intent;
  const entitySummary = formatEntitySummary(action.intent, action.entities);

  const isConfirming = action.status === 'confirming';
  const isFailed = action.status === 'failed';
  const isCompleted = action.status === 'success' || action.status === 'skipped';

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        statusStyle.bg,
        statusStyle.border
      )}
    >
      {/* Main row: sequence, icon, label, confidence */}
      <div className="flex items-center gap-3">
        {/* Sequence badge */}
        <div
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
            'text-xs font-medium',
            isCompleted ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-700'
          )}
        >
          {sequence}
        </div>

        {/* Status icon */}
        <div className={cn('flex-shrink-0', statusStyle.icon)}>
          {STATUS_ICONS[action.status]}
        </div>

        {/* Intent label */}
        <div className="flex-1 min-w-0">
          <span className={cn('text-sm font-medium', statusStyle.text)}>
            {intentLabel}
          </span>
        </div>

        {/* Confidence badge */}
        <div
          className={cn(
            'flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium',
            confidenceStyle.bg,
            confidenceStyle.text
          )}
        >
          {Math.round(action.confidence * 100)}%
        </div>
      </div>

      {/* Entity summary */}
      <div className="mt-2 ml-9 text-sm text-slate-600">{entitySummary}</div>

      {/* Confirmation message and buttons */}
      {isConfirming && (
        <div className="mt-3 ml-9 space-y-2">
          {action.confirmationMessage && (
            <p className="text-sm text-amber-800">{action.confirmationMessage}</p>
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={onConfirm}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Check className="w-3 h-3 mr-1" />
              Bevestigen
            </Button>
            <Button size="sm" variant="ghost" onClick={onSkip}>
              Overslaan
            </Button>
          </div>
        </div>
      )}

      {/* Error state with retry option */}
      {isFailed && action.error && (
        <div className="mt-3 ml-9 space-y-2">
          <p className="text-sm text-red-700">{action.error.message}</p>
          {action.error.recoverable && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RotateCcw className="w-3 h-3 mr-1" />
              Opnieuw proberen
            </Button>
          )}
        </div>
      )}

      {/* Completion time (optional, for completed actions) */}
      {isCompleted && action.completedAt && (
        <div className="mt-1 ml-9 text-xs text-slate-400">
          {action.status === 'success' ? 'Voltooid' : 'Overgeslagen'}
        </div>
      )}
    </div>
  );
}
