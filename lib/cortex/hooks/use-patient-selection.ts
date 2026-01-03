'use client';

/**
 * usePatientSelection Hook
 *
 * Handles patient selection flow: fetch FHIR data, map to DB format, update store.
 * Extracted from ZoekenBlock for DRY compliance.
 *
 * Epic: E0.S4 (Patient Selectie - Refactor)
 * Epic: E3.S3 (Smart Defaults - Re-route after patient selection)
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCortexStore } from '@/stores/cortex-store';
import { safeFetch, getErrorInfo } from '@/lib/cortex/error-handler';
import { mapFhirToDbPatient, type Patient } from '@/lib/fhir/patient-mapper';
import type { PatientSearchResult } from './use-patient-search';

interface UsePatientSelectionOptions {
  /** Callback after successful selection */
  onSuccess?: (patient: Patient, patientName: string) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Add to recent actions (default: true) */
  trackRecentAction?: boolean;
  /** Show toast on success (default: true) */
  showSuccessToast?: boolean;
  /** Handle pending action after selection (default: true) */
  handlePendingAction?: boolean;
}

interface UsePatientSelectionReturn {
  /** Select a patient by search result */
  selectPatient: (patient: PatientSearchResult) => Promise<Patient | null>;
  /** Whether a selection is in progress */
  isSelecting: boolean;
  /** ID of the patient currently being selected */
  selectedId: string | null;
  /** Clear selection state */
  clearSelection: () => void;
}

export function usePatientSelection(
  options: UsePatientSelectionOptions = {}
): UsePatientSelectionReturn {
  const {
    onSuccess,
    onError,
    trackRecentAction = true,
    showSuccessToast = true,
    handlePendingAction = true,
  } = options;

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast } = useToast();

  // E3.S3: Get pendingAction and openArtifact for re-route functionality
  const { setActivePatient, addRecentAction, pendingAction, setPendingAction, openArtifact } = useCortexStore();

  const selectPatient = useCallback(
    async (patient: PatientSearchResult): Promise<Patient | null> => {
      setIsSelecting(true);
      setSelectedId(patient.id);

      try {
        // Fetch full FHIR patient data
        const response = await safeFetch(
          `/api/fhir/Patient/${patient.id}`,
          undefined,
          { operation: 'Patient data ophalen' }
        );
        const fhirPatient = await response.json();

        // Map to DB format
        const dbPatient = mapFhirToDbPatient(fhirPatient);

        // Update store
        setActivePatient(dbPatient);

        // Track recent action
        if (trackRecentAction) {
          addRecentAction({
            intent: 'zoeken',
            label: `Patient geselecteerd: ${patient.name}`,
            patientName: patient.name,
          });
        }

        // Show success toast
        if (showSuccessToast) {
          toast({
            title: 'Patient geselecteerd',
            description: `${patient.name} is nu actief`,
          });
        }

        // E3.S3: Handle pending action - re-route to artifact with patient info
        if (handlePendingAction && pendingAction && !pendingAction.entities.patientId) {
          const artifactType = pendingAction.artifact?.type || pendingAction.intent;

          // Only open artifact if the type is valid (not 'unknown')
          if (artifactType !== 'unknown') {
            // Open artifact with patient info merged into prefill
            openArtifact({
              type: artifactType,
              title: `${pendingAction.intent} - ${patient.name}`,
              prefill: {
                ...pendingAction.entities,
                patientId: dbPatient.id,
                patientName: patient.name,
              },
            });

            console.log('[usePatientSelection] E3.S3: Re-routed pendingAction to', artifactType);
          }

          // Clear pending action regardless
          setPendingAction(null);
        }

        // Call success callback
        onSuccess?.(dbPatient, patient.name);

        return dbPatient;
      } catch (error) {
        console.error('Failed to select patient:', error);

        const errorInfo = getErrorInfo(error, { operation: 'Patient selecteren' });
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.description,
        });

        onError?.(error instanceof Error ? error : new Error(String(error)));

        return null;
      } finally {
        setIsSelecting(false);
        setSelectedId(null);
      }
    },
    [setActivePatient, addRecentAction, toast, trackRecentAction, showSuccessToast, handlePendingAction, pendingAction, setPendingAction, openArtifact, onSuccess, onError]
  );

  const clearSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectedId(null);
  }, []);

  return {
    selectPatient,
    isSelecting,
    selectedId,
    clearSelection,
  };
}
