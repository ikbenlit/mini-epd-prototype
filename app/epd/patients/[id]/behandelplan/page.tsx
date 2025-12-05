/**
 * Behandelplan Page
 * E3.S1: Server component met data loading
 */

import { getCarePlans, getPatientIntakes, getPatientConditions } from './actions';
import { BehandelplanPageClient } from './page-client';

export default async function BehandelplanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Parallel data loading - haal ALLE plannen op
  const [allPlans, intakes, conditions] = await Promise.all([
    getCarePlans(id),
    getPatientIntakes(id),
    getPatientConditions(id),
  ]);

  return (
    <div className="p-6">
      <BehandelplanPageClient
        patientId={id}
        allPlans={allPlans}
        intakes={intakes}
        conditions={conditions}
      />
    </div>
  );
}
