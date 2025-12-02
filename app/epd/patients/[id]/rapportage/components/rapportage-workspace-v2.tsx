'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Report } from '@/lib/types/report'
import { ReportComposer } from './report-composer'
import { QuickActions, type ReportType } from './quick-actions'
import { ReportTimeline } from './report-timeline'

const ReportViewEditModal = dynamic(
  () => import('./report-view-edit-modal').then((m) => m.ReportViewEditModal),
  { ssr: false, loading: () => <ModalSkeleton /> }
)

function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="rounded-2xl bg-white/80 p-6 shadow-xl">
        <div className="h-4 w-48 rounded bg-slate-200 animate-pulse mb-4" />
        <div className="h-32 w-72 rounded bg-slate-100 animate-pulse" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RapportageWorkspaceV2Props {
  patientId: string
  patientName: string
  initialReports: Report[]
  linkedEncounterId?: string
}

type PanelsModule = typeof import('react-resizable-panels')

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function RapportageWorkspaceV2({
  patientId,
  patientName,
  initialReports,
  linkedEncounterId,
}: RapportageWorkspaceV2Props) {
  const [reports, setReports] = useState(initialReports)
  const [selectedType, setSelectedType] = useState<ReportType>('vrije_notitie')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [duplicateContent, setDuplicateContent] = useState<string | null>(null)
  const [isComposerCollapsed, setIsComposerCollapsed] = useState(false)
  const [panelsLib, setPanelsLib] = useState<PanelsModule | null>(null)

  useEffect(() => {
    let active = true
    import('react-resizable-panels')
      .then((mod) => {
        if (active) {
          setPanelsLib(mod)
        }
      })
      .catch((error) => {
        console.error('Kon react-resizable-panels niet laden', error)
      })
    return () => {
      active = false
    }
  }, [])

  // Handlers
  const handleReportCreated = useCallback((report: Report) => {
    setReports((prev) => [report, ...prev])
  }, [])

  const handleSelectReport = useCallback((report: Report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleReportUpdated = useCallback((updatedReport: Report) => {
    setReports((prev) =>
      prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
    )
    setSelectedReport(updatedReport)
  }, [])

  const handleReportDeleted = useCallback((reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId))
    if (selectedReport?.id === reportId) {
      setSelectedReport(null)
    }
  }, [selectedReport])

  const handleDuplicate = useCallback((content: string) => {
    setDuplicateContent(content)
    // Open composer als deze collapsed is
    if (isComposerCollapsed) {
      setIsComposerCollapsed(false)
    }
  }, [isComposerCollapsed])

  const handleTypeSelect = useCallback((type: ReportType) => {
    setSelectedType(type)
  }, [])

  const toggleComposer = useCallback(() => {
    setIsComposerCollapsed((prev) => !prev)
  }, [])

  const PanelGroupComponent = panelsLib?.PanelGroup
  const PanelComponent = panelsLib?.Panel
  const PanelResizeHandleComponent = panelsLib?.PanelResizeHandle

  const composerPanel = (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 shrink-0 bg-slate-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Nieuwe rapportage</h2>
          {PanelGroupComponent ? (
            <button
              type="button"
              onClick={toggleComposer}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
              aria-label="Sluit editor"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-xs text-slate-400">Layout optimalisatie laden…</span>
          )}
        </div>

        {linkedEncounterId && (
          <div className="mb-3 p-2 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-2 text-sm text-teal-700">
            <Calendar className="h-4 w-4" />
            <span>Dit verslag wordt gekoppeld aan de afspraak</span>
          </div>
        )}

        <QuickActions onSelectType={handleTypeSelect} selectedType={selectedType} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <ReportComposer
          patientId={patientId}
          patientName={patientName}
          selectedType={selectedType}
          onTypeChange={handleTypeSelect}
          selectedReport={selectedReport}
          onReportCreated={handleReportCreated}
          initialContent={duplicateContent}
          onInitialContentConsumed={() => setDuplicateContent(null)}
          linkedEncounterId={linkedEncounterId}
        />
      </div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <div className="flex-1 overflow-hidden">
        {PanelGroupComponent && PanelComponent && PanelResizeHandleComponent ? (
          <PanelGroupComponent direction="horizontal" className="h-full">
            <PanelComponent
              defaultSize={isComposerCollapsed ? 100 : 60}
              minSize={40}
              className="relative"
            >
              <ReportTimeline
                reports={reports}
                onSelectReport={handleSelectReport}
                activeReportId={selectedReport?.id}
              />
            </PanelComponent>

            {!isComposerCollapsed && (
              <PanelResizeHandleComponent className="relative w-1 bg-slate-200 hover:bg-emerald-400 transition-colors group">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 group-hover:w-1.5 bg-slate-300 group-hover:bg-emerald-500 transition-all" />
              </PanelResizeHandleComponent>
            )}

            {!isComposerCollapsed && (
              <PanelComponent
                defaultSize={40}
                minSize={25}
                maxSize={60}
                className="relative bg-white border-l border-slate-200"
              >
                {composerPanel}
              </PanelComponent>
            )}

            {isComposerCollapsed && (
              <div className="absolute top-1/2 right-0 -translate-y-1/2 z-20">
                <button
                  type="button"
                  onClick={toggleComposer}
                  className={cn(
                    'flex items-center gap-2 px-3 py-6 rounded-l-lg',
                    'bg-emerald-500 text-white shadow-lg',
                    'hover:bg-emerald-600 transition-all',
                    'border border-r-0 border-emerald-600'
                  )}
                  aria-label="Open editor"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="text-sm font-medium writing-mode-vertical-rl rotate-180">
                    Nieuwe rapportage
                  </span>
                </button>
              </div>
            )}
          </PanelGroupComponent>
        ) : (
          <div className="h-full flex flex-col lg:flex-row">
            <div className="flex-1 overflow-y-auto border-b border-slate-200">
              <ReportTimeline
                reports={reports}
                onSelectReport={handleSelectReport}
                activeReportId={selectedReport?.id}
              />
            </div>
            <div className="lg:w-[420px] border-t border-slate-200 lg:border-t-0 lg:border-l lg:border-slate-200 bg-white">
              {composerPanel}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && selectedReport && (
        <ReportViewEditModal
          report={selectedReport}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          patientId={patientId}
          onReportUpdated={handleReportUpdated}
          onReportDeleted={handleReportDeleted}
          onDuplicate={handleDuplicate}
        />
      )}
    </div>
  )
}
