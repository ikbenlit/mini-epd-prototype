'use client';

/**
 * PatientMentionDropdown Component
 *
 * Dropdown for @mention patient selection in CommandInput.
 * Positioned above the input, shows search results.
 *
 * Epic: E2.S2 (Patient Selectie - @Mention)
 */

import { useEffect } from 'react';
import { usePatientSearch, type PatientSearchResult } from '@/lib/cortex/hooks/use-patient-search';
import {
  PatientListItem,
  PatientListEmpty,
  PatientListLoading,
} from '@/components/cortex/shared/patient-list-item';

interface PatientMentionDropdownProps {
  /** Current search query (text after @) */
  query: string;
  /** Called when a patient is selected */
  onSelect: (patient: PatientSearchResult) => void;
  /** Called when dropdown should close */
  onClose: () => void;
}

export function PatientMentionDropdown({
  query,
  onSelect,
  onClose,
}: PatientMentionDropdownProps) {
  const { setQuery, results, isSearching } = usePatientSearch({
    debounceMs: 150,
    limit: 5,
    minQueryLength: 2,
  });

  // Sync query to search hook
  useEffect(() => {
    setQuery(query);
  }, [query, setQuery]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden"
      role="listbox"
      aria-label="Patient zoekresultaten"
    >
      {isSearching ? (
        <PatientListLoading message="Zoeken..." />
      ) : query.length < 2 ? (
        <div className="p-3 text-sm text-slate-500 text-center">
          Typ minimaal 2 karakters
        </div>
      ) : results.length > 0 ? (
        <div className="p-1 space-y-0.5 max-h-64 overflow-y-auto">
          {results.map((patient) => (
            <PatientListItem
              key={patient.id}
              patient={patient}
              onClick={() => onSelect(patient)}
              size="sm"
            />
          ))}
        </div>
      ) : (
        <PatientListEmpty
          message={`Geen resultaten voor "@${query}"`}
          submessage="Probeer een andere naam"
        />
      )}
    </div>
  );
}
