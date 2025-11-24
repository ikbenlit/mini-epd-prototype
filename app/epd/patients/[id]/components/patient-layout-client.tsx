'use client';

import type { ReactNode } from 'react';
import type { FHIRPatient } from '@/lib/fhir';
import { useSetPatient } from '@/app/epd/components/patient-context';

interface PatientLayoutClientProps {
  patient: FHIRPatient;
  patientId: string;
  children: ReactNode;
}

export function PatientLayoutClient({ patient, children }: PatientLayoutClientProps) {
  // Inject patient data into the context (provided by parent EPDLayoutClient)
  useSetPatient(patient);

  return (
    <div className="flex h-full flex-1 flex-col bg-white">
      <div className="flex-1 overflow-auto bg-slate-50">{children}</div>
    </div>
  );
}
