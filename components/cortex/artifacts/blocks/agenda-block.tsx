'use client';
import React, { useState, useEffect } from 'react';
import { AppointmentTypeCode, LocationClassCode, CalendarEvent } from '@/app/epd/agenda/types';
import { AgendaListView } from './agenda-list-view';
import { AgendaCreateForm } from './agenda-create-form';
import { AgendaCancelView } from './agenda-cancel-view';
import { AgendaRescheduleForm } from './agenda-reschedule-form';
import { AgendaErrorState } from './agenda-error-state';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface AgendaBlockProps {
    mode: 'list' | 'create' | 'cancel' | 'reschedule';
    appointments?: CalendarEvent[];
    dateRange?: { start?: Date; end?: Date; label: string };
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
    appointments: initialAppointments,
    dateRange: initialDateRange,
    prefillData,
    disambiguationOptions,
    onClose,
}: AgendaBlockProps) {
    // State for fetched appointments (only used in list mode)
    const [appointments, setAppointments] = useState<CalendarEvent[] | undefined>(initialAppointments);
    const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date; label: string } | undefined>(initialDateRange);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refetchKey, setRefetchKey] = useState(0);

    // Fetch appointments when in list mode and no appointments are provided
    // Server-side bepaalt de datum (consistent met EPD agenda)
    useEffect(() => {
        if (mode !== 'list') return;
        if (initialAppointments && initialAppointments.length > 0) return;

        const fetchAppointments = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Build query params - server bepaalt de datum
                const params = new URLSearchParams();

                // Stuur alleen label naar server, server berekent de datums
                if (initialDateRange?.label) {
                    params.set('label', initialDateRange.label);
                }
                // Als geen label en geen expliciete datums, server defaults naar vandaag

                const response = await fetch(`/api/cortex/agenda?${params}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Kon afspraken niet laden');
                }

                const data = await response.json();
                setAppointments(data.appointments || []);

                // Update dateRange met server-side berekende waarden
                if (data.dateRange) {
                    setDateRange({
                        start: new Date(data.dateRange.start),
                        end: new Date(data.dateRange.end),
                        label: data.dateRange.label,
                    });
                }
            } catch (err) {
                console.error('Error fetching appointments:', err);
                setError(err instanceof Error ? err.message : 'Er ging iets mis');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, [mode, initialAppointments, initialDateRange, refetchKey]);

    const renderContent = () => {
        switch (mode) {
            case 'list':
                if (isLoading) {
                    return (
                        <div key="loading" className="flex flex-col items-center justify-center h-full text-slate-500">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-4" />
                            <p className="text-sm">Afspraken laden...</p>
                        </div>
                    );
                }
                if (error) {
                    return (
                        <AgendaErrorState 
                            key="error"
                            error={error}
                            context="query"
                            onRetry={() => {
                                setError(null);
                                setRefetchKey((k) => k + 1); // Trigger refetch
                            }}
                        />
                    );
                }
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
