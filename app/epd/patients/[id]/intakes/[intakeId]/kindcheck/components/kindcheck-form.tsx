'use client';

import { useState, useTransition } from 'react';
import { saveKindcheck, type KindcheckData } from '../../actions';
import { Loader2 } from 'lucide-react';

interface KindcheckFormProps {
  patientId: string;
  intakeId: string;
  initialData: KindcheckData;
}

export function KindcheckForm({ patientId, intakeId, initialData }: KindcheckFormProps) {
  const [form, setForm] = useState<KindcheckData>({ ...initialData });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await saveKindcheck(patientId, intakeId, form);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Thuiswonende kinderen?</label>
        <select
          value={form.hasChildren ? 'yes' : 'no'}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, hasChildren: e.target.value === 'yes' }))
          }
          className="h-9 rounded-md border border-slate-300 px-3 text-sm"
        >
          <option value="no">Nee</option>
          <option value="yes">Ja</option>
        </select>
      </div>

      {form.hasChildren && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Aantal kinderen"
            value={form.childCount ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, childCount: Number(e.target.value) || 0 }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
          <input
            type="text"
            placeholder="Leeftijden"
            value={form.ages ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, ages: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Zorgen over veiligheid?</label>
        <select
          value={form.concerns ? 'yes' : 'no'}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, concerns: e.target.value === 'yes' }))
          }
          className="h-9 rounded-md border border-slate-300 px-3 text-sm"
        >
          <option value="no">Nee</option>
          <option value="yes">Ja</option>
        </select>
      </div>
      {form.concerns && (
        <textarea
          value={form.concernsNotes ?? ''}
          onChange={(e) => setForm((prev) => ({ ...prev, concernsNotes: e.target.value }))}
          placeholder="Toelichting"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      )}

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Actie ondernomen?</label>
        <select
          value={form.actionTaken ? 'yes' : 'no'}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, actionTaken: e.target.value === 'yes' }))
          }
          className="h-9 rounded-md border border-slate-300 px-3 text-sm"
        >
          <option value="no">Nee</option>
          <option value="yes">Ja</option>
        </select>
      </div>
      {form.actionTaken && (
        <textarea
          value={form.actionNotes ?? ''}
          onChange={(e) => setForm((prev) => ({ ...prev, actionNotes: e.target.value }))}
          placeholder="Beschrijving van actie"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      )}

      <textarea
        value={form.notes ?? ''}
        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        placeholder="Notities"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Opslaan
      </button>
    </div>
  );
}
