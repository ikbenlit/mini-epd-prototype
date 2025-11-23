'use server';

/**
 * Patient CRUD Server Actions (FHIR-based)
 *
 * Server-side actions that interact with FHIR Patient API
 */

import { revalidatePath } from 'next/cache';
import { headers, cookies } from 'next/headers';
import type { FHIRPatient, FHIRBundle } from '@/lib/fhir';

/**
 * Get the base URL for API calls in server actions
 * Uses headers() to get the host from the request
 */
function getBaseUrl(): string {
  // Try environment variable first
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Try to get from headers (works in server components/actions)
  try {
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch {
    // Headers not available, fallback to localhost
  }
  
  // Fallback to localhost
  return 'http://localhost:3000';
}

/**
 * Get cookies as a string for fetch headers
 */
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

/**
 * Get all patients via FHIR API
 */
export async function getPatients(filters?: {
  search?: string;
  status?: string;
  gender?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    const baseUrl = getBaseUrl();
    const url = new URL('/api/fhir/Patient', baseUrl);

    // Search filter
    if (filters?.search) {
      url.searchParams.set('name', filters.search);
    }

    // Status filter
    if (filters?.status) {
      url.searchParams.set('status', filters.status);
    }

    // Gender filter
    if (filters?.gender) {
      url.searchParams.set('gender', filters.gender);
    }

    // Pagination (default: 50 per page)
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 50;
    url.searchParams.set('_count', pageSize.toString());
    url.searchParams.set('_offset', ((page - 1) * pageSize).toString());

    // Sorting
    if (filters?.sortBy) {
      const sortOrder = filters?.sortOrder === 'desc' ? '-' : '';
      url.searchParams.set('_sort', `${sortOrder}${filters.sortBy}`);
    }

    // Get cookies to pass authentication
    const cookieHeader = await getCookieHeader();
    
    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch patients: ${response.status} ${response.statusText}`;
      
      // Check if we got HTML (likely a redirect to login)
      if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
        throw new Error('Niet geautoriseerd. Log opnieuw in.');
      }
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.issue?.[0]?.diagnostics) {
          errorMessage = errorJson.issue[0].diagnostics;
        }
      } catch {
        // If not JSON, use the text (but truncate if HTML)
        if (errorText && !errorText.trim().startsWith('<!')) {
          errorMessage = errorText.substring(0, 200);
        }
      }
      
      console.error('Error fetching patients:', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        error: errorMessage.substring(0, 100),
      });
      
      throw new Error(errorMessage);
    }

    const bundle: FHIRBundle<FHIRPatient> = await response.json();

    return {
      patients: bundle.entry?.map((entry) => entry.resource).filter(Boolean) as FHIRPatient[] || [],
      total: bundle.total || 0,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('Error fetching patients:', error);
    
    // Provide more context in error message
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Kon geen verbinding maken met de server. Controleer of de applicatie draait.');
    }
    
    throw error instanceof Error ? error : new Error('Failed to fetch patients');
  }
}

/**
 * Get single patient by ID via FHIR API
 */
export async function getPatient(id: string) {
  try {
    const baseUrl = getBaseUrl();
    const cookieHeader = await getCookieHeader();
    
    const response = await fetch(`${baseUrl}/api/fhir/Patient/${id}`, {
      cache: 'no-store',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Check if we got HTML (likely a redirect to login)
      if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
        throw new Error('Niet geautoriseerd. Log opnieuw in.');
      }
      throw new Error(`Failed to fetch patient: ${response.statusText}`);
    }

    const patient: FHIRPatient = await response.json();
    return patient;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch patient');
  }
}

/**
 * Create new patient via FHIR API
 */
export async function createPatient(fhirPatient: FHIRPatient) {
  try {
    const baseUrl = getBaseUrl();
    const cookieHeader = await getCookieHeader();
    
    const response = await fetch(`${baseUrl}/api/fhir/Patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(fhirPatient),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.issue?.[0]?.diagnostics || 'Failed to create patient');
    }

    const patient: FHIRPatient = await response.json();
    revalidatePath('/epd/patients');
    return patient;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error instanceof Error ? error : new Error('Failed to create patient');
  }
}

/**
 * Update existing patient via FHIR API
 */
export async function updatePatient(id: string, fhirPatient: FHIRPatient) {
  try {
    const baseUrl = getBaseUrl();
    const cookieHeader = await getCookieHeader();
    
    const response = await fetch(`${baseUrl}/api/fhir/Patient/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify({ ...fhirPatient, id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.issue?.[0]?.diagnostics || 'Failed to update patient');
    }

    const patient: FHIRPatient = await response.json();
    revalidatePath('/epd/patients');
    revalidatePath(`/epd/patients/${id}`);
    return patient;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error instanceof Error ? error : new Error('Failed to update patient');
  }
}

/**
 * Delete patient via FHIR API
 */
export async function deletePatient(id: string) {
  try {
    const baseUrl = getBaseUrl();
    const cookieHeader = await getCookieHeader();
    
    const response = await fetch(`${baseUrl}/api/fhir/Patient/${id}`, {
      method: 'DELETE',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.issue?.[0]?.diagnostics || 'Failed to delete patient');
    }

    revalidatePath('/epd/patients');
    return { success: true };
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error instanceof Error ? error : new Error('Failed to delete patient');
  }
}
