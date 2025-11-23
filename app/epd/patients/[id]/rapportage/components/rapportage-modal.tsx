'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SpeechRecorder } from '@/components/speech-recorder';
import type { ClassificationResult } from '@/lib/types/report';
import { createReport } from '../actions';
import { toast } from '@/hooks/use-toast';

interface RapportageModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

export function RapportageModal({ isOpen, onClose, patientId, patientName }: RapportageModalProps) {
  const [content, setContent] = useState('');
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [selectedType, setSelectedType] = useState<'behandeladvies' | 'vrije_notitie'>('vrije_notitie');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setClassification(null);
      setSelectedType('vrije_notitie');
      setError(null);
      setIsAnalyzing(false);
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleAnalyze = async () => {
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
      setClassification(null);
      setSelectedType('vrije_notitie');
      const message = err instanceof Error ? err.message : 'AI-analyse mislukt';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'AI-analyse mislukt',
        description: message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await createReport(patientId, {
        type: selectedType,
        content,
        ai_confidence: classification?.confidence,
        ai_reasoning: classification?.reasoning,
      });
      toast({
        title: 'Rapportage opgeslagen',
        description: `${patientName} heeft nu een nieuwe notitie in de tijdlijn.`,
      });
      router.refresh();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Opslaan mislukt';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Opslaan mislukt',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const characterCount = content.length;
  const contentInvalid = characterCount < 20 || characterCount > 5000;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nieuwe rapportage</DialogTitle>
          <DialogDescription>
            Leg een rapportage vast voor {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Beschrijf wat je wilt vastleggen..."
              className="w-full min-h-[160px] rounded-md border border-slate-200 p-3"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{characterCount} / 5000 karakters</span>
              {contentInvalid && <span>Min. 20 karakters</span>}
            </div>
          </div>

          <SpeechRecorder
            disabled={isSaving || isAnalyzing}
            onTranscript={(text) =>
              setContent((prev) => `${prev}${prev ? '\n' : ''}${text}`)
            }
          />

          <div className="rounded-lg border border-slate-200 p-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Rapportagetype</p>
                <p className="text-xs text-slate-500">
                  Kies handmatig of gebruik het AI-voorstel.
                </p>
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

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Annuleren
            </Button>
            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={contentInvalid || isAnalyzing || isSaving}
            >
              {isAnalyzing ? 'Analyseren…' : 'Analyseer met AI'}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={contentInvalid || isSaving}
            >
              {isSaving ? 'Opslaan…' : 'Opslaan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
