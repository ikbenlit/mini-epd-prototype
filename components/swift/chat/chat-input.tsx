'use client';

/**
 * Chat Input Component (v3.0)
 *
 * Text input onderaan chat panel met Enter to submit en Shift+Enter voor nieuwe regel.
 *
 * Epic: E2 (Chat Panel & Messages)
 * Story: E2.S4 (ChatInput component)
 */

import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Mic } from 'lucide-react';
import { useSwiftStore } from '@/stores/swift-store';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({
  placeholder = 'Typ of spreek wat je wilt doen...',
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addChatMessage = useSwiftStore((s) => s.addChatMessage);

  // Handle input change and auto-resize
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Handle submit
  const handleSubmit = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || disabled) return;

    // Add user message to store
    addChatMessage({
      type: 'user',
      content: trimmedValue,
    });

    // Call optional onSend callback
    onSend?.(trimmedValue);

    // Clear input
    setInputValue('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Focus back on textarea
    textareaRef.current?.focus();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to submit (unless Shift is pressed)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    // Shift+Enter for new line (default behavior, no need to handle)
  };

  return (
    <div className="border-t border-slate-200 p-4 bg-white">
      <div className="relative flex items-end gap-2">
        {/* Textarea input */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 px-4 py-3 pr-12',
            'rounded-lg border border-slate-300',
            'focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
            'outline-none resize-none',
            'text-slate-900 placeholder:text-slate-400',
            'max-h-32 overflow-y-auto',
            'transition-colors',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ minHeight: '48px' }}
        />

        {/* Voice input button (placeholder for now) */}
        <button
          type="button"
          className={cn(
            'absolute right-12 bottom-3',
            'text-slate-400 hover:text-slate-600',
            'transition-colors p-1.5 rounded-md hover:bg-slate-100',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
          aria-label="Spraak invoer"
          title="Spraak invoer (komt in E5.S3)"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
          className={cn(
            'absolute right-3 bottom-3',
            'text-brand-600 hover:text-brand-700',
            'transition-all p-1.5 rounded-md',
            'hover:bg-brand-50 active:scale-95',
            (!inputValue.trim() || disabled) && 'opacity-30 cursor-not-allowed'
          )}
          aria-label="Verstuur bericht"
          title="Verstuur (Enter)"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-slate-400 mt-2">
        <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">
          Enter
        </kbd>{' '}
        om te versturen •{' '}
        <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">
          Shift+Enter
        </kbd>{' '}
        voor nieuwe regel
      </p>
    </div>
  );
}
