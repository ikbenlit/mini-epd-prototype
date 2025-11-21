'use server';

/**
 * Patient CRUD Server Actions (FHIR-based)
 *
 * Server-side actions that interact with FHIR Patient API
 */

import { revalidatePath } from 'next/cache';
import type { FHIRPatient, FHIRBundle } from '@/lib/fhir';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Get all patients via FHIR API
 */
export async function getPatients(filters?: {
  search?: string;
}) {
  try {
    const url = new URL(`${API_BASE_URL}/api/fhir/Patient`);

    if (filters?.search) {
      url.searchParams.set('name', filters.search);
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.statusText}`);
    }

    const bundle: FHIRBundle<FHIRPatient> = await response.json();
    return bundle.entry?.map((entry) => entry.resource).filter(Boolean) as FHIRPatient[] || [];
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw new Error('Failed to fetch patients');
  }
}

/**
 * Get single patient by ID via FHIR API
 */
export async function getPatient(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fhir/Patient/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patient: ${response.statusText}`);
    }

    const patient: FHIRPatient = await response.json();
    return patient;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw new Error('Failed to fetch patient');
  }
}

/**
 * Create new patient via FHIR API
 */
export async function createPatient(fhirPatient: FHIRPatient) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fhir/Patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    const response = await fetch(`${API_BASE_URL}/api/fhir/Patient/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
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
