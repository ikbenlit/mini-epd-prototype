/**
 * Behandelplan - Level 2 (Client Dossier)
 *
 * SMART doelen tracking met interventies en versioning.
 */

export default function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Behandelplan
      </h1>

      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <p className="text-slate-600 text-lg mb-2">
          SMART Doelen & Interventies
        </p>
        <p className="text-slate-500 text-sm">
          Treatment plan met versioning (v1, v2, concept/gepubliceerd)
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Epic 5 - Placeholder for future content
        </p>
      </div>
    </div>
  );
}
