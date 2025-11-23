import { getReports } from './actions';
import { RapportageWorkspace } from './components/rapportage-workspace';
import { getPatient } from '../../actions';

export default async function RapportagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [reports, patient] = await Promise.all([getReports(id), getPatient(id)]);
  const patientName = formatPatientName(patient);

  return (
    <RapportageWorkspace
      patientId={id}
      patientName={patientName}
      initialReports={reports}
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
