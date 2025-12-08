/**
 * Overdracht Page
 * Master-detail layout met patiëntenlijst en detail panel voor overdracht
 */

import { Suspense } from 'react';
import { VerpleegrapportageClient } from '../components/verpleegrapportage-client';
import { getOverdrachtPatients } from '../actions';
import type { PeriodValue } from '../lib/period-utils';
import { Loader2 } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ patient?: string; periode?: string }>;
}

function LoadingState() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-teal-600 mx-auto mb-3 animate-spin" />
        <p className="text-sm text-slate-600">Laden...</p>
      </div>
    </div>
  );
}

async function OverdrachtContent({ searchParams }: PageProps) {
  const { patient, periode } = await searchParams;

  // Validate period parameter - default to '1d' (24 uur)
  const validPeriods: PeriodValue[] = ['1d', '3d', '7d', '14d'];
  const period: PeriodValue = validPeriods.includes(periode as PeriodValue)
    ? (periode as PeriodValue)
    : '1d';

  // Fetch patients data
  const data = await getOverdrachtPatients(period);

  // Determine initial patient selection
  const initialPatientId = patient && data.patients.some(p => p.id === patient)
    ? patient
    : data.patients.length > 0
      ? data.patients[0].id
      : null;

  return (
    <VerpleegrapportageClient
      initialPatients={data.patients}
      initialPatientId={initialPatientId}
      initialPeriod={period}
    />
  );
}

export default async function OverdrachtPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<LoadingState />}>
      <OverdrachtContent searchParams={searchParams} />
    </Suspense>
  );
}
