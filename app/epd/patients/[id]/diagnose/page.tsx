/**
 * Diagnose Page
 * E2.S3: Placeholder for diagnose functionality (to be implemented in Epic 6)
 */

import { Stethoscope } from 'lucide-react';

export default async function DiagnosePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Diagnose</h2>
        <p className="text-sm text-slate-600 mt-1">
          DSM-5 diagnoses en behandeladvies
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 mb-4">
          <Stethoscope className="h-8 w-8 text-purple-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Diagnose Module - Coming Soon
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          De diagnose functionaliteit wordt geïmplementeerd in Epic 6. Dit omvat
          DSM-5 diagnose registratie en behandeladvies formulering.
        </p>
      </div>
    </div>
  );
}
