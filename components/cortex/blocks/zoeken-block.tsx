'use client';

/**
 * Zoeken Block
 *
 * Block voor het zoeken naar patienten.
 * Refactored to use extracted hooks and components (E0 - DRY).
 *
 * Epic: E3.S4 (Original), E0 (Refactor)
 */

import { useEffect, useRef } from 'react';
import { useCortexStore } from '@/stores/cortex-store';
import { BlockContainer } from './block-container';
import type { BlockPrefillData } from '@/stores/cortex-store';
import { BLOCK_CONFIGS } from '@/lib/cortex/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, User } from 'lucide-react';

// Use extracted hooks and components (DRY)
import { usePatientSearch } from '@/lib/cortex/hooks/use-patient-search';
import { usePatientSelection } from '@/lib/cortex/hooks/use-patient-selection';
import {
  PatientListItem,
  PatientListEmpty,
  PatientListLoading,
} from '@/components/cortex/shared/patient-list-item';

interface ZoekenBlockProps {
  prefill?: BlockPrefillData;
}

export function ZoekenBlock({ prefill }: ZoekenBlockProps) {
  const config = BLOCK_CONFIGS.zoeken;
  const { closeBlock, openArtifact } = useCortexStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get prefill query from various sources
  const prefillQuery = prefill?.patientName || prefill?.query || '';

  // Use extracted hooks
  const { query, setQuery, results, isSearching, searchPatients } = usePatientSearch({
    initialQuery: prefillQuery,
    limit: 10,
  });

  const { selectPatient, selectedId } = usePatientSelection({
    onSuccess: (dbPatient, patientName) => {
      // Close block and open patient dashboard
      closeBlock();
      openArtifact({
        type: 'patient-dashboard',
        title: `Dashboard - ${patientName}`,
        prefill: {
          patientId: dbPatient.id,
          patientName: patientName,
        },
      });
    },
  });

  // Auto-search on prefill
  useEffect(() => {
    if (prefillQuery && prefillQuery.length >= 2) {
      searchPatients(prefillQuery);
    }
  }, [prefillQuery, searchPatients]);

  const showResults = query.length >= 2;

  return (
    <BlockContainer title={config.title} size={config.size}>
      <div className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="patient-search">Zoek patient</Label>
          <div className="relative" ref={dropdownRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="patient-search"
              type="text"
              placeholder="Typ naam, BSN of clientnummer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="space-y-2">
            {isSearching ? (
              <PatientListLoading />
            ) : results.length > 0 ? (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {results.map((patient) => (
                  <PatientListItem
                    key={patient.id}
                    patient={patient}
                    isLoading={selectedId === patient.id}
                    onClick={() => selectPatient(patient)}
                  />
                ))}
              </div>
            ) : (
              <PatientListEmpty
                message="Geen patienten gevonden"
                submessage="Probeer een andere zoekterm"
              />
            )}
          </div>
        )}

        {/* Empty State - waiting for input */}
        {!showResults && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <User className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Typ minimaal 2 karakters om te zoeken</p>
          </div>
        )}
      </div>
    </BlockContainer>
  );
}
