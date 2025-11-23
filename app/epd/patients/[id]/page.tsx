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
  Calendar,
} from 'lucide-react';
import { getIntakesByPatientId } from './intakes/actions';
import type { Intake } from '@/lib/types/intake';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default async function PatientDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch recent intakes (optional)
  let recentIntakes: Intake[] = [];
  try {
    const intakes = await getIntakesByPatientId(id);
    recentIntakes = intakes.slice(0, 3); // Get up to 3 most recent
  } catch (error) {
    // Silently fail - intakes are optional for dashboard
    console.error('Failed to fetch intakes for dashboard:', error);
  }

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
          href={`/epd/patients/${id}/intakes`}
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

      {/* Recent Intakes Section */}
      {recentIntakes.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recente Intakes</h3>
            <Link
              href={`/epd/patients/${id}/intakes`}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Bekijk alle →
            </Link>
          </div>
          <div className="space-y-3">
            {recentIntakes.map((intake) => (
              <Link
                key={intake.id}
                href={`/epd/patients/${id}/intakes/${intake.id}`}
                className="block p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-50 rounded-md flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                      <FileText className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 group-hover:text-teal-700">
                        {intake.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{intake.department}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(intake.start_date), 'd MMM yyyy', { locale: nl })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      intake.status === 'Open'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {intake.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-2">Volgende stappen</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Controleer en vul basisgegevens aan indien nodig</li>
              <li>• Start screening door activiteiten te loggen</li>
              <li>• Upload relevante documenten (verwijsbrief, etc.)</li>
              <li>• Neem screeningsbesluit om door te gaan naar intake</li>
              <li>
                • Start een nieuwe intake via de{' '}
                <Link
                  href={`/epd/patients/${id}/intakes`}
                  className="underline font-medium hover:text-blue-900"
                >
                  Intake module
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
