/**
 * Client Rapportage - Level 2 (Client Dossier)
 *
 * Client-specifieke voortgang en metrics.
 */

export default function ClientReportsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Rapportage & Voortgang
      </h1>

      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <p className="text-slate-600 text-lg mb-2">
          Client Voortgang
        </p>
        <p className="text-slate-500 text-sm">
          Behandelduur, sessies, doelvoortgang tracking
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Placeholder - Not designed yet
        </p>
      </div>
    </div>
  );
}
