/**
 * Client Dashboard - Level 2 (Client Dossier)
 *
 * Overzicht van client voortgang, recente activiteit en belangrijke metrics.
 */

export default function ClientDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Dashboard
      </h1>

      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <p className="text-slate-600 text-lg mb-2">
          Client Dashboard
        </p>
        <p className="text-slate-500 text-sm">
          Overzicht, recente activiteit, snelle acties
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Placeholder - Not designed yet
        </p>
      </div>
    </div>
  );
}
