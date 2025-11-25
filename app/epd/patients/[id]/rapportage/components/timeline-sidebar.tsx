'use client'

import { useState, useMemo } from 'react'
import { X, Search, ChevronDown, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Report } from '@/lib/types/report'
import { TimelineCard } from './timeline-card'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineSidebarProps {
  /** Of de sidebar open is */
  isOpen: boolean
  /** Callback om sidebar te sluiten */
  onClose: () => void
  /** Lijst van rapportages */
  reports: Report[]
  /** Callback wanneer een rapport wordt geselecteerd */
  onSelectReport: (report: Report) => void
  /** ID van actief rapport (in modal) */
  activeReportId?: string | null
  /** Extra CSS classes */
  className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  behandeladvies: 'Behandeladvies',
  vrije_notitie: 'Vrije notitie',
  intake_verslag: 'Intake verslag',
  behandelplan: 'Behandelplan',
}

const FILTER_THRESHOLD = 10 // Toon filters alleen bij meer dan N items

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TimelineSidebar({
  isOpen,
  onClose,
  reports,
  onSelectReport,
  activeReportId,
  className,
}: TimelineSidebarProps) {
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Gefilterde rapportages
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = !search || 
        report.content.toLowerCase().includes(search.toLowerCase()) ||
        TYPE_LABELS[report.type]?.toLowerCase().includes(search.toLowerCase())
      
      const matchesType = typeFilter === 'all' || report.type === typeFilter
      
      return matchesSearch && matchesType
    })
  }, [reports, search, typeFilter])

  // Toon filters alleen als er meer dan threshold items zijn
  const showFilterSection = reports.length > FILTER_THRESHOLD

  // Unieke types voor filter dropdown
  const availableTypes = useMemo(() => {
    const types = new Set(reports.map(r => r.type))
    return Array.from(types)
  }, [reports])

  return (
    <aside
      className={cn(
        'fixed top-0 right-0 h-full bg-white border-l border-slate-200 shadow-xl z-40',
        'transition-transform duration-300 ease-out',
        'w-full sm:w-[380px] lg:w-[30%] lg:min-w-[320px] lg:max-w-[400px]',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Tijdlijn</h2>
            <span className="text-sm text-slate-500">
              ({filteredReports.length})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek in rapportages..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-emerald-300 focus:outline-none transition-colors"
            />
          </div>

          {/* Filters (on-demand) */}
          {showFilterSection && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
              >
                <ChevronDown className={cn('h-3 w-3 transition-transform', showFilters && 'rotate-180')} />
                Filters
              </button>

              {showFilters && (
                <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                  <label className="block text-xs text-slate-600 mb-1">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-md p-1.5 bg-white"
                  >
                    <option value="all">Alle types</option>
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {TYPE_LABELS[type] || type}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                {reports.length === 0
                  ? 'Nog geen rapportages'
                  : 'Geen resultaten gevonden'}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mt-2 text-xs text-emerald-600 hover:text-emerald-700"
                >
                  Wis zoekopdracht
                </button>
              )}
            </div>
          ) : (
            filteredReports.map((report) => (
              <TimelineCard
                key={report.id}
                report={report}
                onView={() => onSelectReport(report)}
                isActive={activeReportId === report.id}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            {filteredReports.length} van {reports.length} rapportages
          </p>
        </div>
      </div>
    </aside>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Overlay Component (voor achtergrond dimmen)
// ─────────────────────────────────────────────────────────────────────────────

export function TimelineSidebarOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/20 z-30 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  )
}

