import { ContactManager } from './components/contact-manager';
import { getContactMoments } from '../actions';

export default async function IntakeContactsPage({
  params,
}: {
  params: Promise<{ id: string; intakeId: string }>;
}) {
  const { id, intakeId } = await params;
  const contacts = await getContactMoments(intakeId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Contactmomenten</h2>
        <p className="text-sm text-slate-600">
          Registreer gesprekken, telefoontjes en andere contactmomenten.
        </p>
      </div>
      <ContactManager patientId={id} intakeId={intakeId} contacts={contacts} />
    </div>
  );
}
