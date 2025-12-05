'use client';

/**
 * AISummaryBlock Component
 * E5.S4: AI Samenvatting met bronverwijzingen
 */

import { useState } from 'react';
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import type { AISamenvatting, Aandachtspunt } from '@/lib/types/overdracht';

interface AISummaryBlockProps {
  patientId: string;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getBronTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    observatie: 'Vitale functie',
    rapportage: 'Rapportage',
    dagnotitie: 'Dagnotitie',
    risico: 'Risicobeoordeling',
  };
  return labels[type] || type;
}

function getBronTypeStyle(type: string): { bg: string; text: string } {
  switch (type) {
    case 'observatie':
      return { bg: 'bg-teal-100', text: 'text-teal-700' };
    case 'rapportage':
      return { bg: 'bg-indigo-100', text: 'text-indigo-700' };
    case 'dagnotitie':
      return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'risico':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700' };
  }
}

export function AISummaryBlock({ patientId }: AISummaryBlockProps) {
  const [summary, setSummary] = useState<AISamenvatting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateSummary() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/overdracht/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fout bij genereren samenvatting');
      }

      const data: AISamenvatting = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Samenvatting</h2>
          <p className="text-sm text-slate-500">
            Gegenereerd met Claude AI
          </p>
        </div>
      </div>

      {/* Content */}
      {!summary && !loading && !error && (
        <div className="py-6 text-center">
          <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-600 mb-4">
            Genereer een beknopte overdracht samenvatting op basis van alle beschikbare patiëntgegevens.
          </p>
          <button
            onClick={generateSummary}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Genereer samenvatting
          </button>
        </div>
      )}

      {loading && (
        <div className="py-8 text-center">
          <Loader2 className="h-8 w-8 text-violet-600 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-600">
            Samenvatting wordt gegenereerd...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Dit duurt meestal 3-5 seconden
          </p>
        </div>
      )}

      {error && (
        <div className="py-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Fout bij genereren
                </p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={generateSummary}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Opnieuw proberen
          </button>
        </div>
      )}

      {summary && (
        <div className="space-y-5">
          {/* Samenvatting */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Samenvatting</h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">
              {summary.samenvatting}
            </p>
          </div>

          {/* Aandachtspunten */}
          {summary.aandachtspunten.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                Aandachtspunten ({summary.aandachtspunten.length})
              </h3>
              <div className="space-y-2">
                {summary.aandachtspunten.map((punt, index) => (
                  <AandachtspuntItem key={index} punt={punt} />
                ))}
              </div>
            </div>
          )}

          {/* Actiepunten */}
          {summary.actiepunten.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                Actiepunten ({summary.actiepunten.length})
              </h3>
              <ul className="space-y-2">
                {summary.actiepunten.map((actie, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{actie}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Gegenereerd om {formatTime(summary.generatedAt)} ({formatDuration(summary.durationMs)})
              </span>
            </div>
            <button
              onClick={generateSummary}
              disabled={loading}
              className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Vernieuwen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AandachtspuntItem({ punt }: { punt: Aandachtspunt }) {
  const bronStyle = getBronTypeStyle(punt.bron.type);

  return (
    <div
      className={`
        p-3 rounded-lg border-l-4
        ${punt.urgent ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-300'}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className={`text-sm ${punt.urgent ? 'text-red-800 font-medium' : 'text-slate-700'}`}>
          {punt.urgent && (
            <AlertTriangle className="h-3.5 w-3.5 inline mr-1 text-red-600" />
          )}
          {punt.tekst}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`
          inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs
          ${bronStyle.bg} ${bronStyle.text}
        `}>
          <ExternalLink className="h-3 w-3" />
          {getBronTypeLabel(punt.bron.type)}
        </span>
        <span className="text-xs text-slate-500">
          {punt.bron.label} • {punt.bron.datum}
        </span>
      </div>
    </div>
  );
}
