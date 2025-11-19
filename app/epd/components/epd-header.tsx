"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getClient } from '../clients/actions';

interface EPDHeaderProps {
  className?: string;
}

interface ClientData {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
}

export function EPDHeader({ className = "" }: EPDHeaderProps) {
  const pathname = usePathname();
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Context detection: Level 2 if URL contains /clients/[id]
  const isClientContext = pathname.match(/\/epd\/clients\/[^\/]+/);
  const clientId = isClientContext ? pathname.split('/')[3] : null;

  useEffect(() => {
    async function fetchClient() {
      if (!clientId) {
        setSelectedClient(null);
        return;
      }

      // Don't re-fetch if we already have the correct client
      if (selectedClient?.id === clientId) return;

      setIsLoading(true);
      try {
        const client = await getClient(clientId);
        if (client) {
          setSelectedClient(client);
        }
      } catch (error) {
        console.error('Failed to fetch client for header:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClient();
  }, [clientId, selectedClient?.id]);

  return (
    <header className={`h-[60px] bg-white border-b border-slate-200 flex items-center px-6 ${className}`}>
      {/* Left: Logo */}
      <div className="flex items-center">
        <span className="text-base font-medium text-slate-800">Mini-ECD</span>
      </div>

      {/* Center: Client Selector (only in Level 2) */}
      <div className="flex-1 flex justify-center">
        {(selectedClient || isLoading) && clientId && (
          <button className="flex flex-col items-center px-4 py-1 hover:bg-slate-50 rounded-md transition-colors group">
            {isLoading ? (
              <div className="h-8 w-32 bg-slate-100 animate-pulse rounded" />
            ) : selectedClient ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-slate-900">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <span className="text-xs text-slate-500">
                  ID: {selectedClient.id.substring(0, 8)}... | Geb: {new Date(selectedClient.birth_date).toLocaleDateString('nl-NL')}
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
            placeholder="Zoek cliënt..."
            className="w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
}
