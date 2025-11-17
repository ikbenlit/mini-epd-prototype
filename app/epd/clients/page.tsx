import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { getClients } from './actions';
import { ClientList } from './components/client-list';
import { ClientListSkeleton } from './components/client-list-skeleton';
import Link from 'next/link';

interface SearchParams {
  search?: string;
  sortBy?: 'name' | 'age' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export default async function ClientsPage({
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
            <h1 className="text-2xl font-bold text-slate-900">Cliënten</h1>
            <p className="text-sm text-slate-600 mt-1">
              Beheer uw cliëntenbestand
            </p>
          </div>
          <Link
            href="/epd/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nieuwe cliënt</span>
          </Link>
        </div>
      </div>

      {/* Client List with Suspense */}
      <Suspense fallback={<ClientListSkeleton />}>
        <ClientListWrapper searchParams={params} />
      </Suspense>
    </div>
  );
}

async function ClientListWrapper({ searchParams }: { searchParams: SearchParams }) {
  const clients = await getClients({
    search: searchParams.search,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
  });

  return <ClientList initialClients={clients} />;
}
