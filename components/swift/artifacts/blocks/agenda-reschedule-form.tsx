'use client';

import React, { useState, useEffect } from 'react';
import { format, addHours } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar, Clock, X, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { rescheduleEncounter } from '@/app/epd/agenda/actions';
import { CalendarEvent } from '@/app/epd/agenda/types';

interface AgendaRescheduleFormProps {
    prefillData?: {
        identifier?: { encounterId?: string; encounter?: CalendarEvent };
        newDatetime?: { date: Date; time: string };
    };
    onClose?: () => void;
}

export function AgendaRescheduleForm({ prefillData, onClose }: AgendaRescheduleFormProps) {
    // Use encounter from prefill if provided directly (we might need to pass it in prefillData from parent)
    const encounter = prefillData?.identifier?.encounter;
    const encounterId = prefillData?.identifier?.encounterId;

    // State for new date/time
    const [date, setDate] = useState<string>(
        prefillData?.newDatetime?.date
            ? format(prefillData.newDatetime.date, 'yyyy-MM-dd')
            : encounter ? format(new Date(encounter.start), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    );

    const [time, setTime] = useState<string>(
        prefillData?.newDatetime?.time
            ? prefillData.newDatetime.time
            : encounter ? format(new Date(encounter.start), 'HH:mm') : '09:00'
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!encounterId) {
            setError('Geen afspraak ID gevonden.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const startDate = new Date(`${date}T${time}`);
            // Keep same duration? For simplicty default to 1 hour or original duration if we knew it. 
            // API rescheduleEncounter takes start/end.

            let endDate = addHours(startDate, 1);
            if (encounter && encounter.end) {
                const originalDuration = new Date(encounter.end).getTime() - new Date(encounter.start).getTime();
                endDate = new Date(startDate.getTime() + originalDuration);
            }

            // Check if not in past
            if (startDate < new Date()) {
                setError('Kan niet verplaatsen naar een datum in het verleden.');
                setIsSubmitting(false);
                return;
            }

            const result = await rescheduleEncounter(
                encounterId,
                startDate.toISOString(),
                endDate.toISOString()
            );

            if (result.success) {
                setIsSuccess(true);
                setTimeout(() => onClose?.(), 2000);
            } else {
                setError(result.error || 'Kon de afspraak niet verzetten.');
            }
        } catch (err) {
            console.error('Reschedule error:', err);
            setError('Er is een onverwachte fout opgetreden.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="bg-green-50 p-3 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Afspraak verzet</h3>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                    De afspraak is verplaatst naar {format(new Date(`${date}T${time}`), 'd MMMM HH:mm', { locale: nl })}.
                </p>
                <Button onClick={onClose} variant="outline">Sluiten</Button>
            </div>
        );
    }

    if (!encounter && !encounterId) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500">Geen afspraak gevonden om te verzetten.</p>
                <Button onClick={onClose} variant="link">Sluiten</Button>
            </div>
        );
    }

    // Calculate current date/time for display
    const currentStart = encounter ? new Date(encounter.start) : null;
    const currentStr = currentStart ? format(currentStart, 'd MMMM yyyy HH:mm', { locale: nl }) : 'Onbekend';

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-lg text-teal-700">Afspraak verzetten</h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100 rounded-full">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 p-4 overflow-y-auto space-y-6">

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    {encounter && <h4 className="font-medium text-blue-900 mb-2">{encounter.title}</h4>}
                    <div className="flex items-center gap-2 text-sm text-blue-700 opacity-80 decoration-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span className="line-through decoration-blue-900/40">{currentStr}</span>
                    </div>
                    <div className="flex justify-center my-1">
                        <ArrowRight className="h-4 w-4 text-blue-400 rotate-90 sm:rotate-0" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {date && time ? format(new Date(`${date}T${time}`), 'd MMMM yyyy HH:mm', { locale: nl }) : '...'}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="date" className="text-sm font-medium text-gray-700">Nieuwe datum</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="time" className="text-sm font-medium text-gray-700">Nieuwe tijd</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Clock className="h-4 w-4" />
                            </div>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>
                </div>
            </form>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t flex justify-between gap-3">
                <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting} className="flex-1">
                    Annuleren
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                    {isSubmitting ? 'Verplaatsen...' : 'Bevestig wijziging'}
                </Button>
            </div>
        </div>
    );
}
