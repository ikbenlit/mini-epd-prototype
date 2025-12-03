'use client';

/**
 * Agenda Calendar Component
 *
 * FullCalendar wrapper with day/week/workweek views.
 */

import { useCallback, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg, EventDropArg, CalendarApi } from '@fullcalendar/core';
import nlLocale from '@fullcalendar/core/locales/nl';

import type { CalendarEvent, CalendarView } from '../types';

interface AgendaCalendarProps {
  events: CalendarEvent[];
  initialView?: CalendarView;
  currentView?: CalendarView;
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date | null) => void;
  onDateChange?: (start: Date, end: Date) => void;
  calendarRef?: React.RefObject<CalendarApi | null>;
}

export function AgendaCalendar({
  events,
  initialView = 'timeGridWeek',
  currentView,
  onEventClick,
  onDateSelect,
  onEventDrop,
  onDateChange,
  calendarRef: externalRef,
}: AgendaCalendarProps) {
  const internalRef = useRef<FullCalendar>(null);
  const isChangingViewRef = useRef(false);

  // Sync view when currentView prop changes
  useEffect(() => {
    if (currentView && internalRef.current) {
      const api = internalRef.current.getApi();
      if (api.view.type !== currentView) {
        isChangingViewRef.current = true;
        api.changeView(currentView);
        // Reset flag after a short delay to allow the view change to complete
        setTimeout(() => {
          isChangingViewRef.current = false;
        }, 100);
      }
    }
  }, [currentView]);

  const handleEventClick = useCallback((info: EventClickArg) => {
    if (onEventClick) {
      const event = info.event;
      const calendarEvent: CalendarEvent = {
        id: event.id,
        title: event.title,
        start: event.start!,
        end: event.end || undefined,
        extendedProps: event.extendedProps as CalendarEvent['extendedProps'],
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
      };
      onEventClick(calendarEvent);
    }
  }, [onEventClick]);

  const handleDateSelect = useCallback((info: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(info.start, info.end);
    }
  }, [onDateSelect]);

  const handleEventDrop = useCallback((info: EventDropArg) => {
    if (onEventDrop) {
      onEventDrop(
        info.event.id,
        info.event.start!,
        info.event.end
      );
    }
  }, [onEventDrop]);

  const handleDatesSet = useCallback((dateInfo: { start: Date; end: Date }) => {
    // Skip if we're in the middle of a programmatic view change
    if (isChangingViewRef.current) {
      return;
    }
    if (onDateChange) {
      onDateChange(dateInfo.start, dateInfo.end);
    }
  }, [onDateChange]);

  return (
    <div className="agenda-calendar h-full">
      <FullCalendar
        ref={internalRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        locale={nlLocale}
        headerToolbar={false}
        events={events}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        allDaySlot={false}
        nowIndicator={true}
        height="100%"
        expandRows={true}
        stickyHeaderDates={true}
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        datesSet={handleDatesSet}
        views={{
          timeGridWorkWeek: {
            type: 'timeGrid',
            duration: { weeks: 1 },
            hiddenDays: [0, 6], // Hide Sunday and Saturday
            buttonText: 'Werkweek',
          },
        }}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '08:00',
          endTime: '18:00',
        }}
        eventContent={(eventInfo) => (
          <div className="p-1 overflow-hidden h-full">
            <div className="font-medium text-xs truncate">
              {eventInfo.timeText}
            </div>
            <div className="font-semibold text-sm truncate">
              {eventInfo.event.title}
            </div>
            {eventInfo.event.extendedProps?.encounter?.type_display && (
              <div className="text-xs opacity-80 truncate">
                {eventInfo.event.extendedProps.encounter.type_display}
              </div>
            )}
          </div>
        )}
      />
      <style jsx global>{`
        .agenda-calendar .fc {
          --fc-border-color: #e2e8f0;
          --fc-today-bg-color: #f0fdf4;
          --fc-now-indicator-color: #22c55e;
          --fc-event-border-color: transparent;
          font-family: inherit;
        }

        .agenda-calendar .fc-theme-standard td,
        .agenda-calendar .fc-theme-standard th {
          border-color: var(--fc-border-color);
        }

        .agenda-calendar .fc-timegrid-slot {
          height: 2.5rem;
        }

        .agenda-calendar .fc-timegrid-slot-label {
          font-size: 0.75rem;
          color: #64748b;
        }

        .agenda-calendar .fc-col-header-cell {
          padding: 0.5rem 0;
          font-weight: 600;
          color: #334155;
          background-color: #f8fafc;
        }

        .agenda-calendar .fc-col-header-cell-cushion {
          padding: 0.25rem 0.5rem;
        }

        .agenda-calendar .fc-day-today .fc-col-header-cell-cushion {
          color: #16a34a;
        }

        .agenda-calendar .fc-timegrid-event {
          border-radius: 0.375rem;
          border-width: 2px;
          border-left-width: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .agenda-calendar .fc-timegrid-event:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .agenda-calendar .fc-timegrid-now-indicator-line {
          border-width: 2px;
        }

        .agenda-calendar .fc-timegrid-now-indicator-arrow {
          border-width: 6px;
        }

        .agenda-calendar .fc-highlight {
          background-color: #dbeafe;
        }

        .agenda-calendar .fc-non-business {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}
