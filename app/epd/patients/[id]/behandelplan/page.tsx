/**
 * Behandelplan Page
 * E2.S3: Placeholder for behandelplan functionality (future epic)
 */

import { Calendar } from 'lucide-react';

export default async function BehandelplanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Behandelplan</h2>
        <p className="text-sm text-slate-600 mt-1">
          Behandeldoelen, interventies en planning
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
          <Calendar className="h-8 w-8 text-indigo-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Behandelplan Module - Coming Soon
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          De behandelplan functionaliteit wordt in een latere fase geïmplementeerd.
          Dit omvat doelstellingen, interventies en planning van de behandeling.
        </p>
      </div>
    </div>
  );
}
