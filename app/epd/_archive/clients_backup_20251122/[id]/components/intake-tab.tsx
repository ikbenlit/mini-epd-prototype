'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getIntakesByClientId, Intake } from '../intakes/actions';
import { IntakeList } from '../intakes/components/intake-list';

interface IntakeTabProps {
  clientId: string;
}

export function IntakeTab({ clientId }: IntakeTabProps) {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchIntakes() {
      try {
        const data = await getIntakesByClientId(clientId);
        setIntakes(data);
      } catch (error) {
        console.error('Failed to fetch intakes:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchIntakes();
  }, [clientId]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Intakes
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Overzicht van alle intakes
          </p>
        </div>
        <Link
          href={`/epd/clients/${clientId}/intakes/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nieuwe Intake</span>
        </Link>
      </div>

      <IntakeList intakes={intakes} clientId={clientId} isLoading={isLoading} />
    </div>
  );
}
