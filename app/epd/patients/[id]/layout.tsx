import type { ReactNode } from 'react';
import { getPatient } from '../actions';
import { PatientLayoutClient } from './components/patient-layout-client';

export default async function PatientDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);

  return (
    <PatientLayoutClient patientId={id} patient={patient}>
      {children}
    </PatientLayoutClient>
  );
}
