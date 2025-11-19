/**
 * Behandelaar Agenda - Level 1
 *
 * Kalender view met alle afspraken van de behandelaar.
 */

export default function AgendaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Agenda
      </h1>

      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <p className="text-slate-600 text-lg mb-2">
          Behandelaar Agenda
        </p>
        <p className="text-slate-500 text-sm">
          Kalender view met alle afspraken (alle cliënten)
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Placeholder - Not designed yet
        </p>
      </div>
    </div>
  );
}
