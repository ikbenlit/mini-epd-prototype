import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { getPatients } from './actions';
import { PatientList } from './components/patient-list';
import Link from 'next/link';

interface SearchParams {
  search?: string;
  status?: string;
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patiënten</h1>
            <p className="text-sm text-slate-600 mt-1">
              Overzicht van alle patiënten met screening en intake status
            </p>
          </div>
          <Link
            href="/epd/patients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nieuwe patiënt</span>
          </Link>
        </div>
      </div>

      {/* Patient List */}
      <Suspense fallback={<div>Loading patients...</div>}>
        <PatientListWrapper searchParams={params} />
      </Suspense>
    </div>
  );
}

async function PatientListWrapper({ searchParams }: { searchParams: SearchParams }) {
  const patients = await getPatients({
    search: searchParams.search,
    status: searchParams.status,
  });

  return <PatientList initialPatients={patients} />;
}
