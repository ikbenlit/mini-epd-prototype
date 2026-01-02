'use client';

/**
 * Chat Suggestions Component
 *
 * A categorized suggestion strip above the chat input.
 * Shows tabs for categories and clickable chips with example sentences.
 *
 * Features:
 * - Minimizable after first message
 * - Click to fill input (not send)
 * - Contextual patient name replacement
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUGGESTION_CATEGORIES, replacePlaceholder } from '@/lib/cortex/suggestions';

interface ChatSuggestionsProps {
  /** Whether the strip should be minimized */
  isMinimized: boolean;
  /** Callback when minimized state changes */
  onToggleMinimize: () => void;
  /** Callback when a suggestion is clicked */
  onSelectSuggestion: (text: string) => void;
  /** Optional active patient name to replace [naam] placeholders */
  activePatientName?: string;
}

export function ChatSuggestions({
  isMinimized,
  onToggleMinimize,
  onSelectSuggestion,
  activePatientName,
}: ChatSuggestionsProps) {
  const [activeCategory, setActiveCategory] = useState(SUGGESTION_CATEGORIES[0].id);

  const currentCategory = SUGGESTION_CATEGORIES.find((c) => c.id === activeCategory);

  const handleChipClick = (text: string, hasPlaceholder?: boolean) => {
    // Replace placeholder with patient name if available, otherwise keep placeholder
    const finalText = hasPlaceholder
      ? replacePlaceholder(text, activePatientName)
      : text;
    onSelectSuggestion(finalText);
  };

  return (
    <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
      {/* Minimized state - just a button */}
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onClick={onToggleMinimize}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2',
              'text-xs text-slate-500 hover:text-slate-700',
              'hover:bg-slate-50 transition-colors'
            )}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Toon suggesties</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Header with minimize button */}
            <div className="flex items-center justify-between px-4 pt-2 pb-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Wat kan ik vragen?</span>
              </div>
              <button
                onClick={onToggleMinimize}
                className={cn(
                  'text-slate-400 hover:text-slate-600',
                  'p-1 rounded hover:bg-slate-100 transition-colors'
                )}
                aria-label="Minimaliseer suggesties"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 px-3 pb-2 overflow-x-auto">
              {SUGGESTION_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                    'text-xs font-medium whitespace-nowrap',
                    'transition-all duration-200',
                    activeCategory === category.id
                      ? 'bg-brand-100 text-brand-700 shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  )}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>

            {/* Example chips */}
            <div className="px-3 pb-3">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-wrap gap-2"
              >
                {currentCategory?.examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleChipClick(example.text, example.hasPatientPlaceholder)}
                    className={cn(
                      'text-[11px] leading-relaxed',
                      'bg-white border border-slate-200 rounded-full',
                      'px-3 py-1.5',
                      'text-slate-700',
                      'hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700',
                      'active:scale-[0.98]',
                      'transition-all duration-150',
                      'shadow-sm hover:shadow'
                    )}
                  >
                    &ldquo;{example.hasPatientPlaceholder && activePatientName
                      ? replacePlaceholder(example.text, activePatientName)
                      : example.text}&rdquo;
                  </button>
                ))}
              </motion.div>
              {currentCategory && (
                <p className="text-[10px] text-slate-400 mt-2 px-1">
                  {currentCategory.description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

