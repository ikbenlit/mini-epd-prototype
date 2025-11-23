'use server';

import { revalidatePath } from 'next/cache';
import { headers, cookies } from 'next/headers';
import type {
  ScreeningSummary,
  ScreeningWithRelations,
} from '@/lib/types/screening';

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  try {
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch {
    // ignore
  }

  return 'http://localhost:3000';
}

async function getCookieHeader(): Promise<string> {
  try {
    const cookieStore = await cookies();
    return cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
  } catch {
    return '';
  }
}

function normalizeSummary(screening: ScreeningWithRelations): ScreeningSummary {
  return {
    screening,
    activities: screening.screening_activities || [],
    documents: screening.screening_documents || [],
  };
}

export async function getScreeningSummary(patientId: string): Promise<ScreeningSummary> {
  try {
    const baseUrl = getBaseUrl();
    const cookieHeader = await getCookieHeader();
    const response = await fetch(`${baseUrl}/api/screenings?patientId=${patientId}`, {
      cache: 'no-store',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Kon screening niet ophalen');
    }

    const data = await response.json();
    return normalizeSummary(data.screening);
  } catch (error) {
    console.error('Error fetching screening summary:', error);
    throw error instanceof Error ? error : new Error('Kon screening niet ophalen');
  }
}

export async function saveHelpRequest(params: {
  patientId: string;
  screeningId: string;
  request: string;
}) {
  try {
    const baseUrl = getBaseUrl();
    const cookieHeader = await getCookieHeader();

    const response = await fetch(`${baseUrl}/api/screenings/${params.screeningId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify({ request_for_help: params.request }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Opslaan mislukt');
    }

    revalidatePath(`/epd/patients/${params.patientId}/screening`);
    return true;
  } catch (error) {
    console.error('Error saving help request:', error);
    throw error instanceof Error ? error : new Error('Opslaan mislukt');
  }
}

export async function saveScreeningDecision(params: {
  patientId: string;
  screeningId: string;
  decision: 'geschikt' | 'niet_geschikt';
  notes?: string;
  department?: string;
}) {
  try {
    const baseUrl = getBaseUrl();
    const cookieHeader = await getCookieHeader();

    const response = await fetch(`${baseUrl}/api/screenings/${params.screeningId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify({
        decision: params.decision,
        decision_notes: params.notes,
        decision_department: params.department,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Opslaan mislukt');
    }

    revalidatePath(`/epd/patients/${params.patientId}/screening`);
    revalidatePath(`/epd/patients/${params.patientId}`);
    return true;
  } catch (error) {
    console.error('Error saving decision:', error);
    throw error instanceof Error ? error : new Error('Opslaan mislukt');
  }
}

export async function addScreeningActivity(params: {
  patientId: string;
  screeningId: string;
  text: string;
}) {
  try {
    const baseUrl = getBaseUrl();
    const cookieHeader = await getCookieHeader();

    const response = await fetch(`${baseUrl}/api/screenings/${params.screeningId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify({ activity_text: params.text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Toevoegen mislukt');
    }

    revalidatePath(`/epd/patients/${params.patientId}/screening`);
    return true;
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error instanceof Error ? error : new Error('Toevoegen mislukt');
  }
}
