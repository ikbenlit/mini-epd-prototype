'use client';

import { useState, useTransition } from 'react';
import {
  createRiskAssessment,
  deleteRiskAssessment,
  type RiskAssessment,
} from '../../actions';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

// Database values -> Display labels
const riskTypeOptions = [
  { value: 'suicidaliteit', label: 'Suïcidaliteit' },
  { value: 'agressie', label: 'Agressie' },
  { value: 'zelfverwaarlozing', label: 'Zelfverwaarlozing' },
  { value: 'middelenmisbruik', label: 'Middelenmisbruik' },
  { value: 'verward_gedrag', label: 'Verward gedrag' },
  { value: 'overig', label: 'Overig' },
];
const riskLevelOptions = [
  { value: 'laag', label: 'Laag' },
  { value: 'gemiddeld', label: 'Gemiddeld' },
  { value: 'hoog', label: 'Hoog' },
  { value: 'zeer_hoog', label: 'Zeer hoog' },
];

interface RiskManagerProps {
  patientId: string;
  intakeId: string;
  risks: RiskAssessment[];
}

export function RiskManager({ patientId, intakeId, risks }: RiskManagerProps) {
  const [form, setForm] = useState({
    date: '',
    type: riskTypeOptions[0].value,
    level: riskLevelOptions[0].value,
    rationale: '',
    measures: '',
    evaluationDate: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.date || !form.rationale) {
      setError('Datum en onderbouwing zijn verplicht.');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createRiskAssessment({
          patientId,
          intakeId,
          date: form.date,
          type: form.type,
          level: form.level,
          rationale: form.rationale,
          measures: form.measures,
          evaluationDate: form.evaluationDate || undefined,
          notes: form.notes,
        });
        setForm({ ...form, rationale: '', measures: '', notes: '' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteRiskAssessment(patientId, intakeId, id);
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
        {risks.length === 0 && (
          <p className="text-sm text-slate-500">Nog geen risicotaxaties vastgelegd.</p>
        )}
        {risks.map((risk) => {
          const typeLabel = riskTypeOptions.find((o) => o.value === risk.risk_type)?.label ?? risk.risk_type;
          const levelLabel = riskLevelOptions.find((o) => o.value === risk.risk_level)?.label ?? risk.risk_level;
          return (
          <div key={risk.id} className="rounded-lg border border-slate-200 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{typeLabel}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(risk.assessment_date), 'd MMM yyyy', { locale: nl })} • {levelLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(risk.id)}
                disabled={deletingId === risk.id}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600"
              >
                {deletingId === risk.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Verwijder
              </button>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line">{risk.rationale}</p>
            {risk.measures && <p className="text-xs text-slate-600">Maatregelen: {risk.measures}</p>}
            {risk.notes && <p className="text-xs text-slate-500">Notities: {risk.notes}</p>}
          </div>
        )})}
      </div>

      <div className="rounded-lg border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Nieuwe risicotaxatie</h3>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            {riskTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={form.level}
            onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            {riskLevelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={form.rationale}
          onChange={(e) => setForm((prev) => ({ ...prev, rationale: e.target.value }))}
          placeholder="Onderbouwing"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          value={form.measures}
          onChange={(e) => setForm((prev) => ({ ...prev, measures: e.target.value }))}
          placeholder="Maatregelen"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={form.evaluationDate}
          onChange={(e) => setForm((prev) => ({ ...prev, evaluationDate: e.target.value }))}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        />
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
