'use client';

import { useState, useTransition } from 'react';
import { createAnamnese, deleteAnamnese, type Anamnese } from '../../actions';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const types = [
  'Psychiatrische anamnese',
  'Sociale anamnese',
  'Medische anamnese',
  'Familieanamnese',
  'Ontwikkelingsanamnese',
  'Overig',
];

interface AnamneseManagerProps {
  patientId: string;
  intakeId: string;
  anamneses: Anamnese[];
}

export function AnamneseManager({ patientId, intakeId, anamneses }: AnamneseManagerProps) {
  const [form, setForm] = useState({
    date: '',
    type: types[0],
    content: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.date || !form.content) {
      setError('Datum en inhoud zijn verplicht.');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createAnamnese({
          patientId,
          intakeId,
          date: form.date,
          type: form.type,
          content: form.content,
          notes: form.notes,
        });
        setForm({ ...form, content: '', notes: '' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteAnamnese(patientId, intakeId, id);
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
        {anamneses.length === 0 && <p className="text-sm text-slate-500">Nog geen anamneses.</p>}
        {anamneses.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 p-4 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{item.anamnese_type}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(item.anamnese_date), 'd MMM yyyy', { locale: nl })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600"
              >
                {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Verwijder
              </button>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line">{item.content}</p>
            {item.notes && <p className="text-xs text-slate-500">Notities: {item.notes}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Nieuwe anamnese</h3>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        />
        <select
          value={form.type}
          onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <textarea
          value={form.content}
          onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
          placeholder="Inhoud"
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
