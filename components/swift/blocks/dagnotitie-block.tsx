'use client';

/**
 * Dagnotatie Block
 *
 * Block voor het maken van een dagnotitie.
 * E3.S2: Volledige implementatie met patient selectie, categorie, tekst en opslaan.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSwiftStore } from '@/stores/swift-store';
import { BlockContainer } from './block-container';
import type { BlockPrefillData } from '@/stores/swift-store';
import { BLOCK_CONFIGS } from '@/lib/swift/types';
import {
  VERPLEEGKUNDIG_CATEGORIES,
  CATEGORY_CONFIG,
  type VerpleegkundigCategory,
} from '@/lib/types/report';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Search, User, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { safeFetch, getErrorInfo, retryFetch } from '@/lib/swift/error-handler';

interface DagnotitieBlockProps {
  prefill?: BlockPrefillData;
}

interface Patient {
  id: string;
  name_family?: string;
  name_given?: string[];
  identifier_bsn?: string;
}

export function DagnotatieBlock({ prefill }: DagnotitieBlockProps) {
  const config = BLOCK_CONFIGS.dagnotitie;
  const { closeBlock } = useSwiftStore();
  const { toast } = useToast();

  // Form state
  const [patientId, setPatientId] = useState<string>(prefill?.patientId || '');
  const [patientName, setPatientName] = useState<string>(prefill?.patientName || '');
  const [category, setCategory] = useState<VerpleegkundigCategory>(
    prefill?.category || 'observatie'
  );
  const [content, setContent] = useState<string>(prefill?.content || '');
  const [includeInHandover, setIncludeInHandover] = useState<boolean>(false);

  // Patient search state
  const [searchQuery, setSearchQuery] = useState<string>(prefill?.patientName || '');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prefill patient if patientId is provided
  useEffect(() => {
    if (prefill?.patientId && prefill?.patientName) {
      setPatientId(prefill.patientId);
      setPatientName(prefill.patientName);
      setSelectedPatient({
        id: prefill.patientId,
        name_family: prefill.patientName.split(' ').pop(),
        name_given: prefill.patientName.split(' ').slice(0, -1),
      });
    }
  }, [prefill]);

  // Patient search with debouncing
  const searchPatients = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPatients([]);
      setShowPatientDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await safeFetch(
        `/api/fhir/Patient?q=${encodeURIComponent(query)}`,
        undefined,
        { operation: 'Patiënt zoeken' }
      );
      const data = await response.json();
      const mappedPatients: Patient[] =
        data.entry?.map((e: { resource: any }) => {
          const p = e.resource;
          return {
            id: p.id,
            name_family: p.name?.[0]?.family,
            name_given: p.name?.[0]?.given || [],
            identifier_bsn: p.identifier?.find(
              (id: any) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
            )?.value,
          };
        }) || [];
      setPatients(mappedPatients);
      setShowPatientDropdown(mappedPatients.length > 0);
    } catch (error) {
      console.error('Failed to search patients:', error);
      const errorInfo = getErrorInfo(error, { operation: 'Patiënt zoeken' });
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

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery && !selectedPatient) {
      searchTimeoutRef.current = setTimeout(() => {
        searchPatients(searchQuery);
      }, 300);
    } else {
      setPatients([]);
      setShowPatientDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedPatient, searchPatients]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPatient = (patient: Patient) => {
    const fullName = `${patient.name_given?.join(' ') || ''} ${patient.name_family || ''}`.trim();
    setSelectedPatient(patient);
    setPatientId(patient.id);
    setPatientName(fullName);
    setSearchQuery(fullName);
    setShowPatientDropdown(false);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setPatientId('');
    setPatientName('');
    setSearchQuery('');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = useCallback(async () => {
    if (!patientId) {
      toast({
        variant: 'destructive',
        title: 'Patiënt vereist',
        description: 'Selecteer eerst een patiënt',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Content vereist',
        description: 'Voer een notitie in',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await retryFetch(
        () =>
          safeFetch(
            '/api/reports',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                patient_id: patientId,
                type: 'verpleegkundig',
                content: content.trim(),
                category,
                include_in_handover: includeInHandover,
              }),
            },
            { operation: 'Dagnotitie opslaan' }
          ),
        3,
        1000
      );

      const data = await response.json();

      toast({
        title: 'Dagnotitie opgeslagen',
        description: `Notitie voor ${patientName} is opgeslagen`,
      });

      // Close block after short delay
      setTimeout(() => {
        closeBlock();
      }, 500);
    } catch (error) {
      console.error('Failed to save dagnotitie:', error);
      const statusCode = (error as any)?.statusCode;
      const errorInfo = getErrorInfo(error, {
        operation: 'Dagnotitie opslaan',
        statusCode,
      });

      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.description,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [patientId, content, category, includeInHandover, patientName, toast, closeBlock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  // Keyboard shortcut: Cmd/Ctrl+Enter to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+Enter: save dagnotitie
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const formatPatientName = (patient: Patient): string => {
    const given = patient.name_given?.join(' ') || '';
    const family = patient.name_family || '';
    return `${given} ${family}`.trim() || 'Naamloos';
  };

  return (
    <BlockContainer title={config.title} size={config.size}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selectie */}
        <div className="space-y-2">
          <Label htmlFor="patient-search">Patiënt *</Label>
          <div className="relative" ref={dropdownRef}>
            {selectedPatient ? (
              <div className="flex items-center gap-2 p-2 rounded-md border border-slate-200 bg-slate-50">
                <User className="h-4 w-4 text-slate-500" />
                <span className="flex-1 text-sm text-slate-900">{formatPatientName(selectedPatient)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearPatient}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
                >
                  ×
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="patient-search"
                    type="text"
                    placeholder="Zoek patiënt (naam of BSN)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => {
                      if (patients.length > 0) {
                        setShowPatientDropdown(true);
                      }
                    }}
                    className="pl-9"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                  )}
                </div>
                {showPatientDropdown && patients.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handleSelectPatient(patient)}
                        className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-medium">{formatPatientName(patient)}</div>
                        {patient.identifier_bsn && (
                          <div className="text-xs text-slate-500">BSN: {patient.identifier_bsn}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Categorie Selector */}
        <div className="space-y-2">
          <Label>Categorie *</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {VERPLEEGKUNDIG_CATEGORIES.map((cat) => {
              const catConfig = CATEGORY_CONFIG[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-slate-900 text-white border-2 border-slate-700'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {catConfig.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Notitie *</Label>
          <Textarea
            id="content"
            placeholder="Beschrijf wat er is gebeurd..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="resize-none"
            maxLength={500}
          />
          <div className="text-xs text-slate-500 text-right">
            {content.length}/500 karakters
          </div>
        </div>

        {/* Include in Handover */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="include-handover"
            checked={includeInHandover}
            onChange={(e) => setIncludeInHandover(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="include-handover" className="cursor-pointer text-sm text-slate-700">
            Opnemen in overdracht
          </Label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeBlock}
            disabled={isSubmitting}
          >
            Annuleren
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !patientId || !content.trim()}
            title="Opslaan (⌘Enter)"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                Opslaan
                <span className="ml-2 text-xs opacity-70 hidden sm:inline">⌘↵</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </BlockContainer>
  );
}
