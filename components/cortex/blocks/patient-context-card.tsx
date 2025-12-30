'use client';

/**
 * Patient Context Card
 *
 * Toont patiënt context na selectie: notities, vitals, diagnoses.
 * E3.S5: Volledige implementatie met auto-open na patient selectie.
 */

import { useEffect, useState } from 'react';
import { useCortexStore } from '@/stores/cortex-store';
import { BlockContainer } from './block-container';
import { BLOCK_CONFIGS } from '@/lib/cortex/types';
import type { PatientDetail, Report, VitalSign, Condition, RiskAssessment } from '@/lib/types/overdracht';
import { Loader2, FileText, Activity, Stethoscope, AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';
import { cn } from '@/lib/utils';

export function PatientContextCard() {
  const { activePatient, closeBlock } = useCortexStore();
  const [data, setData] = useState<PatientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activePatient?.id) {
      return;
    }

    const fetchContext = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/overdracht/${activePatient.id}`);
        if (!response.ok) {
          throw new Error('Kon patiënt context niet laden');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch patient context:', err);
        setError(err instanceof Error ? err.message : 'Onbekende fout');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContext();
  }, [activePatient?.id]);

  if (!activePatient) {
    return null;
  }

  const patientName = `${activePatient.name_given?.join(' ') || ''} ${activePatient.name_family || ''}`.trim();

  return (
    <BlockContainer title={`Patiënt: ${patientName}`} size="lg">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
          <span className="text-sm text-slate-500">Context laden...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Notities (Reports) */}
          {data.reports && data.reports.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-700">Recente notities</h3>
                <span className="text-xs text-slate-500">({data.reports.length})</span>
              </div>
              <div className="space-y-2">
                {data.reports.slice(0, 5).map((report) => (
                  <ReportItem key={report.id} report={report} />
                ))}
                {data.reports.length > 5 && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    + {data.reports.length - 5} meer notities
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Vitals */}
          {data.vitals && data.vitals.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-700">Vitale functies (vandaag)</h3>
                <span className="text-xs text-slate-500">({data.vitals.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data.vitals.slice(0, 6).map((vital) => (
                  <VitalItem key={vital.id} vital={vital} />
                ))}
              </div>
            </section>
          )}

          {/* Diagnoses */}
          {data.conditions && data.conditions.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-700">Actieve diagnoses</h3>
                <span className="text-xs text-slate-500">({data.conditions.length})</span>
              </div>
              <div className="space-y-2">
                {data.conditions.map((condition) => (
                  <ConditionItem key={condition.id} condition={condition} />
                ))}
              </div>
            </section>
          )}

          {/* Risico's */}
          {data.risks && data.risks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-medium text-slate-700">Risico&apos;s</h3>
                <span className="text-xs text-slate-500">({data.risks.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.risks.map((risk) => (
                  <RiskBadge key={risk.id} risk={risk} />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {(!data.reports || data.reports.length === 0) &&
            (!data.vitals || data.vitals.length === 0) &&
            (!data.conditions || data.conditions.length === 0) &&
            (!data.risks || data.risks.length === 0) && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">Geen context beschikbaar voor deze patiënt</p>
              </div>
            )}
        </div>
      ) : null}
    </BlockContainer>
  );
}

function ReportItem({ report }: { report: Report }) {
  const date = report.created_at ? new Date(report.created_at) : null;
  const formattedDate = date ? format(date, 'd MMM HH:mm', { locale: nl }) : 'Onbekend';

  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-500 uppercase">{report.type}</span>
          {report.include_in_handover && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Overdracht
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />
          {formattedDate}
        </div>
      </div>
      <p className="text-sm text-slate-700 line-clamp-2">{report.content}</p>
    </div>
  );
}

function VitalItem({ vital }: { vital: VitalSign }) {
  const isAbnormal = vital.interpretation_code === 'H' || vital.interpretation_code === 'L';
  const date = vital.effective_datetime ? new Date(vital.effective_datetime) : null;
  const formattedTime = date ? format(date, 'HH:mm', { locale: nl }) : '';

  return (
    <div
      className={cn(
        'p-2 rounded-lg border',
        isAbnormal
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      )}
    >
      <div className="text-xs font-medium mb-0.5">{vital.code_display}</div>
      <div className="text-sm font-semibold">
        {vital.value_quantity_value}
        {vital.value_quantity_unit && <span className="text-xs ml-1">{vital.value_quantity_unit}</span>}
      </div>
      {formattedTime && <div className="text-xs text-slate-500 mt-0.5">{formattedTime}</div>}
    </div>
  );
}

function ConditionItem({ condition }: { condition: Condition }) {
  const date = condition.onset_datetime ? new Date(condition.onset_datetime) : null;
  const formattedDate = date ? format(date, 'd MMM yyyy', { locale: nl }) : null;

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">{condition.code_display}</p>
        {formattedDate && (
          <p className="text-xs text-slate-500">Sinds {formattedDate}</p>
        )}
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: RiskAssessment }) {
  const RISK_TYPE_LABELS: Record<string, string> = {
    suiciderisico: 'Suicide',
    agressie: 'Agressie',
    terugval: 'Terugval',
    automutilatie: 'Automutilatie',
    verwaarlozing: 'Verwaarlozing',
    weglopen: 'Weglopen',
  };

  const RISK_LEVEL_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    zeer_hoog: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
    hoog: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', border: 'border-red-200' },
    gemiddeld: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    laag: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
  };

  const styles = RISK_LEVEL_STYLES[risk.risk_level] || RISK_LEVEL_STYLES.laag;
  const label = RISK_TYPE_LABELS[risk.risk_type] || risk.risk_type;
  const levelLabel =
    risk.risk_level === 'zeer_hoog'
      ? 'Zeer hoog'
      : risk.risk_level.charAt(0).toUpperCase() + risk.risk_level.slice(1);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border',
        styles.bg,
        styles.text,
        styles.border
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', styles.dot)} />
      {label}: {levelLabel}
    </span>
  );
}

