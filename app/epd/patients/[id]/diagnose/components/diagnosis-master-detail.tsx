'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Plus, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiagnosisListItem } from './diagnosis-list-item';
import { DiagnosisDetailForm } from './diagnosis-detail-form';
import type { DiagnosisWithIntake, IntakeInfo } from '../actions';

interface DiagnosisMasterDetailProps {
  patientId: string;
  diagnoses: DiagnosisWithIntake[];
  intakes: IntakeInfo[];
}

export function DiagnosisMasterDetail({
  patientId,
  diagnoses,
  intakes,
}: DiagnosisMasterDetailProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedId = searchParams.get('selected');
  const isNew = selectedId === 'new';
  const selectedDiagnosis = selectedId && !isNew
    ? diagnoses.find((d) => d.id === selectedId) || null
    : null;

  const updateSelection = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('selected', id);
    } else {
      params.delete('selected');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleNewDiagnosis = () => {
    updateSelection('new');
  };

  const handleSelectDiagnosis = (id: string) => {
    updateSelection(id);
  };

  const handleSaved = () => {
    // Na opslaan blijven we op dezelfde selectie (of clear bij new)
    if (isNew) {
      updateSelection(null);
    }
    // Router refresh gebeurt automatisch door revalidatePath
  };

  const handleDeleted = () => {
    updateSelection(null);
  };

  // Sorteer: hoofddiagnoses eerst, dan actieve, dan op datum
  const sortedDiagnoses = [...diagnoses].sort((a, b) => {
    const aIsPrimary = a.category === 'primary-diagnosis';
    const bIsPrimary = b.category === 'primary-diagnosis';
    if (aIsPrimary && !bIsPrimary) return -1;
    if (!aIsPrimary && bIsPrimary) return 1;

    const aIsActive = a.clinical_status === 'active';
    const bIsActive = b.clinical_status === 'active';
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;

    const aDate = a.recorded_date ? new Date(a.recorded_date).getTime() : 0;
    const bDate = b.recorded_date ? new Date(b.recorded_date).getTime() : 0;
    return bDate - aDate;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[500px]">
      {/* Master: Lijst (2 kolommen) */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-700">
            {diagnoses.length} diagnose{diagnoses.length !== 1 ? 's' : ''}
          </h3>
          <Button onClick={handleNewDiagnosis} size="sm" disabled={intakes.length === 0}>
            <Plus className="h-4 w-4 mr-1" />
            Nieuw
          </Button>
        </div>

        {intakes.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            Er is nog geen intake voor deze patiënt. Maak eerst een intake aan.
          </div>
        )}

        {sortedDiagnoses.length === 0 && intakes.length > 0 ? (
          <div className="text-center py-8 text-slate-500">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
              <Stethoscope className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm">Nog geen diagnoses</p>
            <p className="text-xs mt-1">Klik op &quot;Nieuw&quot; om er een toe te voegen.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedDiagnoses.map((diagnosis) => (
              <DiagnosisListItem
                key={diagnosis.id}
                diagnosis={diagnosis}
                isSelected={selectedId === diagnosis.id}
                onClick={() => handleSelectDiagnosis(diagnosis.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail: Formulier (3 kolommen) */}
      <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-5">
        <DiagnosisDetailForm
          patientId={patientId}
          intakes={intakes}
          diagnosis={selectedDiagnosis}
          isNew={isNew}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      </div>
    </div>
  );
}
