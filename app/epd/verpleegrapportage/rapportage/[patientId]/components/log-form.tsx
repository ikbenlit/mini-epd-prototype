'use client';

/**
 * LogForm Component - Compact Quick Entry
 * Compacte inline entry met expandeerbaar volledig formulier
 * Categorie pills + tijd inline, overdracht toggle prominent
 */

import { useState, useTransition, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Loader2,
  Plus,
  Pill,
  Utensils,
  User,
  AlertTriangle,
  FileText,
  Clock,
  ChevronDown,
  CheckCircle2,
  Send,
} from 'lucide-react';
import {
  VERPLEEGKUNDIG_CATEGORIES,
  CATEGORY_CONFIG,
  type VerpleegkundigCategory,
} from '@/lib/types/report';

interface LogFormProps {
  patientId: string;
  onSuccess: () => void;
}

// Icon mapping
const CATEGORY_ICONS: Record<VerpleegkundigCategory, React.ComponentType<{ className?: string }>> = {
  medicatie: Pill,
  adl: Utensils,
  gedrag: User,
  incident: AlertTriangle,
  observatie: FileText,
};

export function LogForm({ patientId, onSuccess }: LogFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [category, setCategory] = useState<VerpleegkundigCategory>('observatie');
  const [content, setContent] = useState('');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [includeInHandover, setIncludeInHandover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  // Auto-expand when typing starts
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (!isExpanded && e.target.value.length > 0) {
      setIsExpanded(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Vul een notitie in');
      return;
    }

    if (content.length > 500) {
      setError('Notitie mag maximaal 500 karakters bevatten');
      return;
    }

    setError(null);

    // Build timestamp from date and time
    const today = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    today.setHours(hours, minutes, 0, 0);

    startTransition(async () => {
      try {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: patientId,
            type: 'verpleegkundig',
            content: content.trim(),
            category,
            include_in_handover: includeInHandover,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Opslaan mislukt');
        }

        // Reset form
        setContent('');
        setTime(format(new Date(), 'HH:mm'));
        setIncludeInHandover(false);
        setCategory('observatie');
        setIsExpanded(false);

        onSuccess();
      } catch (err) {
        console.error('Failed to create report:', err);
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  const charactersLeft = 500 - content.length;
  const selectedConfig = CATEGORY_CONFIG[category];
  const SelectedIcon = CATEGORY_ICONS[category];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm"
    >
      {/* Compact Header - Always visible */}
      <div className="p-3">
        {/* Category pills row */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 -mb-1">
          {VERPLEEGKUNDIG_CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const Icon = CATEGORY_ICONS[cat];
            const isSelected = category === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? `${config.bgColor} ${config.textColor} ring-2 ring-offset-1 ring-current`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input area with inline time and submit */}
        <div className="flex items-start gap-2">
          {/* Time input - compact */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Clock className="h-4 w-4 text-slate-400" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-20 text-sm border-0 bg-slate-50 rounded px-2 py-1.5 focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {/* Textarea - grows on focus/content */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onFocus={() => setIsExpanded(true)}
              placeholder={`Nieuwe ${selectedConfig.label.toLowerCase()} notitie...`}
              rows={isExpanded ? 3 : 1}
              maxLength={500}
              className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none transition-all ${
                isExpanded ? 'min-h-[80px]' : 'min-h-[38px]'
              }`}
            />

            {/* Character counter - only when expanded */}
            {isExpanded && (
              <div className="absolute bottom-2 right-2">
                <span
                  className={`text-xs ${
                    charactersLeft < 50 ? 'text-amber-600 font-medium' : 'text-slate-400'
                  }`}
                >
                  {charactersLeft}
                </span>
              </div>
            )}
          </div>

          {/* Submit button - always visible */}
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="flex-shrink-0 p-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Opslaan"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded section - Handover toggle */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 border-t border-slate-100 mt-2 pt-2">
          <div className="flex items-center justify-between">
            {/* Handover toggle - prominent */}
            <button
              type="button"
              onClick={() => setIncludeInHandover(!includeInHandover)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                includeInHandover
                  ? 'bg-teal-100 text-teal-800 ring-2 ring-teal-500 ring-offset-1'
                  : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${includeInHandover ? 'text-teal-600' : ''}`} />
              <span>Overdracht</span>
              {includeInHandover && (
                <span className="text-xs bg-teal-600 text-white px-1.5 py-0.5 rounded">
                  Aan
                </span>
              )}
            </button>

            {/* Collapse button */}
            <button
              type="button"
              onClick={() => {
                if (!content.trim()) {
                  setIsExpanded(false);
                }
              }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              {content.trim() ? '' : 'Inklappen'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Collapsed state helper text */}
      {!isExpanded && !content && (
        <div className="px-3 pb-2 -mt-1">
          <p className="text-xs text-slate-400">
            Klik op het tekstveld om te beginnen met typen
          </p>
        </div>
      )}
    </form>
  );
}
