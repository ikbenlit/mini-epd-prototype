import { getRiskAssessments } from '../actions';
import { RiskManager } from './components/risk-manager';

export default async function IntakeRiskPage({
  params,
}: {
  params: Promise<{ id: string; intakeId: string }>;
}) {
  const { id, intakeId } = await params;
  const risks = await getRiskAssessments(intakeId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Risicotaxaties</h2>
        <p className="text-sm text-slate-600">
          Vastleggen van risico-inschattingen en opvolgacties.
        </p>
      </div>
      <RiskManager patientId={id} intakeId={intakeId} risks={risks} />
    </div>
  );
}
