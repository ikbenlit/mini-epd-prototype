'use client';

/**
 * Command Input
 *
 * Bottom input bar for text and voice commands.
 */

import { useSwiftStore } from '@/stores/swift-store';
import { Mic } from 'lucide-react';

export function CommandInput() {
  const { inputValue, setInputValue, isVoiceActive, setVoiceActive } = useSwiftStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Process intent (E2)
    console.log('Submit:', inputValue);
  };

  return (
    <footer className="h-16 border-t border-slate-700 flex items-center px-4 shrink-0">
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Typ je intentie... (bijv. 'notitie jan medicatie')"
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        <button
          type="button"
          onClick={() => setVoiceActive(!isVoiceActive)}
          className={`p-2 rounded-lg transition-colors ${
            isVoiceActive
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
          title="Voice input"
        >
          <Mic size={20} />
        </button>
      </form>
    </footer>
  );
}
