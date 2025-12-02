/**
 * Agenda Module Types
 *
 * Type definitions for the agenda/calendar functionality.
 */

import type { Database } from '@/lib/supabase/database.types';

// Database types
export type Encounter = Database['public']['Tables']['encounters']['Row'];
export type EncounterInsert = Database['public']['Tables']['encounters']['Insert'];
export type EncounterUpdate = Database['public']['Tables']['encounters']['Update'];
export type EncounterStatus = Database['public']['Enums']['encounter_status'];

export type Patient = Database['public']['Tables']['patients']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];

// Appointment type codes
export const APPOINTMENT_TYPES = {
  intake: 'Intakegesprek',
  behandeling: 'Behandelsessie',
  'follow-up': 'Vervolggesprek',
  telefonisch: 'Telefonisch contact',
  huisbezoek: 'Huisbezoek',
  online: 'Online consult',
  crisis: 'Crisiscontact',
  overig: 'Overig',
} as const;

export type AppointmentTypeCode = keyof typeof APPOINTMENT_TYPES;

// Location class codes
export const LOCATION_CLASSES = {
  AMB: 'Praktijk',
  VR: 'Online/Virtueel',
  HH: 'Thuis (huisbezoek)',
} as const;

export type LocationClassCode = keyof typeof LOCATION_CLASSES;

// Calendar event for FullCalendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  extendedProps: {
    encounter: Encounter;
    patient?: Patient;
    linkedReports?: Report[];
  };
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  classNames?: string[];
}

// Calendar view types
export type CalendarView = 'timeGridDay' | 'timeGridWeek' | 'timeGridWorkWeek';

// Appointment form data
export interface AppointmentFormData {
  patientId: string;
  date: Date;
  startTime: string;
  endTime?: string;
  typeCode: AppointmentTypeCode;
  classCode: LocationClassCode;
  practitionerId: string;
  notes?: string;
}

// Filter options for calendar
export interface CalendarFilters {
  practitionerId?: string;
  typeCode?: AppointmentTypeCode[];
  status?: EncounterStatus[];
}

// Color mapping for appointment types
export const APPOINTMENT_TYPE_COLORS: Record<AppointmentTypeCode, { bg: string; border: string; text: string }> = {
  intake: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  behandeling: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  'follow-up': { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
  telefonisch: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  huisbezoek: { bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
  online: { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3' },
  crisis: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  overig: { bg: '#f1f5f9', border: '#64748b', text: '#334155' },
};
