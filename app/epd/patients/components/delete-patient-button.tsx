'use client';

/**
 * Delete Patient Button Component
 * E3.S3: Delete patient with confirmation dialog
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { deletePatient } from '../actions';

interface DeletePatientButtonProps {
  patientId: string;
  patientName: string;
}

export function DeletePatientButton({ patientId, patientName }: DeletePatientButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deletePatient(patientId);
      router.push('/epd/patients');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen van patiënt');
      setIsDeleting(false);
    }
  };

  if (!showConfirm) {
    return (
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                Gevaarlijke zone
              </h3>
              <p className="text-xs text-red-700 mb-3">
                Het verwijderen van een patiënt kan niet ongedaan worden gemaakt. Alle gekoppelde
                gegevens (intake, diagnoses, behandelplannen) worden ook verwijderd.
              </p>
              <button
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Patiënt verwijderen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        {error && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Weet u zeker dat u deze patiënt wilt verwijderen?
            </h3>
            <p className="text-sm text-red-800 mb-2">
              U staat op het punt om <strong>{patientName}</strong> permanent te verwijderen.
            </p>
            <p className="text-sm text-red-700">
              Dit verwijdert:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside ml-2 mt-1">
              <li>Alle persoonlijke gegevens</li>
              <li>Alle screening en intake informatie</li>
              <li>Alle diagnoses en observaties</li>
              <li>Alle behandelplannen en doelen</li>
              <li>Alle documenten en rapportages</li>
            </ul>
            <p className="text-sm font-semibold text-red-900 mt-3">
              Deze actie kan niet ongedaan worden gemaakt!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verwijderen...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Ja, verwijder permanent</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors disabled:opacity-50"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}
