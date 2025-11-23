import { getExaminations } from '../actions';
import { ExaminationManager } from '../examination/components/examination-manager';

export default async function IntakeRomPage({
  params,
}: {
  params: Promise<{ id: string; intakeId: string }>;
}) {
  const { id, intakeId } = await params;
  const examinations = await getExaminations(intakeId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">ROM-metingen</h2>
        <p className="text-sm text-slate-600">
          Registeren van ROM-scores gekoppeld aan deze intake.
        </p>
      </div>
      <ExaminationManager
        patientId={id}
        intakeId={intakeId}
        examinations={examinations}
        isRom
      />
    </div>
  );
}
