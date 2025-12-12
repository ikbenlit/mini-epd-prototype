/**
 * Diagnose Overzicht Pagina
 *
 * Toont alle diagnoses van een patiënt (uit alle intakes).
 * Diagnoses kunnen worden bewerkt via de gekoppelde intake.
 */

import { Stethoscope, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPatientDiagnoses } from './actions';
import { DiagnosisOverviewCard } from './components/diagnosis-overview-card';
import { createClient } from '@/lib/auth/server';

export default async function DiagnosePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = await params;

  // Haal alle diagnoses op
  const diagnoses = await getPatientDiagnoses(patientId);

  // Sorteer: hoofddiagnoses eerst, dan actieve, dan op datum
  const sortedDiagnoses = [...diagnoses].sort((a, b) => {
    // Hoofddiagnoses eerst
    const aIsPrimary = a.category === 'primary-diagnosis';
    const bIsPrimary = b.category === 'primary-diagnosis';
    if (aIsPrimary && !bIsPrimary) return -1;
    if (!aIsPrimary && bIsPrimary) return 1;

    // Actieve diagnoses eerst
    const aIsActive = a.clinical_status === 'active';
    const bIsActive = b.clinical_status === 'active';
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;

    // Dan op datum (nieuwste eerst)
    const aDate = a.recorded_date ? new Date(a.recorded_date).getTime() : 0;
    const bDate = b.recorded_date ? new Date(b.recorded_date).getTime() : 0;
    return bDate - aDate;
  });

  // Tel actieve diagnoses
  const activeDiagnoses = diagnoses.filter((d) => d.clinical_status === 'active');
  const primaryDiagnosis = diagnoses.find((d) => d.category === 'primary-diagnosis');

  // Haal meest recente intake op voor "Nieuwe diagnose" link
  const supabase = await createClient();
  const { data: recentIntake } = await supabase
    .from('intakes')
    .select('id')
    .eq('patient_id', patientId)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const newDiagnosisUrl = recentIntake
    ? `/epd/patients/${patientId}/intakes/${recentIntake.id}/diagnosis`
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Diagnoses</h2>
          <p className="text-sm text-slate-600 mt-1">
            Overzicht van alle diagnoses (ICD-10) voor deze patiënt.
          </p>
        </div>

        {newDiagnosisUrl && (
          <Button asChild>
            <Link href={newDiagnosisUrl}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe diagnose
            </Link>
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{diagnoses.length}</div>
          <div className="text-sm text-slate-600">Totaal diagnoses</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-green-600">{activeDiagnoses.length}</div>
          <div className="text-sm text-slate-600">Actieve diagnoses</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-900 truncate">
            {primaryDiagnosis ? (
              <>
                <span className="font-mono">{primaryDiagnosis.code_code}</span>
                {' — '}
                {primaryDiagnosis.code_display}
              </>
            ) : (
              <span className="text-slate-400">Geen hoofddiagnose</span>
            )}
          </div>
          <div className="text-sm text-slate-600">Hoofddiagnose</div>
        </div>
      </div>

      {/* Diagnoses lijst */}
      {sortedDiagnoses.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 mb-4">
            <Stethoscope className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Nog geen diagnoses
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
            Er zijn nog geen diagnoses geregistreerd voor deze patiënt.
            Diagnoses worden vastgelegd tijdens een intake.
          </p>
          {newDiagnosisUrl && (
            <Button asChild>
              <Link href={newDiagnosisUrl}>
                <Plus className="h-4 w-4 mr-2" />
                Eerste diagnose toevoegen
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDiagnoses.map((diagnosis) => (
            <DiagnosisOverviewCard
              key={diagnosis.id}
              diagnosis={diagnosis}
              patientId={patientId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
