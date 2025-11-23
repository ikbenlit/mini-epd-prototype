'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { FHIRPatient } from '@/lib/fhir';
import { ClientHeader } from './client-header';
import { RapportageModal } from '../rapportage/components/rapportage-modal';

interface PatientLayoutClientProps {
  patient: FHIRPatient;
  patientId: string;
  children: ReactNode;
}

export function PatientLayoutClient({ patient, patientId, children }: PatientLayoutClientProps) {
  const [isModalOpen, setModalOpen] = useState(false);

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
      <ClientHeader patient={patient} onNewReport={() => setModalOpen(true)} />
      <div className="flex-1 overflow-auto bg-slate-50">{children}</div>
      <RapportageModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        patientId={patientId}
        patientName={patientName}
      />
    </div>
  );
}
