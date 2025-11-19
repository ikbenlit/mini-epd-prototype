/**
 * Intake Sectie - Level 2 (Client Dossier)
 *
 * TipTap editor voor intake notities met CRUD functionaliteit.
 */

export default function IntakePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Intakes
      </h1>

      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
        <p className="text-slate-600 text-lg mb-2">
          Intake Notities
        </p>
        <p className="text-slate-500 text-sm">
          TipTap editor, CRUD voor intakes, slide-in detail panel
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Epic 3 - Placeholder for future content
        </p>
      </div>
    </div>
  );
}
