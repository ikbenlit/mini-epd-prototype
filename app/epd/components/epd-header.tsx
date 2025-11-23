"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getPatient } from '../patients/actions';
import type { FHIRPatient } from '@/lib/fhir';

interface EPDHeaderProps {
  className?: string;
}

export function EPDHeader({ className = "" }: EPDHeaderProps) {
  const pathname = usePathname();
  const [selectedPatient, setSelectedPatient] = useState<FHIRPatient | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Context detection: Level 2 if URL contains /patients/[id]
  const isPatientContext = pathname.match(/\/epd\/patients\/[^\/]+/);
  const patientId = isPatientContext ? pathname.split('/')[3] : null;

  useEffect(() => {
    async function fetchPatient() {
      if (!patientId) {
        setSelectedPatient(null);
        return;
      }

      // Don't re-fetch if we already have the correct patient
      if (selectedPatient?.id === patientId) return;

      setIsLoading(true);
      try {
        const patient = await getPatient(patientId);
        if (patient) {
          setSelectedPatient(patient);
        }
      } catch (error) {
        console.error('Failed to fetch patient for header:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPatient();
  }, [patientId, selectedPatient?.id]);

  return (
    <header className={`h-[60px] bg-white border-b border-slate-200 flex items-center px-6 ${className}`}>
      {/* Left: Logo */}
      <div className="flex items-center">
        <span className="text-base font-medium text-slate-800">Mini-ECD</span>
      </div>

      {/* Center: Patient Selector (only in Level 2) */}
      <div className="flex-1 flex justify-center">
        {(selectedPatient || isLoading) && patientId && (
          <button className="flex flex-col items-center px-4 py-1 hover:bg-slate-50 rounded-md transition-colors group">
            {isLoading ? (
              <div className="h-8 w-32 bg-slate-100 animate-pulse rounded" />
            ) : selectedPatient ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-slate-900">
                    {selectedPatient.name?.[0]?.given?.join(' ') || ''} {selectedPatient.name?.[0]?.family || ''}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <span className="text-xs text-slate-500">
                  ID: {selectedPatient.id?.substring(0, 8) || ''}... | Geb: {selectedPatient.birthDate ? new Date(selectedPatient.birthDate).toLocaleDateString('nl-NL') : ''}
                </span>
              </>
            ) : null}
          </button>
        )}
      </div>

      {/* Right: Search */}
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Zoek patiënt..."
            className="w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
}
