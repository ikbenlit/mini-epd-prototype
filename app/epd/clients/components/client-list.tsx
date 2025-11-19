'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown, Eye, Edit2, Trash2, Users } from 'lucide-react';
import type { Client } from '@/lib/types/client';
import { transformClient } from '@/lib/types/client';
import { deleteClient } from '../actions';

interface ClientListProps {
  initialClients: Client[];
}

export function ClientList({ initialClients }: ClientListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Transform clients with computed fields
  const clients = initialClients.map(transformClient);

  // Client-side filtering (for instant feedback)
  const filteredClients = clients.filter((client) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(query) ||
      client.last_name.toLowerCase().includes(query) ||
      client.full_name.toLowerCase().includes(query)
    );
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Update URL with search param
    const params = new URLSearchParams();
    if (value) params.set('search', value);
    router.push(`/epd/clients?${params.toString()}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Weet u zeker dat u ${name} wilt verwijderen?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteClient(id);
      router.refresh();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Fout bij verwijderen van cliënt');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Zoek op naam..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {searchQuery ? 'Geen resultaten' : 'Geen cliënten'}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            {searchQuery
              ? 'Probeer een andere zoekopdracht'
              : 'Voeg uw eerste cliënt toe om te beginnen'}
          </p>
          {!searchQuery && (
            <Link
              href="/epd/clients/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
            >
              <span>Nieuwe cliënt toevoegen</span>
            </Link>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      {filteredClients.length > 0 && (
        <div className="hidden md:block bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Naam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Leeftijd
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Geboortedatum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Toegevoegd
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => router.push(`/epd/clients/${client.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {client.first_name[0]}
                            {client.last_name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">
                          {client.full_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {client.age} jaar
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(client.birth_date).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(client.created_at).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div
                      className="flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/epd/clients/${client.id}`}
                        className="text-teal-600 hover:text-teal-900 p-1 rounded hover:bg-teal-50 transition-colors"
                        title="Bekijken"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/epd/clients/${client.id}/edit`}
                        className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-50 transition-colors"
                        title="Bewerken"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(client.id, client.full_name)}
                        disabled={isDeleting === client.id}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Verwijderen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card View */}
      {filteredClients.length > 0 && (
        <div className="md:hidden space-y-3">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {client.first_name[0]}
                      {client.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {client.full_name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {client.age} jaar
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Geboortedatum:</span>
                  <span>{new Date(client.birth_date).toLocaleDateString('nl-NL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Toegevoegd:</span>
                  <span>{new Date(client.created_at).toLocaleDateString('nl-NL')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                <Link
                  href={`/epd/clients/${client.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 font-medium rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Bekijken</span>
                </Link>
                <Link
                  href={`/epd/clients/${client.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Bewerken</span>
                </Link>
                <button
                  onClick={() => handleDelete(client.id, client.full_name)}
                  disabled={isDeleting === client.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Verwijderen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
