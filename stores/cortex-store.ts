import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Database } from '@/lib/supabase/database.types';

// Import shared types from lib/cortex (DRY - single source of truth)
import {
  getCurrentShift,
  type CortexIntent,
  type ShiftType,
  type ExtractedEntities,
  type CortexContext,
  type IntentChain,
  type IntentAction,
  type NudgeSuggestion,
  type ClarificationRequest,
} from '@/lib/cortex/types';

// Re-export for backward compatibility
export type { CortexIntent, ShiftType };

// Database types
export type Patient = Database['public']['Tables']['patients']['Row'];

// Store-specific types (not in lib/cortex/types.ts)
export type BlockType = Exclude<CortexIntent, 'unknown'> | 'fallback' | 'patient-dashboard';

// Chat entities - simplified version for AI responses (strings, not Dates)
// This differs from ExtractedEntities in lib/cortex/types.ts which uses Date objects
// All properties are optional to match Zod schema flexibility
export interface ChatEntities {
  patientName?: string;
  patientId?: string;
  category?: 'medicatie' | 'adl' | 'gedrag' | 'incident' | 'observatie';
  content?: string;
  query?: string;
  date?: string;
  time?: string;
  dateRange?: {
    start: string;
    end: string;
    label: string;
  };
  datetime?: {
    date?: string;
    time?: string;
  };
  appointmentType?: string;
  location?: string;
  identifier?: string;
  newDatetime?: {
    date?: string;
    time?: string;
  };
}

// Chat types (v3.0)
export type ChatMessageType = 'user' | 'assistant' | 'system' | 'error';

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  timestamp: Date;
  action?: ChatAction;
}

export interface ChatAction {
  intent: CortexIntent;
  entities: ChatEntities;
  confidence: number;
  artifact?: {
    type: BlockType;
    prefill: BlockPrefillData;
  };
}

// Block prefill data - uses ChatEntities (string-based) for UI prefilling
export interface BlockPrefillData extends ChatEntities {
  // Additional prefill data specific to blocks
}

// Artifact type (E4 - Multiple artifacts support)
export interface Artifact {
  id: string;
  type: BlockType;
  prefill: BlockPrefillData;
  title: string;
  createdAt: Date;
}

// Recent action for the Recent Strip
export interface RecentAction {
  id: string;
  intent: CortexIntent;
  label: string;
  timestamp: Date;
  patientName?: string;
}

// Store interface
interface CortexStore {
  // Context
  activePatient: Patient | null;
  shift: ShiftType;

  // Block state
  activeBlock: BlockType | null;
  prefillData: BlockPrefillData;
  isBlockLoading: boolean;

  // Input state
  inputValue: string;
  isVoiceActive: boolean;

  // Recent actions
  recentActions: RecentAction[];

  // Chat state (v3.0)
  chatMessages: ChatMessage[];
  isStreaming: boolean;
  pendingAction: ChatAction | null;

  // Artifact state (E4 - Multiple artifacts support)
  openArtifacts: Artifact[];
  activeArtifactId: string | null;

  // V2 Context state
  context: CortexContext | null;

  // V2 Intent Chain state
  activeChain: IntentChain | null;
  chainHistory: IntentChain[];

  // V2 Nudge Suggestions state
  suggestions: NudgeSuggestion[];

  // V2 Clarification state
  pendingClarification: ClarificationRequest | null;

  // Context actions
  setActivePatient: (patient: Patient | null) => void;
  setShift: (shift: ShiftType) => void;

  // Block actions (legacy - will be replaced by artifact actions)
  openBlock: (type: BlockType, prefill?: BlockPrefillData) => void;
  closeBlock: () => void;
  setBlockLoading: (loading: boolean) => void;

  // Artifact actions (E4.S2)
  openArtifact: (artifact: Omit<Artifact, 'id' | 'createdAt'>) => void;
  closeArtifact: (id: string) => void;
  switchArtifact: (id: string) => void;
  closeAllArtifacts: () => void;

  // Input actions
  setInputValue: (value: string) => void;
  setVoiceActive: (active: boolean) => void;
  clearInput: () => void;

  // Recent actions
  addRecentAction: (action: Omit<RecentAction, 'id' | 'timestamp'>) => void;

