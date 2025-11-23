'use client';

import { useState, useTransition } from 'react';
import { addScreeningActivity } from '../actions';
import type { ScreeningActivity } from '@/lib/types/screening';
import { Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ActivityLogProps {
  patientId: string;
  screeningId: string;
  activities: ScreeningActivity[];
}

export function ActivityLog({ patientId, screeningId, activities }: ActivityLogProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!text.trim()) {
      setError('Vul eerst een activiteit in.');
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await addScreeningActivity({
          patientId,
          screeningId,
          text,
        });
        setText('');
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Toevoegen mislukt');
      }
    });
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-md bg-blue-50 text-blue-600">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Activiteitenlog</h3>
          <p className="text-sm text-slate-500">Chronologisch overzicht</p>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto flex-1 pr-1">
        {activities.length === 0 && (
          <p className="text-sm text-slate-500">
            Nog geen activiteiten. Voeg de eerste notitie toe om het dossier te starten.
          </p>
        )}
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border border-slate-200 rounded-lg p-3 bg-slate-50"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium text-slate-700">
                {activity.created_by_name || 'Onbekende gebruiker'}
              </span>
              {activity.created_at && (
                <span>
                  {format(new Date(activity.created_at), 'd MMM yyyy HH:mm', { locale: nl })}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line">{activity.activity_text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Nieuwe activiteit
        </label>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Bijv. Huisarts gesproken, verwijsbrief ontvangen..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Toevoegen
        </button>
      </div>
    </section>
  );
}
