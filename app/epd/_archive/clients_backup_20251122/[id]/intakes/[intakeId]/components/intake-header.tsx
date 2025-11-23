import { Intake } from '../../actions';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar, Clock, FileText } from 'lucide-react';

interface IntakeHeaderProps {
    intake: Intake;
}

export function IntakeHeader({ intake }: IntakeHeaderProps) {
    const statusColors = {
        Open: 'bg-blue-50 text-blue-700 border-blue-200',
        Completed: 'bg-green-50 text-green-700 border-green-200',
        Cancelled: 'bg-red-50 text-red-700 border-red-200',
        Draft: 'bg-slate-50 text-slate-700 border-slate-200',
    };

    const status = intake.status || 'Draft';
    const statusClass = statusColors[status as keyof typeof statusColors] || statusColors.Draft;

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-bold text-slate-900">{intake.title}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>
                                {status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="font-medium text-slate-700">{intake.department}</span>
                            <span className="text-slate-300">|</span>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Start: {format(new Date(intake.start_date), 'd MMM yyyy', { locale: nl })}
                                </span>
                            </div>
                            {intake.end_date && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        Eind: {format(new Date(intake.end_date), 'd MMM yyyy', { locale: nl })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Placeholder for actions like Edit, Close, etc. */}
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                        Bewerken
                    </button>
                </div>
            </div>
        </div>
    );
}
