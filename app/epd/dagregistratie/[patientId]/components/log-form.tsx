'use client';

/**
 * LogForm Component
 * E3.S2: Quick entry form met categorie, tijd, tekst en overdracht checkbox
 */

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import {
  Loader2,
  Plus,
  Pill,
  Utensils,
  User,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import {
  NURSING_LOG_CATEGORIES,
  CATEGORY_CONFIG,
  type NursingLogCategory,
} from '@/lib/types/nursing-log';

interface LogFormProps {
  patientId: string;
  onSuccess: () => void;
}

// Icon mapping
const CATEGORY_ICONS: Record<NursingLogCategory, React.ComponentType<{ className?: string }>> = {
  medicatie: Pill,
  adl: Utensils,
  gedrag: User,
  incident: AlertTriangle,
  observatie: FileText,
};

export function LogForm({ patientId, onSuccess }: LogFormProps) {
  const [category, setCategory] = useState<NursingLogCategory>('observatie');
  const [content, setContent] = useState('');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [includeInHandover, setIncludeInHandover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    const timestamp = today.toISOString();

    startTransition(async () => {
      try {
        const response = await fetch('/api/nursing-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: patientId,
            category,
            content: content.trim(),
            timestamp,
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

        onSuccess();
      } catch (err) {
        console.error('Failed to create log:', err);
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  const charactersLeft = 500 - content.length;
  const selectedConfig = CATEGORY_CONFIG[category];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 overflow-hidden"
    >
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900">Nieuwe notitie</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Categorie
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {NURSING_LOG_CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = CATEGORY_ICONS[cat];
              const isSelected = category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `${config.bgColor} ${config.textColor} border-current`
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Input */}
        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Tijdstip
          </label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full sm:w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Notitie
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Beschrijf de ${selectedConfig.label.toLowerCase()}...`}
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
          />
          <div className="flex justify-between mt-1">
            <span
              className={`text-xs ${
                charactersLeft < 50 ? 'text-amber-600' : 'text-slate-500'
              }`}
            >
              {charactersLeft} karakters over
            </span>
          </div>
        </div>

        {/* Include in Handover Checkbox */}
        <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
          <input
            type="checkbox"
            id="handover"
            checked={includeInHandover}
            onChange={(e) => setIncludeInHandover(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="handover" className="flex-1 cursor-pointer">
            <span className="text-sm font-medium text-teal-900">
              Opnemen in overdracht
            </span>
            <p className="text-xs text-teal-700">
              Deze notitie wordt meegenomen in de AI-gegenereerde overdracht
            </p>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isPending ? 'Opslaan...' : 'Notitie toevoegen'}
        </button>
      </div>
    </form>
  );
}
