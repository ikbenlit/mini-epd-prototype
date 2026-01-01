'use client';

/**
 * Chat Panel (v4.0)
 *
 * Chat interface met scrollable message list, auto-scroll, en scroll-lock detection.
 * V2 integratie: ActionChainCard, ClarificationCard, ProcessingIndicator
 *
 * Epic: E2 (Chat Panel & Messages), E3 (UI Components)
 * Story: E2.S3 (ChatPanel component - scrolling), E3 Integration
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowDown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from './chat-message';
import { ChatInput, ChatInputHandle } from './chat-input';
import { ActionChainCard } from './action-chain-card';
import { ClarificationCard } from './clarification-card';
import { ProcessingIndicator } from './processing-indicator';
import { useCortexStore } from '@/stores/cortex-store';
import { sendChatMessage } from '@/lib/cortex/chat-api';
import { parseActionFromResponse, shouldOpenArtifact } from '@/lib/cortex/action-parser';
import { cn } from '@/lib/utils';

export function ChatPanel() {
  // Chat state
  const chatMessages = useCortexStore((s) => s.chatMessages);
  const addChatMessage = useCortexStore((s) => s.addChatMessage);
  const updateLastMessage = useCortexStore((s) => s.updateLastMessage);
  const setStreaming = useCortexStore((s) => s.setStreaming);
  const isStreaming = useCortexStore((s) => s.isStreaming);
  const setPendingAction = useCortexStore((s) => s.setPendingAction);
  const activePatient = useCortexStore((s) => s.activePatient);
  const shift = useCortexStore((s) => s.shift);

  // V2 Chain state
  const activeChain = useCortexStore((s) => s.activeChain);
  const updateActionStatus = useCortexStore((s) => s.updateActionStatus);
  const completeChain = useCortexStore((s) => s.completeChain);

  // V2 Clarification state
  const pendingClarification = useCortexStore((s) => s.pendingClarification);
  const setPendingClarification = useCortexStore((s) => s.setPendingClarification);
  const resolveClarification = useCortexStore((s) => s.resolveClarification);

  // Refs for scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ref for chat input (for keyboard shortcuts)
  const chatInputRef = useRef<ChatInputHandle>(null);

  // Scroll-lock state
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const hasMessages = chatMessages.length > 0;

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
  }, [chatMessages.length, isScrolledUp, hasMessages, scrollToBottom]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    scrollToBottom('auto');
  }, [scrollToBottom]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to focus chat input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        chatInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // V2 Chain action handlers
  const handleConfirmAction = useCallback((actionId: string) => {
    console.log('[ChatPanel] Confirming action:', actionId);
    updateActionStatus(actionId, 'executing');
    // TODO: E5.S2 - Execute the actual action via API
    // For now, simulate success after a short delay
    setTimeout(() => {
      updateActionStatus(actionId, 'success');
    }, 500);
  }, [updateActionStatus]);

  const handleSkipAction = useCallback((actionId: string) => {
    console.log('[ChatPanel] Skipping action:', actionId);
    updateActionStatus(actionId, 'skipped');
  }, [updateActionStatus]);

  const handleRetryAction = useCallback((actionId: string) => {
    console.log('[ChatPanel] Retrying action:', actionId);
    updateActionStatus(actionId, 'pending');
    // Re-trigger confirmation flow
    setTimeout(() => {
      updateActionStatus(actionId, 'confirming');
    }, 100);
  }, [updateActionStatus]);

  const handleDismissChain = useCallback(() => {
    console.log('[ChatPanel] Dismissing chain');
    completeChain();
  }, [completeChain]);

  const handleSelectClarification = useCallback((option: string) => {
    console.log('[ChatPanel] Clarification selected:', option);
    resolveClarification(option);
    // TODO: E5 - Re-process with selected option
  }, [resolveClarification]);

  const handleDismissClarification = useCallback(() => {
    console.log('[ChatPanel] Clarification dismissed');
    setPendingClarification(null);
  }, [setPendingClarification]);

  // Check if we should show multi-intent UI
  const showActionChain = activeChain && activeChain.actions.length > 1;

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
            {chatMessages.map((message) => (
              <ChatMessage key={message.id} message={message} showTimestamp />
            ))}

            {/* V2: Processing indicator while AI is thinking */}
            {isStreaming && (
              <div className="self-start">
                <ProcessingIndicator message="Even nadenken..." />
              </div>
            )}

            {/* V2: Multi-intent action chain */}
            <AnimatePresence mode="wait">
              {showActionChain && (
                <ActionChainCard
                  key={activeChain.id}
                  chain={activeChain}
                  onConfirmAction={handleConfirmAction}
                  onSkipAction={handleSkipAction}
                  onRetryAction={handleRetryAction}
                  onDismissChain={handleDismissChain}
                />
              )}
            </AnimatePresence>

            {/* V2: Clarification card for ambiguous input */}
            <AnimatePresence mode="wait">
              {pendingClarification && (
                <ClarificationCard
                  key="clarification"
                  question={pendingClarification.question}
                  options={pendingClarification.options}
                  originalInput={pendingClarification.originalInput}
                  onSelectOption={handleSelectClarification}
                  onDismiss={handleDismissClarification}
                />
              )}
            </AnimatePresence>

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md text-center text-slate-500">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                Welkom bij Cortex Assistent
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

      {/* Chat input */}
      <ChatInput
        ref={chatInputRef}
        disabled={isStreaming}
        onSend={async (message) => {
          // E3.S1: Test streaming API with mock response
          setStreaming(true);

          // Add empty assistant message that will be filled by streaming
          addChatMessage({
            type: 'assistant',
            content: '',
          });

          let accumulatedContent = '';

          await sendChatMessage(
            message,
            chatMessages,
            {
              activePatient: activePatient ? {
                id: activePatient.id,
                first_name: activePatient.name_given?.[0] || '',
                last_name: activePatient.name_family || '',
              } : null,
              shift,
            },
            (chunk) => {
              // On each chunk, append to accumulated content and update last message
              accumulatedContent += chunk;
              updateLastMessage(accumulatedContent);
            },
            () => {
              // On done - parse action from complete response
              setStreaming(false);

              // E3.S4: Parse action object from AI response
              const parsed = parseActionFromResponse(accumulatedContent);

              if (parsed.action) {
                console.log('[ChatPanel] Action detected:', parsed.action);

                // Update last message with cleaned text content and action
                updateLastMessage(parsed.textContent, parsed.action);

                // Store action in pendingAction for artifact opening (E3.S6)
                if (shouldOpenArtifact(parsed.action.confidence)) {
                  setPendingAction(parsed.action);
                  console.log('[ChatPanel] Pending action set (confidence:', parsed.action.confidence, ')');
                } else {
                  console.log('[ChatPanel] Action confidence too low:', parsed.action.confidence);
                }
              } else {
                console.log('[ChatPanel] No action detected in response');
              }
            },
            (error) => {
              // On error
              setStreaming(false);
              addChatMessage({
                type: 'error',
                content: `Er ging iets mis: ${error}`,
              });
            }
          );
        }}
      />
    </div>
  );
}
