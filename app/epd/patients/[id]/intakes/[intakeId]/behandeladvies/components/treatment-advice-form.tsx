'use client';

import { useState, useTransition } from 'react';
import { saveTreatmentAdvice } from '../../actions';
import { Loader2, Calendar, UserCircle, ClipboardList, Share2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { RichTextEditor } from '@/components/rich-text-editor';
import { SpeechRecorder } from '@/components/speech-recorder';

interface AdviceData {
  advice?: string;
  department?: string;
  program?: string;
  notes?: string;
  psychologist?: string;
  outcome?: 'in_zorg' | 'doorverwijzing' | 'extra_diagnostiek';
  outcomeNotes?: string;
}

const departments = ['Blijft huidige afdeling', 'Volwassenen', 'Jeugd', 'Forensisch'];
const programs = ['Algemeen GGZ', 'FACT', 'Verslaving', 'Trauma'];
const outcomeOptions = [
  { value: 'in_zorg', label: 'Cliënt gaat in zorg' },
  { value: 'doorverwijzing', label: 'Doorverwijzen' },
  { value: 'extra_diagnostiek', label: 'Extra diagnostiek nodig' },
];

const DEFAULT_PLACEHOLDER = `- Aanbevolen behandelvorm…
- Frequentie en duur…
- Aanvullende interventies…
- Medicatie-overleg indien relevant…
- Monitoring en evaluatie…`;

interface TreatmentAdviceFormProps {
  patientId: string;
  intakeId: string;
  initialData: AdviceData;
  initialDate: string;
  initialPsychologist?: string;
}

export function TreatmentAdviceForm({ patientId, intakeId, initialData, initialDate, initialPsychologist }: TreatmentAdviceFormProps) {
  const [form, setForm] = useState<AdviceData>({
    advice: initialData.advice || '',
    department: initialData.department || '',
    program: initialData.program || '',
    notes: initialData.notes || '',
    psychologist: initialData.psychologist || initialPsychologist || '',
    outcome: initialData.outcome,
    outcomeNotes: initialData.outcomeNotes || '',
  });
  const [finalize, setFinalize] = useState(Boolean(initialData.outcome));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const appendTranscript = (text: string) => {
    if (!text) return;
    const sanitized = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) =>
        `<p>${line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</p>`
      )
      .join('');
    setForm((prev) => ({ ...prev, advice: `${prev.advice || ''}${sanitized}` }));
  };

  const handleSubmit = () => {
    if (!form.advice) {
      setError('Behandeladvies is verplicht.');
      return;
    }
    if (finalize && !form.outcome) {
      setError('Kies een vervolgoptie voordat je afrondt.');
      return;
    }

    startTransition(async () => {
      try {
        await saveTreatmentAdvice({
          patientId,
          intakeId,
          advice: form.advice || '',
          department: form.department,
          program: form.program,
          notes: form.notes,
          psychologist: form.psychologist,
          finalize,
          outcome: form.outcome,
          outcomeNotes: form.outcomeNotes,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Datum advies
            </label>
            <div className="text-sm text-slate-900">{initialDate}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-2">
              <UserCircle className="h-4 w-4" /> Behandelend psycholoog
            </label>
            <input
              type="text"
              value={form.psychologist}
              onChange={(e) => setForm((prev) => ({ ...prev, psychologist: e.target.value }))}
              className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
              placeholder="Naam psycholoog"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Afdeling
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="">Selecteer afdeling…</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Zorgprogramma
            </label>
            <select
              value={form.program}
              onChange={(e) => setForm((prev) => ({ ...prev, program: e.target.value }))}
              className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="">Selecteer zorgprogramma…</option>
              {programs.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Intake afronden
              </label>
              <p className="text-xs text-slate-500">
                Kies vervolgoptie om de intake definitief af te sluiten.
              </p>
            </div>
            <input
              type="checkbox"
              checked={finalize}
              onChange={(e) => setFinalize(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
          </div>
          <div className="space-y-2">
            {outcomeOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="outcome"
                  value={option.value}
                  disabled={!finalize}
                  checked={form.outcome === option.value}
                  onChange={(e) => setForm((prev) => ({ ...prev, outcome: e.target.value as AdviceData['outcome'] }))}
                  className="h-4 w-4"
                />
                {option.label}
              </label>
            ))}
          </div>
          <textarea
            value={form.outcomeNotes}
            disabled={!finalize}
            onChange={(e) => setForm((prev) => ({ ...prev, outcomeNotes: e.target.value }))}
            placeholder="Toelichting op vervolg"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
        </div>

        <div className="rounded-lg border border-slate-200 p-4 bg-slate-50 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Share2 className="h-4 w-4" /> Doorzetten naar behandelplan
          </div>
          <p className="text-xs text-slate-500">
            Gebruik dit advies als basis voor het behandelplan of koppel direct door.
          </p>
          <Link
            href={`/epd/patients/${patientId}/behandelplan`}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white"
          >
            Open behandelplan
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <SpeechRecorder onTranscript={appendTranscript} />
        <RichTextEditor
          value={form.advice}
          onChange={(html) => setForm((prev) => ({ ...prev, advice: html }))}
          placeholder={DEFAULT_PLACEHOLDER}
        />
        <textarea
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Aanvullende notities"
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
    </div>
  );
}
