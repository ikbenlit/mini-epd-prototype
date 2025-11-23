'use client';

import { Target, Sparkles, Clock } from 'lucide-react';

interface PlanTabProps {
  clientId: string;
}

export function PlanTab({ clientId }: PlanTabProps) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Behandelplan
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            SMART doelen en interventies
          </p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 font-medium rounded-lg cursor-not-allowed"
          title="Beschikbaar in Week 3"
        >
          <Sparkles className="h-4 w-4" />
          <span>Genereer Plan</span>
        </button>
      </div>

      {/* Coming Soon State */}
      <div className="py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
          <Target className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Coming Soon - Week 3
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          AI-gegenereerde behandelplannen met SMART doelen en evidence-based
          interventies worden toegevoegd in Week 3.
        </p>

        {/* Feature Preview */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-left">
            <h4 className="font-medium text-slate-900 mb-3">
              🎯 Plan Structuur:
            </h4>
            <div className="space-y-4">
              {/* SMART Doelen */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">
                  1. SMART Doelen
                </h5>
                <p className="text-sm text-slate-600">
                  Specifieke, Meetbare, Acceptabele, Realistische en
                  Tijdgebonden behandeldoelen
                </p>
              </div>

              {/* Interventies */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">
                  2. Interventies
                </h5>
                <p className="text-sm text-slate-600">
                  Evidence-based behandelmethoden (CGT, ACT, EMDR, etc.)
                </p>
              </div>

              {/* Frequentie */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">
                  3. Frequentie
                </h5>
                <p className="text-sm text-slate-600">
                  Sessie planning en behandelintensiteit
                </p>
              </div>

              {/* Meetmomenten */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">
                  4. Meetmomenten
                </h5>
                <p className="text-sm text-slate-600">
                  Evaluatie en voortgangsmetingen
                </p>
              </div>
            </div>

            <h4 className="font-medium text-slate-900 mb-3 mt-6">
              ✨ Geplande Features:
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>AI Plan Generator</strong> - Gebaseerd op intake +
                  profiel
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>Versioning</strong> - Meerdere versies per cliënt
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>Status Tracking</strong> - Concept vs. Gepubliceerd
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>JSONB Opslag</strong> - Flexibele datastructuur
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>Export Functie</strong> - PDF generatie voor dossier
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
