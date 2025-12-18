/**
 * Diagnose Overzicht Pagina
 *
 * Master-detail layout voor diagnoses:
 * - Links: lijst van diagnoses met selectie
 * - Rechts: formulier voor bekijken/bewerken/toevoegen
 */

import { Suspense } from 'react';
import { Activity } from 'lucide-react';
import { getPatientDiagnoses, getPatientIntakes } from './actions';
import { DiagnosisMasterDetail } from './components/diagnosis-master-detail';

export default async function DiagnosePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = await params;

  // Haal diagnoses en intakes parallel op
  const [diagnoses, intakes] = await Promise.all([
    getPatientDiagnoses(patientId),
    getPatientIntakes(patientId),
  ]);

  // Tel actieve diagnoses
  const activeDiagnoses = diagnoses.filter((d) => d.clinical_status === 'active');

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Diagnoses</h2>
        <div className="flex items-center gap-2 mt-1">
          <Activity className="h-4 w-4 text-green-600" />
          <span className="text-sm">
            <span className="font-medium text-green-600">{activeDiagnoses.length} actief</span>
            <span className="text-slate-500"> van {diagnoses.length} totaal</span>
          </span>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <Suspense fallback={<div className="text-sm text-slate-500">Laden...</div>}>
        <DiagnosisMasterDetail
          patientId={patientId}
          diagnoses={diagnoses}
          intakes={intakes}
        />
      </Suspense>
    </div>
  );
}
