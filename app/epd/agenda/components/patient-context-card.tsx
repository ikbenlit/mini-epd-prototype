'use client';

/**
 * Patient Context Card Component
 *
 * Displays medical context (conditions, risks, vitals) for a patient
 * in the appointment modal. Collapsible by default.
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Activity, Stethoscope, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import type { PatientDetail, Condition, RiskAssessment, VitalSign } from '@/lib/types/overdracht';

interface PatientContextCardProps {
  patientId: string;
}

// Risk type labels in Dutch
const RISK_TYPE_LABELS: Record<string, string> = {
  suiciderisico: 'Suicide',
  agressie: 'Agressie',
  terugval: 'Terugval',
  automutilatie: 'Automutilatie',
  verwaarlozing: 'Verwaarlozing',
  weglopen: 'Weglopen',
};

// Risk level colors
const RISK_LEVEL_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  zeer_hoog: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  hoog: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  gemiddeld: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  laag: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
};

export function PatientContextCard({ patientId }: PatientContextCardProps) {
  const [data, setData] = useState<PatientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/overdracht/${patientId}`);
        if (!response.ok) {
          throw new Error('Kon patient context niet laden');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Onbekende fout');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContext();
  }, [patientId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 animate-pulse">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Medische context laden...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return null; // Silently fail - don't block the modal
  }

  // No data or all arrays empty
  if (!data) {
    return null;
  }

  const hasConditions = data.conditions.length > 0;
  const hasRisks = data.risks.length > 0;
  const hasVitals = data.vitals.length > 0;

  // Nothing to show
  if (!hasConditions && !hasRisks && !hasVitals) {
    return null;
  }

  // Sort risks by level (highest first)
  const sortedRisks = [...data.risks].sort((a, b) => {
    const order = ['zeer_hoog', 'hoog', 'gemiddeld', 'laag'];
    return order.indexOf(a.risk_level) - order.indexOf(b.risk_level);
  });

  // Filter to significant risks only (gemiddeld and up)
  const significantRisks = sortedRisks.filter(
    (r) => r.risk_level === 'zeer_hoog' || r.risk_level === 'hoog' || r.risk_level === 'gemiddeld'
  );

  // Build summary for collapsed state
  const summaryParts: string[] = [];
  if (hasConditions) summaryParts.push(`${data.conditions.length} diagnose${data.conditions.length > 1 ? 's' : ''}`);
  if (significantRisks.length > 0) summaryParts.push(`${significantRisks.length} risico${significantRisks.length > 1 ? "'s" : ''}`);
  if (hasVitals) summaryParts.push(`${data.vitals.length} vital${data.vitals.length > 1 ? 's' : ''}`);

  return (
    <div className="mt-3 bg-slate-50 rounded-lg border border-slate-200">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
          <Stethoscope className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs font-medium text-slate-600">Medische context</span>
        </div>
        {!isExpanded && summaryParts.length > 0 && (
          <span className="text-xs text-slate-500">{summaryParts.join(' · ')}</span>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-200 pt-3">
          {/* Risks - Always show first if present (most important) */}
          {significantRisks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Risico&apos;s
              </div>
              <div className="flex flex-wrap gap-1.5">
                {significantRisks.map((risk) => (
                  <RiskBadge key={risk.id} risk={risk} />
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {hasConditions && (
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1.5">Diagnoses</div>
              <div className="space-y-1">
                {data.conditions.slice(0, 3).map((condition) => (
                  <ConditionItem key={condition.id} condition={condition} />
                ))}
                {data.conditions.length > 3 && (
                  <div className="text-xs text-slate-500">
                    + {data.conditions.length - 3} meer
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vitals (today only) */}
          {hasVitals && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                <Activity className="h-3.5 w-3.5 text-teal-600" />
                Vitals vandaag
              </div>
              <div className="flex flex-wrap gap-2">
                {data.vitals.slice(0, 4).map((vital) => (
                  <VitalItem key={vital.id} vital={vital} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RiskBadge({ risk }: { risk: RiskAssessment }) {
  const styles = RISK_LEVEL_STYLES[risk.risk_level] || RISK_LEVEL_STYLES.laag;
  const label = RISK_TYPE_LABELS[risk.risk_type] || risk.risk_type;
  const levelLabel = risk.risk_level === 'zeer_hoog' ? 'Zeer hoog' :
                     risk.risk_level.charAt(0).toUpperCase() + risk.risk_level.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {label}: {levelLabel}
    </span>
  );
}

function ConditionItem({ condition }: { condition: Condition }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-700">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span className="line-clamp-1">{condition.code_display}</span>
    </div>
  );
}

function VitalItem({ vital }: { vital: VitalSign }) {
  const isAbnormal = vital.interpretation_code === 'H' || vital.interpretation_code === 'L';

  return (
    <div
      className={`text-xs px-2 py-1 rounded ${
        isAbnormal ? 'bg-amber-100 text-amber-800' : 'bg-white text-slate-600 border border-slate-200'
      }`}
    >
      <span className="font-medium">{vital.code_display}:</span>{' '}
      {vital.value_quantity_value}
      {vital.value_quantity_unit && ` ${vital.value_quantity_unit}`}
    </div>
  );
}
