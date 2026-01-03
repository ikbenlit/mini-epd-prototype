'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format, addHours, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar, Clock, MapPin, User, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { createEncounter } from '@/app/epd/agenda/actions';
import {
    APPOINTMENT_TYPES,
    LOCATION_CLASSES,
    AppointmentTypeCode,
    LocationClassCode,
    APPOINTMENT_TYPE_COLORS
} from '@/app/epd/agenda/types';
import { AgendaErrorAlert } from './agenda-error-state';

interface AgendaCreateFormProps {
    prefillData?: {
        patient?: { id: string; name: string };
        datetime?: { date: Date; time: string };
        type?: AppointmentTypeCode;
        location?: LocationClassCode;
        notes?: string;
    };
    onClose?: () => void;
}

interface PatientResult {
    id: string;
    name: string;
    bsn?: string;
    birthDate?: string;
}

export function AgendaCreateForm({ prefillData, onClose }: AgendaCreateFormProps) {
    // Form State
    const [patientId, setPatientId] = useState<string>(prefillData?.patient?.id || '');
    const [patientName, setPatientName] = useState<string>(prefillData?.patient?.name || '');
    const [date, setDate] = useState<string>(
        prefillData?.datetime?.date ? format(prefillData.datetime.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    );
    const [time, setTime] = useState<string>(prefillData?.datetime?.time || '09:00');
    const [type, setType] = useState<AppointmentTypeCode>(prefillData?.type || 'behandeling');
    const [location, setLocation] = useState<LocationClassCode>(prefillData?.location || 'AMB');
    const [notes, setNotes] = useState<string>(prefillData?.notes || '');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Patient Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PatientResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Initialize search query if patient is prefilled but we want to allow editing
    useEffect(() => {
        if (prefillData?.patient?.name) {
            setSearchQuery(prefillData.patient.name);
        }
    }, [prefillData]);

    // Handle outside click to close search results
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length < 2 || patientId) return; // Don't search if too short or if patient already selected

            setIsSearching(true);
            try {
                const res = await fetch(`/api/cortex/patients/search?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.patients || []);
                    setShowResults(true);
                }
            } catch (err) {
                console.error('Failed to search patients', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, patientId]);

    const handlePatientSelect = (patient: PatientResult) => {
        setPatientId(patient.id);
        setPatientName(patient.name);
        setSearchQuery(patient.name);
        setShowResults(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPatientId(''); // Clear selection on edit
        setPatientName('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId) {
            setError('Selecteer a.u.b. een patiënt.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Construct Date objects
            const startDate = new Date(`${date}T${time}`);
            const endDate = addHours(startDate, 1); // Default duration 1 hour

            // Map codes to displays
            const typeDisplay = APPOINTMENT_TYPES[type];
            const locationDisplay = LOCATION_CLASSES[location];

            const result = await createEncounter({
                patientId,
                periodStart: startDate.toISOString(),
                periodEnd: endDate.toISOString(),
                typeCode: type,
                typeDisplay,
                classCode: location,
                classDisplay: locationDisplay,
                notes: notes || undefined,
            });

            if (result.success) {
                const formattedDate = format(startDate, "EEEE d MMMM 'om' HH:mm", { locale: nl });
                
                toast({
                    title: '✓ Afspraak ingepland',
                    description: `${patientName} — ${formattedDate}`,
                    action: (
                        <ToastAction 
                            altText="Bekijk afspraak"
                            onClick={() => window.location.href = `/epd/agenda?highlight=${result.data?.id}&date=${date}`}
                        >
                            Bekijken
                        </ToastAction>
                    ),
                });
                
                onClose?.();
            } else {
                setError(result.error || 'Er is een fout opgetreden.');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Er is een onverwachte fout opgetreden.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col h-full bg-transparent"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-black/5">
                <h3 className="font-semibold text-lg text-gray-900">Nieuwe afspraak inplannen</h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 text-gray-500 hover:text-gray-900 hover:bg-black/5 rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">

                {error && (
                    <AgendaErrorAlert
                        error={error}
                        onDismiss={() => setError(null)}
                        showFallbackLink={true}
                    />
                )}

                {/* Patient Selection */}
                <div className="space-y-2" ref={searchRef}>
                    <Label htmlFor="patient" className="text-sm font-medium text-gray-700">Patiënt <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <User className="h-4 w-4" />
                        </div>
                        <Input
                            id="patient"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Zoek op naam..."
                            className="pl-10 h-10 bg-white/50 backdrop-blur-sm border-black/10 focus:bg-white transition-colors"
                            autoComplete="off"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-3 w-3 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}

                        {showResults && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-xl border border-black/5 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                {searchResults.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handlePatientSelect(p)}
                                        className="w-full text-left px-4 py-3 hover:bg-teal-50/50 text-sm flex flex-col border-b last:border-0 border-black/5 transition-colors"
                                    >
                                        <span className="font-medium text-gray-900">{p.name}</span>
                                        <span className="text-xs text-gray-500 mt-0.5">
                                            {p.birthDate && format(new Date(p.birthDate), 'dd-MM-yyyy')}
                                            {p.bsn && ` • BSN: ${p.bsn}`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium text-gray-700">Datum <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-10 h-10 bg-white/50 backdrop-blur-sm border-black/10 focus:bg-white transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time" className="text-sm font-medium text-gray-700">Tijd <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Clock className="h-4 w-4" />
                            </div>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="pl-10 h-10 bg-white/50 backdrop-blur-sm border-black/10 focus:bg-white transition-colors"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Type Selection */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Type afspraak <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-2.5">
                        {(Object.keys(APPOINTMENT_TYPES) as AppointmentTypeCode[]).map((t) => {
                            const bg = APPOINTMENT_TYPE_COLORS[t].bg;
                            const text = APPOINTMENT_TYPE_COLORS[t].text;
                            const border = APPOINTMENT_TYPE_COLORS[t].border;
                            const isActive = type === t;

                            return (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`
                    px-3 py-2.5 text-xs font-medium rounded-lg border text-left transition-all
                    ${isActive ? 'ring-2 ring-offset-1 ring-teal-500 shadow-sm' : 'hover:bg-black/5 bg-white/40'}
                  `}
                                    style={{
                                        backgroundColor: isActive ? bg : undefined,
                                        color: isActive ? text : '#374151',
                                        borderColor: isActive ? border : 'rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{APPOINTMENT_TYPES[t]}</span>
                                        {isActive && <Check className="h-3.5 w-3.5" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Location Selection */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Locatie <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2.5">
                        {(Object.keys(LOCATION_CLASSES) as LocationClassCode[]).map((l) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => setLocation(l)}
                                className={`
                  flex-1 py-2.5 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-all
                  ${location === l
                                        ? 'bg-teal-50 border-teal-200 text-teal-800 ring-2 ring-teal-500 ring-opacity-20 shadow-sm'
                                        : 'bg-white/40 border-black/10 text-gray-600 hover:bg-black/5'}
                `}
                            >
                                {l === 'AMB' && <MapPin className="h-3.5 w-3.5" />}
                                {l === 'VR' && <div className="h-3.5 w-3.5 border rounded-full" />}
                                {l === 'HH' && <div className="h-3.5 w-3.5 bg-current rounded-sm" />}
                                {LOCATION_CLASSES[l]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notities (optioneel)</Label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Bijv. bijzonderheden, reden van komst..."
                        className="h-24 text-sm resize-none bg-white/50 backdrop-blur-sm border-black/10 focus:bg-white transition-colors rounded-lg"
                    />
                </div>

                <div className="pt-2"></div>
            </form>

            {/* Footer / Actions */}
            <div className="p-5 bg-gray-50/80 backdrop-blur-sm border-t border-black/5 flex justify-between gap-3">
                <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 border-black/10 bg-white/50 hover:bg-white h-10 rounded-lg">
                    Annuleren
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all h-10 rounded-lg"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            <span>Bezig...</span>
                        </div>
                    ) : (
                        'Afspraak inplannen'
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
