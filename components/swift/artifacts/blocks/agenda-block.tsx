'use client';
import React from 'react';
import { AppointmentTypeCode, LocationClassCode, CalendarEvent } from '@/app/epd/agenda/types';
import { AgendaListView } from './agenda-list-view';
import { AgendaCreateForm } from './agenda-create-form';
import { AgendaCancelView } from './agenda-cancel-view';
import { AgendaRescheduleForm } from './agenda-reschedule-form';
import { motion, AnimatePresence } from 'framer-motion';

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
                        key="list"
                        appointments={appointments}
                        dateRange={dateRange}
                        onClose={onClose}
                        onCancelAppointment={(evt) => console.log('Cancel requested', evt)}
                        onViewDetails={(evt) => window.location.href = `/epd/agenda?focus=${evt.id}`}
                    />
                );
            case 'create':
                return <AgendaCreateForm key="create" prefillData={prefillData} onClose={onClose} />;
            case 'cancel':
                return (
                    <AgendaCancelView
                        key="cancel"
                        disambiguationOptions={disambiguationOptions}
                        prefillData={prefillData}
                        onClose={onClose}
                    />
                );
            case 'reschedule':
                return <AgendaRescheduleForm key="reschedule" prefillData={prefillData} onClose={onClose} />;
            default:
                return <div key="error" className="p-4 text-red-500">Unknown mode: {mode}</div>;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full max-w-[600px] max-h-[80vh] h-[600px] overflow-hidden bg-white/95 backdrop-blur-xl border border-black/5 rounded-2xl shadow-2xl flex flex-col"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col h-full overflow-hidden"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
