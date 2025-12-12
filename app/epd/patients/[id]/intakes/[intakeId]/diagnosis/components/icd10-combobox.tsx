'use client';

import { useState, useEffect, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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

  // Flatten ICD-10 codes once
  const flatCodes = useMemo(() => {
    return flattenICD10Codes(icd10CodesData as ICD10CodeList);
  }, []);

  // Debounce search query (200ms)
  const debouncedQuery = useDebounce(searchQuery, 200);

  // Get search results or frequent codes
  const displayCodes = useMemo(() => {
    if (debouncedQuery.trim()) {
      // Search mode: max 8 results
      return searchICD10Codes(flatCodes, debouncedQuery, 8);
    } else {
      // Empty field: show top 5 frequent codes
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedCode ? (
            <span className="truncate">
              {selectedCode.code} — {selectedCode.display}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Zoek op code of beschrijving..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {debouncedQuery.trim()
                ? 'Geen codes gevonden.'
                : 'Begin met typen om te zoeken...'}
            </CommandEmpty>
            {!debouncedQuery.trim() && (
              <CommandGroup heading="Veelgebruikte codes">
                {displayCodes.map((code) => (
                  <CommandItem
                    key={code.code}
                    value={code.code}
                    onSelect={() => handleSelect(code)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCode?.code === code.code
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{code.code}</span>
                      <span className="text-xs text-muted-foreground">
                        {code.display}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {debouncedQuery.trim() && (
              <CommandGroup heading="Zoekresultaten">
                {displayCodes.map((code) => (
                  <CommandItem
                    key={code.code}
                    value={code.code}
                    onSelect={() => handleSelect(code)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCode?.code === code.code
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{code.code}</span>
                      <span className="text-xs text-muted-foreground">
                        {code.display}
                      </span>
                      <span className="text-xs text-muted-foreground italic">
                        {code.category}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

