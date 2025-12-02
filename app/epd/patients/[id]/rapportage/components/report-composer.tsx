'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { ClassificationResult, Report, ReportType } from '@/lib/types/report';
import { createReport } from '../actions';
import type { Editor } from '@/components/rich-text-editor';
import { ToolbarMicButton } from './toolbar-mic-button';

// Dynamic imports
const RichTextEditor = dynamic(
  () => import('@/components/rich-text-editor').then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 animate-pulse">
      <div className="h-10 bg-slate-100 border-b border-slate-200" />
      <div className="h-40 bg-white" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ReportComposerProps {
  patientId: string;
  patientName: string;
  /** Het geselecteerde report type (van parent) */
  selectedType: ReportType;
  /** Callback om type te wijzigen */
  onTypeChange?: (type: ReportType) => void;
  selectedReport?: Report | null;
  onReportCreated?: (report: Report) => void;
  /** Initial content voor de editor (bijv. van duplicate) */
  initialContent?: string | null;
  /** Callback wanneer initialContent is verwerkt */
  onInitialContentConsumed?: () => void;
  /** Linked encounter ID for linking report to appointment */
  linkedEncounterId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ReportComposer({
  patientId,
  patientName,
  selectedType,
  onTypeChange,
  selectedReport,
  onReportCreated,
  initialContent,
  onInitialContentConsumed,
  linkedEncounterId,
}: ReportComposerProps) {
  const router = useRouter();
  const [editorRef, setEditorRef] = useState<Editor | null>(null);
  const [content, setContent] = useState('');
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAutosave, setLastAutosave] = useState<Date | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const draftStorageKey = useMemo(() => `rapportage-draft-${patientId}`, [patientId]);

  // Calculate plain text length from HTML content
  const textContent = useMemo(() => {
    if (typeof document === 'undefined') return '';
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent || div.innerText || '';
  }, [content]);

  const characterCount = textContent.length;
  const contentInvalid = characterCount < 20 || characterCount > 5000;

  // Handle initialContent (e.g., from duplicate)
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      onInitialContentConsumed?.();
    }
  }, [initialContent, onInitialContentConsumed]);

  // Load draft from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(draftStorageKey);
    if (stored) {
      try {
        const draft = JSON.parse(stored) as {
          content?: string;
          type?: ReportType;
          updatedAt?: string;
        };
        if (draft.content) {
          setContent(draft.content);
        }
        if (draft.type && onTypeChange) {
          onTypeChange(draft.type);
        }
        if (draft.updatedAt) {
          setLastAutosave(new Date(draft.updatedAt));
        }
      } catch (draftError) {
        console.error('Failed to parse draft', draftError);
        window.localStorage.removeItem(draftStorageKey);
      }
    }
  }, [draftStorageKey, onTypeChange]);

  // Autosave draft
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!content && selectedType === 'vrije_notitie') {
      window.localStorage.removeItem(draftStorageKey);
      setLastAutosave(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      const payload = {
        content,
        type: selectedType,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(draftStorageKey, JSON.stringify(payload));
      setLastAutosave(new Date(payload.updatedAt));
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [content, selectedType, draftStorageKey]);

  // Recording handlers
  const handleRecordingStart = useCallback(() => {
    setIsRecording(true);
    setInterimText('');
    if (editorRef) {
      editorRef.chain().focus().run();
    }
  }, [editorRef]);

  const handleRecordingStop = useCallback(() => {
    setIsRecording(false);
    setInterimText('');
  }, []);

  const handleTranscript = useCallback((text: string) => {
    setContent((prev) => {
      // If editor has content, append with space
      const plainPrev = prev.replace(/<[^>]*>/g, '').trim();
      if (plainPrev) {
        return `${prev}<p>${text}</p>`;
      }
      return `<p>${text}</p>`;
    });
  }, []);

  const handleInterimTranscript = useCallback((text: string) => {
    setInterimText(text);
  }, []);

  // Reference snippet for context
  const referenceSnippet = useMemo(() => {
    if (!selectedReport) return null;
    const createdAt = selectedReport.created_at ? new Date(selectedReport.created_at) : null;
    return {
      preview:
        selectedReport.content.length > 160
          ? `${selectedReport.content.slice(0, 160)}…`
          : selectedReport.content,
      meta: createdAt
        ? `${createdAt.toLocaleDateString('nl-NL')} • ${createdAt.toLocaleTimeString('nl-NL')}`
        : 'Onbekende datum',
      type: selectedReport.type,
    };
  }, [selectedReport]);

  const analyzeWithAI = async () => {
    if (contentInvalid) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/reports/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textContent }),
      });

      if (!response.ok) {
        throw new Error('AI-analyse mislukt');
      }

      const result: ClassificationResult = await response.json();
      setClassification(result);
      onTypeChange?.(result.type);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI-analyse mislukt';
      setClassification(null);
      setError(message);
      toast({ variant: 'destructive', title: 'AI-analyse mislukt', description: message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveReport = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const created = await createReport(patientId, {
        type: selectedType,
        content: textContent, // Save plain text for now
        ai_confidence: classification?.confidence,
        ai_reasoning: classification?.reasoning,
        encounter_id: linkedEncounterId,
      });
      toast({
        title: 'Rapportage opgeslagen',
        description: `${patientName} heeft nu een nieuwe notitie in de tijdlijn.`,
      });
      onReportCreated?.(created);
      setContent('');
      setClassification(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(draftStorageKey);
      }
      setLastAutosave(null);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Opslaan mislukt';
      setError(message);
      toast({ variant: 'destructive', title: 'Opslaan mislukt', description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const insertReference = () => {
    if (!selectedReport || !referenceSnippet) return;
    const block = `<blockquote>${referenceSnippet.preview}</blockquote><p><em>(${referenceSnippet.type} • ${referenceSnippet.meta})</em></p>`;
    setContent((prev) => (prev ? `${prev}${block}` : block));
  };

  // Mic button for toolbar - directly starts/stops recording
  const MicToolbarButton = (
    <ToolbarMicButton
      onTranscript={handleTranscript}
      onInterimTranscript={handleInterimTranscript}
      onRecordingStart={handleRecordingStart}
      onRecordingStop={handleRecordingStop}
      disabled={isSaving || isAnalyzing}
      patientId={patientId}
    />
  );

  return (
    <section id="rapportage-composer" tabIndex={-1} className="focus:outline-none space-y-4">
      {/* Reference snippet */}
      {referenceSnippet && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Geselecteerde rapportage</span>
            <span>{referenceSnippet.meta}</span>
          </div>
          <p className="mt-2 text-sm text-slate-700">{referenceSnippet.preview}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-slate-400">{referenceSnippet.type}</span>
            <Button type="button" variant="outline" size="sm" onClick={insertReference} disabled={isSaving}>
              Voeg referentie toe
            </Button>
          </div>
        </div>
      )}

      {/* Editor */}
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Begin met typen of gebruik spraakopname..."
        toolbarExtra={MicToolbarButton}
        onEditorReady={setEditorRef}
        isStreaming={isRecording}
        minHeight="180px"
      />

      {/* Interim transcript preview during recording */}
      {interimText && (
        <div className="text-sm text-slate-500 italic bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 -mt-2 animate-pulse">
          {interimText}
        </div>
      )}

      {/* Character count */}
      <div className="flex justify-between text-xs text-slate-500 -mt-2">
        <span>{characterCount} / 5000 karakters</span>
        {characterCount > 0 && characterCount < 20 && <span className="text-amber-600">Minimaal 20 karakters</span>}
      </div>

      {/* AI Classification result (inline) */}
      {classification && (
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>
            AI suggereert: <strong>{classification.type === 'behandeladvies' ? 'Behandeladvies' : 'Vrije notitie'}</strong>
            <span className="text-slate-400 ml-1">({Math.round(classification.confidence * 100)}% zeker)</span>
          </span>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          {isSaving
            ? 'Opslaan bezig…'
            : lastAutosave
            ? `Automatisch opgeslagen ${lastAutosave.toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : 'Concept wordt lokaal bijgehouden.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={analyzeWithAI}
            disabled={contentInvalid || isAnalyzing || isSaving}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isAnalyzing ? 'Analyseren…' : 'Analyseer met AI'}
          </Button>
          <Button type="button" onClick={saveReport} disabled={contentInvalid || isSaving}>
            {isSaving ? 'Opslaan…' : 'Opslaan'}
          </Button>
        </div>
      </div>
    </section>
  );
}
