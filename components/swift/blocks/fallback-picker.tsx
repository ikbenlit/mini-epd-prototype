'use client';

/**
 * Fallback Picker
 *
 * Visual intent selector shown when classification confidence is low.
 * E4.S4: Grid met block opties, keyboard shortcuts (1-3).
 */

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, ArrowRightLeft, X } from 'lucide-react';
import { useSwiftStore } from '@/stores/swift-store';
import type { BlockType } from '@/lib/swift/types';

interface FallbackPickerProps {
  originalInput?: string;
}

interface BlockOption {
  type: BlockType;
  label: string;
  description: string;
  icon: typeof FileText;
  shortcut: string;
  color: string;
}

const BLOCK_OPTIONS: BlockOption[] = [
  {
    type: 'dagnotitie',
    label: 'Notitie',
    description: 'Schrijf een dagnotitie',
    icon: FileText,
    shortcut: '1',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    type: 'zoeken',
    label: 'Zoeken',
    description: 'Zoek een patiënt',
    icon: Search,
    shortcut: '2',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    type: 'overdracht',
    label: 'Overdracht',
    description: 'Bekijk overdracht',
    icon: ArrowRightLeft,
    shortcut: '3',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
];

export function FallbackPicker({ originalInput }: FallbackPickerProps) {
  const { openBlock, closeBlock, addRecentAction } = useSwiftStore();

  const handleSelect = useCallback(
    (option: BlockOption) => {
      // Pass original input as content for dagnotitie, or as search query for zoeken
      const prefillData =
        option.type === 'dagnotitie'
          ? { content: originalInput }
          : option.type === 'zoeken'
            ? { patientName: originalInput }
            : {};

      openBlock(option.type, prefillData);

      addRecentAction({
        intent: option.type,
        label: option.label,
      });
    },
    [openBlock, addRecentAction, originalInput]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Number keys 1-3 for quick select
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= BLOCK_OPTIONS.length) {
        e.preventDefault();
        handleSelect(BLOCK_OPTIONS[keyNum - 1]);
      }

      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        closeBlock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelect, closeBlock]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-lg font-medium text-slate-900">Wat wil je doen?</h2>
        <button
          onClick={closeBlock}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          title="Sluiten (Esc)"
          aria-label="Sluiten"
        >
          <X size={20} />
        </button>
      </div>

      {/* Original input display */}
      {originalInput && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
          <p className="text-sm text-slate-500">
            Je zei: <span className="text-slate-700">&quot;{originalInput}&quot;</span>
          </p>
        </div>
      )}

      {/* Options grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {BLOCK_OPTIONS.map((option) => (
            <motion.button
              key={option.type}
              onClick={() => handleSelect(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${option.color} hover:shadow-md`}
            >
              <option.icon size={28} />
              <span className="font-medium text-sm">{option.label}</span>
              <span className="text-xs opacity-70 text-center">{option.description}</span>
              <span className="mt-1 px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">
                [{option.shortcut}]
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          Druk op [1], [2] of [3] voor snelle selectie
        </p>
      </div>
    </motion.div>
  );
}
