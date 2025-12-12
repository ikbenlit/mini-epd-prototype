'use client';

/**
 * Agenda View Component
 *
 * Client-side wrapper managing calendar state, view switching, and interactions.
 */

import React, { useState, useCallback, useRef, useTransition, useEffect } from 'react';
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

import { AgendaCalendar } from './agenda-calendar';
import { AgendaToolbar } from './agenda-toolbar';
import { AppointmentModal } from './appointment-modal';
import { RescheduleDialog } from './reschedule-dialog';
import { MiniCalendar } from './mini-calendar';
import { getEncounters, rescheduleEncounter } from '../actions';
import type { CalendarEvent, CalendarView } from '../types';

interface PendingReschedule {
  event: CalendarEvent;
  newStart: Date;
  newEnd: Date | null;
}

interface AgendaViewProps {
  initialEvents: CalendarEvent[];
  initialDate?: Date;
  highlightEncounterId?: string;
}

export function AgendaView({ initialEvents, initialDate, highlightEncounterId }: AgendaViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('timeGridWeek');
  const [isPending, startTransition] = useTransition();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>();
  const [modalInitialStartTime, setModalInitialStartTime] = useState<string | undefined>();
  const [modalInitialEndTime, setModalInitialEndTime] = useState<string | undefined>();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();

  // Reschedule dialog state
  const [pendingReschedule, setPendingReschedule] = useState<PendingReschedule | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const calendarRef = useRef<{ getApi: () => { prev: () => void; next: () => void; today: () => void; changeView: (view: string) => void; getDate: () => Date } } | null>(null);

  // Auto-open appointment modal when navigating from a report
  useEffect(() => {
    if (highlightEncounterId && initialEvents.length > 0) {
      const eventToOpen = initialEvents.find((e) => e.id === highlightEncounterId);
      if (eventToOpen) {
        setEditingEvent(eventToOpen);
        setIsModalOpen(true);
      }
    }
  }, [highlightEncounterId, initialEvents]);

  // Fetch events when date range changes
  const fetchEvents = useCallback(async (start: Date, end: Date) => {
    startTransition(async () => {
      const newEvents = await getEncounters({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      setEvents(newEvents);
    });
  }, []);

  // Handle view change
  const handleViewChange = useCallback((view: CalendarView) => {
    setCurrentView(view);
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((direction: 'prev' | 'next' | 'today') => {
    let newDate = new Date(currentDate);

    if (direction === 'today') {
      newDate = new Date();
    } else {
      const days = currentView === 'timeGridDay' ? 1 : 7;
      const offset = direction === 'prev' ? -days : days;
      newDate = addDays(currentDate, offset);
    }

    setCurrentDate(newDate);

    // Calculate date range for fetching
    const start = currentView === 'timeGridDay'
      ? newDate
      : startOfWeek(newDate, { weekStartsOn: 1 });
    const end = currentView === 'timeGridDay'
      ? addDays(newDate, 1)
      : endOfWeek(newDate, { weekStartsOn: 1 });

    fetchEvents(start, end);
  }, [currentDate, currentView, fetchEvents]);

  // Handle date range change from calendar
  const handleDateChange = useCallback((start: Date, end: Date) => {
    setCurrentDate(start);
    fetchEvents(start, end);
  }, [fetchEvents]);

  // Handle event click - open edit modal
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  }, []);

  // Handle date selection (for creating new appointment)
  const handleDateSelect = useCallback((start: Date, end: Date) => {
    setEditingEvent(undefined);
    setModalInitialDate(start);
    setModalInitialStartTime(format(start, 'HH:mm'));
    setModalInitialEndTime(format(end, 'HH:mm'));
    setIsModalOpen(true);
  }, []);

  // Handle event drag-and-drop - show confirmation dialog
  const handleEventDrop = useCallback((
    eventId: string,
    newStart: Date,
    newEnd: Date | null
  ) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setPendingReschedule({ event, newStart, newEnd });
    }
  }, [events]);

  // Confirm reschedule
  const confirmReschedule = useCallback(async () => {
    if (!pendingReschedule) return;

    setIsRescheduling(true);
    const { event, newStart, newEnd } = pendingReschedule;

    const result = await rescheduleEncounter(
      event.id,
      newStart.toISOString(),
      newEnd?.toISOString() || null
    );

    if (result.success) {
      toast({ title: 'Afspraak verzet' });
      // Update local state
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, start: newStart, end: newEnd || undefined }
            : e
        )
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Kon afspraak niet verzetten',
        description: result.error,
      });
      // Refresh events to revert
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      fetchEvents(start, end);
    }

    setIsRescheduling(false);
    setPendingReschedule(null);
  }, [pendingReschedule, currentDate, fetchEvents]);

  // Cancel reschedule - revert the visual change
  const cancelReschedule = useCallback(() => {
    // Refresh events to revert the visual drag
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    fetchEvents(start, end);
    setPendingReschedule(null);
  }, [currentDate, fetchEvents]);

  // Handle new appointment button
  const handleNewAppointment = useCallback(() => {
    setEditingEvent(undefined);
    setModalInitialDate(currentDate);
    setModalInitialStartTime('09:00');
    setModalInitialEndTime('10:00');
    setIsModalOpen(true);
  }, [currentDate]);

  // Handle mini calendar date selection
  const handleMiniCalendarDateSelect = useCallback((date: Date) => {
    setCurrentDate(date);

    // Calculate date range based on current view
    const start = currentView === 'timeGridDay'
      ? date
      : startOfWeek(date, { weekStartsOn: 1 });
    const end = currentView === 'timeGridDay'
      ? addDays(date, 1)
      : endOfWeek(date, { weekStartsOn: 1 });

    fetchEvents(start, end);
  }, [currentView, fetchEvents]);

  // Handle modal success (refresh events)
  const handleModalSuccess = useCallback(() => {
    const start = currentView === 'timeGridDay'
      ? currentDate
      : startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = currentView === 'timeGridDay'
      ? addDays(currentDate, 1)
      : endOfWeek(currentDate, { weekStartsOn: 1 });
    fetchEvents(start, end);
  }, [currentDate, currentView, fetchEvents]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <AgendaToolbar
        currentDate={currentDate}
        currentView={currentView}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
        onNewAppointment={handleNewAppointment}
      />

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Mini calendar sidebar */}
        <div className="w-64 flex-shrink-0">
          <MiniCalendar
            selectedDate={currentDate}
            onDateSelect={handleMiniCalendarDateSelect}
          />
        </div>

        {/* Main calendar */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden relative">
          {isPending && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
          <AgendaCalendar
            events={events}
            initialView={currentView}
            currentView={currentView}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
            onEventDrop={handleEventDrop}
            onDateChange={handleDateChange}
          />
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialDate={modalInitialDate}
        initialStartTime={modalInitialStartTime}
        initialEndTime={modalInitialEndTime}
        editingEvent={editingEvent}
        onSuccess={handleModalSuccess}
      />

      {/* Reschedule Confirmation Dialog */}
      {pendingReschedule && (
        <RescheduleDialog
          open={!!pendingReschedule}
          onOpenChange={(open) => {
            if (!open) cancelReschedule();
          }}
          patientName={pendingReschedule.event.title}
          appointmentType={pendingReschedule.event.extendedProps.encounter.type_display}
          oldStart={new Date(pendingReschedule.event.start)}
          oldEnd={pendingReschedule.event.end ? new Date(pendingReschedule.event.end) : null}
          newStart={pendingReschedule.newStart}
          newEnd={pendingReschedule.newEnd}
          onConfirm={confirmReschedule}
          isLoading={isRescheduling}
        />
      )}
    </div>
  );
}
