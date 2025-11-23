import { getAnamneses } from '../actions';
import { AnamneseManager } from './components/anamnese-manager';

export default async function IntakeAnamnesePage({
  params,
}: {
  params: Promise<{ id: string; intakeId: string }>;
}) {
  const { id, intakeId } = await params;
  const anamneses = await getAnamneses(intakeId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Anamnese</h2>
        <p className="text-sm text-slate-600">
          Vastleggen van psychiatrische, sociale en andere anamneses.
        </p>
      </div>
      <AnamneseManager patientId={id} intakeId={intakeId} anamneses={anamneses} />
    </div>
  );
}
