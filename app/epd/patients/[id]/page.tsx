/**
 * Patient Dashboard Page
 * E2.S3: Default view showing patient overview and status
 */

import Link from 'next/link';
import {
  User,
  ClipboardList,
  FileText,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default async function PatientDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-600 mt-1">
          Overzicht van cliëntgegevens en voortgang
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Basisgegevens Card */}
        <Link
          href={`/epd/patients/${id}/basisgegevens`}
          className="bg-white rounded-lg border border-slate-200 p-6 hover:border-teal-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Basisgegevens</h3>
                <p className="text-xs text-slate-500">NAW & contactgegevens</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
        </Link>

        {/* Screening Card */}
        <Link
          href={`/epd/patients/${id}/screening`}
          className="bg-white rounded-lg border border-slate-200 p-6 hover:border-teal-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Screening</h3>
                <p className="text-xs text-slate-500">Activiteiten & besluit</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
        </Link>

        {/* Intake Card */}
        <Link
          href={`/epd/patients/${id}/intake`}
          className="bg-white rounded-lg border border-slate-200 p-6 hover:border-teal-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Intake</h3>
                <p className="text-xs text-slate-500">Gesprekken & registraties</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Next Steps Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Volgende stappen</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Controleer en vul basisgegevens aan indien nodig</li>
              <li>• Start screening door activiteiten te loggen</li>
              <li>• Upload relevante documenten (verwijsbrief, etc.)</li>
              <li>• Neem screeningsbesluit om door te gaan naar intake</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
