import { getIntakeById } from '../actions';
import { notFound } from 'next/navigation';

interface IntakePageProps {
    params: Promise<{ intakeId: string }>;
}

export default async function IntakePage({ params }: IntakePageProps) {
    const { intakeId } = await params;
    const intake = await getIntakeById(intakeId);

    if (!intake) {
        notFound();
    }

    return (
        <div className="max-w-3xl">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Algemene Informatie</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Titel</label>
                        <p className="text-slate-900">{intake.title}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Afdeling</label>
                        <p className="text-slate-900">{intake.department}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Status</label>
                        <p className="text-slate-900">{intake.status}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Startdatum</label>
                        <p className="text-slate-900">{intake.start_date}</p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-500 mb-2">Notities</label>
                    <div className="bg-slate-50 rounded-md p-4 text-slate-600 text-sm min-h-[100px]">
                        {intake.notes || 'Geen notities beschikbaar.'}
                    </div>
                </div>
            </div>
        </div>
    );
}
