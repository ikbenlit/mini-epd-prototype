'use client';
import React from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar, MapPin, Globe, Home, Clock, X, Info, ChevronRight, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CalendarEvent,
    APPOINTMENT_TYPE_COLORS,
    APPOINTMENT_TYPES,
    LOCATION_CLASSES,
    LocationClassCode,
    AppointmentTypeCode
} from '@/app/epd/agenda/types';

interface AgendaListViewProps {
    appointments?: CalendarEvent[];
    dateRange?: { start: Date; end: Date; label: string };
    onClose?: () => void;
    onCancelAppointment?: (encounter: CalendarEvent) => void;
    onViewDetails?: (encounter: CalendarEvent) => void;
}

export function AgendaListView({
    appointments = [],
    dateRange,
    onClose,
    onCancelAppointment,
    onViewDetails
}: AgendaListViewProps) {

    const formatDateLabel = () => {
        if (dateRange?.label) {
            if (dateRange.label === 'vandaag' || dateRange.label === 'morgen') {
                const dateStr = format(dateRange.start, 'd MMMM', { locale: nl });
                return `Afspraken ${dateRange.label} - ${dateStr}`;
            }
            return `Afspraken ${dateRange.label}`;
        }
        // Fallback if no specific label
        if (appointments.length > 0) {
            return `Afspraken ${format(new Date(appointments[0].start), 'd MMMM', { locale: nl })}`;
        }
        return 'Afspraken';
    };

    const getLocationIcon = (classCode: string) => {
        switch (classCode as LocationClassCode) {
            case 'AMB': return <MapPin className="h-3 w-3" />;
            case 'VR': return <Globe className="h-3 w-3" />;
            case 'HH': return <Home className="h-3 w-3" />;
            default: return <MapPin className="h-3 w-3" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2 text-teal-700">
                    <Calendar className="h-5 w-5" />
                    <h3 className="font-semibold text-lg capitalize">{formatDateLabel()}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100 rounded-full">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                            <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium">Geen afspraken gevonden</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Er staan geen afspraken gepland voor deze periode.
                        </p>
                        <Button variant="outline" className="mt-4 gap-2 text-teal-600 border-teal-200 hover:bg-teal-50">
                            <span className="text-lg leading-none">+</span> Maak nieuwe afspraak
                        </Button>
                    </div>
                ) : (
                    appointments.map((evt) => {
                        const encounter = evt.extendedProps.encounter;
                        const patient = evt.extendedProps.patient;
                        const typeCode = encounter.type_code as AppointmentTypeCode;
                        const typeColor = APPOINTMENT_TYPE_COLORS[typeCode] || APPOINTMENT_TYPE_COLORS.overig;
                        const classCode = encounter.class_code as LocationClassCode;

                        const startTime = format(new Date(evt.start), 'HH:mm');
                        const endTime = evt.end ? format(new Date(evt.end), 'HH:mm') : '';

                        return (
                            <div
                                key={evt.id}
                                className="group border rounded-lg p-3 hover:border-teal-200 hover:shadow-sm transition-all bg-white"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                                            <span>{startTime} {endTime && `- ${endTime}`}</span>
                                        </div>
                                        <button
                                            className="text-left font-semibold text-teal-700 hover:underline mt-0.5"
                                            onClick={() => console.log('Open patient context', patient?.id)}
                                        >
                                            {evt.title}
                                        </button>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        style={{
                                            backgroundColor: typeColor.bg,
                                            color: typeColor.text,
                                            borderColor: typeColor.border
                                        }}
                                        className="whitespace-nowrap shadow-none"
                                    >
                                        {encounter.type_display || APPOINTMENT_TYPES[typeCode] || typeCode}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                    <div className="flex items-center gap-1.5" title={LOCATION_CLASSES[classCode]}>
                                        {getLocationIcon(classCode)}
                                        <span>{encounter.class_display || LOCATION_CLASSES[classCode] || classCode}</span>
                                    </div>
                                    {encounter.status === 'cancelled' && (
                                        <Badge variant="destructive" className="h-5 px-1.5">Geannuleerd</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => onCancelAppointment?.(evt)}
                                    >
                                        Annuleren
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-teal-600 hover:bg-teal-50"
                                        onClick={() => onViewDetails?.(evt)}
                                    >
                                        Details <ChevronRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t text-center">
                <a
                    href="/epd/agenda"
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1"
                >
                    Open volledige agenda <ChevronRight className="h-3 w-3" />
                </a>
            </div>
        </div>
    );
}
