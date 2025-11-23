import { NewIntakeForm } from '../components/new-intake-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface NewIntakePageProps {
    params: Promise<{ id: string }>;
}

export default async function NewIntakePage({ params }: NewIntakePageProps) {
    const { id } = await params;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <Link
                    href={`/epd/patients/${id}/intakes`}
                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Terug naar overzicht
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Nieuwe Intake Starten</h1>
                <p className="text-slate-600 mt-2">
                    Vul de basisgegevens in om een nieuwe intake te starten.
                </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <NewIntakeForm patientId={id} />
            </div>
        </div>
    );
}

