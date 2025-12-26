'use client';

/**
 * Canvas Area
 *
 * Central area where blocks appear. Shows empty state when no block is active.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useSwiftStore } from '@/stores/swift-store';
import type { BlockType, BlockPrefillData } from '@/stores/swift-store';
import { DagnotatieBlock } from '../blocks/dagnotitie-block';
import { ZoekenBlock } from '../blocks/zoeken-block';
import { OverdrachtBlock } from '../blocks/overdracht-block';
import { PatientContextCard } from '../blocks/patient-context-card';
import { FallbackPicker } from '../blocks/fallback-picker';

export function CanvasArea() {
  const { activeBlock, prefillData, activePatient } = useSwiftStore();

  function renderBlock(blockType: BlockType, prefill: BlockPrefillData) {
    switch (blockType) {
      case 'dagnotitie':
        return <DagnotatieBlock prefill={prefill} />;
      case 'zoeken':
        return <ZoekenBlock prefill={prefill} />;
      case 'overdracht':
        return <OverdrachtBlock prefill={prefill} />;
      case 'fallback':
        return <FallbackPicker originalInput={prefill.content} />;
      default:
        return null;
    }
  }

  // Block animations volgens UX specificatie (sectie 11.1):
  // Openen: Slide up + fade in (200ms), Scale: 0.95 → 1.0
  // Sluiten: Slide down + fade out (200ms), Scale: 1.0 → 0.95
  const blockAnimations = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      },
    },
    exit: { 
      opacity: 0, 
      y: 20, // Slide down (niet omhoog)
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 overflow-auto">
      <AnimatePresence mode="wait" initial={false}>
        {activeBlock ? (
          <motion.div 
            key={activeBlock} 
            initial={blockAnimations.initial}
            animate={blockAnimations.animate}
            exit={blockAnimations.exit}
          >
            {renderBlock(activeBlock, prefillData)}
          </motion.div>
        ) : activePatient ? (
          <motion.div 
            key="patient-context"
            initial={blockAnimations.initial}
            animate={blockAnimations.animate}
            exit={blockAnimations.exit}
          >
            <PatientContextCard />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <EmptyState />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="text-center max-w-md">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-slate-700 mb-2">Wat wil je doen?</h2>
        <p className="text-sm text-slate-500">
          Typ of spreek je intentie
        </p>
      </div>

      <div className="space-y-2 text-left">
        <ExampleCommand icon="📝" text="notitie jan medicatie gegeven" />
        <ExampleCommand icon="🔍" text="zoek marie" />
        <ExampleCommand icon="📋" text="overdracht" />
      </div>

      <p className="mt-6 text-xs text-slate-500">
        <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shadow-sm">⌘K</kbd> om te focussen
      </p>
    </div>
  );
}

function ExampleCommand({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-sm">
      <span>{icon}</span>
      <span className="text-slate-600">&quot;{text}&quot;</span>
    </div>
  );
}
