import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { ClientForm } from '../components/client-form';

export default function NewClientPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
      {/* Back Button */}
      <Link
        href="/epd/clients"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Terug naar overzicht</span>
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Nieuwe cliënt</h1>
        <p className="text-sm text-slate-600 mt-1">
          Voeg een nieuwe cliënt toe aan het systeem
        </p>
      </div>

      {/* Form */}
      <ClientForm />
    </div>
  );
}
