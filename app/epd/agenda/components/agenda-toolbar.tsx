'use client';

/**
 * Agenda Toolbar Component
 *
 * View switcher and date navigation for the calendar.
 */

import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

import type { CalendarView } from '../types';

interface AgendaToolbarProps {
  currentDate: Date;
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onNewAppointment: () => void;
}

const VIEW_OPTIONS: { value: CalendarView; label: string; className?: string }[] = [
  { value: 'timeGridDay', label: 'Dag' },
  { value: 'timeGridWeek', label: 'Week', className: 'hidden md:block' },
  { value: 'timeGridWorkWeek', label: 'Werkweek', className: 'hidden md:block' },
];

export function AgendaToolbar({
  currentDate,
  currentView,
  onViewChange,
  onNavigate,
  onNewAppointment,
}: AgendaToolbarProps) {
  const getDateLabel = () => {
    if (currentView === 'timeGridDay') {
      return format(currentDate, 'EEEE d MMMM yyyy', { locale: nl });
    }

    // For week views, show the week range
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + (currentView === 'timeGridWorkWeek' ? 4 : 6));

    if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
      return `${format(startOfWeek, 'd')} - ${format(endOfWeek, 'd MMMM yyyy', { locale: nl })}`;
    }

    if (startOfWeek.getFullYear() === endOfWeek.getFullYear()) {
      return `${format(startOfWeek, 'd MMM', { locale: nl })} - ${format(endOfWeek, 'd MMM yyyy', { locale: nl })}`;
    }

    return `${format(startOfWeek, 'd MMM yyyy', { locale: nl })} - ${format(endOfWeek, 'd MMM yyyy', { locale: nl })}`;
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
      {/* Left: Title and Date */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate('prev')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('today')}
            className="h-8"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Vandaag
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate('next')}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-lg font-medium text-slate-700 capitalize">
          {getDateLabel()}
        </span>
      </div>

      {/* Right: View Switcher and New Appointment */}
      <div className="flex items-center gap-3">
        {/* View Switcher */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onViewChange(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentView === option.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                } ${option.className || ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* New Appointment Button */}
        <Button onClick={onNewAppointment} className="gap-2 w-full md:w-auto">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Nieuwe Afspraak</span>
          <span className="md:hidden">Nieuw</span>
        </Button>
      </div>
    </div>
  );
}
