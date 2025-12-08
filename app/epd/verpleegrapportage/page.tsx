/**
 * Rapportage Page (default landing page)
 * Centrale pagina voor verpleegkundige rapportage met patiënt selector
 * Toont alleen notities van vandaag (invoerpagina)
 */

import { PenLine } from 'lucide-react';
import { getOverdrachtPatients } from './actions';
import { RapportageWorkspace } from './rapportage/components/rapportage-workspace';

export default async function RapportagePage() {
  const { patients } = await getOverdrachtPatients();

  return (
    <div className="h-screen bg-slate-50">
      {/* Workspace */}
      {patients.length === 0 ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <PenLine className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">
              Geen patiënten met recente activiteit
            </p>
            <p className="text-sm text-slate-500">
              Patiënten verschijnen hier wanneer er rapportages zijn gemaakt in de
              afgelopen 24 uur
            </p>
          </div>
        </div>
      ) : (
        <RapportageWorkspace patients={patients} />
      )}
    </div>
  );
}
