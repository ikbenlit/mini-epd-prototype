/**
 * Behandelaar Agenda - Level 1
 *
 * Kalender view met alle afspraken van de behandelaar.
 * Supports day, week, and workweek views.
 */

import { startOfWeek, endOfWeek } from 'date-fns';
import { AgendaView } from './components/agenda-view';
import { getEncounters } from './actions';

export default async function AgendaPage() {
  // Get initial date range (current week)
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });

  // Fetch initial events
  const initialEvents = await getEncounters({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  });

  return (
    <AgendaView
      initialEvents={initialEvents}
      initialDate={now}
    />
  );
}
