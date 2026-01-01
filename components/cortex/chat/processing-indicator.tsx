'use client';

/**
 * ProcessingIndicator Component
 *
 * Shows loading state during AI operations with multiple variants:
 * - spinner: Rotating loader icon with text (default)
 * - skeleton: Pulsing placeholder blocks
 * - pulse: Animated dots
 *
 * Epic: E3 (UI Components)
 * Story: E3.S4 (Processing indicator)
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingIndicatorProps {
  /** Loading message to display (default: "Even nadenken...") */
  message?: string;
  /** Visual style variant */
  type?: 'spinner' | 'skeleton' | 'pulse';
  /** Size of the indicator */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size configurations for each variant
 */
const SIZE_CONFIG = {
  sm: {
    icon: 'w-3 h-3',
    text: 'text-xs',
    dot: 'w-1.5 h-1.5',
    skeleton: 'h-3',
  },
  md: {
    icon: 'w-4 h-4',
    text: 'text-sm',
    dot: 'w-2 h-2',
    skeleton: 'h-4',
  },
  lg: {
    icon: 'w-5 h-5',
    text: 'text-base',
    dot: 'w-2.5 h-2.5',
    skeleton: 'h-5',
  },
};

export function ProcessingIndicator({
  message = 'Even nadenken...',
  type = 'spinner',
  size = 'md',
  className,
}: ProcessingIndicatorProps) {
  const sizeConfig = SIZE_CONFIG[size];

  // Spinner variant - rotating icon with text
  if (type === 'spinner') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-slate-500',
          className
        )}
      >
        <Loader2 className={cn(sizeConfig.icon, 'animate-spin')} />
        <span className={sizeConfig.text}>{message}</span>
      </div>
    );
  }

  // Skeleton variant - pulsing placeholder blocks
  if (type === 'skeleton') {
    return (
      <div className={cn('space-y-2', className)}>
        <div
          className={cn(
            sizeConfig.skeleton,
            'bg-slate-200 rounded animate-pulse w-3/4'
          )}
        />
        <div
          className={cn(
            sizeConfig.skeleton,
            'bg-slate-200 rounded animate-pulse w-1/2'
          )}
        />
        <div
          className={cn(
            sizeConfig.skeleton,
            'bg-slate-200 rounded animate-pulse w-2/3'
          )}
        />
      </div>
    );
  }

  // Pulse variant - animated dots
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className={cn(
          sizeConfig.dot,
          'bg-blue-500 rounded-full animate-pulse'
        )}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={cn(
          sizeConfig.dot,
          'bg-blue-500 rounded-full animate-pulse'
        )}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={cn(
          sizeConfig.dot,
          'bg-blue-500 rounded-full animate-pulse'
        )}
        style={{ animationDelay: '300ms' }}
      />
      {message && (
        <span className={cn(sizeConfig.text, 'text-slate-500 ml-2')}>
          {message}
        </span>
      )}
    </div>
  );
}

/**
 * Inline spinner for use in buttons or compact spaces
 */
export function InlineSpinner({
  size = 'sm',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeConfig = SIZE_CONFIG[size];
  return (
    <Loader2
      className={cn(sizeConfig.icon, 'animate-spin text-current', className)}
    />
  );
}
