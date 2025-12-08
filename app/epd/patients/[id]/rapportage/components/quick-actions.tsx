'use client'

import { FileText, ClipboardList, TrendingUp, Phone, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportType } from '@/lib/types/report'

// Re-export for backwards compatibility
export type { ReportType } from '@/lib/types/report'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface QuickAction {
  id: string
  label: string
  icon: typeof FileText
  type: ReportType
  color?: string
}

export interface QuickActionsProps {
  /** Callback wanneer een type wordt geselecteerd */
  onSelectType: (type: ReportType) => void
  /** Huidige geselecteerde type */
  selectedType?: ReportType
  /** Disabled state */
  disabled?: boolean
  /** Extra CSS classes */
  className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'voortgang', label: 'Voortgang', icon: TrendingUp, type: 'voortgang', color: 'emerald' },
  { id: 'contact', label: 'Contact', icon: Phone, type: 'contact', color: 'amber' },
  { id: 'crisis', label: 'Crisis', icon: Zap, type: 'crisis', color: 'red' },
  { id: 'vrije-notitie', label: 'Vrije notitie', icon: FileText, type: 'vrije_notitie', color: 'slate' },
  { id: 'behandeladvies', label: 'Behandeladvies', icon: ClipboardList, type: 'behandeladvies', color: 'indigo' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function QuickActions({
  onSelectType,
  selectedType,
  disabled = false,
  className,
}: QuickActionsProps) {
  const handleSelect = (type: ReportType) => {
    onSelectType(type)
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        const isActive = selectedType === action.type
        
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => handleSelect(action.type)}
            disabled={disabled}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              'border',
              isActive
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </button>
        )
      })}
    </div>
  )
}
