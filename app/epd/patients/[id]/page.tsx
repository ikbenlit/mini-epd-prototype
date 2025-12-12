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
  Clock,
} from 'lucide-react';
import { getIntakesByPatientId } from './intakes/actions';
import type { Intake } from '@/lib/types/intake';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { getPatientEncounters } from '@/app/epd/agenda/actions';
import { getActiveCarePlan, getPatientIntakes } from './behandelplan/actions';
import type { SmartGoal, Intervention, Behandelstructuur, Evaluatiemoment } from '@/lib/types/behandelplan';

function extractHulpvraag(notes: string | null): string | null {
  if (!notes) return null;
  const firstSentence = notes.split(/[.!?]/)[0];
  return firstSentence.length > 150 ? firstSentence.slice(0, 150) + '...' : firstSentence;
}

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

  // Fetch encounters (vandaag, toekomst en recente)
  let upcomingEncounters: any[] = [];
  let recentEncounters: any[] = [];
  try {
    const allEncounters = await getPatientEncounters(id);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Split into upcoming (vandaag + toekomst) and recent (verleden)
    const upcoming = allEncounters.filter(e => new Date(e.period_start) >= todayStart);
    const recent = allEncounters.filter(e => new Date(e.period_start) < todayStart);
    
    // Take 5 most relevant: prioritize upcoming, then recent
    upcomingEncounters = upcoming.slice(0, 5);
    if (upcomingEncounters.length < 5) {
      recentEncounters = recent.slice(0, 5 - upcomingEncounters.length);
    }
  } catch (error) {
    console.error('Failed to fetch encounters:', error);
  }

  // Fetch active care plan
  let activeCarePlan: any = null;
  let hulpvraag: string | null = null;
  try {
    activeCarePlan = await getActiveCarePlan(id);
    
    // Get hulpvraag from linked intake
    if (activeCarePlan?.based_on_intake_id) {
      const intakes = await getPatientIntakes(id);
      const linkedIntake = intakes.find(i => i.id === activeCarePlan.based_on_intake_id);
      if (linkedIntake?.notes) {
        hulpvraag = extractHulpvraag(linkedIntake.notes);
      }
    }
  } catch (error) {
    console.error('Failed to fetch care plan:', error);
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

      {/* Agenda Afspraken Section */}
      {(upcomingEncounters.length > 0 || recentEncounters.length > 0) && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Agenda Afspraken</h3>
            <Link
              href={`/epd/agenda?encounterId=${upcomingEncounters[0]?.id || recentEncounters[0]?.id}`}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Bekijk agenda →
            </Link>
          </div>
          <div className="space-y-3">
            {[...upcomingEncounters, ...recentEncounters].slice(0, 5).map((encounter) => {
              const encounterDate = new Date(encounter.period_start);
              const isPast = encounterDate < new Date();
              const isToday = encounterDate.toDateString() === new Date().toDateString();
              
              return (
                <Link
                  key={encounter.id}
                  href={`/epd/agenda?encounterId=${encounter.id}`}
                  className="block p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        isPast ? 'bg-slate-100' : isToday ? 'bg-blue-50' : 'bg-teal-50'
                      } group-hover:bg-teal-100 transition-colors`}>
                        <Calendar className={`h-4 w-4 ${
                          isPast ? 'text-slate-500' : isToday ? 'text-blue-600' : 'text-teal-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-teal-700">
                          {encounter.type_display || 'Afspraak'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(encounterDate, 'd MMM yyyy HH:mm', { locale: nl })}
                          </span>
                          {encounter.period_end && (
                            <>
                              <span>•</span>
                              <span>
                                {format(new Date(encounter.period_end), 'HH:mm', { locale: nl })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      encounter.status === 'planned' || encounter.status === 'arrived'
                        ? 'bg-blue-50 text-blue-700'
                        : encounter.status === 'finished'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-slate-50 text-slate-700'
                    }`}>
                      {encounter.status === 'planned' ? 'Gepland' : 
                       encounter.status === 'arrived' ? 'Aangekomen' :
                       encounter.status === 'finished' ? 'Afgerond' : encounter.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Behandelplan Section */}
      {activeCarePlan && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Actief Behandelplan</h3>
            <Link
              href={`/epd/patients/${id}/behandelplan`}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Bekijk volledig plan →
            </Link>
          </div>
          
          {/* Hulpvraag */}
          {hulpvraag && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-600 mb-1">Hulpvraag</p>
              <p className="text-sm text-slate-700 italic">&ldquo;{hulpvraag}&rdquo;</p>
            </div>
          )}
          
          {/* Behandelstructuur */}
          {activeCarePlan.behandelstructuur && (
            <div className="mb-4 p-3 bg-teal-50 rounded-lg">
              <p className="text-xs font-medium text-teal-700 mb-2">Behandelstructuur</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-teal-900">
                <div>
                  <span className="font-medium">Duur:</span> {activeCarePlan.behandelstructuur.duur}
                </div>
                <div>
                  <span className="font-medium">Frequentie:</span> {activeCarePlan.behandelstructuur.frequentie}
                </div>
                <div>
                  <span className="font-medium">Aantal sessies:</span> {activeCarePlan.behandelstructuur.aantalSessies}
                </div>
                <div>
                  <span className="font-medium">Vorm:</span> {activeCarePlan.behandelstructuur.vorm}
                </div>
              </div>
            </div>
          )}
          
          {/* Doelen Overzicht */}
          {activeCarePlan.goals && Array.isArray(activeCarePlan.goals) && activeCarePlan.goals.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-600 mb-2">Doelen ({activeCarePlan.goals.length})</p>
              <div className="space-y-2">
                {activeCarePlan.goals.slice(0, 3).map((goal: SmartGoal) => (
                  <div key={goal.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900">{goal.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        goal.status === 'bezig' ? 'bg-blue-50 text-blue-700' :
                        goal.status === 'gehaald' ? 'bg-green-50 text-green-700' :
                        'bg-slate-50 text-slate-700'
                      }`}>
                        {goal.status === 'bezig' ? 'Bezig' :
                         goal.status === 'gehaald' ? 'Gehaald' :
                         goal.status === 'niet_gestart' ? 'Niet gestart' : goal.status}
                      </span>
                    </div>
                    {goal.progress > 0 && (
                      <div className="mt-1">
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{goal.progress}% voltooid</p>
                      </div>
                    )}
                  </div>
                ))}
                {activeCarePlan.goals.length > 3 && (
                  <p className="text-xs text-slate-500 text-center">
                    +{activeCarePlan.goals.length - 3} meer doelen
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Interventies Overzicht */}
          {activeCarePlan.activities && Array.isArray(activeCarePlan.activities) && activeCarePlan.activities.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-600 mb-2">Interventies ({activeCarePlan.activities.length})</p>
              <div className="flex flex-wrap gap-2">
                {activeCarePlan.activities.slice(0, 5).map((intervention: Intervention) => (
                  <span
                    key={intervention.id}
                    className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                  >
                    {intervention.name}
                  </span>
                ))}
                {activeCarePlan.activities.length > 5 && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                    +{activeCarePlan.activities.length - 5} meer
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Aankomende Evaluatiemomenten */}
          {activeCarePlan.evaluatiemomenten && 
           Array.isArray(activeCarePlan.evaluatiemomenten) && 
           activeCarePlan.evaluatiemomenten.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Aankomende evaluatiemomenten</p>
              <div className="space-y-2">
                {activeCarePlan.evaluatiemomenten
                  .filter((evaluatie: Evaluatiemoment) => evaluatie.status === 'gepland')
                  .slice(0, 2)
                  .map((evaluatie: Evaluatiemoment) => (
                    <div key={evaluatie.id} className="p-2 bg-amber-50 rounded border border-amber-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-900">
                            {evaluatie.type === 'tussentijds' ? 'Tussentijdse evaluatie' :
                             evaluatie.type === 'eind' ? 'Eindevaluatie' : 'Crisis evaluatie'}
                          </p>
                          {evaluatie.plannedDate && (
                            <p className="text-xs text-amber-700 mt-0.5">
                              Week {evaluatie.weekNumber} • {format(new Date(evaluatie.plannedDate), 'd MMM yyyy', { locale: nl })}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                          Gepland
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
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
