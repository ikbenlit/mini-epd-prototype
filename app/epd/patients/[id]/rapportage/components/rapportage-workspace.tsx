'use client'

import { useState, useCallback } from 'react'
import { LayoutList } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Report } from '@/lib/types/report'
import { useMediaQuery } from '@/hooks/use-media-query'
import { ReportComposer } from './report-composer'
import { QuickActions, type ReportType } from './quick-actions'
import { TimelineSidebar, TimelineSidebarOverlay } from './timeline-sidebar'
import { ReportViewEditModal } from './report-view-edit-modal'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RapportageWorkspaceProps {
  patientId: string
  patientName: string
  initialReports: Report[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function RapportageWorkspace({
  patientId,
  patientName,
  initialReports,
}: RapportageWorkspaceProps) {
  const [reports, setReports] = useState(initialReports)
  const [selectedType, setSelectedType] = useState<ReportType>('vrije_notitie')
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [duplicateContent, setDuplicateContent] = useState<string | null>(null)
  const isMobile = useMediaQuery('(max-width: 1023px)')

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
    // Bewaar selectedReport voor active state in timeline
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
    setIsTimelineOpen(false) // Sluit timeline zodat editor zichtbaar is
  }, [])

  const handleTypeSelect = useCallback((type: ReportType) => {
    setSelectedType(type)
  }, [])

  const toggleTimeline = useCallback(() => {
    setIsTimelineOpen((prev) => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Rapportage
              </p>
              <h1 className="text-xl font-semibold text-slate-900">
                {patientName}
              </h1>
            </div>
            
            {/* Timeline toggle button */}
            <button
              type="button"
              onClick={toggleTimeline}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isTimelineOpen
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              )}
            >
              <LayoutList className="h-4 w-4" />
              Tijdlijn
              {reports.length > 0 && (
                <span className={cn(
                  'ml-1 px-1.5 py-0.5 rounded-full text-xs',
                  isTimelineOpen ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-600'
                )}>
                  {reports.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main 
        className={cn(
          'transition-all duration-300 ease-out',
          // Op desktop: editor krimpt wanneer timeline open is
          isTimelineOpen && !isMobile && 'lg:mr-[30%] lg:min-w-0'
        )}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Quick Actions */}
          <section className="mb-6">
            <QuickActions
              onSelectType={handleTypeSelect}
              selectedType={selectedType}
            />
          </section>

          {/* Editor */}
          <section>
            <ReportComposer
              patientId={patientId}
              patientName={patientName}
              selectedReport={selectedReport}
              onReportCreated={handleReportCreated}
              initialContent={duplicateContent}
              onInitialContentConsumed={() => setDuplicateContent(null)}
            />
          </section>
        </div>
      </main>

      {/* Timeline Sidebar */}
      <TimelineSidebarOverlay
        isOpen={isTimelineOpen && isMobile}
        onClose={() => setIsTimelineOpen(false)}
      />
      
      <TimelineSidebar
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        reports={reports}
        onSelectReport={handleSelectReport}
        activeReportId={selectedReport?.id}
      />

      {/* View/Edit Modal */}
      <ReportViewEditModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        patientId={patientId}
        onReportUpdated={handleReportUpdated}
        onReportDeleted={handleReportDeleted}
        onDuplicate={handleDuplicate}
      />
    </div>
  )
}
