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

export type BlockType = Exclude<SwiftIntent, 'unknown'>;

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

      // Reset
      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'swift-store',
    }
  )
);
