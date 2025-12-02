import { getReports } from './actions';
import { RapportageWorkspaceV2 } from './components/rapportage-workspace-v2';
import { getPatient } from '../../actions';

export default async function RapportagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ encounterId?: string }>;
}) {
  const { id } = await params;
  const { encounterId } = await searchParams;
  const [reports, patient] = await Promise.all([getReports(id), getPatient(id)]);
  const patientName = formatPatientName(patient);

  return (
    <RapportageWorkspaceV2
      patientId={id}
      patientName={patientName}
      initialReports={reports}
      linkedEncounterId={encounterId}
    />
  );
}

function formatPatientName(patient: Awaited<ReturnType<typeof getPatient>>) {
  const name = patient?.name?.[0];
  if (!name) return 'deze patiënt';
  return [
    ...(name.prefix || []),
    ...(name.given || []),
    name.family,
  ]
    .filter(Boolean)
    .join(' ');
}
