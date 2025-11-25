'use client'

import { FilePenLine, FileText } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { Report } from '@/lib/types/report'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineCardProps {
  report: Report
  onView: () => void
  isActive?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_META = {
  behandeladvies: {
    label: 'Behandeladvies',
    icon: FilePenLine,
    iconBg: 'bg-teal-50 text-teal-600',
  },
  vrije_notitie: {
    label: 'Vrije notitie',
    icon: FileText,
    iconBg: 'bg-slate-100 text-slate-600',
  },
  intake_verslag: {
    label: 'Intake verslag',
    icon: FileText,
    iconBg: 'bg-blue-50 text-blue-600',
  },
  behandelplan: {
    label: 'Behandelplan',
    icon: FilePenLine,
    iconBg: 'bg-purple-50 text-purple-600',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getPreview(content: string, maxLines = 2): string {
  if (!content) return ''
  
  // Strip HTML tags als er HTML in zit
  const stripped = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  
  // Neem eerste N regels of max 100 karakters
  const lines = stripped.split(/[.!?]\s+/).slice(0, maxLines)
  const preview = lines.join('. ')
  
  if (preview.length > 120) {
    return preview.slice(0, 120) + '...'
  }
  
  return preview + (stripped.length > preview.length ? '...' : '')
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TimelineCard({ report, onView, isActive = false }: TimelineCardProps) {
  const meta = TYPE_META[report.type as keyof typeof TYPE_META] ?? TYPE_META.vrije_notitie
  const Icon = meta.icon
  
  const createdAt = report.created_at ? new Date(report.created_at) : null
  const dateFormatted = createdAt 
    ? format(createdAt, "d-MM, HH:mm", { locale: nl })
    : ''
  const relativeTime = createdAt
    ? formatDistanceToNow(createdAt, { addSuffix: false, locale: nl })
    : ''
  
  const preview = getPreview(report.content)

  return (
    <article
      className={cn(
        'rounded-lg border bg-white p-3 transition-all cursor-pointer',
        'hover:border-emerald-300 hover:shadow-sm',
        isActive 
          ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
          : 'border-slate-200'
      )}
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onView()
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className={cn('p-1.5 rounded-md', meta.iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {meta.label}
          </p>
          <p className="text-xs text-slate-500">
            {dateFormatted}
            {relativeTime && (
              <span className="text-slate-400 ml-1">
                · {relativeTime} geleden
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <p className="mt-2 text-xs text-slate-600 line-clamp-2">
          {preview}
        </p>
      )}

      {/* Action */}
      <div className="mt-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onView()
          }}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          Bekijk rapport →
        </button>
      </div>
    </article>
  )
}

