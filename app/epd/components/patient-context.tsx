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
  const { patient: currentPatient, setPatient } = usePatientContext();

  useEffect(() => {
    // Only update if patient ID changed - prevents flashing during navigation
    if (patient?.id !== currentPatient?.id) {
      setPatient(patient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally only depend on ID, not full object
  }, [patient?.id, currentPatient?.id, setPatient]);

  // No cleanup - keep patient in context during navigation to prevent flashing
}
