'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useDeepgramStreaming,
  type TranscriptResult,
} from '@/hooks/use-deepgram-streaming';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ToolbarMicButtonProps {
  /** Callback voor final transcripts */
  onTranscript: (text: string) => void;
  /** Callback voor interim transcripts (live preview) */
  onInterimTranscript?: (text: string) => void;
  /** Callback wanneer recording start */
  onRecordingStart?: () => void;
  /** Callback wanneer recording stopt */
  onRecordingStop?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Patient ID voor telemetry */
  patientId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini Waveform Component
// ─────────────────────────────────────────────────────────────────────────────

function MiniWaveform({ analyserNode }: { analyserNode: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bars
      const barCount = 5;
      const barWidth = 3;
      const gap = 2;
      const maxHeight = canvas.height - 4;
      const startX = (canvas.width - (barCount * barWidth + (barCount - 1) * gap)) / 2;

      for (let i = 0; i < barCount; i++) {
        // Sample from different parts of frequency spectrum
        const dataIndex = Math.floor((i / barCount) * bufferLength * 0.5);
        const value = dataArray[dataIndex] / 255;
        const barHeight = Math.max(4, value * maxHeight);

        const x = startX + i * (barWidth + gap);
        const y = (canvas.height - barHeight) / 2;

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode]);

  return (
    <canvas
      ref={canvasRef}
      width={32}
      height={20}
      className="inline-block"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function ToolbarMicButton({
  onTranscript,
  onInterimTranscript,
  onRecordingStart,
  onRecordingStop,
  disabled = false,
  patientId,
}: ToolbarMicButtonProps) {
  const [interimText, setInterimText] = useState('');
  // Completed utterances (after speechFinal)
  const completedUtterancesRef = useRef<string[]>([]);
  // Current utterance being built (before speechFinal)
  const currentUtteranceRef = useRef<string>('');

  const handleTranscript = useCallback(
    (result: TranscriptResult) => {
      if (result.isFinal) {
        // Update current utterance with latest final text
        currentUtteranceRef.current = result.transcript;
        setInterimText('');

        if (result.speechFinal) {
          // Utterance complete - commit to completed list
          if (currentUtteranceRef.current.trim()) {
            completedUtterancesRef.current.push(currentUtteranceRef.current);
          }
          currentUtteranceRef.current = '';
        }

        // Build full text: completed utterances + current utterance
        const parts = [...completedUtterancesRef.current];
        if (currentUtteranceRef.current.trim()) {
          parts.push(currentUtteranceRef.current);
        }
        onTranscript(parts.join(' '));
      } else {
        // Interim result - show as preview
        setInterimText(result.transcript);
        onInterimTranscript?.(result.transcript);
      }
    },
    [onTranscript, onInterimTranscript]
  );

  const {
    status,
    isRecording,
    startRecording,
    stopRecording,
    analyserNode,
    isBrowserSupported,
  } = useDeepgramStreaming({
    onTranscript: handleTranscript,
  });

  const handleClick = async () => {
    console.log('[ToolbarMicButton] Click - isRecording:', isRecording, 'status:', status);

    if (isRecording) {
      console.log('[ToolbarMicButton] Stopping recording...');
      stopRecording();
      onRecordingStop?.();
      completedUtterancesRef.current = [];
      currentUtteranceRef.current = '';
      setInterimText('');
    } else {
      console.log('[ToolbarMicButton] Starting recording...');
      completedUtterancesRef.current = [];
      currentUtteranceRef.current = '';
      setInterimText('');
      onRecordingStart?.();
      try {
        await startRecording();
        console.log('[ToolbarMicButton] startRecording() completed');
      } catch (err) {
        console.error('[ToolbarMicButton] startRecording() failed:', err);
      }
    }
  };

  const isConnecting = status === 'connecting';
  const isActive = isRecording && status === 'connected';

  // Determine button state and colors
  const getButtonClasses = () => {
    if (isActive) {
      // Recording - orange background
      return 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm';
    }
    if (isConnecting) {
      // Connecting - subtle loading state
      return 'bg-amber-100 text-amber-700';
    }
    // Default - green background
    return 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm';
  };

  if (!isBrowserSupported) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-7 items-center gap-1 px-2 rounded-md text-xs font-medium bg-slate-200 text-slate-400 cursor-not-allowed"
        title="Spraakopname niet ondersteund in deze browser"
      >
        <Mic className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isConnecting}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200',
        getButtonClasses(),
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      title={isRecording ? 'Stop opname' : 'Start opname'}
    >
      {isConnecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isActive ? (
        <>
          <MiniWaveform analyserNode={analyserNode} />
          <Square className="h-3 w-3" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
}
