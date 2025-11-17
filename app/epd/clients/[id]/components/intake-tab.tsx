'use client';

import { FileText, Plus, Calendar, Clock } from 'lucide-react';

interface IntakeTabProps {
  clientId: string;
}

export function IntakeTab({ clientId }: IntakeTabProps) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Intake Notities
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Gespreksverslagen en intake documenten
          </p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 font-medium rounded-lg cursor-not-allowed"
          title="Beschikbaar in Week 3"
        >
          <Plus className="h-4 w-4" />
          <span>Nieuwe notitie</span>
        </button>
      </div>

      {/* Coming Soon State */}
      <div className="py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
          <FileText className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Coming Soon - Week 3
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          De intake module met TipTap rich text editor en AI-samenvatting wordt
          toegevoegd in Week 3 van de development sprint.
        </p>

        {/* Feature Preview */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-left">
            <h4 className="font-medium text-slate-900 mb-3">
              📋 Geplande Features:
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>TipTap Rich Text Editor</strong> - Professionele
                  tekstverwerking
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>AI Samenvatting</strong> - Claude 3.5 Sonnet
                  generatie (&lt; 5 sec)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>B1 Readability</strong> - Automatische
                  tekstvereenvoudiging
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>Tags & Categorieën</strong> - Intake, Evaluatie, Plan
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>
                  <strong>Versiehistorie</strong> - Track alle wijzigingen
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
