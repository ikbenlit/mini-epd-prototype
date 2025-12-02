'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SuggestionCategory {
  id: string
  label: string
  icon: string
  questions: string[]
}

/**
 * Documentation suggestions - shown when not in a patient dossier
 */
const DOC_SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'clienten',
    label: 'Cliënten & Dossiers',
    icon: '👤',
    questions: [
      'Hoe maak ik een nieuwe cliënt aan?',
      'Hoe zoek ik een bestaande cliënt?',
      'Hoe open ik een cliëntdossier?',
    ],
  },
  {
    id: 'intake',
    label: 'Intake & Screening',
    icon: '📋',
    questions: [
      'Hoe start ik een intake?',
      'Waar vind ik de screeningresultaten?',
      'Hoe voeg ik notities toe aan een intake?',
    ],
  },
  {
    id: 'spraak',
    label: 'Spraak & Rapportage',
    icon: '🎤',
    questions: [
      'Hoe werkt de spraakherkenning?',
      'Waarom werkt mijn microfoon niet?',
      'Hoe dicteer ik een rapportage?',
    ],
  },
]

/**
 * Client suggestions - shown when in a patient dossier
 */
const CLIENT_SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'rapportages',
    label: 'Rapportages',
    icon: '📝',
    questions: [
      'Geef een samenvatting van de rapportages',
      'Wat is er de laatste tijd genoteerd?',
      'Zijn er behandeladviezen?',
    ],
  },
  {
    id: 'intake',
    label: 'Intake & Behandeling',
    icon: '🏥',
    questions: [
      'Wat is het behandeladvies?',
      'Op welke afdeling loopt de intake?',
      'Is de intake afgerond?',
    ],
  },
  {
    id: 'screening',
    label: 'Screening',
    icon: '📋',
    questions: [
      'Wat was de hulpvraag?',
      'Wat is de screeningbeslissing?',
      'Is de cliënt geschikt bevonden?',
    ],
  },
]

interface ChatSuggestionsProps {
  onSelect: (question: string) => void
  disabled?: boolean
  mode?: 'client' | 'documentation'
}

/**
 * Two-step suggestion selector:
 * 1. Show categories
 * 2. After selecting category, show questions
 *
 * Supports two modes:
 * - 'documentation': Questions about how to use the EPD system
 * - 'client': Questions about the active patient (rapportages, intake, screening)
 */
export function ChatSuggestions({ onSelect, disabled = false, mode = 'documentation' }: ChatSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<SuggestionCategory | null>(null)

  // Select the appropriate categories based on mode
  const categories = mode === 'client' ? CLIENT_SUGGESTION_CATEGORIES : DOC_SUGGESTION_CATEGORIES

  const handleQuestionSelect = (question: string) => {
    onSelect(question)
    setSelectedCategory(null)
  }

  // Show questions for selected category
  if (selectedCategory) {
    return (
      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-2 transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          Terug
        </button>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm">{selectedCategory.icon}</span>
          <span className="text-xs font-medium text-slate-700">{selectedCategory.label}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {selectedCategory.questions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => handleQuestionSelect(question)}
              disabled={disabled}
              className={cn(
                'text-xs px-3 py-2 rounded-lg',
                'bg-slate-100 text-slate-700',
                'hover:bg-amber-100 hover:text-amber-800',
                'transition-colors duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'text-left'
              )}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Show category selection
  return (
    <div className="px-4 pb-3">
      <p className="text-xs text-slate-500 mb-2">
        {mode === 'client' ? 'Vragen over deze cliënt:' : 'Kies een onderwerp:'}
      </p>
      <div className="flex flex-col gap-1.5">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              'bg-slate-100 text-slate-700',
              'hover:bg-amber-100 hover:text-amber-800',
              'transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'text-left text-sm'
            )}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
