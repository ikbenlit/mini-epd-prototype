'use server';

/**
 * Intake Server Actions (API-based)
 *
 * Server-side actions that interact with Intake API endpoints
 * Refactored from direct Supabase queries to use Custom API
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import type {
  Intake,
  CreateIntakeInput,
  UpdateIntakeInput,
  IntakeListResponse,
} from '@/lib/types/intake';

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
 * Get all intakes for a specific patient
 * @param patientId - UUID of the patient
 * @returns Array of intakes for the patient
 */
export async function getIntakesByPatientId(patientId: string): Promise<Intake[]> {
  try {
    const baseUrl = getBaseUrl();
    const url = new URL('/api/intakes', baseUrl);
    url.searchParams.set('patientId', patientId);
    
    const cookieHeader = await getCookieHeader();

    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // If not JSON, check if it's HTML (redirect)
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          throw new Error('Niet geautoriseerd. Log opnieuw in.');
        }
      }
      
      console.error('Error fetching intakes:', response.statusText, errorData);
      throw new Error(`Failed to fetch intakes: ${errorData.error || response.statusText}`);
    }

    const data: IntakeListResponse = await response.json();
    return data.intakes;
  } catch (error) {
    console.error('Error in getIntakesByPatientId:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch intakes');
  }
}

/**
 * Get a specific intake by ID
 * @param intakeId - UUID of the intake
 * @returns Intake object or null if not found
 */
export async function getIntakeById(intakeId: string): Promise<Intake | null> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/intakes/${intakeId}`;
    const cookieHeader = await getCookieHeader();

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // If not JSON, check if it's HTML (redirect)
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          throw new Error('Niet geautoriseerd. Log opnieuw in.');
        }
      }
      
      console.error('Error fetching intake:', response.statusText, errorData);
      throw new Error(`Failed to fetch intake: ${errorData.error || response.statusText}`);
    }

    const data: Intake = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getIntakeById:', error);
    // Return null instead of throwing for not found cases
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error instanceof Error ? error : new Error('Failed to fetch intake');
  }
}

/**
 * Create a new intake
 * @param input - Intake creation data
 * @returns Created intake object
 */
export async function createIntake(input: CreateIntakeInput): Promise<Intake> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/intakes`;
    const cookieHeader = await getCookieHeader();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // If not JSON, check if it's HTML (redirect)
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          throw new Error('Niet geautoriseerd. Log opnieuw in.');
        }
      }
      
      console.error('Error creating intake:', response.statusText, errorData);
      
      // Handle validation errors
      if (response.status === 400 && errorData.details) {
        const validationErrors = errorData.details
          .map((d: { field: string; message: string }) => `${d.field}: ${d.message}`)
          .join(', ');
        throw new Error(`Validatiefout: ${validationErrors}`);
      }
      
      throw new Error(`Failed to create intake: ${errorData.error || response.statusText}`);
    }

    const data: Intake = await response.json();
    
    // Revalidate paths
    revalidatePath(`/epd/patients/${input.patient_id}/intakes`);
    revalidatePath(`/epd/patients/${input.patient_id}`);
    
    // Redirect to intakes list
    redirect(`/epd/patients/${input.patient_id}/intakes`);
    
    // This will never be reached due to redirect, but TypeScript needs it
    return data;
  } catch (error) {
    console.error('Error in createIntake:', error);
    throw error instanceof Error ? error : new Error('Failed to create intake');
  }
}

/**
 * Update an existing intake
 * @param intakeId - UUID of the intake to update
 * @param input - Partial intake data to update
 * @returns Updated intake object
 */
export async function updateIntake(
  intakeId: string,
  input: UpdateIntakeInput
): Promise<Intake> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/intakes/${intakeId}`;
    const cookieHeader = await getCookieHeader();

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // If not JSON, check if it's HTML (redirect)
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          throw new Error('Niet geautoriseerd. Log opnieuw in.');
        }
      }
      
      console.error('Error updating intake:', response.statusText, errorData);
      
      if (response.status === 404) {
        throw new Error('Intake niet gevonden');
      }
      
      if (response.status === 400 && errorData.details) {
        const validationErrors = errorData.details
          .map((d: { field: string; message: string }) => `${d.field}: ${d.message}`)
          .join(', ');
        throw new Error(`Validatiefout: ${validationErrors}`);
      }
      
      throw new Error(`Failed to update intake: ${errorData.error || response.statusText}`);
    }

    const data: Intake = await response.json();
    
    // Revalidate paths (we need to get patient_id from the intake)
    revalidatePath(`/epd/patients/${data.patient_id}/intakes`);
    revalidatePath(`/epd/patients/${data.patient_id}/intakes/${intakeId}`);
    revalidatePath(`/epd/patients/${data.patient_id}`);
    
    return data;
  } catch (error) {
    console.error('Error in updateIntake:', error);
    throw error instanceof Error ? error : new Error('Failed to update intake');
  }
}

/**
 * Delete an intake
 * @param intakeId - UUID of the intake to delete
 * @param patientId - UUID of the patient (for revalidation)
 */
export async function deleteIntake(intakeId: string, patientId: string): Promise<void> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/intakes/${intakeId}`;
    const cookieHeader = await getCookieHeader();

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // If not JSON, check if it's HTML (redirect)
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          throw new Error('Niet geautoriseerd. Log opnieuw in.');
        }
      }
      
      console.error('Error deleting intake:', response.statusText, errorData);
      
      if (response.status === 404) {
        throw new Error('Intake niet gevonden');
      }
      
      throw new Error(`Failed to delete intake: ${errorData.error || response.statusText}`);
    }

    // Revalidate paths
    revalidatePath(`/epd/patients/${patientId}/intakes`);
    revalidatePath(`/epd/patients/${patientId}`);
  } catch (error) {
    console.error('Error in deleteIntake:', error);
    throw error instanceof Error ? error : new Error('Failed to delete intake');
  }
}

