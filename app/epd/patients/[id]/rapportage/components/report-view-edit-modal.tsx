'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { X, Pencil, Copy, Trash2, Save, Loader2, Calendar, ExternalLink } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { Report } from '@/lib/types/report'
import { SpeechRecorderStreaming } from '@/components/speech-recorder-streaming'
import { toast } from '@/hooks/use-toast'
import { updateReport, deleteReport } from '../actions'
import { EncounterSelector } from './encounter-selector'
import { getEncounterById } from '@/app/epd/agenda/actions'

interface LinkedEncounter {
  id: string
  period_start: string
  period_end: string | null
  type_code: string
  type_display: string
  status: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportViewEditModalProps {
  /** Het rapport om te bekijken/bewerken */
  report: Report | null
  /** Of de modal open is */
  isOpen: boolean
  /** Callback om modal te sluiten */
  onClose: () => void
  /** Patient ID voor API calls */
  patientId: string
  /** Callback na succesvolle update */
  onReportUpdated?: (report: Report) => void
  /** Callback na verwijdering */
  onReportDeleted?: (reportId: string) => void
  /** Callback voor dupliceren */
  onDuplicate?: (content: string) => void
}

type ModalMode = 'read' | 'edit'

// ─────────────────────────────────────────────────────────────────────────────
// Unsaved Changes Dialog
// ─────────────────────────────────────────────────────────────────────────────

function UnsavedChangesDialog({
  isOpen,
  onSaveAndClose,
  onDiscardAndClose,
  onCancel,
  isSaving,
}: {
  isOpen: boolean
  onSaveAndClose: () => void
  onDiscardAndClose: () => void
  onCancel: () => void
  isSaving: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold text-slate-900">
          Niet opgeslagen wijzigingen
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Je hebt wijzigingen die nog niet zijn opgeslagen. Wat wil je doen?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSaveAndClose}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Opslaan en sluiten
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onDiscardAndClose}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Wijzigingen verwijderen
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full px-4 py-2 text-slate-600 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-50"
          >
            ← Terug naar bewerken
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirmation Dialog
// ─────────────────────────────────────────────────────────────────────────────

function DeleteConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold text-slate-900">
          Rapportage verwijderen?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Weet je zeker dat je deze rapportage wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verwijderen...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Verwijderen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────────────────────

export function ReportViewEditModal({
  report,
  isOpen,
  onClose,
  patientId,
  onReportUpdated,
  onReportDeleted,
  onDuplicate,
}: ReportViewEditModalProps) {
  // State
  const [mode, setMode] = useState<ModalMode>('read')
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [encounterId, setEncounterId] = useState<string | null>(null)
  const [originalEncounterId, setOriginalEncounterId] = useState<string | null>(null)
  const [linkedEncounter, setLinkedEncounter] = useState<LinkedEncounter | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync content met report
  useEffect(() => {
    if (report) {
      setContent(report.content)
      setOriginalContent(report.content)
      setEncounterId(report.encounter_id || null)
      setOriginalEncounterId(report.encounter_id || null)
      setMode('read')
    }
  }, [report])

  // Fetch linked encounter details for navigation
  useEffect(() => {
    if (encounterId) {
      getEncounterById(encounterId).then((encounter) => {
        setLinkedEncounter(encounter)
      })
    } else {
      setLinkedEncounter(null)
    }
  }, [encounterId])

  // Reset bij sluiten
  useEffect(() => {
    if (!isOpen) {
      setMode('read')
      setShowUnsavedDialog(false)
      setShowDeleteDialog(false)
    }
  }, [isOpen])

  // Check for unsaved changes
  const hasUnsavedChanges = content !== originalContent || encounterId !== originalEncounterId

  // Keyboard handler (Escape)
  // Handlers
  const handleClose = useCallback(() => {
    if (mode === 'edit' && hasUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      onClose()
    }
  }, [mode, hasUnsavedChanges, onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  const handleEdit = useCallback(() => {
    setMode('edit')
    // Focus textarea en zet cursor aan einde
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const length = textareaRef.current.value.length
        textareaRef.current.setSelectionRange(length, length)
      }
    }, 100)
  }, [])

