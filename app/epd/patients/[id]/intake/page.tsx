import { redirect } from 'next/navigation';

/**
 * Intake Redirect
 * Redirects from /epd/patients/[id]/intake to /epd/patients/[id]/intakes
 */

export default async function IntakeRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/epd/patients/${id}/intakes`);
}
