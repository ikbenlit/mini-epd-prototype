'use client';

import { useState, useTransition } from 'react';
import { createContactMoment, deleteContactMoment, type Encounter } from '../../actions';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const contactTypes = [
  'Intakegesprek',
  'Aanvullend onderzoek',
  'Telefonisch contact',
  'Huisbezoek',
  'Overig',
];

interface ContactManagerProps {
  patientId: string;
  intakeId: string;
  contacts: Encounter[];
}

export function ContactManager({ patientId, intakeId, contacts }: ContactManagerProps) {
  const [form, setForm] = useState({
    date: '',
    start: '',
    end: '',
    type: contactTypes[0],
    location: 'Op locatie',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.date || !form.start) {
      setError('Datum en starttijd zijn verplicht.');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createContactMoment({
          patientId,
          intakeId,
          date: form.date,
          startTime: form.start,
          endTime: form.end,
          type: form.type,
          location: form.location,
          notes: form.notes,
        });
        setForm({ ...form, notes: '', end: '' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteContactMoment(patientId, intakeId, id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verwijderen mislukt');
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {contacts.length === 0 && (
          <p className="text-sm text-slate-500">
            Nog geen contactmomenten geregistreerd.
          </p>
        )}
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="rounded-lg border border-slate-200 p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{contact.type_display}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(contact.period_start), 'd MMM yyyy HH:mm', { locale: nl })}
                  {contact.period_end && (
                    <>
                      {' '}-{' '}
                      {format(new Date(contact.period_end), 'HH:mm', { locale: nl })}
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(contact.id)}
                disabled={deletingId === contact.id}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                {deletingId === contact.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Verwijder
              </button>
            </div>
            {contact.notes && (
              <p className="text-sm text-slate-700 whitespace-pre-line">{contact.notes}</p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Nieuw contactmoment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
          <input
            type="time"
            value={form.start}
            onChange={(e) => setForm((prev) => ({ ...prev, start: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
          <input
            type="time"
            value={form.end}
            onChange={(e) => setForm((prev) => ({ ...prev, end: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            {contactTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="Locatie"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
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
          className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Opslaan
        </button>
      </div>
    </div>
  );
}
