'use client';

/**
 * usePatientSearch Hook
 *
 * Reusable hook for patient search with debouncing.
 * Extracted from ZoekenBlock for DRY compliance.
 *
 * Epic: E0.S1 (Patient Selectie - Refactor)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { safeFetch, getErrorInfo } from '@/lib/cortex/error-handler';

export interface PatientSearchResult {
  id: string;
  name: string;
  birthDate: string;
  identifier_bsn?: string;
  identifier_client_number?: string;
  matchScore: number;
}

interface UsePatientSearchOptions {
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Minimum query length to trigger search (default: 2) */
  minQueryLength?: number;
  /** Maximum number of results (default: 10) */
  limit?: number;
  /** Initial query value */
  initialQuery?: string;
}

interface UsePatientSearchReturn {
  /** Current search query */
  query: string;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Search results */
  results: PatientSearchResult[];
  /** Loading state */
  isSearching: boolean;
  /** Manually trigger search (bypasses debounce) */
  searchPatients: (query: string) => Promise<void>;
  /** Clear results */
  clearResults: () => void;
}

export function usePatientSearch(
  options: UsePatientSearchOptions = {}
): UsePatientSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    limit = 10,
    initialQuery = '',
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const searchPatients = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setResults([]);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsSearching(true);
      try {
        const response = await safeFetch(
          `/api/patients/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}`,
          { signal: abortControllerRef.current.signal },
          { operation: 'Patient zoeken' }
        );
        const data = await response.json();
        setResults(data.patients || []);
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to search patients:', error);
        const errorInfo = getErrorInfo(error, { operation: 'Patient zoeken' });
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.description,
        });
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [toast, minQueryLength, limit]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length >= minQueryLength) {
      timeoutRef.current = setTimeout(() => {
        searchPatients(query);
      }, debounceMs);
    } else {
      setResults([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs, minQueryLength, searchPatients]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    searchPatients,
    clearResults,
  };
}