  const handleCancelEdit = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      setContent(originalContent)
      setMode('read')
    }
  }, [hasUnsavedChanges, originalContent])

  const handleSave = useCallback(async () => {
    if (!report) return

    setIsSaving(true)
    try {
      const updated = await updateReport(patientId, report.id, {
        content,
        encounter_id: encounterId,
      })
      setOriginalContent(content)
      setOriginalEncounterId(encounterId)
      onReportUpdated?.(updated)
      toast({
        title: 'Wijzigingen opgeslagen',
        description: 'De rapportage is bijgewerkt.',
      })
    } catch (error) {
      console.error('Failed to save:', error)
      toast({
        variant: 'destructive',
        title: 'Opslaan mislukt',
        description: error instanceof Error ? error.message : 'Probeer het opnieuw.',
      })
    } finally {
      setIsSaving(false)
    }
  }, [report, patientId, content, encounterId, onReportUpdated])

  const handleSaveAndClose = useCallback(async () => {
    await handleSave()
    setShowUnsavedDialog(false)
    onClose()
  }, [handleSave, onClose])

  const handleDiscardAndClose = useCallback(() => {
    setContent(originalContent)
    setEncounterId(originalEncounterId)
    setShowUnsavedDialog(false)
    onClose()
  }, [originalContent, originalEncounterId, onClose])

  const handleDelete = useCallback(async () => {
    if (!report) return

    setIsDeleting(true)
    try {
      await deleteReport(patientId, report.id)
      onReportDeleted?.(report.id)
      toast({
        title: 'Rapportage verwijderd',
        description: 'De rapportage is verwijderd.',
      })
      onClose()
    } catch (error) {
      console.error('Failed to delete:', error)
      toast({
        variant: 'destructive',
        title: 'Verwijderen mislukt',
        description: error instanceof Error ? error.message : 'Probeer het opnieuw.',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }, [report, patientId, onReportDeleted, onClose])

  const handleDuplicate = useCallback(() => {
    onDuplicate?.(content)
    onClose()
    toast({
      title: 'Gekopieerd',
      description: 'Inhoud is gekopieerd naar de editor.',
    })
  }, [content, onDuplicate, onClose])

  const handleTranscript = useCallback((transcript: string) => {
    setContent((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }, [])

  const handleRecordingStart = useCallback(() => {
    setIsStreaming(true)
    if (textareaRef.current) {
      const length = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(length, length)
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [])

  const handleRecordingStop = useCallback(() => {
    setIsStreaming(false)
  }, [])

  // Don't render if not open or no report
  if (!isOpen || !report) return null

  const createdAt = report.created_at ? new Date(report.created_at) : null
  const dateFormatted = createdAt
    ? format(createdAt, "d MMMM yyyy 'om' HH:mm", { locale: nl })
    : ''
  const relativeTime = createdAt
    ? formatDistanceToNow(createdAt, { addSuffix: true, locale: nl })
    : ''

  const TYPE_LABELS: Record<string, string> = {
    behandeladvies: 'Behandeladvies',
    vrije_notitie: 'Vrije notitie',
    intake_verslag: 'Intake verslag',
    behandelplan: 'Behandelplan',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
        <div
          className={cn(
            'bg-white rounded-2xl shadow-2xl w-full max-w-3xl',
            'animate-in fade-in slide-in-from-bottom-4 duration-300'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {TYPE_LABELS[report.type] || report.type}
                {mode === 'edit' && (
                  <span className="ml-2 text-sm font-normal text-emerald-600">
                    (bewerken)
                  </span>
                )}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {dateFormatted}
                {relativeTime && <span className="ml-2 text-slate-400">({relativeTime})</span>}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {mode === 'read' ? (
                <>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Bewerken
                  </button>
                  {onDuplicate && (
                    <button
                      type="button"
                      onClick={handleDuplicate}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <Copy className="h-4 w-4" />
                      Dupliceer
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowDeleteDialog(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opslaan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Opslaan
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Annuleren
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                aria-label="Sluiten"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Speech Recorder (only in edit mode) */}
          {mode === 'edit' && (
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <SpeechRecorderStreaming
                onTranscript={handleTranscript}
                onRecordingStart={handleRecordingStart}
                onRecordingStop={handleRecordingStop}
                telemetryContext={{
                  context: 'report_modal',
                  patientId,
                  reportId: report.id,
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {mode === 'read' ? (
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {content}
                </p>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={cn(
                  'w-full min-h-[300px] p-4 text-sm text-slate-900 rounded-xl border bg-white',
                  'focus:outline-none transition-all duration-200',
                  isStreaming
                    ? 'border-emerald-500 border-2 shadow-emerald-500/20 shadow-md'
                    : 'border-slate-200 focus:border-emerald-300'
                )}
                placeholder="Bewerk de rapportage of dicteer met spraak..."
              />
            )}
          </div>

          {/* Encounter linking */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Gekoppelde afspraak</span>
            </div>

            {mode === 'read' && linkedEncounter ? (
              // Read mode with linked encounter - show clickable card
              <Link
                href={`/epd/agenda?date=${format(new Date(linkedEncounter.period_start), 'yyyy-MM-dd')}&encounterId=${linkedEncounter.id}`}
                className="block p-3 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-teal-700">
                    {linkedEncounter.type_display || linkedEncounter.type_code}
                  </span>
                  <ExternalLink className="h-4 w-4 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-teal-600 mt-0.5">
                  {format(new Date(linkedEncounter.period_start), "EEEE d MMMM yyyy 'om' HH:mm", { locale: nl })}
                </div>
                <div className="text-xs text-teal-500 mt-1 flex items-center gap-1">
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs',
                    linkedEncounter.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    linkedEncounter.status === 'planned' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  )}>
                    {linkedEncounter.status === 'completed' ? 'Afgerond' :
                     linkedEncounter.status === 'planned' ? 'Gepland' :
                     linkedEncounter.status}
                  </span>
                  <span className="text-teal-400">•</span>
                  <span>Klik om naar agenda te gaan</span>
                </div>
              </Link>
            ) : mode === 'read' ? (
              // Read mode without linked encounter
              <div className="text-sm text-slate-400 py-2 italic">
                Geen afspraak gekoppeld. Bewerk om een afspraak te koppelen.
              </div>
            ) : (
              // Edit mode - show selector
              <EncounterSelector
                patientId={patientId}
                value={encounterId}
                onChange={setEncounterId}
              />
            )}
          </div>

          {/* Footer with metadata */}
          {report.ai_reasoning && (
            <div className="px-6 pb-6">
              <div className="rounded-lg bg-slate-50 p-4 text-sm">
                <p className="font-medium text-slate-700">AI toelichting</p>
                <p className="mt-1 text-slate-600">{report.ai_reasoning}</p>
                {report.ai_confidence !== null && (
                  <p className="mt-2 text-xs text-slate-500">
                    Zekerheid: {Math.round(report.ai_confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Unsaved indicator */}
          {mode === 'edit' && hasUnsavedChanges && (
            <div className="px-6 pb-4">
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Niet opgeslagen wijzigingen
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onSaveAndClose={handleSaveAndClose}
        onDiscardAndClose={handleDiscardAndClose}
        onCancel={() => setShowUnsavedDialog(false)}
        isSaving={isSaving}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isDeleting={isDeleting}
      />
    </>
  )
}
