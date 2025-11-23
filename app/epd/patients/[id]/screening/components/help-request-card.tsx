'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2, NotebookPen } from 'lucide-react';
import { saveHelpRequest } from '../actions';
import { cn } from '@/lib/utils';

interface HelpRequestCardProps {
  patientId: string;
  screeningId: string;
  initialValue?: string | null;
}

export function HelpRequestCard({ patientId, screeningId, initialValue }: HelpRequestCardProps) {
  const [value, setValue] = useState(initialValue || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const handleSave = () => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await saveHelpRequest({
          patientId,
          screeningId,
          request: value,
        });
        setSuccess(true);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-md bg-teal-50 text-teal-600">
          <NotebookPen className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Hulpvraag</h3>
          <p className="text-sm text-slate-500">Beschrijf de zorgvraag van de cliënt</p>
        </div>
      </div>

      <textarea
        className="w-full min-h-[160px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
        placeholder="Beschrijf de hulpvraag van de cliënt..."
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSuccess(false);
        }}
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm">
          {error && <span className="text-red-600">{error}</span>}
          {success && !error && <span className="text-emerald-600">Opgeslagen</span>}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Opslaan
        </button>
      </div>
    </section>
  );
}