  // Chat actions (v3.0)
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string, action?: ChatAction | null) => void;
  clearChat: () => void;
  setStreaming: (streaming: boolean) => void;
  setPendingAction: (action: ChatAction | null) => void;

  // V2 Context actions
  setContext: (context: CortexContext) => void;
  updateContext: (partial: Partial<CortexContext>) => void;

  // V2 Chain actions
  startChain: (chain: IntentChain) => void;
  updateActionStatus: (
    actionId: string,
    status: IntentAction['status'],
    error?: IntentAction['error']
  ) => void;
  completeChain: () => void;

  // V2 Nudge actions
  addSuggestion: (suggestion: NudgeSuggestion) => void;
  acceptSuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;

  // V2 Clarification actions
  setPendingClarification: (clarification: ClarificationRequest | null) => void;
  resolveClarification: (selectedOption: string) => void;

  // Reset
  reset: () => void;
}

// Initial state
const initialState = {
  activePatient: null,
  shift: getCurrentShift(),
  activeBlock: null,
  prefillData: {},
  isBlockLoading: false,
  inputValue: '',
  isVoiceActive: false,
  recentActions: [] as RecentAction[],
  // Chat state (v3.0)
  chatMessages: [] as ChatMessage[],
  isStreaming: false,
  pendingAction: null as ChatAction | null,
  // Artifact state (E4)
  openArtifacts: [] as Artifact[],
  activeArtifactId: null as string | null,
  // V2 state
  context: null as CortexContext | null,
  activeChain: null as IntentChain | null,
  chainHistory: [] as IntentChain[],
  suggestions: [] as NudgeSuggestion[],
  pendingClarification: null as ClarificationRequest | null,
};

