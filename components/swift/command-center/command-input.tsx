'use client';

/**
 * Command Input
 *
 * Bottom input bar for text and voice commands.
 * Height: 64px (h-16)
 *
 * Features:
 * - Text input with dynamic placeholder
 * - Focus state with ring
 * - Send button (appears when input has value)
 * - Voice input with Deepgram streaming
 * - ⌘K shortcut hint
 */

import { forwardRef, useState, useEffect, useRef } from 'react';
import { useSwiftStore } from '@/stores/swift-store';
import { useSwiftVoice } from '@/lib/swift/use-swift-voice';
import type { BlockType } from '@/lib/swift/types';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { safeFetch, getErrorInfo } from '@/lib/swift/error-handler';

export const CommandInput = forwardRef<HTMLInputElement>(function CommandInput(_, ref) {
  const {
    inputValue,
    setInputValue,
    clearInput,
    activePatient,
    activeBlock,
    isVoiceActive,
    openBlock,
    addRecentAction,
  } = useSwiftStore();
  const { toast } = useToast();

  const {
    isRecording,
    isConnecting,
    isConnected,
    error: voiceError,
    startRecording,
    stopRecording,
    analyserNode,
    isBrowserSupported,
  } = useSwiftVoice();

  const [isProcessing, setIsProcessing] = useState(false);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const hasValue = inputValue.trim().length > 0;

  // Waveform visualization
  useEffect(() => {
    if (!analyserNode || !waveformRef.current || !isRecording) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = waveformRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;

      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(248, 250, 252)'; // slate-50
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient from blue to red based on amplitude
        const hue = 220 - (dataArray[i] / 255) * 40;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, isRecording]);

  // Dynamic placeholder based on context
  const getPlaceholder = () => {
    if (isRecording) return 'Luisteren...';
    if (isConnecting) return 'Verbinden met spraakherkenning...';
    if (activePatient) {
      return `Actie voor ${activePatient.name_given[0]}... (bijv. "notitie medicatie")`;
    }
    return 'Typ of spreek je intentie... (bijv. "notitie jan medicatie")';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!hasValue || isProcessing) return;

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    const inputText = inputValue.trim();
    setIsProcessing(true);
    
    try {
      // Call intent classification API
      const response = await safeFetch(
        '/api/intent/classify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: inputText }),
        },
        { operation: 'Intent classificeren' }
      );

      const result = await response.json();
      const { intent, confidence, entities } = result;

      // Check if we have a valid intent with sufficient confidence
      if (intent !== 'unknown' && confidence >= 0.5) {
        // Open the appropriate block with prefill data
        // Type assertion: intent is BlockType after 'unknown' check
        openBlock(intent as BlockType, entities);
        
        // Add to recent actions
        addRecentAction({
          intent,
          label: inputText.slice(0, 50), // Truncate for display
          patientName: entities.patientName,
        });
        
        clearInput();
      } else {
        // Low confidence or unknown intent - show FallbackPicker
        openBlock('fallback', { content: inputText });
        clearInput();
      }
    } catch (error) {
      console.error('Error processing intent:', error);
      const statusCode = (error as any)?.statusCode;
      const errorInfo = getErrorInfo(error, {
        operation: 'Intent classificeren',
        statusCode,
      });

      // Show error toast
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.description,
      });

      // On error, show FallbackPicker so user can choose
      // This ensures the user's input is not lost
      openBlock('fallback', { content: inputText });
      clearInput();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Keyboard shortcut: Cmd/Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+Enter: submit command
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  const isDisabled = isProcessing || activeBlock !== null;

  return (
    <footer className="h-16 border-t border-slate-200 flex items-center px-4 shrink-0 bg-white">
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        {/* Input wrapper with optional waveform */}
        <div className="relative flex-1">
          {/* Waveform canvas (shown when recording) */}
          {isRecording && (
            <canvas
              ref={waveformRef}
              width={200}
              height={40}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded opacity-60"
            />
          )}

          <input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isDisabled}
            className={`w-full bg-white border rounded-xl py-3 text-slate-900 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200
                       ${isRecording ? 'pl-[220px] pr-12 border-red-500/50' : 'pl-4 pr-12 border-slate-300'}`}
            autoFocus
          />

          {/* Status indicators */}
          {!hasValue && !isRecording && !isConnecting && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 pointer-events-none hidden sm:block">
              ⌘K
            </span>
          )}
          {isConnecting && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-500 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              Verbinden
            </span>
          )}
          {voiceError && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400 max-w-[150px] truncate">
              {voiceError}
            </span>
          )}
        </div>

        {/* Send button - appears when has value */}
        {hasValue && (
          <button
            type="submit"
            disabled={isProcessing}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Verstuur (Enter)"
          >
            {isProcessing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        )}

        {/* Voice button */}
        {isBrowserSupported ? (
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={isDisabled || isConnecting}
            className={`p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-red-600 hover:bg-red-500 text-white ring-4 ring-red-600/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title={isRecording ? 'Stop opname' : 'Start voice input'}
          >
            {isConnecting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isRecording ? (
              <MicOff size={20} />
            ) : (
              <Mic size={20} />
            )}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="p-3 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
            title="Spraakherkenning niet ondersteund in deze browser"
          >
            <MicOff size={20} />
          </button>
        )}
      </form>
    </footer>
  );
});
