import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getClient } from '../actions';
import { transformClient } from '@/lib/types/client';
import { ClientTabs } from './components/client-tabs';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: ClientDetailPageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  // Fetch client data
  let client;
  try {
    client = await getClient(id);
  } catch (error) {
    notFound();
  }

  if (!client) {
    notFound();
  }

  const clientWithAge = transformClient(client);

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <Link
            href="/epd/clients"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Terug naar cliënten</span>
          </Link>

          {/* Client Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-xl">
                  {client.first_name[0]}
                  {client.last_name[0]}
                </span>
              </div>

              {/* Name & Info */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {clientWithAge.full_name}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                  <span>{clientWithAge.age} jaar</span>
                  <span>•</span>
                  <span>
                    Geboren:{' '}
                    {new Date(client.birth_date).toLocaleDateString('nl-NL')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/epd/clients/${client.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Bewerken
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <ClientTabs clientId={client.id} activeTab={tab} />
      </div>
    </div>
  );
}
