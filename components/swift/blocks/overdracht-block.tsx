'use client';

/**
 * Overdracht Block
 *
 * Block voor het genereren van overdracht samenvattingen per patiënt.
 * E3.S6: Volledige implementatie met AI samenvatting per patiënt.
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSwiftStore } from '@/stores/swift-store';
import { BlockContainer } from './block-container';
import type { BlockPrefillData } from '@/stores/swift-store';
import { BLOCK_CONFIGS } from '@/lib/swift/types';
import type { PatientOverzicht, AISamenvatting } from '@/lib/types/overdracht';
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Calendar,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OverdrachtBlockProps {
  prefill?: BlockPrefillData;
}

type PeriodValue = '1d' | '3d' | '7d' | '14d';

const PERIOD_OPTIONS: { value: PeriodValue; label: string; description: string }[] = [
  { value: '1d', label: 'Vandaag', description: 'Laatste 24 uur' },
  { value: '3d', label: '3 dagen', description: 'Afgelopen 3 dagen' },
  { value: '7d', label: '1 week', description: 'Afgelopen 7 dagen' },
  { value: '14d', label: '2 weken', description: 'Afgelopen 14 dagen' },
];

interface PatientSummary {
  patient: PatientOverzicht;
  summary: AISamenvatting | null;
  loading: boolean;
  error: string | null;
}

export function OverdrachtBlock({ prefill }: OverdrachtBlockProps) {
  const config = BLOCK_CONFIGS.overdracht;
  const { activePatient } = useSwiftStore();
  const { toast } = useToast();

  const [period, setPeriod] = useState<PeriodValue>('1d');
  const [patients, setPatients] = useState<PatientOverzicht[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [patientSummaries, setPatientSummaries] = useState<Map<string, PatientSummary>>(new Map());

  // Load patients list
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
        const response = await fetch('/api/overdracht/patients');
        if (!response.ok) {
          throw new Error('Kon patiëntenlijst niet laden');
        }
        const data = await response.json();
        setPatients(data.patients || []);

        // Initialize summaries map
        const summaries = new Map<string, PatientSummary>();
        (data.patients || []).forEach((patient: PatientOverzicht) => {
          summaries.set(patient.id, {
            patient,
            summary: null,
            loading: false,
            error: null,
          });
        });
        setPatientSummaries(summaries);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
        toast({
          variant: 'destructive',
          title: 'Laden mislukt',
          description: error instanceof Error ? error.message : 'Kon patiëntenlijst niet laden',
        });
      } finally {
        setIsLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [toast]);

  // Auto-generate summary for activePatient if set (only once when block opens)
  useEffect(() => {
    if (activePatient && patients.length > 0 && patientSummaries.size > 0) {
      const summaryData = patientSummaries.get(activePatient.id);
      // Only auto-generate if no summary exists and not already loading
      if (summaryData && !summaryData.summary && !summaryData.loading) {
        generateSummary(activePatient.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePatient?.id, patients.length, patientSummaries.size]);

  // Generate summary for a patient
  const generateSummary = useCallback(async (patientId: string) => {
    setPatientSummaries((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(patientId);
      if (existing) {
        updated.set(patientId, {
          ...existing,
          loading: true,
          error: null,
        });
      }
      return updated;
    });

    try {
      const response = await fetch('/api/overdracht/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, period }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Genereren mislukt' }));
        throw new Error(errorData.error || 'Genereren mislukt');
      }

      const summary: AISamenvatting = await response.json();

      setPatientSummaries((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(patientId);
        if (existing) {
          updated.set(patientId, {
            ...existing,
            summary,
            loading: false,
            error: null,
          });
        }
        return updated;
      });
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setPatientSummaries((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(patientId);
        if (existing) {
          updated.set(patientId, {
            ...existing,
            loading: false,
            error: error instanceof Error ? error.message : 'Onbekende fout',
          });
        }
        return updated;
      });
    }
  }, [period]);

  // Filter patients: if activePatient is set, only show that one
  const displayPatients = activePatient
    ? patients.filter((p) => p.id === activePatient.id)
    : patients;

  const formatPatientName = (patient: PatientOverzicht): string => {
    return `${patient.name_given?.join(' ') || ''} ${patient.name_family || ''}`.trim();
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (datetime: string): string => {
    return format(new Date(datetime), 'HH:mm', { locale: nl });
  };

  return (
    <BlockContainer title={config.title} size={config.size}>
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Periode</label>
          <div className="grid grid-cols-4 gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  period === option.value
                    ? 'bg-slate-700 text-white border-2 border-slate-500'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {PERIOD_OPTIONS.find((o) => o.value === period)?.description}
          </p>
        </div>

        {/* Patients List */}
        {isLoadingPatients ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
            <span className="text-sm text-slate-400">Patiënten laden...</span>
          </div>
        ) : displayPatients.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Geen patiënten gevonden voor deze periode</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayPatients.map((patient) => {
              const summaryData = patientSummaries.get(patient.id);
              const summary = summaryData?.summary;
              const loading = summaryData?.loading || false;
              const error = summaryData?.error;

              return (
                <div
                  key={patient.id}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  {/* Patient Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-medium text-white">
                        {formatPatientName(patient)}
                      </h3>
                      {patient.alerts.total > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">
                            {patient.alerts.total} alert{patient.alerts.total > 1 ? 's' : ''}
                          </span>
                          {patient.alerts.high_risk_count > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/30 text-red-300">
                              {patient.alerts.high_risk_count} risico
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {!summary && !loading && (
                      <Button
                        size="sm"
                        onClick={() => generateSummary(patient.id)}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        <Sparkles className="h-4 w-4 mr-1.5" />
                        Genereer
                      </Button>
                    )}
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="py-6 text-center">
                      <Loader2 className="h-6 w-6 text-violet-400 mx-auto mb-2 animate-spin" />
                      <p className="text-sm text-slate-400">Samenvatting wordt gegenereerd...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="py-4">
                      <div className="p-3 bg-red-900/20 rounded-lg border border-red-800 mb-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-300">{error}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateSummary(patient.id)}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-1.5" />
                        Opnieuw proberen
                      </Button>
                    </div>
                  )}

                  {/* Summary Content */}
                  {summary && (
                    <div className="space-y-4 pt-4 border-t border-slate-700">
                      {/* Samenvatting */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Samenvatting</h4>
                        <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-lg">
                          {summary.samenvatting}
                        </p>
                      </div>

                      {/* Aandachtspunten */}
                      {summary.aandachtspunten.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-300 mb-2">
                            Aandachtspunten ({summary.aandachtspunten.length})
                          </h4>
                          <div className="space-y-2">
                            {summary.aandachtspunten.map((punt, index) => (
                              <AandachtspuntItem key={index} punt={punt} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actiepunten */}
                      {summary.actiepunten.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-300 mb-2">
                            Actiepunten ({summary.actiepunten.length})
                          </h4>
                          <ul className="space-y-2">
                            {summary.actiepunten.map((actie, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-slate-400"
                              >
                                <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                                <span>{actie}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {formatTime(summary.generatedAt)} ({formatDuration(summary.durationMs)})
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => generateSummary(patient.id)}
                          disabled={loading}
                          className="text-xs h-7"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          Vernieuwen
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BlockContainer>
  );
}

function AandachtspuntItem({ punt }: { punt: AISamenvatting['aandachtspunten'][0] }) {
  const getBronTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      observatie: 'Vitale functie',
      rapportage: 'Rapportage',
      verpleegkundig: 'Verpleegkundig',
      risico: 'Risicobeoordeling',
    };
    return labels[type] || type;
  };

  const getBronTypeStyle = (type: string): { bg: string; text: string } => {
    switch (type) {
      case 'observatie':
        return { bg: 'bg-teal-900/30', text: 'text-teal-300' };
      case 'rapportage':
        return { bg: 'bg-indigo-900/30', text: 'text-indigo-300' };
      case 'verpleegkundig':
        return { bg: 'bg-amber-900/30', text: 'text-amber-300' };
      case 'risico':
        return { bg: 'bg-red-900/30', text: 'text-red-300' };
      default:
        return { bg: 'bg-slate-800', text: 'text-slate-400' };
    }
  };

  const bronStyle = getBronTypeStyle(punt.bron.type);

  return (
    <div
      className={cn(
        'p-3 rounded-lg border-l-4',
        punt.urgent
          ? 'bg-red-900/20 border-red-500'
          : 'bg-slate-800/50 border-slate-600'
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        {punt.urgent && <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />}
        <p
          className={cn(
            'text-sm flex-1',
            punt.urgent ? 'text-red-200 font-medium' : 'text-slate-300'
          )}
        >
          {punt.tekst}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs',
            bronStyle.bg,
            bronStyle.text
          )}
        >
          {getBronTypeLabel(punt.bron.type)}
        </span>
        <span className="text-xs text-slate-500">
          {punt.bron.label} • {punt.bron.datum}
        </span>
      </div>
    </div>
  );
}
