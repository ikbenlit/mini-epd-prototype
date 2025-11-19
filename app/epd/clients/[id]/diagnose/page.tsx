/**
 * Diagnose & Probleemprofiel - Level 2 (Client Dossier)
 *
 * DSM-light categorieën met severity tracking.
 */

export default function DiagnosePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Diagnose & Probleemprofiel
      </h1>

      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <p className="text-slate-600 text-lg mb-2">
          DSM-light Categorieën
        </p>
        <p className="text-slate-500 text-sm">
          6 categorieën met severity indicators (Laag/Middel/Hoog)
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Epic 4 - Placeholder for future content
        </p>
      </div>
    </div>
  );
}
