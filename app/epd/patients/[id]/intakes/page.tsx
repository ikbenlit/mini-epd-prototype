import { getIntakesByPatientId } from './actions';
import { IntakeList } from './components/intake-list';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface IntakesPageProps {
    params: Promise<{ id: string }>;
}

export default async function IntakesPage({ params }: IntakesPageProps) {
    const { id } = await params;
    const intakes = await getIntakesByPatientId(id);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Intakes
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Overzicht van alle intakes
                    </p>
                </div>
                <Link
                    href={`/epd/patients/${id}/intakes/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nieuwe Intake</span>
                </Link>
            </div>

            <IntakeList intakes={intakes} patientId={id} />
        </div>
    );
}

