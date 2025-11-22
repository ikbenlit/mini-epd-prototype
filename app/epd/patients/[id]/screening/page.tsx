/**
 * Screening Page
 * E2.S3: Placeholder for screening functionality (to be implemented in Epic 3)
 */

import { ClipboardList } from 'lucide-react';

export default async function ScreeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Screening</h2>
        <p className="text-sm text-slate-600 mt-1">
          Activiteitenlog, documenten, hulpvraag en screeningsbesluit
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
          <ClipboardList className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Screening Module - Coming Soon
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          De screening functionaliteit wordt geïmplementeerd in Epic 3. Dit omvat
          activiteitenlog, documentbeheer, hulpvraag registratie en screeningsbesluit.
        </p>
      </div>
    </div>
  );
}
