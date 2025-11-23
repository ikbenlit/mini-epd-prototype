'use client';

import { useState, useTransition } from 'react';
import { createDiagnosis, deleteDiagnosis, type Condition } from '../../actions';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const severities = ['licht', 'matig', 'ernstig'];
const statuses = ['active', 'resolved', 'entered-in-error'];

interface DiagnosisManagerProps {
  patientId: string;
  intakeId: string;
  diagnoses: Condition[];
}

export function DiagnosisManager({ patientId, intakeId, diagnoses }: DiagnosisManagerProps) {
  const [form, setForm] = useState({ code: '', description: '', severity: severities[0], status: statuses[0], notes: '' });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.code || !form.description) {
      setError('Code en omschrijving zijn verplicht.');
      return;
    }
    startTransition(async () => {
      try {
        await createDiagnosis({
          patientId,
          intakeId,
          code: form.code,
          description: form.description,
          severity: form.severity,
          status: form.status,
          notes: form.notes,
        });
        setForm({ ...form, notes: '' });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteDiagnosis(patientId, intakeId, id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verwijderen mislukt');
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {diagnoses.length === 0 && <p className="text-sm text-slate-500">Nog geen diagnoses.</p>}
        {diagnoses.map((diag) => (
          <div key={diag.id} className="rounded-lg border border-slate-200 p-4 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{diag.code_code} — {diag.code_display}</p>
                <p className="text-xs text-slate-500">
                  {diag.recorded_date
                    ? format(new Date(diag.recorded_date), 'd MMM yyyy', { locale: nl })
                    : 'Onbekende datum'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(diag.id)}
                disabled={deletingId === diag.id}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600"
              >
                {deletingId === diag.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Verwijder
              </button>
            </div>
            {diag.note && <p className="text-sm text-slate-700">{diag.note}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Nieuwe diagnose</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="DSM code"
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
          <input
            type="text"
            placeholder="Omschrijving"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={form.severity}
            onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Notities"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Opslaan
        </button>
      </div>
    </div>
  );
}
