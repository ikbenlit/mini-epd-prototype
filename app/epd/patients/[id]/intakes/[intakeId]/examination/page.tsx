import { getExaminations } from '../actions';
import { ExaminationManager } from './components/examination-manager';

export default async function IntakeExaminationPage({
  params,
}: {
  params: Promise<{ id: string; intakeId: string }>;
}) {
  const { id, intakeId } = await params;
  const examinations = await getExaminations(intakeId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Onderzoeken</h2>
        <p className="text-sm text-slate-600">
          Psychodiagnostiek, medische onderzoeken en rapportage.
        </p>
      </div>
      <ExaminationManager patientId={id} intakeId={intakeId} examinations={examinations} />
    </div>
  );
}
