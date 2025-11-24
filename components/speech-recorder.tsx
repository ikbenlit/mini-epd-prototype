'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpeechRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SpeechRecorder({ onTranscript, disabled = false, className }: SpeechRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopStream = () => {
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
  };

  const handleStop = useCallback(async () => {
    setIsRecording(false);
    const chunks = chunksRef.current;
    chunksRef.current = [];
    stopStream();

    if (chunks.length === 0) return;

    const blob = new Blob(chunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    try {
      setIsUploading(true);
      setError(null);
      const response = await fetch('/api/deepgram/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Transcriptie mislukt');
      }

      const data = await response.json();
      if (data.transcript) {
        onTranscript(data.transcript as string);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setIsUploading(false);
    }
  }, [onTranscript]);

  const startRecording = async () => {
    if (disabled || isUploading) return;

    try {
      setError(null);
      setPermissionDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setPermissionDenied(true);
      setError('Toegang tot microfoon geweigerd of niet beschikbaar.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const isBusy = isRecording || isUploading;

  return (
    <div className={cn('rounded-lg border border-slate-200 p-4 bg-white space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Spraak-naar-tekst</p>
          <p className="text-xs text-slate-500">
            {isRecording ? 'Opname loopt…' : 'Neem een fragment op en laat Deepgram transcriberen.'}
          </p>
        </div>
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isUploading || disabled}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {isRecording ? (
            <>
              <Square className="h-3 w-3 text-red-600" /> Stop
            </>
          ) : (
            <>
              <Mic className="h-3 w-3 text-teal-600" /> Opnemen
            </>
          )}
        </button>
      </div>
      {isUploading && (
        <p className="text-xs text-slate-500 inline-flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Transcriptie bezig…
        </p>
      )}
      {permissionDenied && <p className="text-xs text-red-600">Microfoontoegang nodig om op te nemen.</p>}
      {error && !permissionDenied && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