// Create the store
export const useCortexStore = create<CortexStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Context actions
      setActivePatient: (patient) => set({ activePatient: patient }, false, 'setActivePatient'),

      setShift: (shift) => set({ shift }, false, 'setShift'),

      // Block actions
      openBlock: (type, prefill = {}) => {
        set(
          {
            activeBlock: type,
            prefillData: prefill,
            isBlockLoading: false,
          },
          false,
          'openBlock'
        );
      },

      closeBlock: () => {
        set(
          {
            activeBlock: null,
            prefillData: {},
            isBlockLoading: false,
          },
          false,
          'closeBlock'
        );
      },

      setBlockLoading: (loading) => set({ isBlockLoading: loading }, false, 'setBlockLoading'),

      // Input actions
      setInputValue: (value) => set({ inputValue: value }, false, 'setInputValue'),

      setVoiceActive: (active) => set({ isVoiceActive: active }, false, 'setVoiceActive'),

      clearInput: () => set({ inputValue: '' }, false, 'clearInput'),

      // Recent actions
      addRecentAction: (action) => {
        const newAction: RecentAction = {
          ...action,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        set(
          (state) => ({
            recentActions: [newAction, ...state.recentActions].slice(0, 5),
          }),
          false,
          'addRecentAction'
        );
      },

      // Chat actions (v3.0)
      addChatMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        set(
          (state) => ({
            chatMessages: [...state.chatMessages, newMessage],
          }),
          false,
          'addChatMessage'
        );
      },

      updateLastMessage: (content, action?) => {
        set(
          (state) => {
            const messages = [...state.chatMessages];
            if (messages.length > 0) {
              const updatedMessage: ChatMessage = {
                ...messages[messages.length - 1],
                content,
              };

              // Only add action if it's not null/undefined
              if (action !== undefined && action !== null) {
                updatedMessage.action = action;
              }

              messages[messages.length - 1] = updatedMessage;
            }
            return { chatMessages: messages };
          },
          false,
          'updateLastMessage'
        );
      },

      clearChat: () => {
        set(
          {
            chatMessages: [],
            isStreaming: false,
            pendingAction: null,
          },
          false,
          'clearChat'
        );
      },

      setStreaming: (streaming) => set({ isStreaming: streaming }, false, 'setStreaming'),

      setPendingAction: (action) => set({ pendingAction: action }, false, 'setPendingAction'),

      // Artifact actions (E4.S2)
      openArtifact: (artifactData) => {
        set(
          (state) => {
            // Create artifact with unique ID and timestamp
            const newArtifact: Artifact = {
              ...artifactData,
              id: crypto.randomUUID(),
              createdAt: new Date(),
            };

            let artifacts = [...state.openArtifacts];

            // Max 3 artifacts - remove oldest if at capacity
            if (artifacts.length >= 3) {
              console.log('[Store] Max 3 artifacts reached, removing oldest');
              artifacts = artifacts.slice(1); // Remove first (oldest)
            }

            console.log('[Store] Opening artifact:', newArtifact.type, newArtifact.title);

            return {
              openArtifacts: [...artifacts, newArtifact],
              activeArtifactId: newArtifact.id,
            };
          },
          false,
          'openArtifact'
        );
      },

      closeArtifact: (id) => {
        set(
          (state) => {
            const artifacts = state.openArtifacts.filter((a) => a.id !== id);

            // If closing active artifact, switch to last remaining artifact
            let newActiveId = state.activeArtifactId;
            if (state.activeArtifactId === id) {
              newActiveId = artifacts.length > 0 ? artifacts[artifacts.length - 1].id : null;
            }

            console.log('[Store] Closing artifact:', id, 'New active:', newActiveId);

            return {
              openArtifacts: artifacts,
              activeArtifactId: newActiveId,
            };
          },
          false,
          'closeArtifact'
        );
      },

      switchArtifact: (id) => {
        set(
          (state) => {
            // Verify artifact exists
            const exists = state.openArtifacts.some((a) => a.id === id);
            if (!exists) {
              console.warn('[Store] Cannot switch to artifact:', id, '(not found)');
              return state;
            }

            console.log('[Store] Switching to artifact:', id);
            return { activeArtifactId: id };
          },
          false,
          'switchArtifact'
        );
      },

      closeAllArtifacts: () => {
        set(
          {
            openArtifacts: [],
            activeArtifactId: null,
          },
          false,
          'closeAllArtifacts'
        );
      },

      // V2 Context actions
      setContext: (context) => set({ context }, false, 'setContext'),

      updateContext: (partial) =>
        set(
          (state) => ({
            context: state.context ? { ...state.context, ...partial } : null,
          }),
          false,
          'updateContext'
        ),

      // V2 Chain actions
      startChain: (chain) =>
        set(
          {
            activeChain: chain,
          },
          false,
          'startChain'
        ),

      updateActionStatus: (actionId, status, error) =>
        set(
          (state) => {
            if (!state.activeChain) return state;

            const actions = state.activeChain.actions.map((action) =>
              action.id === actionId
                ? {
                    ...action,
                    status,
                    error,
                    ...(status === 'executing' ? { startedAt: new Date() } : {}),
                    ...(status === 'success' || status === 'failed'
                      ? { completedAt: new Date() }
                      : {}),
                  }
                : action
            );

            return {
              activeChain: {
                ...state.activeChain,
                actions,
              },
            };
          },
          false,
          'updateActionStatus'
        ),

      completeChain: () =>
        set(
          (state) => {
            if (!state.activeChain) return state;

            // Move to history
            const completedChain: IntentChain = {
              ...state.activeChain,
              status: 'completed',
            };

            return {
              activeChain: null,
              chainHistory: [completedChain, ...state.chainHistory].slice(0, 10), // Keep last 10
            };
          },
          false,
          'completeChain'
        ),

      // V2 Nudge actions
      addSuggestion: (suggestion) =>
        set(
          (state) => ({
            suggestions: [...state.suggestions, suggestion],
          }),
          false,
          'addSuggestion'
        ),

      acceptSuggestion: (suggestionId) =>
        set(
          (state) => ({
            suggestions: state.suggestions.map((s) =>
              s.id === suggestionId ? { ...s, status: 'accepted' as const } : s
            ),
          }),
          false,
          'acceptSuggestion'
        ),

      dismissSuggestion: (suggestionId) =>
        set(
          (state) => ({
            suggestions: state.suggestions.filter((s) => s.id !== suggestionId),
          }),
          false,
          'dismissSuggestion'
        ),

      // V2 Clarification actions
      setPendingClarification: (clarification) =>
        set({ pendingClarification: clarification }, false, 'setPendingClarification'),

      resolveClarification: (selectedOption) =>
        set(
          (state) => {
            console.log('[Store] Clarification resolved:', selectedOption);
            return { pendingClarification: null };
          },
          false,
          'resolveClarification'
        ),

      // Reset
      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'cortex-store',
    }
  )
);
