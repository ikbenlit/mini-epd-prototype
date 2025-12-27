'use client';

/**
 * Zoeken Block
 *
 * Block voor het zoeken naar patiënten.
 * E3.S4: Volledige implementatie met input, resultaten en selectie naar store.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSwiftStore } from '@/stores/swift-store';
import { BlockContainer } from './block-container';
import type { BlockPrefillData } from '@/stores/swift-store';
import { BLOCK_CONFIGS } from '@/lib/swift/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { safeFetch, getErrorInfo } from '@/lib/swift/error-handler';

interface ZoekenBlockProps {
  prefill?: BlockPrefillData;
}

interface PatientSearchResult {
  id: string;
  name: string;
  birthDate: string;
  identifier_bsn?: string;
  identifier_client_number?: string;
  matchScore: number;
}

export function ZoekenBlock({ prefill }: ZoekenBlockProps) {
  const config = BLOCK_CONFIGS.zoeken;
  const { closeBlock, setActivePatient, addRecentAction } = useSwiftStore();
  const { toast } = useToast();

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>(prefill?.patientName || '');
  const [patients, setPatients] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Patient search function
  const searchPatients = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPatients([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await safeFetch(
        `/api/patients/search?q=${encodeURIComponent(query)}&limit=10`,
        undefined,
        { operation: 'Patiënt zoeken' }
      );
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error('Failed to search patients:', error);
      const statusCode = (error as any)?.statusCode;
      const errorInfo = getErrorInfo(error, {
        operation: 'Patiënt zoeken',
        statusCode,
      });
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.description,
      });
      setPatients([]);
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Prefill search query
  useEffect(() => {
    if (prefill?.patientName) {
      setSearchQuery(prefill.patientName);
      // Auto-search if prefill is provided
      if (prefill.patientName.length >= 2) {
        searchPatients(prefill.patientName);
      }
    }
  }, [prefill, searchPatients]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchPatients(searchQuery);
      }, 300);
    } else {
      setPatients([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchPatients]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Don't close if clicking on input
        const target = event.target as HTMLElement;
        if (!target.closest('input')) {
          // Dropdown will close naturally when input loses focus
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle patient selection
  const handleSelectPatient = async (patient: PatientSearchResult) => {
    setSelectedPatientId(patient.id);

    try {
      // Fetch full patient data from FHIR API
      const response = await safeFetch(
        `/api/fhir/Patient/${patient.id}`,
        undefined,
        { operation: 'Patiënt data ophalen' }
      );

      const fhirPatient = await response.json();

      // Map FHIR Patient to database Patient format
      // Map gender to enum type
      const genderMap: Record<string, 'male' | 'female' | 'other' | 'unknown'> = {
        male: 'male',
        female: 'female',
        other: 'other',
        unknown: 'unknown',
      };
      const mappedGender = genderMap[fhirPatient.gender?.toLowerCase() || 'unknown'] || 'unknown';

      const dbPatient = {
        id: fhirPatient.id,
        name_family: fhirPatient.name?.[0]?.family || '',
        name_given: fhirPatient.name?.[0]?.given || [],
        birth_date: fhirPatient.birthDate || '',
        identifier_bsn: fhirPatient.identifier?.find(
          (id: any) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
        )?.value || null,
        identifier_client_number: fhirPatient.identifier?.find(
          (id: any) => id.system?.includes('client') || id.system?.includes('999.7.6')
        )?.value || null,
        gender: mappedGender as 'male' | 'female' | 'other' | 'unknown',
        active: fhirPatient.active !== false,
        status: null,
        created_at: null,
        updated_at: null,
        address_line: null,
        address_city: null,
        address_postal_code: null,
        address_country: null,
        telecom_email: null,
        telecom_phone: null,
        name_prefix: null,
        name_use: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        emergency_contact_relationship: null,
        general_practitioner_name: null,
        general_practitioner_agb: null,
        insurance_company: null,
        insurance_number: null,
        is_john_doe: null,
      };

      // Set active patient in store
      setActivePatient(dbPatient);

      // Add to recent actions
      addRecentAction({
        intent: 'zoeken',
        label: `Patiënt geselecteerd: ${patient.name}`,
        patientName: patient.name,
      });

      // Show success toast
      toast({
        title: 'Patiënt geselecteerd',
        description: `${patient.name} is nu actief`,
      });

      // Close search block and open PatientContextCard
      closeBlock();
      
      // Open PatientContextCard after a short delay to allow ZoekenBlock to close
      setTimeout(() => {
        // PatientContextCard will auto-open when activePatient is set
        // We don't need to explicitly open it as a block - it's shown automatically
      }, 100);
    } catch (error) {
      console.error('Failed to select patient:', error);
      const statusCode = (error as any)?.statusCode;
      const errorInfo = getErrorInfo(error, {
        operation: 'Patiënt selecteren',
        statusCode,
      });
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.description,
      });
      setSelectedPatientId(null);
    }
  };

  const formatPatientDisplay = (patient: PatientSearchResult): string => {
    let display = patient.name;
    if (patient.birthDate) {
      const birthYear = new Date(patient.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      display += ` (${age} jaar)`;
    }
    return display;
  };

  return (
    <BlockContainer title={config.title} size={config.size}>
      <div className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="patient-search">Zoek patiënt</Label>
          <div className="relative" ref={dropdownRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="patient-search"
              type="text"
              placeholder="Typ naam, BSN of clientnummer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <div className="space-y-2">
            {isSearching ? (
              <div className="flex items-center justify-center py-8 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Zoeken...</span>
              </div>
            ) : patients.length > 0 ? (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {patients.map((patient) => {
                  const isSelected = selectedPatientId === patient.id;
                  return (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handleSelectPatient(patient)}
                      disabled={isSelected}
                      className={cn(
                        'w-full px-3 py-2.5 rounded-lg border text-left transition-colors',
                        isSelected
                          ? 'bg-slate-100 border-slate-300 cursor-wait'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 cursor-pointer'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white shrink-0">
                            {patient.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {formatPatientDisplay(patient)}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {patient.identifier_bsn && (
                                <span className="text-xs text-slate-500">
                                  BSN: {patient.identifier_bsn}
                                </span>
                              )}
                              {patient.identifier_client_number && (
                                <span className="text-xs text-slate-500">
                                  Client: {patient.identifier_client_number}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isSelected ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
                        ) : (
                          <Check className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <User className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Geen patiënten gevonden</p>
                <p className="text-xs mt-1">Probeer een andere zoekterm</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {searchQuery.length < 2 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Search className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Typ minimaal 2 karakters om te zoeken</p>
          </div>
        )}
      </div>
    </BlockContainer>
  );
}
