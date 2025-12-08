'use client';

/**
 * VerpleegrapportageClient Component
 * Client wrapper voor master-detail layout met state management
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';
import type { PatientOverzicht } from '@/lib/types/overdracht';
import type { PeriodValue } from '../lib/period-utils';
import { PatientList } from './patient-list';
import { PatientDetail } from './patient-detail';

interface VerpleegrapportageClientProps {
  initialPatients: PatientOverzicht[];
  initialPatientId: string | null;
  initialPeriod: PeriodValue;
}

export function VerpleegrapportageClient({
  initialPatients,
  initialPatientId,
  initialPeriod,
}: VerpleegrapportageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialPatientId);
  const [period, setPeriod] = useState<PeriodValue>(initialPeriod);

  // Sync period from URL
  useEffect(() => {
    const urlPeriod = searchParams.get('periode') as PeriodValue | null;
    // Default to '1d' (24 uur) when no periode param in URL
    const newPeriod = urlPeriod && ['1d', '3d', '7d', '14d'].includes(urlPeriod)
      ? urlPeriod
      : '1d';
    setPeriod(newPeriod);
  }, [searchParams]);

  // Handle patient selection
  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);

    // Update URL with patient param
    const params = new URLSearchParams(searchParams.toString());
    params.set('patient', patientId);
    router.push(`/epd/verpleegrapportage/overdracht?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Main content - Master-detail layout (geen header meer) */}
        {/* Left panel - Patient list */}
        <aside className="w-80 border-r border-slate-200 bg-white flex-shrink-0 overflow-hidden">
          <PatientList
            patients={initialPatients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={handleSelectPatient}
          />
        </aside>

        {/* Right panel - Patient detail */}
        <main className="flex-1 overflow-hidden">
          {selectedPatientId ? (
            <PatientDetail patientId={selectedPatientId} period={period} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                <h2 className="text-lg font-medium text-slate-600 mb-2">
                  Selecteer een patiënt
                </h2>
                <p className="text-sm text-slate-500">
                  Klik op een patiënt in de lijst om de details te bekijken
                </p>
              </div>
            </div>
          )}
        </main>
    </div>
  );
}
