'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { AlertTriangle, Calendar, Clock, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cancelEncounter } from '@/app/epd/agenda/actions';
import { CalendarEvent, APPOINTMENT_TYPES, AppointmentTypeCode } from '@/app/epd/agenda/types';

interface AgendaCancelViewProps {
    disambiguationOptions?: CalendarEvent[];
    prefillData?: {
        identifier?: { encounterId?: string };
    };
    onClose?: () => void;
}

export function AgendaCancelView({ disambiguationOptions, prefillData, onClose }: AgendaCancelViewProps) {
    const [selectedEncounterId, setSelectedEncounterId] = useState<string | undefined>(
        prefillData?.identifier?.encounterId
    );

    // If we have disambiguation options and no selection yet, default to first? 
    // Better to let user choose.

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If there's only one option provided via disambiguationOptions (and no prefill), select it automatically?
    // Logic: if prefill encounterId is set, use that.
    // If not, and disambiguationOptions has 1 item, use that.
    // If not, wait for user selection.

    const effectiveEncounter = disambiguationOptions?.find(e => e.id === selectedEncounterId) ||
        (disambiguationOptions?.length === 1 ? disambiguationOptions[0] : undefined);

    const handleCancel = async () => {
        const idToCancel = selectedEncounterId || effectiveEncounter?.id;

        if (!idToCancel) {
            setError('Selecteer eerst een afspraak om te annuleren.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await cancelEncounter(idToCancel);
            if (result.success) {
                setIsSuccess(true);
                // Wait a moment before closing or let user close
                setTimeout(() => onClose?.(), 2000);
            } else {
                setError(result.error || 'Kon de afspraak niet annuleren.');
            }
        } catch (err) {
            console.error('Cancel error:', err);
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
                <h3 className="text-lg font-semibold text-gray-900">Afspraak geannuleerd</h3>
                <p className="text-sm text-gray-500 mt-1 mb-6">De afspraak is succesvol verwijderd uit de agenda.</p>
                <Button onClick={onClose} variant="outline">Sluiten</Button>
            </div>
        );
    }

    // Disambiguation Mode
    if (!effectiveEncounter && disambiguationOptions && disambiguationOptions.length > 1) {
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg text-red-700">Afspraak annuleren</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-4">
                        Er zijn meerdere afspraken gevonden. Welke wil je annuleren?
                    </p>

                    <RadioGroup value={selectedEncounterId} onValueChange={setSelectedEncounterId} className="space-y-3">
                        {disambiguationOptions.map((evt) => {
                            const encounter = evt.extendedProps.encounter;
                            const typeCode = encounter.type_code as AppointmentTypeCode;
                            const dateStr = format(new Date(evt.start), 'd MMM yyyy', { locale: nl });
                            const timeStr = format(new Date(evt.start), 'HH:mm');

                            return (
                                <div key={evt.id} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                    <RadioGroupItem value={evt.id} id={evt.id} />
                                    <Label htmlFor={evt.id} className="flex-1 cursor-pointer">
                                        <div className="font-medium text-gray-900">{evt.title}</div>
                                        <div className="text-sm text-gray-500">
                                            {dateStr} om {timeStr} • {encounter.type_display || APPOINTMENT_TYPES[typeCode]}
                                        </div>
                                    </Label>
                                </div>
                            );
                        })}
                    </RadioGroup>
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-between gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">Annuleren</Button>
                    <Button
                        onClick={() => { /* State updates automatically via RadioGroup */ }}
                        disabled={!selectedEncounterId}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                        Volgende
                    </Button>
                </div>
            </div>
        );
    }

    // Confirmation Mode (Single Match)
    if (effectiveEncounter) {
        const encounter = effectiveEncounter.extendedProps.encounter;
        const typeCode = encounter.type_code as AppointmentTypeCode;
        const dateStr = format(new Date(effectiveEncounter.start), 'EEEE d MMMM yyyy', { locale: nl });
        const timeStr = format(new Date(effectiveEncounter.start), 'HH:mm');
        const endTimeStr = effectiveEncounter.end ? format(new Date(effectiveEncounter.end), 'HH:mm') : '';

        return (
            <div className="flex flex-col h-full bg-white">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg text-red-700">Weet je het zeker?</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 p-4">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="text-sm text-red-800">
                                <p className="font-medium">Deze actie kan niet ongedaan worden gemaakt.</p>
                                <p className="mt-1 opacity-90">De afspraak wordt permanent uit de agenda verwijderd.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-white shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">{effectiveEncounter.title}</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="capitalize">{dateStr}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{timeStr} {endTimeStr && `- ${endTimeStr}`}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-block w-20 text-gray-400">Type:</span>
                                <span className="font-medium">{encounter.type_display || APPOINTMENT_TYPES[typeCode]}</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-between gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
                        Terug
                    </Button>
                    <Button
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isSubmitting ? 'Annuleren...' : 'Ja, annuleer afspraak'}
                    </Button>
                </div>
            </div>
        );
    }

    // Fallback / Loading
    return (
        <div className="p-4">
            <p>Geen afspraak geselecteerd.</p>
            <Button onClick={onClose} variant="link">Sluiten</Button>
        </div>
    );
}
