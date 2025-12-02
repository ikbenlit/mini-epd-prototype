/**
 * Behandelaar Agenda - Level 1
 *
 * Kalender view met alle afspraken van de behandelaar.
 * Supports day, week, and workweek views.
 */

import { startOfWeek, endOfWeek, parseISO, isValid } from 'date-fns';
import { AgendaView } from './components/agenda-view';
import { getEncounters } from './actions';

interface AgendaPageProps {
  searchParams: Promise<{ date?: string; encounterId?: string }>;
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const { date: dateParam, encounterId } = await searchParams;

  // Parse date from URL or use current date
  let targetDate = new Date();
  if (dateParam) {
    const parsedDate = parseISO(dateParam);
    if (isValid(parsedDate)) {
      targetDate = parsedDate;
    }
  }

  // Get initial date range (week of target date)
  const start = startOfWeek(targetDate, { weekStartsOn: 1 });
  const end = endOfWeek(targetDate, { weekStartsOn: 1 });

  // Fetch initial events
  const initialEvents = await getEncounters({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  });

  return (
    <AgendaView
      initialEvents={initialEvents}
      initialDate={targetDate}
      highlightEncounterId={encounterId}
    />
  );
}
