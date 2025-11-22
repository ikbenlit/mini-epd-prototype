/**
 * Rapportage Page
 * E2.S3: Placeholder for rapportage functionality (future epic)
 */

import { FileBarChart } from 'lucide-react';

export default async function RapportagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Rapportage</h2>
        <p className="text-sm text-slate-600 mt-1">
          Overzichten, statistieken en export mogelijkheden
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
          <FileBarChart className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Rapportage Module - Coming Soon
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          De rapportage functionaliteit wordt in een latere fase geïmplementeerd.
          Dit omvat overzichten, statistieken en exportfunctionaliteit.
        </p>
      </div>
    </div>
  );
}
