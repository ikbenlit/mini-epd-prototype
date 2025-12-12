'use client';

/**
 * Appointment Modal Component
 *
 * Modal for creating and editing appointments (encounters).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar, Clock, User, MapPin, FileText, Search, X, Trash2, PenLine, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { QuickActions } from '@/app/epd/patients/[id]/rapportage/components/quick-actions';
import { RichTextEditor } from '@/components/rich-text-editor';
import type { ReportType } from '@/lib/types/report';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

import { createEncounter, updateEncounter, cancelEncounter, getEncounterReports } from '../actions';
import { CancelDialog } from './cancel-dialog';
import { PatientContextCard } from './patient-context-card';
import {
  APPOINTMENT_TYPES,
  LOCATION_CLASSES,
  type AppointmentTypeCode,
  type LocationClassCode,
  type CalendarEvent,
} from '../types';

interface Patient {
  id: string;
  name_family: string;
  name_given: string[];
  birth_date: string;
  identifier_bsn?: string;
  identifier_client_number?: string;
}

interface LinkedReport {
  id: string;
  type: string;
  content: string;
  created_at: string;
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  editingEvent?: CalendarEvent;
  onSuccess?: () => void;
}

const inputClassName = "w-full min-w-0 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-0 focus:border-transparent text-sm box-border";
const selectClassName = "w-full min-w-0 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-0 focus:border-transparent text-sm bg-white box-border";
const labelClassName = "block text-sm font-medium text-slate-700 mb-1";

export function AppointmentModal({
  open,
  onOpenChange,
  initialDate,
  initialStartTime,
  initialEndTime,
  editingEvent,
  onSuccess,
}: AppointmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Recent patients
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Linked reports state
  const [linkedReports, setLinkedReports] = useState<LinkedReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Report composer state
  const [showReportComposer, setShowReportComposer] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('vrije_notitie');
  const [reportContent, setReportContent] = useState('');
  const [isSavingReport, setIsSavingReport] = useState(false);
  
  // Report edit state
  const [editingReport, setEditingReport] = useState<LinkedReport | null>(null);
  const [editReportContent, setEditReportContent] = useState('');
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);

  // Form state
  const [date, setDate] = useState<string>(
    initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [startTime, setStartTime] = useState<string>(initialStartTime || '09:00');
  const [endTime, setEndTime] = useState<string>(initialEndTime || '10:00');
  const [typeCode, setTypeCode] = useState<AppointmentTypeCode>('behandeling');
  const [classCode, setClassCode] = useState<LocationClassCode>('AMB');
  const [notes, setNotes] = useState<string>('');

  // Determine if we're in edit mode
  const isEditMode = !!editingEvent;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (editingEvent) {
        // Edit mode: pre-fill from existing event
        const encounter = editingEvent.extendedProps.encounter;
        const patient = editingEvent.extendedProps.patient;

        // Set patient
        if (patient) {
          setSelectedPatient(patient as Patient);
          setPatientSearch(`${patient.name_given?.[0] || ''} ${patient.name_family || ''}`.trim());
        }

        // Set date/time
        const startDate = new Date(encounter.period_start);
        setDate(format(startDate, 'yyyy-MM-dd'));
        setStartTime(format(startDate, 'HH:mm'));

        if (encounter.period_end) {
          const endDate = new Date(encounter.period_end);
          setEndTime(format(endDate, 'HH:mm'));
        } else {
          setEndTime('');
        }

        // Set type and location
        setTypeCode((encounter.type_code as AppointmentTypeCode) || 'behandeling');
        setClassCode((encounter.class_code as LocationClassCode) || 'AMB');
        setNotes(encounter.notes || '');
      } else {
        // Create mode: use initial values
        if (initialDate) {
          setDate(format(initialDate, 'yyyy-MM-dd'));
        }
        if (initialStartTime) {
          setStartTime(initialStartTime);
        }
        if (initialEndTime) {
          setEndTime(initialEndTime);
        }
      }
    } else {
      // Reset on close
      setSelectedPatient(null);
      setPatientSearch('');
      setNotes('');
      setTypeCode('behandeling');
      setClassCode('AMB');
      setLinkedReports([]);
      setShowReportComposer(false);
      setReportContent('');
      setSelectedReportType('vrije_notitie');
      setEditingReport(null);
      setEditReportContent('');
    }
  }, [open, initialDate, initialStartTime, initialEndTime, editingEvent]);

  // Fetch linked reports when editing an appointment
  useEffect(() => {
    if (open && editingEvent) {
      setIsLoadingReports(true);
      getEncounterReports(editingEvent.id)
        .then((reports) => {
          setLinkedReports(reports);
        })
        .catch((error) => {
          console.error('Failed to fetch linked reports:', error);
        })
        .finally(() => {
          setIsLoadingReports(false);
        });
    }
  }, [open, editingEvent]);

  // Fetch recent patients (last 5 by updated_at)
  const fetchRecentPatients = useCallback(async () => {
    try {
      const response = await fetch('/api/fhir/Patient?_count=5');
      if (response.ok) {
        const data = await response.json();
        const mappedPatients = data.entry?.map((e: { resource: unknown }) =>
          mapFhirPatient(e.resource as Parameters<typeof mapFhirPatient>[0])
        ) || [];
        setRecentPatients(mappedPatients);
      }
    } catch (error) {
      console.error('Failed to fetch recent patients:', error);
    }
  }, []);

  // Fetch recent patients when modal opens (for new appointments)
  useEffect(() => {
    if (open && !editingEvent) {
      fetchRecentPatients();
    }
  }, [open, editingEvent, fetchRecentPatients]);

  // Map FHIR Patient to internal format
  const mapFhirPatient = (fhirPatient: {
    id: string;
    name?: Array<{ family?: string; given?: string[] }>;
    birthDate?: string;
    identifier?: Array<{ system?: string; value?: string }>;
  }): Patient => {
    const bsnIdentifier = fhirPatient.identifier?.find(
      (id) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
    );
    const clientNumberIdentifier = fhirPatient.identifier?.find(
      (id) => id.system?.includes('client') || id.system?.includes('999.7.6')
    );

    return {
      id: fhirPatient.id,
      name_family: fhirPatient.name?.[0]?.family || '',
      name_given: fhirPatient.name?.[0]?.given || [],
      birth_date: fhirPatient.birthDate || '',
      identifier_bsn: bsnIdentifier?.value,
      identifier_client_number: clientNumberIdentifier?.value,
    };
  };

  // Search patients
  const searchPatients = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPatients([]);
      return;
    }

    setIsSearching(true);
    try {
      // Use general search parameter that searches name, BSN, and client number
      const response = await fetch(`/api/fhir/Patient?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        const mappedPatients = data.entry?.map((e: { resource: unknown }) =>
          mapFhirPatient(e.resource as Parameters<typeof mapFhirPatient>[0])
        ) || [];
        setPatients(mappedPatients);
      }
    } catch (error) {
      console.error('Failed to search patients:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search - only search when no patient is selected
  useEffect(() => {
    // Skip search if patient is already selected
    if (selectedPatient) {
      setShowPatientDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      if (patientSearch.length >= 2) {
        searchPatients(patientSearch);
        setShowPatientDropdown(true);
      } else {
        setPatients([]);
        setShowPatientDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [patientSearch, searchPatients, selectedPatient]);

  // Handle patient selection
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch(`${patient.name_given?.[0] || ''} ${patient.name_family || ''}`.trim());
    setShowPatientDropdown(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient && !isEditMode) {
      toast({
        variant: 'destructive',
        title: 'Selecteer een patiënt',
        description: 'Kies een patiënt uit de zoekresultaten.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const periodStart = `${date}T${startTime}:00`;
      const periodEnd = endTime ? `${date}T${endTime}:00` : null;

      if (isEditMode && editingEvent) {
        // Update existing encounter
        const result = await updateEncounter(editingEvent.id, {
          periodStart,
          periodEnd,
          typeCode,
          typeDisplay: APPOINTMENT_TYPES[typeCode as AppointmentTypeCode],
          classCode,
          classDisplay: LOCATION_CLASSES[classCode as LocationClassCode],
          notes: notes || '',
        });

        if (result.success) {
          toast({
            title: 'Afspraak bijgewerkt',
            description: `${APPOINTMENT_TYPES[typeCode as AppointmentTypeCode]} is aangepast.`,
          });
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast({
            variant: 'destructive',
            title: 'Bewerken mislukt',
            description: result.error,
          });
        }
      } else {
        // Create new encounter
        const result = await createEncounter({
          patientId: selectedPatient!.id,
          practitionerId: '', // TODO: Get current practitioner
          periodStart,
          periodEnd: periodEnd || undefined,
          typeCode,
          typeDisplay: APPOINTMENT_TYPES[typeCode as AppointmentTypeCode],
          classCode,
          classDisplay: LOCATION_CLASSES[classCode as LocationClassCode],
          notes: notes || undefined,
        });

        if (result.success) {
          toast({
            title: 'Afspraak aangemaakt',
            description: `${APPOINTMENT_TYPES[typeCode as AppointmentTypeCode]} met ${selectedPatient!.name_given?.[0] || ''} ${selectedPatient!.name_family || ''}`.trim(),
          });
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast({
            variant: 'destructive',
            title: 'Afspraak aanmaken mislukt',
            description: result.error,
          });
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Er ging iets mis',
        description: 'Probeer het opnieuw.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    if (!editingEvent) return;

    setIsCancelling(true);
    try {
      const result = await cancelEncounter(editingEvent.id);

      if (result.success) {
        toast({
          title: 'Afspraak geannuleerd',
          description: 'De afspraak is succesvol geannuleerd.',
        });
        setShowCancelDialog(false);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast({
          variant: 'destructive',
          title: 'Annuleren mislukt',
          description: result.error,
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Er ging iets mis',
        description: 'Probeer het opnieuw.',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle save report
  const handleSaveReport = async () => {
    if (!editingEvent?.extendedProps.patient || !editingEvent.id) return;
    
    const textContent = reportContent.replace(/<[^>]*>/g, '').trim();
    if (textContent.length < 20) {
      toast({
        variant: 'destructive',
        title: 'Verslag te kort',
        description: 'Een verslag moet minimaal 20 karakters bevatten.',
      });
      return;
    }
    
    if (textContent.length > 5000) {
      toast({
        variant: 'destructive',
        title: 'Verslag te lang',
        description: 'Een verslag mag maximaal 5000 karakters bevatten.',
      });
      return;
    }
    
    setIsSavingReport(true);
    try {
      await handleCreateReport(
        editingEvent.extendedProps.patient.id,
        selectedReportType,
        textContent,
        editingEvent.id
      );
      
      toast({
        title: 'Verslag opgeslagen',
        description: 'Het verslag is gekoppeld aan deze afspraak.',
      });
      
      // Reset composer
      setReportContent('');
      setShowReportComposer(false);
      
      // Refresh linked reports
      const reports = await getEncounterReports(editingEvent.id);
      setLinkedReports(reports);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Opslaan mislukt',
        description: error instanceof Error ? error.message : 'Probeer het opnieuw.',
      });
    } finally {
      setIsSavingReport(false);
    }
  };

  const formatPatientName = (patient: Patient) => {
    const name = `${patient.name_given?.[0] || ''} ${patient.name_family || ''}`.trim();
    const birthDate = patient.birth_date
      ? format(new Date(patient.birth_date), 'd MMM yyyy', { locale: nl })
      : '';
    // Show client number or BSN (prefer client number)
    const identifier = patient.identifier_client_number
      ? `#${patient.identifier_client_number}`
      : patient.identifier_bsn
        ? `BSN ${patient.identifier_bsn.slice(-4)}`
        : '';
    return { name, birthDate, identifier };
  };

  // Client-side createReport function
  const handleCreateReport = async (patientId: string, type: ReportType, content: string, encounterId: string) => {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patientId,
        type,
        content,
        encounter_id: encounterId,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Opslaan mislukt');
    }
    
    return response.json();
  };

  // Client-side updateReport function
  const handleUpdateReport = async (reportId: string, content: string) => {
    const response = await fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Bijwerken mislukt');
    }
    
    return response.json();
  };

  // Handle edit report
  const handleEditReport = (report: LinkedReport) => {
    setEditingReport(report);
    setEditReportContent(report.content);
    setShowReportComposer(false); // Close composer if open
  };

  // Handle save edited report
  const handleSaveEditedReport = async () => {
    if (!editingReport || !editingEvent?.id) return;
    
    const textContent = editReportContent.replace(/<[^>]*>/g, '').trim();
    if (textContent.length < 20) {
      toast({
        variant: 'destructive',
        title: 'Verslag te kort',
        description: 'Een verslag moet minimaal 20 karakters bevatten.',
      });
      return;
    }
    
    if (textContent.length > 5000) {
      toast({
        variant: 'destructive',
        title: 'Verslag te lang',
        description: 'Een verslag mag maximaal 5000 karakters bevatten.',
      });
      return;
    }
    
    setIsUpdatingReport(true);
    try {
      await handleUpdateReport(editingReport.id, textContent);
      
      toast({
        title: 'Verslag bijgewerkt',
        description: 'Het verslag is succesvol bijgewerkt.',
      });
      
      // Reset edit state
      setEditingReport(null);
      setEditReportContent('');
      
      // Refresh linked reports
      const reports = await getEncounterReports(editingEvent.id);
      setLinkedReports(reports);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Bijwerken mislukt',
        description: error instanceof Error ? error.message : 'Probeer het opnieuw.',
      });
    } finally {
      setIsUpdatingReport(false);
    }
  };

  const wrappedOnOpenChange = React.useCallback((newOpen: boolean) => {
    onOpenChange(newOpen);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={wrappedOnOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] !grid !grid-rows-[auto_1fr_auto] !gap-0 p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            {editingEvent ? 'Afspraak bewerken' : 'Nieuwe Afspraak'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 px-6 min-h-0">
          {/* Patient Search */}
          <div className="relative">
            <label className={labelClassName}>
              <User className="h-4 w-4 inline mr-1" />
              Patiënt *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPatientSearch(e.target.value);
                  if (selectedPatient) {
                    setSelectedPatient(null);
                  }
                }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => {
                  // Delay to allow click on dropdown items
                  setTimeout(() => setIsInputFocused(false), 200);
                }}
                placeholder="Zoek op naam, BSN of clientnummer..."
                className={`${inputClassName} pl-9`}
                required
              />
              {selectedPatient && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientSearch('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Patient Dropdown */}
            {showPatientDropdown && patients.length > 0 && (
              <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-auto">
                {patients.map((patient: Patient) => {
                  const { name, birthDate, identifier } = formatPatientName(patient);
                  return (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handleSelectPatient(patient)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{name}</span>
                        <span className="text-xs text-slate-500">{birthDate}</span>
                      </div>
                      {identifier && (
                        <div className="text-xs text-slate-400">{identifier}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {isSearching && (
              <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-center text-sm text-slate-500">
                Zoeken...
              </div>
            )}

            {showPatientDropdown && patients.length === 0 && patientSearch.length >= 2 && !isSearching && (
              <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-center text-sm text-slate-500">
                Geen patiënten gevonden
              </div>
            )}

            {/* Recent Patients Dropdown - shown when focused but no search query */}
            {isInputFocused && !selectedPatient && patientSearch.length < 2 && recentPatients.length > 0 && !isEditMode && (
              <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-auto">
                <div className="px-3 py-2 border-b border-slate-100 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Recente patiënten
                </div>
                {recentPatients.map((patient: Patient) => {
                  const { name, birthDate, identifier } = formatPatientName(patient);
                  return (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handleSelectPatient(patient)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{name}</span>
                        <span className="text-xs text-slate-500">{birthDate}</span>
                      </div>
                      {identifier && (
                        <div className="text-xs text-slate-400">{identifier}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Patient Info Card - shown when patient is selected */}
          {selectedPatient && (
            <div className="mt-2 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-slate-900">
                      {selectedPatient.name_given?.[0]} {selectedPatient.name_family}
                    </div>
                    <Link
                      href={`/epd/patients/${selectedPatient.id}`}
                      className="text-teal-600 hover:text-teal-700 transition-colors"
                      title="Open patiëntendossier"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="text-sm text-slate-600 mt-0.5">
                    Geb. {selectedPatient.birth_date
                      ? format(new Date(selectedPatient.birth_date), 'd MMMM yyyy', { locale: nl })
                      : 'Onbekend'}
                  </div>
                  {selectedPatient.identifier_client_number && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      Clientnr: {selectedPatient.identifier_client_number}
                    </div>
                  )}
                  {selectedPatient.identifier_bsn && !selectedPatient.identifier_client_number && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      BSN: ***{selectedPatient.identifier_bsn.slice(-4)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientSearch('');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Patient Medical Context */}
              <PatientContextCard patientId={selectedPatient.id} />
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-end">
            <div className="min-w-0">
              <label className={labelClassName}>
                <Calendar className="h-4 w-4 inline mr-1" />
                Datum *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
            <div className="w-24">
              <label className={labelClassName}>
                <Clock className="h-4 w-4 inline mr-1" />
                Van *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
            <div className="w-24">
              <label className={labelClassName}>
                <Clock className="h-4 w-4 inline mr-1" />
                Tot
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          {/* Type and Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className={labelClassName}>Type afspraak *</label>
              <select
                value={typeCode}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeCode(e.target.value as AppointmentTypeCode)}
                className={selectClassName}
                required
              >
                {Object.entries(APPOINTMENT_TYPES).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClassName}>
                <MapPin className="h-4 w-4 inline mr-1" />
                Locatie
              </label>
              <select
                value={classCode}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClassCode(e.target.value as LocationClassCode)}
                className={selectClassName}
              >
                {Object.entries(LOCATION_CLASSES).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClassName}>
              <FileText className="h-4 w-4 inline mr-1" />
              Notities
            </label>
            <textarea
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Optionele notities voor deze afspraak..."
              rows={3}
              className={`${inputClassName} resize-none`}
            />
          </div>

          {/* Report Composer Section - only shown in edit mode when toggled */}
          {isEditMode && showReportComposer && editingEvent?.extendedProps.patient && (
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className={labelClassName}>
                  <FileText className="h-4 w-4 inline mr-1" />
                  Nieuw verslag
                </label>
                <button
                  type="button"
                  onClick={() => setShowReportComposer(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Quick Actions voor type selectie */}
              <div className="mb-4">
                <QuickActions
                  onSelectType={setSelectedReportType}
                  selectedType={selectedReportType}
                  disabled={isSavingReport}
                />
              </div>
              
              {/* Rich Text Editor */}
              <div className="mb-3">
                <RichTextEditor
                  value={reportContent}
                  onChange={setReportContent}
                  placeholder="Begin met typen..."
                  minHeight="150px"
                />
              </div>
              
              {/* Character count */}
              <div className="flex justify-between text-xs text-slate-500 mb-4">
                <span>
                  {reportContent.replace(/<[^>]*>/g, '').trim().length} / 5000 karakters
                </span>
                {reportContent.replace(/<[^>]*>/g, '').trim().length > 0 && 
                 reportContent.replace(/<[^>]*>/g, '').trim().length < 20 && (
                  <span className="text-amber-600">Minimaal 20 karakters</span>
                )}
              </div>
              
              {/* Save button */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowReportComposer(false);
                    setReportContent('');
                  }}
                  disabled={isSavingReport}
                >
                  Annuleren
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveReport}
                  disabled={
                    isSavingReport ||
                    reportContent.replace(/<[^>]*>/g, '').trim().length < 20 ||
                    reportContent.replace(/<[^>]*>/g, '').trim().length > 5000
                  }
                >
                  {isSavingReport ? 'Opslaan...' : 'Verslag opslaan'}
                </Button>
              </div>
            </div>
          )}

          {/* Linked Reports Section - only shown in edit mode */}
          {isEditMode && !editingReport && (
            <div className="border-t border-slate-200 pt-4">
              <label className={labelClassName}>
                <FileText className="h-4 w-4 inline mr-1" />
                Gekoppelde verslagen
              </label>
              {isLoadingReports ? (
                <div className="text-sm text-slate-500 py-2">Verslagen laden...</div>
              ) : linkedReports.length === 0 ? (
                <div className="text-sm text-slate-400 py-2 italic">
                  Geen verslagen gekoppeld aan deze afspraak
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {linkedReports.map((report: LinkedReport) => {
                    const reportDate = new Date(report.created_at);
                    const TYPE_LABELS: Record<string, string> = {
                      behandeladvies: 'Behandeladvies',
                      vrije_notitie: 'Vrije notitie',
                      intake: 'Intake verslag',
                      voortgang: 'Voortgangsverslag',
                      crisis: 'Crisis notitie',
                      contact: 'Contactnotitie',
                    };
                    return (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => handleEditReport(report)}
                        className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">
                            {TYPE_LABELS[report.type] || report.type}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(reportDate, 'd MMM yyyy', { locale: nl })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {report.content.substring(0, 100)}
                          {report.content.length > 100 ? '...' : ''}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Report Edit Section - shown when editing a report */}
          {isEditMode && editingReport && (
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className={labelClassName}>
                  <FileText className="h-4 w-4 inline mr-1" />
                  Verslag bewerken
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setEditingReport(null);
                    setEditReportContent('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Rich Text Editor */}
              <div className="mb-3">
                <RichTextEditor
                  value={editReportContent}
                  onChange={setEditReportContent}
                  placeholder="Begin met typen..."
                  minHeight="150px"
                />
              </div>
              
              {/* Character count */}
              <div className="flex justify-between text-xs text-slate-500 mb-4">
                <span>
                  {editReportContent.replace(/<[^>]*>/g, '').trim().length} / 5000 karakters
                </span>
                {editReportContent.replace(/<[^>]*>/g, '').trim().length > 0 && 
                 editReportContent.replace(/<[^>]*>/g, '').trim().length < 20 && (
                  <span className="text-amber-600">Minimaal 20 karakters</span>
                )}
              </div>
              
              {/* Save button */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingReport(null);
                    setEditReportContent('');
                  }}
                  disabled={isUpdatingReport}
                >
                  Annuleren
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveEditedReport}
                  disabled={
                    isUpdatingReport ||
                    editReportContent.replace(/<[^>]*>/g, '').trim().length < 20 ||
                    editReportContent.replace(/<[^>]*>/g, '').trim().length > 5000
                  }
                >
                  {isUpdatingReport ? 'Opslaan...' : 'Wijzigingen opslaan'}
                </Button>
              </div>
            </div>
          )}
          </div>

          <DialogFooter className="flex-shrink-0 flex justify-between sm:justify-between gap-2 pt-4 px-6 pb-6 border-t border-slate-200 bg-white">
            {isEditMode && editingEvent?.extendedProps.patient && (
              <div className="flex gap-2 mr-auto">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Annuleren
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReportComposer(!showReportComposer)}
                  disabled={isSubmitting}
                >
                  <PenLine className="h-4 w-4 mr-1" />
                  {showReportComposer ? 'Verberg verslag' : 'Maak verslag'}
                </Button>
              </div>
            )}
            {isEditMode && !editingEvent?.extendedProps.patient && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                disabled={isSubmitting}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Annuleren
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Sluiten
              </Button>
              <Button type="submit" disabled={isSubmitting || (!selectedPatient && !isEditMode)}>
                {isSubmitting ? 'Opslaan...' : isEditMode ? 'Opslaan' : 'Afspraak maken'}
              </Button>
            </div>
          </DialogFooter>
        </form>

        {/* Cancel Confirmation Dialog */}
        {editingEvent && (
          <CancelDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            patientName={editingEvent.title}
            appointmentType={editingEvent.extendedProps.encounter.type_display}
            appointmentDate={new Date(editingEvent.start)}
            onConfirm={handleCancelAppointment}
            isLoading={isCancelling}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
