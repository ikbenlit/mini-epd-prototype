'use client';

import { useState, useTransition } from 'react';
import { createExamination, deleteExamination, type Examination } from '../../actions';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const examinationTypes = ['Bloedonderzoek', 'Neuropsychologisch onderzoek', 'Psychodiagnostiek', 'IQ-test', 'Persoonlijkheidsonderzoek', 'Overig'];

interface ExaminationManagerProps {
  patientId: string;
  intakeId: string;
  examinations: Examination[];
  isRom?: boolean;
}

export function ExaminationManager({ patientId, intakeId, examinations, isRom }: ExaminationManagerProps) {
  const filtered = examinations.filter((exam) =>
    isRom ? exam.examination_type === 'ROM' : exam.examination_type !== 'ROM'
  );

  const [form, setForm] = useState({
    date: '',
    type: examinationTypes[0],
    performer: '',
    findings: '',
    reason: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.date || !form.findings) {
      setError('Datum en bevindingen zijn verplicht.');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createExamination({
          patientId,
          intakeId,
          date: form.date,
          type: form.type,
          findings: form.findings,
          performer: form.performer,
          reason: form.reason,
          notes: form.notes,
          isRom,
        });
        setForm({ ...form, findings: '', notes: '' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteExamination(patientId, intakeId, id);
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
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500">
            {isRom ? 'Nog geen ROM-metingen' : 'Nog geen onderzoeken geregistreerd.'}
          </p>
        )}
        {filtered.map((exam) => (
          <div key={exam.id} className="rounded-lg border border-slate-200 p-4 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{exam.examination_type}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(exam.examination_date), 'd MMM yyyy', { locale: nl })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(exam.id)}
                disabled={deletingId === exam.id}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600"
              >
                {deletingId === exam.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Verwijder
              </button>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line">{exam.findings}</p>
            {exam.notes && <p className="text-xs text-slate-500">Notities: {exam.notes}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          {isRom ? 'Nieuwe ROM-meting' : 'Nieuw onderzoek'}
        </h3>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        />
        {!isRom && (
          <select
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            {examinationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          placeholder={isRom ? 'Instrument / score' : 'Uitgevoerd door'}
          value={form.performer}
          onChange={(e) => setForm((prev) => ({ ...prev, performer: e.target.value }))}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        />
        <textarea
          value={form.findings}
          onChange={(e) => setForm((prev) => ({ ...prev, findings: e.target.value }))}
          placeholder={isRom ? 'Score en interpretatie' : 'Bevindingen'}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          value={form.reason}
          onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
          placeholder="Reden"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
