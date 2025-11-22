/**
 * Basisgegevens Page
 * E2.S3: Patient basic information with edit functionality
 */

import { getPatient } from '../../actions';
import { PatientForm } from '../../components/patient-form';
import { AlertCircle } from 'lucide-react';

export default async function BasisgegevensPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);

  // Check if John Doe
  const isJohnDoe = (patient as any).extension?.find(
    (ext: any) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/john-doe'
  )?.valueBoolean;

  // Check if BSN is missing or placeholder
  const bsn = patient.identifier?.find(
    (id) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
  )?.value;
  const hasMissingBSN = !bsn || bsn === '999999990';

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Basisgegevens</h2>
        <p className="text-sm text-slate-600 mt-1">
          NAW-gegevens en contactinformatie
        </p>
      </div>

      {/* John Doe Warning */}
      {isJohnDoe && hasMissingBSN && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">
                Incomplete gegevens - John Doe registratie
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Vul BSN aan zodra deze beschikbaar is voor volledige registratie.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <PatientForm patient={patient} />
      </div>
    </div>
  );
}
