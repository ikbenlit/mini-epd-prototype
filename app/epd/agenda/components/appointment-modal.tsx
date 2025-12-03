'use client';

/**
 * Appointment Modal Component
 *
 * Modal for creating and editing appointments (encounters).
 */

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar, Clock, User, MapPin, FileText, Search, X, Trash2, PenLine } from 'lucide-react';
import Link from 'next/link';

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

const inputClassName = "w-full min-w-0 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm box-border";
const selectClassName = "w-full min-w-0 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white box-border";
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
          typeDisplay: APPOINTMENT_TYPES[typeCode],
          classCode,
          classDisplay: LOCATION_CLASSES[classCode],
          notes: notes || '',
        });

        if (result.success) {
          toast({
            title: 'Afspraak bijgewerkt',
            description: `${APPOINTMENT_TYPES[typeCode]} is aangepast.`,
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
          typeDisplay: APPOINTMENT_TYPES[typeCode],
          classCode,
          classDisplay: LOCATION_CLASSES[classCode],
          notes: notes || undefined,
        });

        if (result.success) {
          toast({
            title: 'Afspraak aangemaakt',
            description: `${APPOINTMENT_TYPES[typeCode]} met ${selectedPatient!.name_given?.[0] || ''} ${selectedPatient!.name_family || ''}`.trim(),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            {editingEvent ? 'Afspraak bewerken' : 'Nieuwe Afspraak'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2 overflow-hidden">
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
                onChange={(e) => {
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
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                {patients.map((patient) => {
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
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-center text-sm text-slate-500">
                Zoeken...
              </div>
            )}

            {showPatientDropdown && patients.length === 0 && patientSearch.length >= 2 && !isSearching && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-center text-sm text-slate-500">
                Geen patiënten gevonden
              </div>
            )}

            {/* Recent Patients Dropdown - shown when focused but no search query */}
            {isInputFocused && !selectedPatient && patientSearch.length < 2 && recentPatients.length > 0 && !isEditMode && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                <div className="px-3 py-2 border-b border-slate-100 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Recente patiënten
                </div>
                {recentPatients.map((patient) => {
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
                <div>
                  <div className="font-medium text-slate-900">
                    {selectedPatient.name_given?.[0]} {selectedPatient.name_family}
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
                onChange={(e) => setDate(e.target.value)}
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
                onChange={(e) => setStartTime(e.target.value)}
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
                onChange={(e) => setEndTime(e.target.value)}
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
                onChange={(e) => setTypeCode(e.target.value as AppointmentTypeCode)}
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
                onChange={(e) => setClassCode(e.target.value as LocationClassCode)}
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
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optionele notities voor deze afspraak..."
              rows={3}
              className={`${inputClassName} resize-none`}
            />
          </div>

          {/* Linked Reports Section - only shown in edit mode */}
          {isEditMode && (
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
                  {linkedReports.map((report) => {
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
                      <Link
                        key={report.id}
                        href={`/epd/patients/${editingEvent?.extendedProps.patient?.id}/rapportage?reportId=${report.id}`}
                        className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
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
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between gap-2">
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
                  asChild
                >
                  <Link
                    href={`/epd/patients/${editingEvent.extendedProps.patient.id}/rapportage?encounterId=${editingEvent.id}`}
                  >
                    <PenLine className="h-4 w-4 mr-1" />
                    Maak verslag
                  </Link>
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
                {isSubmitting ? 'Opslaan...' : isEditMode ? 'Wijzigingen opslaan' : 'Afspraak maken'}
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
