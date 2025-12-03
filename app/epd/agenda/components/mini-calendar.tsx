'use client';

/**
 * Mini Calendar Component
 *
 * Compact month view calendar for quick date navigation.
 * Uses FullCalendar daygrid plugin for consistency with the main calendar.
 */

import { useCallback, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import nlLocale from '@fullcalendar/core/locales/nl';
import type { DateClickArg } from '@fullcalendar/interaction';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function MiniCalendar({ selectedDate, onDateSelect }: MiniCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // Navigate to month containing selected date
  useEffect(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.gotoDate(selectedDate);
    }
  }, [selectedDate]);

  const handleDateClick = useCallback((info: DateClickArg) => {
    onDateSelect(info.date);
  }, [onDateSelect]);

  const handlePrevMonth = useCallback(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
    }
  }, []);

  const handleNextMonth = useCallback(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
    }
  }, []);

  const handleToday = useCallback(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
    onDateSelect(new Date());
  }, [onDateSelect]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      {/* Custom header with month/year navigation */}
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <button
          onClick={handleToday}
          className="text-sm font-semibold text-slate-800 hover:text-teal-600 transition-colors capitalize"
        >
          {format(selectedDate, 'MMMM yyyy', { locale: nl })}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Mini calendar */}
      <div className="mini-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={nlLocale}
          headerToolbar={false}
          height="auto"
          fixedWeekCount={false}
          showNonCurrentDates={true}
          dayMaxEvents={0}
          dateClick={handleDateClick}
          dayCellClassNames={(arg) => {
            const isSelected = arg.date.toDateString() === selectedDate.toDateString();
            return isSelected ? 'mini-cal-selected' : '';
          }}
        />
      </div>

      <style jsx global>{`
        .mini-calendar .fc {
          --fc-border-color: #e2e8f0;
          --fc-today-bg-color: #f0fdf4;
          font-family: inherit;
          font-size: 0.75rem;
        }

        .mini-calendar .fc-theme-standard td,
        .mini-calendar .fc-theme-standard th {
          border: none;
        }

        .mini-calendar .fc-theme-standard .fc-scrollgrid {
          border: none;
        }

        .mini-calendar .fc-col-header-cell {
          padding: 0.25rem 0;
          font-weight: 500;
          color: #64748b;
          font-size: 0.65rem;
          text-transform: uppercase;
        }

        .mini-calendar .fc-daygrid-day {
          cursor: pointer;
        }

        .mini-calendar .fc-daygrid-day-frame {
          min-height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mini-calendar .fc-daygrid-day-top {
          flex-direction: row;
          justify-content: center;
        }

        .mini-calendar .fc-daygrid-day-number {
          padding: 0;
          font-size: 0.75rem;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.15s;
        }

        .mini-calendar .fc-daygrid-day:hover .fc-daygrid-day-number {
          background-color: #f1f5f9;
        }

        .mini-calendar .fc-day-today .fc-daygrid-day-number {
          background-color: #14b8a6;
          color: white;
          font-weight: 600;
        }

        .mini-calendar .mini-cal-selected .fc-daygrid-day-number {
          background-color: #0d9488;
          color: white;
          font-weight: 600;
        }

        .mini-calendar .fc-day-today.mini-cal-selected .fc-daygrid-day-number {
          background-color: #0f766e;
        }

        .mini-calendar .fc-day-other .fc-daygrid-day-number {
          color: #cbd5e1;
        }

        .mini-calendar .fc-daygrid-day-events {
          display: none;
        }

        .mini-calendar .fc-daygrid-day-bottom {
          display: none;
        }
      `}</style>
    </div>
  );
}
