import { getPatient } from '../actions';
import { PatientForm } from '../components/patient-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);

  const name = patient.name?.[0];
  const fullName = [
    ...(name?.prefix || []),
    ...(name?.given || []),
    name?.family,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with back button */}
      <div className="mb-8">
        <Link
          href="/epd/patients"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Terug naar patiënten</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Patiënt bewerken</h1>
        <p className="text-sm text-slate-600 mt-1">
          {fullName} - ID: {patient.id}
        </p>
      </div>

      {/* Patient Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <PatientForm patient={patient} />
      </div>
    </div>
  );
}
