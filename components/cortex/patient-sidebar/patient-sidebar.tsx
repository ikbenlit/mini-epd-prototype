'use client';

/**
 * PatientSidebar Component
 *
 * Collapsible overlay sidebar for quick patient selection.
 * Features search and recent patients list.
 *
 * Epic: E1.S2 (Patient Selectie - Sidebar)
 */

import { useEffect, useRef } from 'react';
import { X, Search, Clock, Users } from 'lucide-react';
import { useCortexStore } from '@/stores/cortex-store';
import { usePatientSearch, type PatientSearchResult } from '@/lib/cortex/hooks/use-patient-search';
import { usePatientSelection } from '@/lib/cortex/hooks/use-patient-selection';
import {
  PatientListItem,
  PatientListEmpty,
  PatientListLoading,
} from '@/components/cortex/shared/patient-list-item';
import { Input } from '@/components/ui/input';

export function PatientSidebar() {
  const {
    patientSidebarOpen,
    togglePatientSidebar,
    setPatientSidebarOpen,
    recentPatients,
    addRecentPatient,
  } = useCortexStore();

  const { query, setQuery, results, isSearching, clearResults } = usePatientSearch({
    debounceMs: 200,
    limit: 5,
  });

  const { selectPatient, isSelecting, selectedId } = usePatientSelection({
    onSuccess: (patient) => {
      // Add to recent patients and close sidebar
      addRecentPatient(patient);
      setPatientSidebarOpen(false);
      clearResults();
    },
    showSuccessToast: true,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when sidebar opens
  useEffect(() => {
    if (patientSidebarOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [patientSidebarOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && patientSidebarOpen) {
        e.preventDefault();
        setPatientSidebarOpen(false);
        clearResults();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [patientSidebarOpen, setPatientSidebarOpen, clearResults]);

  // Don't render if closed
  if (!patientSidebarOpen) return null;

  const showResults = query.length >= 2;
  const showRecent = !showResults && recentPatients.length > 0;

  // Map DB patient to search result format for PatientListItem
  const mapPatientToSearchResult = (patient: typeof recentPatients[0]): PatientSearchResult => ({
    id: patient.id,
    name: `${patient.name_given?.[0] || ''} ${patient.name_family || ''}`.trim() || 'Onbekend',
    birthDate: patient.birth_date || '',
    identifier_bsn: patient.identifier_bsn || undefined,
    identifier_client_number: patient.identifier_client_number || undefined,
    matchScore: 1,
  });

  const handleBackdropClick = () => {
    setPatientSidebarOpen(false);
    clearResults();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50 flex flex-col"
        role="dialog"
        aria-label="Patient selectie"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Patienten
          </h2>
          <button
            type="button"
            onClick={() => {
              setPatientSidebarOpen(false);
              clearResults();
            }}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek patient..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Search Results */}
          {showResults && (
            <div className="space-y-1.5">
              {isSearching ? (
                <PatientListLoading />
              ) : results.length > 0 ? (
                results.map((patient) => (
                  <PatientListItem
                    key={patient.id}
                    patient={patient}
                    isLoading={selectedId === patient.id && isSelecting}
                    onClick={() => selectPatient(patient)}
                    size="sm"
                  />
                ))
              ) : (
                <PatientListEmpty
                  message={`Geen resultaten voor "${query}"`}
                  submessage="Probeer een andere zoekterm"
                />
              )}
            </div>
          )}

          {/* Recent Patients */}
          {showRecent && (
            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Recent
              </h3>
              <div className="space-y-1.5">
                {recentPatients.map((patient) => {
                  const searchResult = mapPatientToSearchResult(patient);
                  return (
                    <PatientListItem
                      key={patient.id}
                      patient={searchResult}
                      isLoading={selectedId === patient.id && isSelecting}
                      onClick={() => selectPatient(searchResult)}
                      size="sm"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State - No query, no recent */}
          {!showResults && !showRecent && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-sm text-center">
                Typ om te zoeken of selecteer
                <br />
                een recente patient
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
