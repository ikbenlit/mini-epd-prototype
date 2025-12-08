'use client';

/**
 * PatientDetail Component - Geoptimaliseerde UX
 *
 * Layout verbeteringen:
 * 1. Compacte patient header
 * 2. Risico alerts direct bovenaan (prominent)
 * 3. Geen Vitale functies blok (niet geïmplementeerd)
 * 4. Rapportages timeline als hoofdcontent
 * 5. AI samenvatting in sidebar
 */

import { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { PatientDetail as PatientDetailType } from '@/lib/types/overdracht';
import type { PeriodValue } from '../lib/period-utils';
import { ReportsBlock } from './blocks/reports-block';
import { AISummaryBlock } from './blocks/ai-summary-block';

interface PatientDetailProps {
  patientId: string;
  period: PeriodValue;
}

function formatPatientName(
  nameGiven: string[],
  nameFamily: string,
  namePrefix?: string
): string {
  const given = nameGiven.join(' ');
  if (namePrefix) {
    return `${given} ${namePrefix} ${nameFamily}`;
  }
  return `${given} ${nameFamily}`;
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getGenderLabel(gender: string): string {
  switch (gender) {
    case 'male': return 'Man';
    case 'female': return 'Vrouw';
    default: return 'Onbekend';
  }
}

function getRiskLevelLabel(level: string): string {
  switch (level) {
    case 'zeer_hoog': return 'Zeer hoog';
    case 'hoog': return 'Hoog';
    case 'matig': return 'Matig';
    case 'laag': return 'Laag';
    default: return level;
  }
}

export function PatientDetail({ patientId, period }: PatientDetailProps) {
  const [data, setData] = useState<PatientDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/verpleegrapportage/${patientId}?periode=${period}`);

      if (!response.ok) {
        throw new Error('Kon patiëntgegevens niet ophalen');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  }, [patientId, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-teal-600 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-600">Gegevens laden...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600 mb-2">{error || 'Geen gegevens gevonden'}</p>
          <button
            onClick={fetchData}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  const { patient, reports, risks } = data;
  const patientName = formatPatientName(
    patient.name_given,
    patient.name_family,
    patient.name_prefix
  );
  const age = calculateAge(patient.birth_date);
  const genderLabel = getGenderLabel(patient.gender);

  // Filter voor belangrijke alerts
  const markedReports = reports.filter(r => r.include_in_handover);
  const highRisks = risks.filter(r => r.risk_level === 'hoog' || r.risk_level === 'zeer_hoog');
  const incidents = reports.filter(r => r.type === 'incident' || r.type === 'crisis');

  return (
    <div className="h-full overflow-y-auto">
      {/* Compact Patient Header - zonder avatar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{patientName}</h1>
            <p className="text-sm text-slate-500">{age} jaar • {genderLabel}</p>
          </div>

          {/* Quick badges + actions */}
          <div className="flex items-center gap-2">
            {highRisks.length > 0 && (
              <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {highRisks.length} hoog risico
              </span>
            )}
            {markedReports.length > 0 && (
              <span className="px-2.5 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                {markedReports.length} overdracht
              </span>
            )}
            <Link
              href={`/epd/patients/${patientId}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Dossier
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Risico's Alert Block - Bovenaan en prominent */}
            {highRisks.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-red-900 mb-2">
                      Hoge risico&apos;s ({highRisks.length})
                    </h2>
                    <div className="space-y-2">
                      {highRisks.map((risk) => (
                        <div
                          key={risk.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            risk.risk_level === 'zeer_hoog'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {getRiskLevelLabel(risk.risk_level)}
                          </span>
                          <div>
                            <span className="font-medium text-red-900">{risk.risk_type}</span>
                            {risk.rationale && (
                              <p className="text-red-700 mt-0.5">{risk.rationale}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Incidenten waarschuwing */}
            {incidents.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <span className="text-sm text-orange-800">
                  <span className="font-medium">{incidents.length} incident{incidents.length > 1 ? 'en' : ''}</span> in deze periode
                </span>
              </div>
            )}

            {/* Rapportages Timeline */}
            <ReportsBlock reports={reports} />
          </div>

          {/* Right column - AI Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <AISummaryBlock patientId={patientId} period={period} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
