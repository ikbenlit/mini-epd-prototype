'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ScreeningDocument } from '@/lib/types/screening';
import { Loader2, Trash2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

const DOCUMENT_BUCKET = 'screening-documents';
const BASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${DOCUMENT_BUCKET}`;

const documentTypeOptions = [
  'verwijsbrief',
  'verhuisbericht',
  'indicatie',
  'overig',
];

interface DocumentCardProps {
  patientId: string;
  screeningId: string;
  documents: ScreeningDocument[];
}

export function DocumentCard({ patientId, screeningId, documents }: DocumentCardProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('verwijsbrief');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUpload = () => {
    if (!file) {
      setError('Selecteer eerst een bestand.');
      return;
    }

    setError(null);
    startUpload(async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      try {
        const response = await fetch(`/api/screenings/${screeningId}/documents`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Upload mislukt');
        }

        setFile(null);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Upload mislukt');
      }
    });
  };

  const handleDelete = async (documentId: string) => {
    setDeletingId(documentId);
    try {
      const response = await fetch(
        `/api/screenings/${screeningId}/documents/${documentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Verwijderen mislukt');
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Verwijderen mislukt');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-md bg-slate-100 text-slate-600">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Documenten</h3>
          <p className="text-sm text-slate-500">
            Upload verwijsbrieven, indicaties en andere stukken.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border border-dashed border-slate-300 rounded-lg p-4">
          <div className="flex flex-col gap-3">
            <input
              type="file"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setFile(selected);
                setError(null);
              }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              >
                {documentTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60'
                )}
              >
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                Upload document
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {file && (
              <p className="text-xs text-slate-500">
                Geselecteerd: {file.name} • {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {documents.length === 0 && (
            <p className="text-sm text-slate-500">
              Nog geen documenten geregistreerd.
            </p>
          )}
          {documents.map((doc) => {
            const publicUrl = `${BASE_STORAGE_URL}/${doc.file_path}`;
            return (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200 rounded-lg p-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{doc.file_name}</p>
                  <p className="text-xs text-slate-500">
                    {doc.document_type} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Onbekend'} •{' '}
                    {doc.uploaded_by_name || 'Onbekend'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Verwijderen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
