'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { FHIRPatient } from '@/lib/fhir';

interface PatientContextValue {
  patient: FHIRPatient | null;
  setPatient: (patient: FHIRPatient | null) => void;
}

const PatientContext = createContext<PatientContextValue>({
  patient: null,
  setPatient: () => {},
});

export function usePatientContext() {
  return useContext(PatientContext);
}

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<FHIRPatient | null>(null);

  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  );
}

// Hook to inject patient data into context from nested layouts
export function useSetPatient(patient: FHIRPatient | null) {
  const { setPatient } = usePatientContext();

  useEffect(() => {
    setPatient(patient);
    return () => setPatient(null); // Cleanup when unmounting
  }, [patient, setPatient]);
}
