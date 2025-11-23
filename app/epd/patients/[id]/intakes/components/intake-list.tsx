'use client';

import { Intake } from '@/lib/types/intake';
import { IntakeCard } from './intake-card';
import { FileText } from 'lucide-react';

interface IntakeListProps {
    intakes: Intake[];
    patientId: string;
    isLoading?: boolean;
}

export function IntakeList({ intakes, patientId, isLoading }: IntakeListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="h-32 bg-slate-50 rounded-lg border border-slate-200 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (intakes.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                    <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 mb-1">
                    Geen intakes gevonden
                </h3>
                <p className="text-sm text-slate-500">
                    Start een nieuwe intake om te beginnen.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {intakes.map((intake) => (
                <IntakeCard key={intake.id} intake={intake} patientId={patientId} />
            ))}
        </div>
    );
}

