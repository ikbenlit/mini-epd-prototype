'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createIntake } from '../actions';
import { useState, useTransition } from 'react';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    title: z.string().min(1, 'Titel is verplicht'),
    department: z.enum(['Volwassenen', 'Jeugd', 'Ouderen']),
    start_date: z.string().min(1, 'Startdatum is verplicht'),
});

type FormData = z.infer<typeof formSchema>;

interface NewIntakeFormProps {
    patientId: string;
}

export function NewIntakeForm({ patientId }: NewIntakeFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            department: 'Volwassenen',
            start_date: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const onSubmit = (data: FormData) => {
        setError(null);
        startTransition(async () => {
            try {
                await createIntake({
                    ...data,
                    patient_id: patientId,
                });
            } catch (e) {
                setError('Er is een fout opgetreden bij het aanmaken van de intake.');
                console.error(e);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-slate-900">
                    Titel Intake
                </label>
                <input
                    id="title"
                    type="text"
                    {...register('title')}
                    placeholder="Bijv. Intake Depressie"
                    className={cn(
                        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
                        errors.title && "border-red-500 focus:ring-red-500"
                    )}
                    disabled={isPending}
                />
                {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium text-slate-900">
                    Afdeling
                </label>
                <select
                    id="department"
                    {...register('department')}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isPending}
                >
                    <option value="Volwassenen">Volwassenen</option>
                    <option value="Jeugd">Jeugd</option>
                    <option value="Ouderen">Ouderen</option>
                </select>
                {errors.department && (
                    <p className="text-xs text-red-500">{errors.department.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="start_date" className="text-sm font-medium text-slate-900">
                    Startdatum
                </label>
                <div className="relative">
                    <input
                        id="start_date"
                        type="date"
                        {...register('start_date')}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
                            errors.start_date && "border-red-500 focus:ring-red-500"
                        )}
                        disabled={isPending}
                    />
                </div>
                {errors.start_date && (
                    <p className="text-xs text-red-500">{errors.start_date.message}</p>
                )}
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isPending ? 'Aanmaken...' : 'Start Intake'}
                </button>
            </div>
        </form>
    );
}

