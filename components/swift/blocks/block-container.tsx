'use client';

/**
 * Block Container
 *
 * Wrapper for ephemeral blocks with animation, close button, and sizing.
 */

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useSwiftStore } from '@/stores/swift-store';
import type { BlockSize } from '@/lib/swift/types';

interface BlockContainerProps {
  title: string;
  size?: BlockSize;
  children: ReactNode;
}

const SIZE_CLASSES: Record<BlockSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  full: 'max-w-4xl',
};

export function BlockContainer({ title, size = 'md', children }: BlockContainerProps) {
  const { closeBlock } = useSwiftStore();

  return (
    <div
      className={`w-full ${SIZE_CLASSES[size]} bg-slate-800 rounded-xl border border-slate-700 shadow-2xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h2 className="text-lg font-medium text-white">{title}</h2>
        <button
          onClick={closeBlock}
          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Sluiten (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}
