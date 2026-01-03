'use client';

/**
 * Patient Dashboard Block
 *
 * Swift artifact that shows patient properties and dashboard summary.
 */

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  AlertCircle,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  User,
} from 'lucide-react';
import { BlockContainer } from './block-container';
import { safeFetch, getErrorInfo } from '@/lib/cortex/error-handler';
import { useToast } from '@/hooks/use-toast';
import { BLOCK_CONFIGS } from '@/lib/cortex/types';
import type { BlockPrefillData } from '@/stores/cortex-store';
import { useCortexStore } from '@/stores/cortex-store';
import type { FHIRPatient } from '@/lib/fhir';
import type { Intake } from '@/lib/types/intake';
import { cn } from '@/lib/utils';
import { formatPatientName } from '@/lib/fhir/patient-mapper';

interface PatientDashboardBlockProps {
  prefill?: BlockPrefillData;
}

interface EncounterSummary {
  id: string;
  period_start: string;
  period_end?: string | null;
  type_display?: string | null;
  status: string;
}

interface CarePlanSummary {
  id?: string;
  title?: string | null;
  status?: string | null;
  based_on_intake_id?: string | null;
  behandelstructuur?: unknown;
  goals?: unknown;
  activities?: unknown;
  evaluatiemomenten?: unknown;
}

interface PatientDashboardResponse {
  patient: FHIRPatient;
  intakes: Intake[];
  encounters: EncounterSummary[];
  carePlan: CarePlanSummary | null;
  hulpvraag?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  planned: 'Screening',
  active: 'Actief',
  finished: 'Afgerond',
  cancelled: 'Afgemeld',
};

const GENDER_LABELS: Record<string, string> = {
  male: 'Man',
  female: 'Vrouw',
  other: 'Anders',
  unknown: 'Onbekend',
};

function extractEpisodeStatus(patient?: FHIRPatient): string | null {
  if (!patient) return null;
  const statusExtension = (patient as any)?.extension?.find(
    (ext: any) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/episode-status'
  );
  return statusExtension?.valueCode || null;
}

function getPatientName(patient?: FHIRPatient): string {
  const name = patient?.name?.[0];
  if (!name) return 'Onbekende patiënt';
  return [
    ...(name.prefix || []),
    ...(name.given || []),
    name.family,
  ]
    .filter(Boolean)
    .join(' ');
}

function getPatientBsn(patient?: FHIRPatient): string | null {
  if (!patient?.identifier) return null;
  return (
    patient.identifier.find(
      (id) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
    )?.value || null
  );
}

