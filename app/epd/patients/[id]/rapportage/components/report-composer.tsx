'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SpeechRecorder } from '@/components/speech-recorder';
import { toast } from '@/hooks/use-toast';
import type { ClassificationResult, Report } from '@/lib/types/report';
import { createReport } from '../actions';

interface ReportComposerProps {
  patientId: string;
  patientName: string;
  selectedReport?: Report | null;
  onReportCreated?: (report: Report) => void;
}

export function ReportComposer({
  patientId,
  patientName,
  selectedReport,
  onReportCreated,
}: ReportComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [selectedType, setSelectedType] = useState<'behandeladvies' | 'vrije_notitie'>('vrije_notitie');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAutosave, setLastAutosave] = useState<Date | null>(null);
  const draftStorageKey = useMemo(() => `rapportage-draft-${patientId}`, [patientId]);

  const characterCount = content.length;
  const contentInvalid = characterCount < 20 || characterCount > 5000;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(draftStorageKey);
    if (stored) {
      try {
        const draft = JSON.parse(stored) as {
          content?: string;
          type?: 'behandeladvies' | 'vrije_notitie';
          updatedAt?: string;
        };
        if (draft.content) {
          setContent(draft.content);
        }
        if (draft.type) {
          setSelectedType(draft.type);
        }
        if (draft.updatedAt) {
          setLastAutosave(new Date(draft.updatedAt));
        }
      } catch (draftError) {
        console.error('Failed to parse draft', draftError);
        window.localStorage.removeItem(draftStorageKey);
      }
    }
  }, [draftStorageKey]);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('AI-analyse mislukt');
      }

      const result: ClassificationResult = await response.json();
      setClassification(result);
      setSelectedType(result.type);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI-analyse mislukt';
      setClassification(null);
      setSelectedType('vrije_notitie');
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
        content,
        ai_confidence: classification?.confidence,
        ai_reasoning: classification?.reasoning,
      });
      toast({
        title: 'Rapportage opgeslagen',
        description: `${patientName} heeft nu een nieuwe notitie in de tijdlijn.`,
      });
      onReportCreated?.(created);
      setContent('');
      setClassification(null);
      setSelectedType('vrije_notitie');
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
    const prefix = content ? `${content.trim()}\n\n` : '';
    const block = `> ${referenceSnippet.preview}\n(${referenceSnippet.type} • ${referenceSnippet.meta})`;
    setContent(`${prefix}${block}\n\n`);
  };

  return (
    <section
      id="rapportage-composer"
      tabIndex={-1}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm focus:outline-none"
    >
      <div className="mb-4">
        <p className="text-sm uppercase tracking-wide text-slate-500">Nieuwe rapportage</p>
        <h2 className="text-xl font-semibold text-slate-900">Voor {patientName}</h2>
        <p className="text-sm text-slate-500">
          Schrijf vanuit tekst of spraak en gebruik AI voor typebepaling.
        </p>
      </div>

      {referenceSnippet && (
        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Geselecteerde rapportage</span>
            <span>{referenceSnippet.meta}</span>
          </div>
          <p className="mt-2 text-sm text-slate-700">{referenceSnippet.preview}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-slate-400">{referenceSnippet.type}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={insertReference}
              disabled={isSaving}
            >
              Voeg referentie toe
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Beschrijf wat je wilt vastleggen..."
            className="w-full min-h-[200px] rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-inner focus:border-teal-500 focus:outline-none"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{characterCount} / 5000 karakters</span>
            {contentInvalid && <span>Minimaal 20 karakters</span>}
          </div>
        </div>

        <SpeechRecorder
          disabled={isSaving || isAnalyzing}
          onTranscript={(text) =>
            setContent((prev) => (prev ? `${prev}\n${text}` : text))
          }
        />

        <div className="rounded-xl border border-slate-200 p-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Rapportagetype</p>
              <p className="text-xs text-slate-500">Stel handmatig in of gebruik het AI-voorstel.</p>
            </div>
            <span className="text-xs text-slate-500">
              {classification
                ? `AI: ${classification.type} (${Math.round(classification.confidence * 100)}%)`
                : 'Nog geen AI-analyse'}
            </span>
          </div>
          {classification?.reasoning && (
            <p className="mt-2 text-xs text-slate-500">{classification.reasoning}</p>
          )}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'behandeladvies' | 'vrije_notitie')}
            className="mt-3 w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
          >
            <option value="behandeladvies">Behandeladvies</option>
            <option value="vrije_notitie">Vrije notitie</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
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
            {isAnalyzing ? 'Analyseren…' : 'Analyseer met AI'}
          </Button>
          <Button
            type="button"
            onClick={saveReport}
            disabled={contentInvalid || isSaving}
          >
            {isSaving ? 'Opslaan…' : 'Opslaan'}
          </Button>
        </div>
      </div>
    </section>
  );
}
