/**
 * Rapportage Per Patiënt Page
 * Route /epd/verpleegrapportage/rapportage/[patientId]
 * Met periode selector voor terugkijken naar eerdere dagen
 */

import { createClient } from '@/lib/auth/server';
import { notFound } from 'next/navigation';
import { LogList } from './components/log-list';
import { PeriodSelector } from './components/period-selector';
import { getPeriodDateRange, type PeriodValue } from '../lib/period-utils';
import { ArrowLeft, PenLine, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import type { Report } from '@/lib/types/overdracht';

interface PageProps {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ periode?: string }>;
}

async function getPatientWithLogs(patientId: string, period: PeriodValue) {
  const supabase = await createClient();
  const { startDate, endDate } = getPeriodDateRange(period);

  const [patientResult, logsResult] = await Promise.all([
    supabase
      .from('patients')
      .select('id, name_given, name_family, name_prefix, birth_date, gender')
      .eq('id', patientId)
      .single(),
    // Nu reports met type='verpleegkundig' i.p.v. nursing_logs
    supabase
      .from('reports')
      .select('id, type, content, created_at, created_by, structured_data, include_in_handover, shift_date')
      .eq('patient_id', patientId)
      .eq('type', 'verpleegkundig')
      .gte('shift_date', startDate)
      .lte('shift_date', endDate)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
  ]);

  if (patientResult.error || !patientResult.data) {
    return null;
  }

  return {
    patient: patientResult.data,
    logs: (logsResult.data || []) as Report[],
    startDate,
    endDate,
    period,
  };
}

function formatPatientName(
  nameGiven: string[],
  nameFamily: string,
  namePrefix?: string | null
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

export default async function RapportagePatientPage({ params, searchParams }: PageProps) {
  const { patientId } = await params;
  const { periode } = await searchParams;

  // Validate period parameter
  const validPeriods: PeriodValue[] = ['today', 'yesterday', '3days', '7days'];
  const period: PeriodValue = validPeriods.includes(periode as PeriodValue)
    ? (periode as PeriodValue)
    : 'today';

  const data = await getPatientWithLogs(patientId, period);

  if (!data) {
    notFound();
  }

  const { patient, logs, startDate, endDate } = data;
  const patientName = formatPatientName(
    patient.name_given,
    patient.name_family,
    patient.name_prefix
  );
  const age = calculateAge(patient.birth_date);

  // Format date range for display
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  const displayDate = startDate === endDate
    ? new Date(startDate).toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : `${formatDate(startDate)} - ${formatDate(endDate)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/epd/patients/${patientId}`}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar patiënt
            </Link>
            <Link
              href={`/epd/verpleegrapportage?patient=${patientId}`}
              className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              Naar overdracht
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <PenLine className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Rapportage
                </h1>
                <p className="text-sm text-slate-600">
                  {patientName} ({age} jaar) • {displayDate}
                </p>
              </div>
            </div>
            <PeriodSelector patientId={patientId} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <LogList
          patientId={patientId}
          initialLogs={logs}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
}
