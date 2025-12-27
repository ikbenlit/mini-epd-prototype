'use client';

/**
 * Chat Panel (v3.0)
 *
 * Chat interface met message list en input.
 * Toont chat messages met verschillende types (user, assistant, system, error).
 *
 * Epic: E2 (Chat Panel & Messages)
 * Story: E2.S2 (ChatMessage component) - testing
 */

import { ChatMessage } from './chat-message';
import { useSwiftStore } from '@/stores/swift-store';

export function ChatPanel() {
  const chatMessages = useSwiftStore((s) => s.chatMessages);

  // Demo messages for testing E2.S2 (will be removed in E2.S3)
  const demoMessages = chatMessages.length === 0 ? [
    {
      id: '1',
      type: 'system' as const,
      content: 'Welkom bij Swift Medical Scribe v3.0',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'user' as const,
      content: 'Notitie voor Jan: medicatie gegeven om 14:00',
      timestamp: new Date(),
    },
    {
      id: '3',
      type: 'assistant' as const,
      content: 'Ik begrijp dat je een notitie wilt maken voor Jan over medicatie. Ik open een dagnotitie voor je waarin je dit kunt vastleggen.',
      timestamp: new Date(),
    },
    {
      id: '4',
      type: 'error' as const,
      content: 'Er ging iets mis met de verbinding. Probeer het opnieuw.',
      timestamp: new Date(),
    },
  ] : chatMessages;

  const hasMessages = demoMessages.length > 0;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat messages area */}
      <div className="flex-1 overflow-auto p-6">
        {hasMessages ? (
          <div className="flex flex-col space-y-3">
            {demoMessages.map((message) => (
              <ChatMessage key={message.id} message={message} showTimestamp />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md text-center text-slate-500">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                Welkom bij Swift Medical Scribe
              </h3>
              <p className="text-sm mb-4">
                Typ of spreek wat je wilt doen...
              </p>
              <div className="text-left text-sm space-y-1 bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-slate-700 mb-2">Voorbeelden:</p>
                <p>• &ldquo;Notitie voor Jan: medicatie gegeven&rdquo;</p>
                <p>• &ldquo;Zoek Marie van den Berg&rdquo;</p>
                <p>• &ldquo;Maak overdracht voor deze dienst&rdquo;</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat input - placeholder */}
      <div className="border-t border-slate-200 p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Typ of spreek wat je wilt doen..."
            className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 outline-none text-slate-900 placeholder:text-slate-400"
            disabled
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            disabled
          >
            🎤
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          E2.S2 compleet: ChatMessage component werkend ✓
        </p>
      </div>
    </div>
  );
}
