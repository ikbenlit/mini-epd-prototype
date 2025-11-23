import { getDiagnoses } from '../actions';
import { DiagnosisManager } from './components/diagnosis-manager';

export default async function IntakeDiagnosisPage({
  params,
}: {
  params: Promise<{ id: string; intakeId: string }>;
}) {
  const { id, intakeId } = await params;
  const diagnoses = await getDiagnoses(intakeId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Diagnoses</h2>
        <p className="text-sm text-slate-600">
          Registreer DSM-5 diagnoses gekoppeld aan deze intake.
        </p>
      </div>
      <DiagnosisManager patientId={id} intakeId={intakeId} diagnoses={diagnoses} />
    </div>
  );
}
