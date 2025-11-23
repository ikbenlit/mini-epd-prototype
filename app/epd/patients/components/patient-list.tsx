'use client';

/**
 * Patient List Component
 * E3.S2: Patiëntenlijst met zoekfunctie, filters, paginatie en sortering
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { FHIRPatient } from '@/lib/fhir';

interface PatientListProps {
  patients: FHIRPatient[];
  total: number;
  page: number;
  pageSize: number;
}

// Status badge component
function StatusBadge({ status }: { status?: string }) {
  const badges = {
    planned: { label: 'Screening', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    active: { label: 'Actief', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    finished: { label: 'Afgerond', className: 'bg-slate-100 text-slate-800 border-slate-200' },
    cancelled: { label: 'Afgemeld', className: 'bg-red-100 text-red-800 border-red-200' },
  };

  const badge = status && status in badges ? badges[status as keyof typeof badges] : null;

  if (!badge) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

export function PatientList({ patients, total, page, pageSize }: PatientListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [genderFilter, setGenderFilter] = useState(searchParams.get('gender') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc');

  // Calculate pagination info
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  // Build URL params helper
  const buildUrlParams = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const allParams = {
      search: searchTerm,
      status: statusFilter,
      gender: genderFilter,
      sortBy: sortBy,
      sortOrder: sortOrder,
      page: page.toString(),
      ...updates,
    };

    Object.entries(allParams).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '1') {
        params.set(key, value.toString());
      }
    });

    return params.toString();
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/epd/patients?${buildUrlParams({ page: 1 })}`);
  };

  // Handle status filter change
  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    router.push(`/epd/patients?${buildUrlParams({ status: newStatus, page: 1 })}`);
  };

  // Handle gender filter change
  const handleGenderFilterChange = (newGender: string) => {
    setGenderFilter(newGender);
    router.push(`/epd/patients?${buildUrlParams({ gender: newGender, page: 1 })}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    router.push(`/epd/patients?${buildUrlParams({ page: newPage })}`);
  };

  // Handle sorting
  const handleSort = (column: string) => {
    const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
    router.push(`/epd/patients?${buildUrlParams({ sortBy: column, sortOrder: newSortOrder, page: 1 })}`);
  };

  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-teal-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-teal-600" />
    );
  };

  if (patients.length === 0) {
    return (
      <div>
        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Zoek op naam of BSN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[160px]"
            >
              <option value="all">Alle statussen</option>
              <option value="planned">Screening</option>
              <option value="active">Actief</option>
              <option value="finished">Afgerond</option>
              <option value="cancelled">Afgemeld</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={genderFilter}
              onChange={(e) => handleGenderFilterChange(e.target.value)}
              className="pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[160px]"
            >
              <option value="all">Alle geslachten</option>
              <option value="male">Man</option>
              <option value="female">Vrouw</option>
              <option value="other">Anders</option>
              <option value="unknown">Onbekend</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <User className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">Geen patiënten gevonden</h3>
          <p className="mt-2 text-sm text-slate-600">
            {searchTerm || statusFilter !== 'all' || genderFilter !== 'all'
              ? 'Probeer een andere zoekopdracht of filter.'
              : 'Begin met het toevoegen van een nieuwe patiënt.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Zoek op naam of BSN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[160px]"
          >
            <option value="all">Alle statussen</option>
            <option value="planned">Screening</option>
            <option value="active">Actief</option>
            <option value="finished">Afgerond</option>
            <option value="cancelled">Afgemeld</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <select
            value={genderFilter}
            onChange={(e) => handleGenderFilterChange(e.target.value)}
            className="pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[160px]"
          >
            <option value="all">Alle geslachten</option>
            <option value="male">Man</option>
            <option value="female">Vrouw</option>
            <option value="other">Anders</option>
            <option value="unknown">Onbekend</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    Naam
                    {renderSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  BSN
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('birthDate')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    Geboortedatum
                    {renderSortIcon('birthDate')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    Status
                    {renderSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('_lastUpdated')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    Laatst gewijzigd
                    {renderSortIcon('_lastUpdated')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {patients.map((patient) => {
                const name = patient.name?.[0];
                const fullName = [
                  ...(name?.prefix || []),
                  ...(name?.given || []),
                  name?.family,
                ]
                  .filter(Boolean)
                  .join(' ');

                const bsn = patient.identifier?.find(
                  (id) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
                )?.value;

                // Get status from extension (we'll add this to the FHIR mapping)
                const statusExtension = patient.extension?.find(
                  (ext) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/episode-status'
                );
                const status = statusExtension?.valueCode;

                // Format updated_at date
                const updatedAt = patient.meta?.lastUpdated
                  ? new Date(patient.meta.lastUpdated).toLocaleDateString('nl-NL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-';

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/epd/patients/${patient.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {name?.given?.[0]?.[0]}
                            {name?.family?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {fullName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{bsn || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {patient.birthDate
                          ? new Date(patient.birthDate).toLocaleDateString('nl-NL')
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">{updatedAt}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            {/* Results info */}
            <div className="text-sm text-slate-600">
              Resultaten {startIndex}-{endIndex} van {total}
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Vorige pagina"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }

                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[2.5rem] px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Volgende pagina"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
