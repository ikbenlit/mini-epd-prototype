import { Calendar, ChevronRight, FileText } from 'lucide-react';
import { Intake } from '../actions';
import Link from 'next/link';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface IntakeCardProps {
    intake: Intake;
    clientId: string;
}

export function IntakeCard({ intake, clientId }: IntakeCardProps) {
    const statusColors = {
        Open: 'bg-blue-50 text-blue-700 border-blue-200',
        Completed: 'bg-green-50 text-green-700 border-green-200',
        Cancelled: 'bg-red-50 text-red-700 border-red-200',
        Draft: 'bg-slate-50 text-slate-700 border-slate-200',
    };

    const status = intake.status || 'Draft';
    const statusClass = statusColors[status as keyof typeof statusColors] || statusColors.Draft;

    return (
        <Link
            href={`/epd/clients/${clientId}/intakes/${intake.id}`}
            className="block group"
        >
            <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-teal-500 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 rounded-md text-teal-600 group-hover:bg-teal-100 transition-colors">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 group-hover:text-teal-700 transition-colors">
                                {intake.title}
                            </h3>
                            <p className="text-sm text-slate-500">{intake.department}</p>
                        </div>
                    </div>
                    <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}
                    >
                        {status}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {format(new Date(intake.start_date), 'd MMM yyyy', { locale: nl })}
                        </span>
                    </div>
                    {intake.end_date && (
                        <>
                            <span>&rarr;</span>
                            <span>
                                {format(new Date(intake.end_date), 'd MMM yyyy', { locale: nl })}
                            </span>
                        </>
                    )}
                    <div className="ml-auto">
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
