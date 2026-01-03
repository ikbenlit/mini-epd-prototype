'use client';

/**
 * Chat Empty State Component
 *
 * Interactive grid of cards shown when the chat has no messages.
 * Each card represents a main capability category.
 */

import { motion } from 'framer-motion';
import { FileText, Calendar, Search, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatEmptyStateProps {
  /** Callback when a quick action card is clicked */
  onSelectAction: (text: string) => void;
  /** Optional active patient name */
  activePatientName?: string;
}

const quickActions = [
  {
    id: 'notitie',
    icon: FileText,
    title: 'Dagnotitie maken',
    description: 'Registreer observaties, medicatie of incidenten',
    example: 'Notitie [naam] medicatie gegeven',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    hoverColor: 'hover:bg-blue-100 hover:border-blue-300',
  },
  {
    id: 'agenda',
    icon: Calendar,
    title: 'Agenda bekijken',
    description: 'Bekijk of plan afspraken',
    example: 'Agenda vandaag',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    hoverColor: 'hover:bg-emerald-100 hover:border-emerald-300',
  },
  {
    id: 'zoeken',
    icon: Search,
    title: 'Patiënt zoeken',
    description: 'Zoek in dossiers en patiëntgegevens',
    example: 'Zoek [naam]',
    color: 'bg-violet-50 text-violet-600 border-violet-200',
    hoverColor: 'hover:bg-violet-100 hover:border-violet-300',
  },
  {
    id: 'overdracht',
    icon: ClipboardList,
    title: 'Overdracht maken',
    description: 'Genereer een samenvatting voor de volgende dienst',
    example: 'Overdracht',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    hoverColor: 'hover:bg-amber-100 hover:border-amber-300',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
};

export function ChatEmptyState({ onSelectAction, activePatientName }: ChatEmptyStateProps) {
  const handleCardClick = (example: string) => {
    // Replace [naam] with patient name if available
    const text = activePatientName
      ? example.replace(/\[naam\]/g, activePatientName)
      : example;
    onSelectAction(text);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="text-4xl mb-3">💬</div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Welkom bij Cortex Assistent
        </h2>
        <p className="text-sm text-slate-500 max-w-md">
          Typ of spreek wat je wilt doen. Klik op een kaart om snel te starten.
        </p>
      </motion.div>

      {/* Action cards grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg"
      >
        {quickActions.map((action) => {
          const Icon = action.icon;
          const displayExample = activePatientName
            ? action.example.replace(/\[naam\]/g, activePatientName)
            : action.example;

          return (
            <motion.button
              key={action.id}
              variants={cardVariants}
              onClick={() => handleCardClick(action.example)}
              className={cn(
                'group relative text-left p-4 rounded-xl border-2',
                'transition-all duration-200',
                'active:scale-[0.98]',
                action.color,
                action.hoverColor
              )}
            >
              {/* Icon */}
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg bg-white/60',
                    'group-hover:bg-white group-hover:shadow-sm',
                    'transition-all duration-200'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-800 text-sm mb-0.5">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">
                    {action.description}
                  </p>
                  <p className="text-[11px] text-slate-400 italic truncate">
                    &ldquo;{displayExample}&rdquo;
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Keyboard hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-slate-400 mt-6"
      >
        Tip: Gebruik{' '}
        <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">
          ⌘K
        </kbd>{' '}
        om direct te beginnen met typen
      </motion.p>
    </div>
  );
}

