/**
 * Behandelaar Dashboard - Level 1
 *
 * Overzicht van caseload, aandachtspunten, taken en recente activiteit.
 */

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Dashboard
      </h1>

      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <p className="text-slate-600 text-lg mb-2">
          Behandelaar Dashboard
        </p>
        <p className="text-slate-500 text-sm">
          Caseload overzicht, aandachtspunten en aankomende afspraken
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Epic 1 - Placeholder for future content
        </p>
      </div>
    </div>
  );
}
