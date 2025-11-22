/**
 * Intake Page
 * E2.S3: Placeholder for intake functionality (to be implemented in Epic 4)
 */

import { FileText } from 'lucide-react';

export default async function IntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Intake</h2>
        <p className="text-sm text-slate-600 mt-1">
          Overzicht van intakes en intake details
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mb-4">
          <FileText className="h-8 w-8 text-teal-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Intake Module - Coming Soon
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          De intake functionaliteit wordt geïmplementeerd in Epic 4 en 5. Dit omvat
          intake overzicht, contactmomenten, kindcheck, risicotaxatie, anamnese,
          onderzoek en ROM-metingen.
        </p>
      </div>
    </div>
  );
}
