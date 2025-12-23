'use client';

/**
 * Swift Voice Hook
 *
 * Wraps useDeepgramStreaming for Swift-specific voice input behavior.
 * Streams transcript directly to the command input.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSwiftStore } from '@/stores/swift-store';
import {
  useDeepgramStreaming,
  type TranscriptResult,
} from '@/hooks/use-deepgram-streaming';

export interface UseSwiftVoiceReturn {
  isRecording: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  analyserNode: AnalyserNode | null;
  isBrowserSupported: boolean;
}

export function useSwiftVoice(): UseSwiftVoiceReturn {
  const { setInputValue, setVoiceActive, inputValue } = useSwiftStore();

  // Track the base text (what was in input before recording started)
  const baseTextRef = useRef('');
  // Track interim transcript for replacement
  const lastInterimRef = useRef('');

  const handleTranscript = useCallback(
    (result: TranscriptResult) => {
      const { transcript, isFinal } = result;

      if (isFinal) {
        // Final transcript: append to base text and update base
        const newText = baseTextRef.current
          ? `${baseTextRef.current} ${transcript}`
          : transcript;
        baseTextRef.current = newText;
        lastInterimRef.current = '';
        setInputValue(newText);
      } else {
        // Interim transcript: show as preview (replace previous interim)
        const previewText = baseTextRef.current
          ? `${baseTextRef.current} ${transcript}`
          : transcript;
        setInputValue(previewText);
        lastInterimRef.current = transcript;
      }
    },
    [setInputValue]
  );

  const handleError = useCallback(
    (error: Error) => {
      console.error('[SwiftVoice] Error:', error.message);
    },
    []
  );

  const {
    status,
    isRecording,
    startRecording: startDeepgram,
    stopRecording: stopDeepgram,
    analyserNode,
    error,
    isBrowserSupported,
  } = useDeepgramStreaming({
    onTranscript: handleTranscript,
    onError: handleError,
    language: 'nl',
    model: 'nova-2',
    endpointingMs: 2000, // Shorter for command-style input
  });

  const startRecording = useCallback(async () => {
    // Store current input as base text
    baseTextRef.current = inputValue;
    lastInterimRef.current = '';
    setVoiceActive(true);
    await startDeepgram();
  }, [inputValue, setVoiceActive, startDeepgram]);

  const stopRecording = useCallback(() => {
    stopDeepgram();
    setVoiceActive(false);
    // Keep whatever text is in the input
    lastInterimRef.current = '';
  }, [stopDeepgram, setVoiceActive]);

  // Sync voice active state with recording state
  useEffect(() => {
    if (!isRecording) {
      setVoiceActive(false);
    }
  }, [isRecording, setVoiceActive]);

  return {
    isRecording,
    isConnecting: status === 'connecting' || status === 'reconnecting',
    isConnected: status === 'connected',
    error,
    startRecording,
    stopRecording,
    analyserNode,
    isBrowserSupported,
  };
}
