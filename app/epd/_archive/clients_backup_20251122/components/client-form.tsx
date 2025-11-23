'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import type { ClientFormData } from '@/lib/types/client';
import type { Client } from '@/lib/types/client';
import { createClient, updateClient } from '../actions';

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ClientFormData>({
    first_name: client?.first_name || '',
    last_name: client?.last_name || '',
    birth_date: client?.birth_date || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (client) {
        await updateClient(client.id, formData);
        router.push(`/epd/clients/${client.id}`);
      } else {
        const newClient = await createClient(formData);
        router.push(`/epd/clients/${newClient.id}`);
      }
      router.refresh();
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        {/* First Name */}
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Voornaam <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="first_name"
            required
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="bijv. Jan"
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Achternaam <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="last_name"
            required
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="bijv. de Vries"
          />
        </div>

        {/* Birth Date */}
        <div>
          <label
            htmlFor="birth_date"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Geboortedatum <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="birth_date"
            required
            value={formData.birth_date}
            onChange={(e) => handleChange('birth_date', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Bezig...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{client ? 'Bijwerken' : 'Opslaan'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
