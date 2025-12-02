'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar, Link2, Link2Off, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPatientEncounters } from '@/app/epd/agenda/actions';

interface Encounter {
  id: string;
  period_start: string;
  period_end: string | null;
  type_code: string;
  type_display: string;
  status: string;
  notes: string | null;
}

interface EncounterSelectorProps {
  patientId: string;
  value?: string | null;
  onChange: (encounterId: string | null) => void;
  disabled?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  intake: 'Intake',
  behandeling: 'Behandeling',
  'follow-up': 'Follow-up',
  telefonisch: 'Telefonisch',
  huisbezoek: 'Huisbezoek',
  online: 'Online consult',
  crisis: 'Crisis',
  overig: 'Overig',
};

export function EncounterSelector({
  patientId,
  value,
  onChange,
  disabled = false,
}: EncounterSelectorProps) {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load encounters when dropdown opens
  useEffect(() => {
    if (isOpen && !hasLoaded) {
      setIsLoading(true);
      getPatientEncounters(patientId)
        .then((data) => {
          setEncounters(data);
          setHasLoaded(true);
        })
        .catch((error) => {
          console.error('Failed to load encounters:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, hasLoaded, patientId]);

  const selectedEncounter = encounters.find((e) => e.id === value);

  const formatEncounterDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "d MMM yyyy 'om' HH:mm", { locale: nl });
  };

  const handleSelect = (encounterId: string | null) => {
    onChange(encounterId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2 text-left',
          'border rounded-lg text-sm transition-colors',
          disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-white hover:bg-slate-50',
          value
            ? 'border-teal-300 bg-teal-50'
            : 'border-slate-200'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {value ? (
            <Link2 className="h-4 w-4 text-teal-600 shrink-0" />
          ) : (
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          )}
          <span className={cn('truncate', value ? 'text-teal-700' : 'text-slate-500')}>
            {selectedEncounter
              ? `${TYPE_LABELS[selectedEncounter.type_code] || selectedEncounter.type_display} - ${formatEncounterDate(selectedEncounter.period_start)}`
              : 'Koppel aan afspraak...'}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform',
            isOpen && 'rotate-180',
            value ? 'text-teal-600' : 'text-slate-400'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Afspraken laden...
              </div>
            ) : encounters.length === 0 ? (
              <div className="py-4 px-3 text-sm text-slate-500 text-center">
                Geen afspraken gevonden
              </div>
            ) : (
              <>
                {/* Option to unlink */}
                {value && (
                  <button
                    type="button"
                    onClick={() => handleSelect(null)}
                    className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 border-b border-slate-100"
                  >
                    <Link2Off className="h-4 w-4" />
                    <span className="text-sm">Koppeling verwijderen</span>
                  </button>
                )}

                {/* Encounters list */}
                {encounters.map((encounter) => {
                  const isSelected = encounter.id === value;
                  return (
                    <button
                      key={encounter.id}
                      type="button"
                      onClick={() => handleSelect(encounter.id)}
                      className={cn(
                        'w-full px-3 py-2 text-left hover:bg-slate-50',
                        isSelected && 'bg-teal-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isSelected ? 'text-teal-700' : 'text-slate-900'
                          )}
                        >
                          {TYPE_LABELS[encounter.type_code] || encounter.type_display}
                        </span>
                        <span
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded',
                            encounter.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : encounter.status === 'planned'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {encounter.status === 'completed'
                            ? 'Afgerond'
                            : encounter.status === 'planned'
                            ? 'Gepland'
                            : encounter.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {formatEncounterDate(encounter.period_start)}
                      </div>
                      {encounter.notes && (
                        <div className="text-xs text-slate-400 mt-0.5 truncate">
                          {encounter.notes}
                        </div>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
