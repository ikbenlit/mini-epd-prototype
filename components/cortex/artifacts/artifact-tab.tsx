'use client';

/**
 * Artifact Tab Component
 *
 * Tab voor een individueel artifact in de ArtifactContainer.
 * Toont titel, close button, en active state.
 *
 * Epic: E4 (Artifact Area & Tabs)
 * Story: E4.S1 (ArtifactContainer component)
 */

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Artifact } from '@/stores/cortex-store';

interface ArtifactTabProps {
  artifact: Artifact;
  isActive: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export function ArtifactTab({ artifact, isActive, onSelect, onClose }: ArtifactTabProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-4 py-2.5 border-r border-slate-200 cursor-pointer transition-colors',
        'hover:bg-slate-50 min-w-[140px] max-w-[200px]',
        isActive && 'bg-white border-b-2 border-b-amber-500'
      )}
      onClick={() => onSelect(artifact.id)}
    >
      {/* Tab title */}
      <span
        className={cn(
          'flex-1 text-sm font-medium truncate',
          isActive ? 'text-slate-900' : 'text-slate-600'
        )}
        title={artifact.title}
      >
        {artifact.title}
      </span>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(artifact.id);
        }}
        className={cn(
          'p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors',
          'opacity-0 group-hover:opacity-100',
          isActive && 'opacity-100'
        )}
        title="Sluiten"
        aria-label={`Sluit ${artifact.title}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}
