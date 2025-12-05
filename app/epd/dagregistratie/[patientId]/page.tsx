/**
 * Dagregistratie Page
 * E3.S1: Route /epd/dagregistratie/[patientId], lijst van notities vandaag
 */

import { createClient } from '@/lib/auth/server';
import { notFound } from 'next/navigation';
import { LogList } from './components/log-list';
import { ArrowLeft, ClipboardList, FileText } from 'lucide-react';
import Link from 'next/link';
import type { NursingLog } from '@/lib/types/nursing-log';

interface PageProps {
  params: Promise<{ patientId: string }>;
}

async function getPatientWithLogs(patientId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const [patientResult, logsResult] = await Promise.all([
    supabase
      .from('patients')
      .select('id, name_given, name_family, name_prefix, birth_date, gender')
      .eq('id', patientId)
      .single(),
    supabase
      .from('nursing_logs')
      .select('*')
      .eq('patient_id', patientId)
      .eq('shift_date', today)
      .order('timestamp', { ascending: false }),
  ]);

  if (patientResult.error || !patientResult.data) {
    return null;
  }

  return {
    patient: patientResult.data,
    logs: (logsResult.data || []) as NursingLog[],
    date: today,
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

export default async function DagregistratiePage({ params }: PageProps) {
  const { patientId } = await params;
  const data = await getPatientWithLogs(patientId);

  if (!data) {
    notFound();
  }

  const { patient, logs, date } = data;
  const patientName = formatPatientName(
    patient.name_given,
    patient.name_family,
    patient.name_prefix
  );
  const age = calculateAge(patient.birth_date);

  // Format date for display
  const displayDate = new Date(date).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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
              href={`/epd/overdracht/${patientId}`}
              className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              <FileText className="h-4 w-4" />
              Naar overdracht
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Dagregistratie
              </h1>
              <p className="text-sm text-slate-600">
                {patientName} ({age} jaar) • {displayDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <LogList
          patientId={patientId}
          initialLogs={logs}
          date={date}
        />
      </div>
    </div>
  );
}
