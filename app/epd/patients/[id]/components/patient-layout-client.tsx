'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { FHIRPatient } from '@/lib/fhir';
import { ClientHeader } from './client-header';

interface PatientLayoutClientProps {
  patient: FHIRPatient;
  patientId: string;
  children: ReactNode;
}

export function PatientLayoutClient({ patient, patientId, children }: PatientLayoutClientProps) {
  const patientName = useMemo(() => {
    const name = patient.name?.[0];
    if (!name) return 'deze patiënt';
    return [
      ...(name.prefix || []),
      ...(name.given || []),
      name.family,
    ]
      .filter(Boolean)
      .join(' ');
  }, [patient]);

  return (
    <div className="flex h-full flex-1 flex-col bg-white">
      <ClientHeader patient={patient} focusElementId="rapportage-composer" />
      <div className="flex-1 overflow-auto bg-slate-50">{children}</div>
    </div>
  );
}
