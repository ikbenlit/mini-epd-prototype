'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import icd10CodesData from '@/lib/data/icd10-ggz-codes.json';
import {
  type ICD10Code,
  type FlatICD10Code,
  flattenICD10Codes,
  searchICD10Codes,
  getFrequentCodes,
  type ICD10CodeList,
} from '@/lib/types/icd10';

interface ICD10ComboboxProps {
  value: string;
  onSelect: (code: ICD10Code) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ICD10Combobox({
  value,
  onSelect,
  placeholder = 'Zoek ICD-10 code...',
  disabled = false,
}: ICD10ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten ICD-10 codes once
  const flatCodes = useMemo(() => {
    return flattenICD10Codes(icd10CodesData as ICD10CodeList);
  }, []);

  // Debounce search query (200ms)
  const debouncedQuery = useDebounce(searchQuery, 200);

  // Get search results or frequent codes
  const displayCodes = useMemo(() => {
    if (debouncedQuery.trim()) {
      return searchICD10Codes(flatCodes, debouncedQuery, 8);
    } else {
      return getFrequentCodes(flatCodes, icd10CodesData.frequentCodes).slice(0, 5);
    }
  }, [debouncedQuery, flatCodes]);

  // Find selected code object
  const selectedCode = useMemo(() => {
    if (!value) return null;
    return flatCodes.find((code) => code.code === value) || null;
  }, [value, flatCodes]);

  const handleSelect = (code: FlatICD10Code) => {
    onSelect({
      code: code.code,
      display: code.display,
      keywords: code.keywords,
    });
    setOpen(false);
    setSearchQuery('');
  };

  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={open ? searchQuery : (selectedCode ? `${selectedCode.code} — ${selectedCode.display}` : '')}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            disabled={disabled}
            className="pl-9 pr-8"
          />
          <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto">
          {displayCodes.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {debouncedQuery.trim()
                ? 'Geen codes gevonden.'
                : 'Begin met typen om te zoeken...'}
            </div>
          ) : (
            <div className="p-1">
              {!debouncedQuery.trim() && (
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Veelgebruikte codes
                </div>
              )}
              {debouncedQuery.trim() && (
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Zoekresultaten
                </div>
              )}
              {displayCodes.map((code) => (
                <button
                  key={code.code}
                  type="button"
                  onClick={() => handleSelect(code)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground',
                    selectedCode?.code === code.code && 'bg-accent'
                  )}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 shrink-0',
                      selectedCode?.code === code.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{code.code}</span>
                    <span className="text-xs text-muted-foreground">
                      {code.display}
                    </span>
                    {debouncedQuery.trim() && (
                      <span className="text-xs text-muted-foreground italic">
                        {code.category}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
