import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getClient } from '../../actions';
import { ClientForm } from '../../components/client-form';

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;

  // Fetch client data
  let client;
  try {
    client = await getClient(id);
  } catch (error) {
    notFound();
  }

  if (!client) {
    notFound();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
      {/* Back Button */}
      <Link
        href={`/epd/clients/${id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Terug naar cliënt</span>
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Cliënt bewerken</h1>
        <p className="text-sm text-slate-600 mt-1">
          Wijzig de gegevens van {client.first_name} {client.last_name}
        </p>
      </div>

      {/* Form */}
      <ClientForm client={client} />
    </div>
  );
}