export function PatientDashboardBlock({ prefill }: PatientDashboardBlockProps) {
  const config = BLOCK_CONFIGS['patient-dashboard'];
  const { activePatient } = useCortexStore();
  const { toast } = useToast();

  // E3.S2: Use activePatient as fallback for patientId
  const patientId = prefill?.patientId || activePatient?.id;
  const patientNameFromPrefill = prefill?.patientName || (activePatient ? formatPatientName(activePatient) : undefined);

  const [data, setData] = useState<PatientDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(patientId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setError('Geen patiënt geselecteerd');
      setIsLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await safeFetch(
          `/api/patients/${patientId}/dashboard`,
          undefined,
          { operation: 'Patiëntdashboard laden' }
        );
        const result = (await response.json()) as PatientDashboardResponse;
        setData(result);
      } catch (err) {
        const statusCode = (err as any)?.statusCode;
        const errorInfo = getErrorInfo(err, {
          operation: 'Patiëntdashboard laden',
          statusCode,
        });
        setError(errorInfo.description);
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.description,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [patientId, toast]);

  const patient = data?.patient;
  const patientName = useMemo(() => getPatientName(patient), [patient]);
  const patientStatus = extractEpisodeStatus(patient);
  const patientStatusLabel = patientStatus ? STATUS_LABELS[patientStatus] || patientStatus : null;
  const patientBirthDate = patient?.birthDate
    ? format(new Date(patient.birthDate), 'd MMM yyyy', { locale: nl })
    : 'Onbekend';
  const patientGender = patient?.gender ? GENDER_LABELS[patient.gender] || patient.gender : 'Onbekend';
  const patientBsn = getPatientBsn(patient) || 'Onbekend';

  const recentIntakes = data?.intakes?.slice(0, 3) || [];
  const encounters = data?.encounters || [];

  const encounterGroups = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const upcoming = encounters.filter((e) => new Date(e.period_start) >= todayStart);
    const recent = encounters.filter((e) => new Date(e.period_start) < todayStart);

    const displayEncounters = [...upcoming, ...recent].slice(0, 5);
    return displayEncounters;
  }, [encounters]);

  const goalsCount = Array.isArray(data?.carePlan?.goals) ? data?.carePlan?.goals.length : 0;
  const interventionsCount = Array.isArray(data?.carePlan?.activities)
    ? data?.carePlan?.activities.length
    : 0;

  // E3.S2: Use patientNameFromPrefill for title
  const title = patientNameFromPrefill
    ? `${config.title} - ${patientNameFromPrefill}`
    : config.title;

  return (
    <BlockContainer title={title} size={config.size}>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
          <span className="text-sm text-slate-500">Dashboard laden...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Basisgegevens */}
          <section className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-slate-700">Basisgegevens</h3>
              {patientStatusLabel && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {patientStatusLabel}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Naam</p>
                <p className="text-slate-900 font-medium">{patientName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Geboortedatum</p>
                <p className="text-slate-900">{patientBirthDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">BSN</p>
                <p className="text-slate-900">{patientBsn}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Geslacht</p>
                <p className="text-slate-900">{patientGender}</p>
              </div>
            </div>
          </section>

          {/* Recente intakes */}
          <section className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-teal-600" />
              <h3 className="text-sm font-medium text-slate-700">Recente intakes</h3>
              <span className="text-xs text-slate-500">({data.intakes.length})</span>
            </div>
            {recentIntakes.length === 0 ? (
              <p className="text-sm text-slate-500">Geen intakes gevonden</p>
            ) : (
              <div className="space-y-2">
                {recentIntakes.map((intake) => (
                  <div
                    key={intake.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{intake.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{intake.department}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(intake.start_date), 'd MMM yyyy', { locale: nl })}
                        </span>
                      </div>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      intake.status === 'Open'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-green-50 text-green-700'
                    )}>
                      {intake.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Agenda afspraken */}
          <section className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-medium text-slate-700">Agenda afspraken</h3>
              <span className="text-xs text-slate-500">({encounters.length})</span>
            </div>
            {encounterGroups.length === 0 ? (
              <p className="text-sm text-slate-500">Geen afspraken gevonden</p>
            ) : (
              <div className="space-y-2">
                {encounterGroups.map((encounter) => {
                  const encounterDate = new Date(encounter.period_start);
                  const isPast = encounterDate < new Date();

                  return (
                    <div
                      key={encounter.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
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
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        encounter.status === 'planned' || encounter.status === 'arrived'
                          ? 'bg-blue-50 text-blue-700'
                          : encounter.status === 'finished'
                          ? 'bg-green-50 text-green-700'
                          : isPast
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-slate-50 text-slate-700'
                      )}>
                        {encounter.status === 'planned'
                          ? 'Gepland'
                          : encounter.status === 'arrived'
                          ? 'Aangekomen'
                          : encounter.status === 'finished'
                          ? 'Afgerond'
                          : encounter.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Behandelplan */}
          <section className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-medium text-slate-700">Actief behandelplan</h3>
            </div>
            {data.carePlan ? (
              <div className="space-y-3">
                {data.hulpvraag && (
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                    <p className="text-xs font-medium text-slate-500 mb-1">Hulpvraag</p>
                    <p className="italic">&ldquo;{data.hulpvraag}&rdquo;</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-xs text-teal-700 mb-1">Doelen</p>
                    <p className="text-base font-semibold text-teal-900">{goalsCount}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-purple-700 mb-1">Interventies</p>
                    <p className="text-base font-semibold text-purple-900">{interventionsCount}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Geen actief behandelplan</p>
            )}
          </section>
        </div>
      ) : (
        <div className="text-sm text-slate-500">Geen gegevens beschikbaar</div>
      )}
    </BlockContainer>
  );
}
