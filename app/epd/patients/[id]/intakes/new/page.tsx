import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const NewIntakeForm = dynamic(
    () => import('../components/new-intake-form').then((m) => m.NewIntakeForm),
    { ssr: false, loading: () => <FormSkeleton /> }
);

function FormSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-5 w-1/3 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-5 w-1/4 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-5 w-1/4 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-200" />
        </div>
    );
}

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
