'use client';

/**
 * Chat Panel (v3.0)
 *
 * Chat interface met scrollable message list, auto-scroll, en scroll-lock detection.
 *
 * Epic: E2 (Chat Panel & Messages)
 * Story: E2.S3 (ChatPanel component - scrolling)
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowDown } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { useSwiftStore } from '@/stores/swift-store';
import { cn } from '@/lib/utils';

export function ChatPanel() {
  const chatMessages = useSwiftStore((s) => s.chatMessages);

  // Refs for scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll-lock state
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Demo messages for testing scrolling behavior (will be removed when chat input is implemented)
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
      content: 'Hoi, ik wil een notitie maken',
      timestamp: new Date(),
    },
    {
      id: '3',
      type: 'assistant' as const,
      content: 'Natuurlijk! Voor welke patiënt wil je een notitie maken?',
      timestamp: new Date(),
    },
    {
      id: '4',
      type: 'user' as const,
      content: 'Notitie voor Jan: medicatie gegeven om 14:00',
      timestamp: new Date(),
    },
    {
      id: '5',
      type: 'assistant' as const,
      content: 'Ik begrijp dat je een notitie wilt maken voor Jan over medicatie. Ik open een dagnotitie voor je waarin je dit kunt vastleggen.',
      timestamp: new Date(),
    },
    {
      id: '6',
      type: 'user' as const,
      content: 'Zoek Marie van den Berg',
      timestamp: new Date(),
    },
    {
      id: '7',
      type: 'assistant' as const,
      content: 'Ik zoek Marie van den Berg voor je op in het systeem.',
      timestamp: new Date(),
    },
    {
      id: '8',
      type: 'user' as const,
      content: 'Maak overdracht voor deze dienst',
      timestamp: new Date(),
    },
    {
      id: '9',
      type: 'assistant' as const,
      content: 'Ik maak een overdracht voor je. Welke dienst bedoel je precies? Nacht, ochtend, middag of avond?',
      timestamp: new Date(),
    },
    {
      id: '10',
      type: 'user' as const,
      content: 'Avonddienst',
      timestamp: new Date(),
    },
    {
      id: '11',
      type: 'assistant' as const,
      content: 'Prima! Ik open een overdracht voor de avonddienst. Je kunt hier alle relevante informatie voor de overdracht invullen.',
      timestamp: new Date(),
    },
    {
      id: '12',
      type: 'system' as const,
      content: 'Dit is een lange conversatie om scrolling te testen',
      timestamp: new Date(),
    },
  ] : chatMessages;

  const hasMessages = demoMessages.length > 0;

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setIsScrolledUp(false);
    setShowScrollButton(false);
  }, []);

  // Detect scroll position (scroll-lock detection)
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold

    setIsScrolledUp(!isNearBottom);

    // Show scroll button only if scrolled up AND there are messages
    setShowScrollButton(!isNearBottom && hasMessages);
  }, [hasMessages]);

  // Auto-scroll to latest message when new message arrives (unless user scrolled up)
  useEffect(() => {
    if (!isScrolledUp && hasMessages) {
      scrollToBottom('smooth');
    }
  }, [demoMessages.length, isScrolledUp, hasMessages, scrollToBottom]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    scrollToBottom('auto');
  }, [scrollToBottom]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat messages area - scrollable */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 relative"
      >
        {hasMessages ? (
          <div className="flex flex-col space-y-3">
            {demoMessages.map((message) => (
              <ChatMessage key={message.id} message={message} showTimestamp />
            ))}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
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

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className={cn(
              'absolute bottom-4 right-4 z-10',
              'bg-white border border-slate-300 rounded-full p-2',
              'shadow-lg hover:shadow-xl',
              'transition-all duration-200',
              'hover:bg-slate-50 active:scale-95',
              'flex items-center gap-2 text-sm text-slate-700 font-medium px-3 py-2'
            )}
            aria-label="Scroll naar laatste bericht"
          >
            <ArrowDown className="w-4 h-4" />
            <span>Scroll naar beneden</span>
          </button>
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
          E2.S3 in progress: Auto-scroll en scroll-lock werkend ✓
        </p>
      </div>
    </div>
  );
}
