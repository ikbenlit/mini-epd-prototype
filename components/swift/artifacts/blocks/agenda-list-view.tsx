'use client';
import React from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar, MapPin, Globe, Home, Clock, X, Info, ChevronRight, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
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

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

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
        <div className="flex flex-col h-full bg-transparent">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-black/5">
                <div className="flex items-center gap-3 text-teal-700">
                    <div className="p-2 bg-teal-50 rounded-lg">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 capitalize leading-tight">{formatDateLabel()}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 text-gray-500 hover:text-gray-900 hover:bg-black/5 rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Body */}
            <motion.div
                className="flex-1 overflow-y-auto p-5 space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {appointments.length === 0 ? (
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center justify-center h-full text-center text-gray-500"
                    >
                        <div className="bg-gray-50/50 p-4 rounded-full mb-4">
                            <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-900">Geen afspraken gevonden</p>
                        <p className="text-sm text-gray-500 mt-1 max-w-[200px]">
                            Er staan geen afspraken gepland voor deze periode.
                        </p>
                        <Button variant="outline" className="mt-6 gap-2 text-teal-700 border-teal-200/50 hover:bg-teal-50/50 bg-white/50">
                            <span className="text-lg leading-none">+</span> Maak nieuwe afspraak
                        </Button>
                    </motion.div>
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
                            <motion.div
                                key={evt.id}
                                variants={itemVariants}
                                className="group border border-black/5 rounded-2xl p-4 hover:border-teal-200/50 hover:shadow-md transition-all bg-white/60 hover:bg-white/90 backdrop-blur-sm"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-0.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{startTime} {endTime && `- ${endTime}`}</span>
                                        </div>
                                        <button
                                            className="text-left text-base font-semibold text-gray-900 hover:text-teal-700 hover:underline transition-colors"
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
                                        className="whitespace-nowrap shadow-none px-2.5 py-0.5 text-xs font-medium rounded-md"
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
                                        <Badge variant="destructive" className="h-5 px-1.5 font-normal rounded-sm">Geannuleerd</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg px-3"
                                        onClick={() => onCancelAppointment?.(evt)}
                                    >
                                        Annuleren
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs font-medium text-teal-700 hover:bg-teal-50/50 rounded-lg px-3"
                                        onClick={() => onViewDetails?.(evt)}
                                    >
                                        Details <ChevronRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* Footer */}
            <div className="p-5 bg-gray-50/80 backdrop-blur-sm border-t border-black/5 text-center">
                <a
                    href="/epd/agenda"
                    className="text-sm font-medium text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center gap-1 transition-colors"
                >
                    Open volledige agenda <ChevronRight className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}
