import { getTreatmentAdvice } from '../actions';
import { TreatmentAdviceForm } from './components/treatment-advice-form';

export default async function IntakeTreatmentAdvicePage({
  params,
}: {
  params: Promise<{ id: string; intakeId: string }>;
}) {
  const { id, intakeId } = await params;
  const advice = await getTreatmentAdvice(intakeId);
  const today = new Date().toLocaleDateString('nl-NL');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Behandeladvies</h2>
        <p className="text-sm text-slate-600">
          Documenteer het behandeladvies en koppel het aan een programma/afdeling.
        </p>
      </div>
      <TreatmentAdviceForm
        patientId={id}
        intakeId={intakeId}
        initialData={advice}
        initialDate={today}
        initialPsychologist={advice?.psychologist}
      />
    </div>
  );
}
