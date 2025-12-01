'use client'

import { useRef, useState } from 'react'
import { Send } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * Chat input component with textarea, send button, Enter/Shift+Enter support
 *
 * - Enter: send message
 * - Shift+Enter: new line
 * - Auto-resize textarea
 */
export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Stel een vraag...',
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setValue('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)

    // Auto-resize
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div className="border-t border-slate-200 p-3 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5',
            'text-sm placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'max-h-[120px]'
          )}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          className={cn(
            'flex items-center justify-center',
            'w-10 h-10 rounded-xl',
            'transition-all duration-200',
            canSend
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          )}
          aria-label="Verstuur bericht"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
