'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authFetch, getBaseUrl } from '@/lib/server/api-client';
import type { Report, ReportListResponse, CreateReportInput } from '@/lib/types/report';

interface GetReportsOptions {
  limit?: number;
  offset?: number;
}

export async function getReports(
  patientId: string,
  options?: GetReportsOptions
): Promise<Report[]> {
  const result = await getReportsPaginated(patientId, options);
  return result.reports;
}

export async function getReportsPaginated(
  patientId: string,
  options?: GetReportsOptions
): Promise<ReportListResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/reports', baseUrl);
  url.searchParams.set('patientId', patientId);

  if (options?.limit) {
    url.searchParams.set('limit', options.limit.toString());
  }
  if (options?.offset) {
    url.searchParams.set('offset', options.offset.toString());
  }

  const response = await authFetch(url.toString(), {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) {
      redirect('/login');
    }
    throw new Error('Fout bij ophalen rapportages');
  }

  return response.json();
}

export async function createReport(
  patientId: string,
  input: Omit<CreateReportInput, 'patient_id'>
): Promise<Report> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/reports`;

  const response = await authFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patient_id: patientId,
      ...input,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      redirect('/login');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Opslaan mislukt');
  }

  revalidatePath(`/epd/patients/${patientId}/rapportage`);
  return response.json();
}

export async function updateReport(
  patientId: string,
  reportId: string,
  input: { content?: string; encounter_id?: string | null }
): Promise<Report> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/reports/${reportId}`;

  const response = await authFetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    if (response.status === 401) {
      redirect('/login');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Bijwerken mislukt');
  }

  revalidatePath(`/epd/patients/${patientId}/rapportage`);
  return response.json();
}

export async function deleteReport(patientId: string, reportId: string) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/reports/${reportId}`;

  const response = await authFetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 401) {
      redirect('/login');
    }
    throw new Error('Verwijderen mislukt');
  }

  revalidatePath(`/epd/patients/${patientId}/rapportage`);
  return response.json();
}
