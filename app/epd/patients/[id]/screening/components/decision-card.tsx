'use client';

import { useEffect, useState, useTransition } from 'react';
import { saveScreeningDecision } from '../actions';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldX } from 'lucide-react';

const departmentOptions = [
  'Volwassenen',
  'Jeugd (< 18 jaar)',
  'Forensisch',
  'Verslaving',
  'Ouderen (65+)',
  'FACT',
];

interface DecisionCardProps {
  patientId: string;
  screeningId: string;
  initialDecision?: string | null;
  initialDepartment?: string | null;
  initialNotes?: string | null;
  hasReferralDocument: boolean;
}

export function DecisionCard({
  patientId,
  screeningId,
  initialDecision,
  initialDepartment,
  initialNotes,
  hasReferralDocument,
}: DecisionCardProps) {
  const [decision, setDecision] = useState<'geschikt' | 'niet_geschikt' | ''>(
    (initialDecision as 'geschikt' | 'niet_geschikt') || ''
  );
  const [department, setDepartment] = useState(initialDepartment || '');
  const [notes, setNotes] = useState(initialNotes || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDecision((initialDecision as 'geschikt' | 'niet_geschikt') || '');
    setDepartment(initialDepartment || '');
    setNotes(initialNotes || '');
  }, [initialDecision, initialDepartment, initialNotes]);

  const handleSave = () => {
    if (!decision) {
      setError('Kies eerst een besluit.');
      return;
    }

    if (decision === 'geschikt' && !department) {
      setError('Kies een afdeling voor intake.');
      return;
    }

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await saveScreeningDecision({
          patientId,
          screeningId,
          decision,
          notes,
          department: decision === 'geschikt' ? department : undefined,
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
        <div className="p-2 rounded-md bg-slate-100 text-slate-700">
          {decision === 'geschikt' ? (
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          ) : decision === 'niet_geschikt' ? (
            <ShieldX className="h-5 w-5 text-red-600" />
          ) : (
            <ShieldCheck className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Screeningsbesluit</h3>
          <p className="text-sm text-slate-500">Alleen zichtbaar voor psychologen</p>
        </div>
      </div>

      {!hasReferralDocument && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Geen verwijsbrief gevonden</p>
          <p className="text-amber-800 mt-1">
            Voeg een verwijsbrief toe voordat je een definitief besluit neemt, zodat het dossier compleet is.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-wrap gap-3">
          {[
            { value: 'geschikt', label: 'Geschikt voor intake' },
            { value: 'niet_geschikt', label: 'Niet geschikt / doorverwijzen' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setDecision(option.value as 'geschikt' | 'niet_geschikt');
                setSuccess(false);
              }}
              className={cn(
                'px-4 py-2 rounded-full border text-sm font-medium transition',
                decision === option.value
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {decision === 'geschikt' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Doorgaan bij afdeling
            </label>
            <select
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);
                setSuccess(false);
              }}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Selecteer afdeling...</option>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Notities bij besluit</label>
          <textarea
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setSuccess(false);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="Extra context of afspraken..."
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div>
          {error && <span className="text-red-600">{error}</span>}
          {success && !error && <span className="text-emerald-600">Besluit opgeslagen</span>}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {isPending && <span className="animate-pulse">...</span>}
          Opslaan besluit
        </button>
      </div>
    </section>
  );
}
