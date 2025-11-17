'use client';

import { User, Brain, Clock } from 'lucide-react';

interface ProfileTabProps {
  clientId: string;
}

export function ProfileTab({ clientId }: ProfileTabProps) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Probleemprofiel
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            DSM-light categorisatie en ernst indicatie
          </p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 font-medium rounded-lg cursor-not-allowed"
          title="Beschikbaar in Week 3"
        >
          <Brain className="h-4 w-4" />
          <span>AI Analyse</span>
        </button>
      </div>

      {/* Coming Soon State */}
      <div className="py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
          <User className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Coming Soon - Week 3
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          AI-gestuurde probleemclassificatie met DSM-light categorieën wordt
          toegevoegd in Week 3.
        </p>

        {/* Feature Preview */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-left">
            <h4 className="font-medium text-slate-900 mb-3">
              🎯 DSM-light Categorieën:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-slate-700">Stemming & Depressie</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-slate-700">Angst</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-slate-700">Gedrag & Impuls</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-slate-700">Middelengebruik</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-slate-700">Cognitief</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-teal-500" />
                <span className="text-slate-700">Context & Psychosociaal</span>
              </div>
            </div>

            <h4 className="font-medium text-slate-900 mb-3 mt-6">
              📊 Geplande Features:
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>AI Categorisatie</strong> - Automatische DSM-light
                  classificatie
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>Ernst Indicatie</strong> - Laag, Middel, Hoog scoring
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>Visuele Dashboard</strong> - Overzichtelijke
                  weergave per categorie
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>Bronverwijzing</strong> - Link naar intake notities
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Timeline Preview */}
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full text-sm">
          <Clock className="h-4 w-4 text-teal-600" />
          <span className="text-teal-800">
            <strong>Week 3:</strong> 18-24 November 2024
          </span>
        </div>
      </div>
    </div>
  );
}
