import { getKindcheck } from '../actions';
import { KindcheckForm } from './components/kindcheck-form';

export default async function IntakeKindcheckPage({
  params,
}: {
  params: Promise<{ id: string; intakeId: string }>;
}) {
  const { id, intakeId } = await params;
  const data = await getKindcheck(intakeId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Kindcheck</h2>
        <p className="text-sm text-slate-600">
          Registreer aanwezigheid van kinderen, zorgen en ondernomen acties.
        </p>
      </div>
      <KindcheckForm patientId={id} intakeId={intakeId} initialData={data} />
    </div>
  );
}
