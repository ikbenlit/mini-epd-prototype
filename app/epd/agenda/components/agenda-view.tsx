'use client';

/**
 * Agenda View Component
 *
 * Client-side wrapper managing calendar state, view switching, and interactions.
 */

import { useState, useCallback, useRef, useEffect, useTransition } from 'react';
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

import { AgendaCalendar } from './agenda-calendar';
import { AgendaToolbar } from './agenda-toolbar';
import { getEncounters, rescheduleEncounter } from '../actions';
import type { CalendarEvent, CalendarView } from '../types';

interface AgendaViewProps {
  initialEvents: CalendarEvent[];
  initialDate?: Date;
}

export function AgendaView({ initialEvents, initialDate }: AgendaViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('timeGridWeek');
  const [isPending, startTransition] = useTransition();

  const calendarRef = useRef<{ getApi: () => { prev: () => void; next: () => void; today: () => void; changeView: (view: string) => void; getDate: () => Date } } | null>(null);

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

  // Handle event click
  const handleEventClick = useCallback((event: CalendarEvent) => {
    // TODO: Open appointment details modal
    toast({
      title: `Afspraak: ${event.title}`,
      description: event.extendedProps.encounter.type_display,
    });
  }, []);

  // Handle date selection (for creating new appointment)
  const handleDateSelect = useCallback((start: Date, end: Date) => {
    // TODO: Open new appointment modal with pre-filled dates
    toast({
      title: 'Nieuwe afspraak',
      description: `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
    });
  }, []);

  // Handle event drag-and-drop
  const handleEventDrop = useCallback(async (
    eventId: string,
    newStart: Date,
    newEnd: Date | null
  ) => {
    const result = await rescheduleEncounter(
      eventId,
      newStart.toISOString(),
      newEnd?.toISOString() || null
    );

    if (result.success) {
      toast({ title: 'Afspraak verzet' });
      // Update local state optimistically
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
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
  }, [currentDate, fetchEvents]);

  // Handle new appointment button
  const handleNewAppointment = useCallback(() => {
    // TODO: Open new appointment modal
    toast({ title: 'Nieuwe afspraak modal (nog te implementeren)' });
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <AgendaToolbar
        currentDate={currentDate}
        currentView={currentView}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
        onNewAppointment={handleNewAppointment}
      />

      <div className="flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden">
        {isPending && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        <AgendaCalendar
          events={events}
          initialView={currentView}
          onEventClick={handleEventClick}
          onDateSelect={handleDateSelect}
          onEventDrop={handleEventDrop}
          onDateChange={handleDateChange}
        />
      </div>
    </div>
  );
}
