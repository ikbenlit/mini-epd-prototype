'use client';
import React from 'react';
import { AppointmentTypeCode, LocationClassCode, CalendarEvent } from '@/app/epd/agenda/types';
import { AgendaListView } from './agenda-list-view';
import { AgendaCreateForm } from './agenda-create-form';
import { AgendaCancelView } from './agenda-cancel-view';
import { AgendaRescheduleForm } from './agenda-reschedule-form';

export interface AgendaBlockProps {
    mode: 'list' | 'create' | 'cancel' | 'reschedule';
    appointments?: CalendarEvent[];
    dateRange?: { start: Date; end: Date; label: string };
    prefillData?: {
        patient?: { id: string; name: string };
        datetime?: { date: Date; time: string };
        type?: AppointmentTypeCode;
        location?: LocationClassCode;
        notes?: string;
        identifier?: { encounterId?: string; encounter?: CalendarEvent };
        newDatetime?: { date: Date; time: string };
    };
    disambiguationOptions?: CalendarEvent[];
    onClose?: () => void;
}

export function AgendaBlock({
    mode,
    appointments,
    dateRange,
    prefillData,
    disambiguationOptions,
    onClose,
}: AgendaBlockProps) {
    const renderContent = () => {
        switch (mode) {
            case 'list':
                return (
                    <AgendaListView
                        appointments={appointments}
                        dateRange={dateRange}
                        onClose={onClose}
                        onCancelAppointment={(evt) => console.log('Cancel requested', evt)}
                        onViewDetails={(evt) => window.location.href = `/epd/agenda?focus=${evt.id}`}
                    />
                );
            case 'create':
                return <AgendaCreateForm prefillData={prefillData} onClose={onClose} />;
            case 'cancel':
                return (
                    <AgendaCancelView
                        disambiguationOptions={disambiguationOptions}
                        prefillData={prefillData}
                        onClose={onClose}
                    />
                );
            case 'reschedule':
                return <AgendaRescheduleForm prefillData={prefillData} onClose={onClose} />;
            default:
                return <div className="p-4 text-red-500">Unknown mode: {mode}</div>;
        }
    };

    return (
        <div className="w-full max-w-[600px] max-h-[80vh] overflow-y-auto bg-white border rounded shadow-sm">
            {renderContent()}
        </div>
    );
}
