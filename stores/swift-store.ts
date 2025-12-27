import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Database } from '@/lib/supabase/database.types';
import type { VerpleegkundigCategory } from '@/lib/types/report';

// Database types
export type Patient = Database['public']['Tables']['patients']['Row'];

// Swift-specific types
export type ShiftType = 'nacht' | 'ochtend' | 'middag' | 'avond';

export type SwiftIntent =
  | 'dagnotitie'
  | 'zoeken'
  | 'overdracht'
  | 'unknown';

export type BlockType = Exclude<SwiftIntent, 'unknown'> | 'fallback';

// Chat types (v3.0)
export type ChatMessageType = 'user' | 'assistant' | 'system' | 'error';

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  timestamp: Date;
  action?: ChatAction; // Optional action attached to assistant messages
}

export interface ChatAction {
  intent: SwiftIntent;
  entities: ExtractedEntities;
  confidence: number;
  artifact?: {
    type: BlockType;
    prefill: BlockPrefillData;
  };
}

// Extracted entities from user input
export interface ExtractedEntities {
  patientName?: string;
  patientId?: string;
  category?: VerpleegkundigCategory;
  content?: string;
}

// Block prefill data
export interface BlockPrefillData extends ExtractedEntities {
  // Additional prefill data specific to blocks
}

// Recent action for the Recent Strip
export interface RecentAction {
  id: string;
  intent: SwiftIntent;
  label: string;
  timestamp: Date;
  patientName?: string;
}

// Store interface
interface SwiftStore {
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

  // Context actions
  setActivePatient: (patient: Patient | null) => void;
  setShift: (shift: ShiftType) => void;

  // Block actions
  openBlock: (type: BlockType, prefill?: BlockPrefillData) => void;
  closeBlock: () => void;
  setBlockLoading: (loading: boolean) => void;

  // Input actions
  setInputValue: (value: string) => void;
  setVoiceActive: (active: boolean) => void;
  clearInput: () => void;

  // Recent actions
  addRecentAction: (action: Omit<RecentAction, 'id' | 'timestamp'>) => void;

  // Chat actions (v3.0)
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  clearChat: () => void;
  setStreaming: (streaming: boolean) => void;
  setPendingAction: (action: ChatAction | null) => void;

  // Reset
  reset: () => void;
}

// Helper to calculate current shift based on time
function getCurrentShift(): ShiftType {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 7) return 'nacht';
  if (hour >= 7 && hour < 12) return 'ochtend';
  if (hour >= 12 && hour < 17) return 'middag';
  return 'avond';
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
  recentActions: [],
  // Chat state (v3.0)
  chatMessages: [],
  isStreaming: false,
  pendingAction: null,
};

// Create the store
export const useSwiftStore = create<SwiftStore>()(
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

      updateLastMessage: (content) => {
        set(
          (state) => {
            const messages = [...state.chatMessages];
            if (messages.length > 0) {
              messages[messages.length - 1] = {
                ...messages[messages.length - 1],
                content,
              };
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

      // Reset
      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'swift-store',
    }
  )
);
