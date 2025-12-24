/**
 * Patient Search API
 *
 * GET /api/patients/search?q=query&limit=5
 *
 * Fuzzy search voor patiënten met eenvoudige JSON response.
 * Gebruikt voor Swift blocks en andere client-side componenten.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';

interface PatientSearchResult {
  id: string;
  name: string;
  birthDate: string;
  identifier_bsn?: string;
  identifier_client_number?: string;
  matchScore: number;
}

interface SearchResponse {
  patients: PatientSearchResult[];
  totalCount: number;
}

/**
 * Calculate simple match score based on query match
 * - Exact match: 1.0
 * - Starts with: 0.9
 * - Contains: 0.7
 * - Partial match: 0.5
 */
function calculateMatchScore(
  query: string,
  patient: {
    name_family?: string | null;
    name_given?: string[] | null;
    identifier_bsn?: string | null;
    identifier_client_number?: string | null;
  }
): number {
  const normalizedQuery = query.toLowerCase().trim();
  const fullName = `${patient.name_given?.join(' ') || ''} ${patient.name_family || ''}`
    .toLowerCase()
    .trim();

  // Exact match on full name
  if (fullName === normalizedQuery) {
    return 1.0;
  }

  // Starts with query
  if (fullName.startsWith(normalizedQuery)) {
    return 0.9;
  }

  // Contains query
  if (fullName.includes(normalizedQuery)) {
    return 0.7;
  }

  // Check individual name parts
  const nameParts = fullName.split(' ');
  const queryParts = normalizedQuery.split(' ');
  let matchedParts = 0;

  for (const queryPart of queryParts) {
    if (nameParts.some((part) => part.startsWith(queryPart) || part.includes(queryPart))) {
      matchedParts++;
    }
  }

  if (matchedParts > 0) {
    return 0.5 + (matchedParts / queryParts.length) * 0.2;
  }

  // Check BSN match
  if (patient.identifier_bsn && patient.identifier_bsn.includes(normalizedQuery)) {
    return 0.8;
  }

  // Check client number match
  if (
    patient.identifier_client_number &&
    patient.identifier_client_number.toLowerCase().includes(normalizedQuery)
  ) {
    return 0.8;
  }

  return 0.3; // Default low score for any match
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 50) : 10;

    if (!query || query.trim().length < 2) {
      return NextResponse.json<SearchResponse>(
        {
          patients: [],
          totalCount: 0,
        },
        { status: 200 }
      );
    }

    const searchQuery = query.trim();

    // Build Supabase query
    let dbQuery = supabase.from('patients').select('id, name_family, name_given, birth_date, identifier_bsn, identifier_client_number');

    // Check if input looks like a number (BSN or client number)
    const isNumeric = /^\d+$/.test(searchQuery);
    if (isNumeric) {
      // Search BSN and client number
      dbQuery = dbQuery.or(
        `identifier_bsn.ilike.%${searchQuery}%,identifier_client_number.ilike.%${searchQuery}%`
      );
    } else {
      // Search name fields (family name and given names)
      dbQuery = dbQuery.or(
        `name_family.ilike.%${searchQuery}%,name_given.cs.{${searchQuery}}`
      );
    }

    // Order by updated_at descending (newest first)
    dbQuery = dbQuery.order('updated_at', { ascending: false }).limit(limit * 2); // Get more to calculate scores

    // Execute query
    const { data: patients, error } = await dbQuery;

    if (error) {
      console.error('Error searching patients:', error);
      return NextResponse.json(
        { error: 'Zoeken mislukt', details: error.message },
        { status: 500 }
      );
    }

    if (!patients || patients.length === 0) {
      return NextResponse.json<SearchResponse>(
        {
          patients: [],
          totalCount: 0,
        },
        { status: 200 }
      );
    }

    // Calculate match scores and format results
    const results: PatientSearchResult[] = patients
      .map((patient) => {
        const fullName = `${patient.name_given?.join(' ') || ''} ${patient.name_family || ''}`.trim();
        const matchScore = calculateMatchScore(searchQuery, patient);

        return {
          id: patient.id,
          name: fullName || 'Naamloos',
          birthDate: patient.birth_date || '',
          identifier_bsn: patient.identifier_bsn || undefined,
          identifier_client_number: patient.identifier_client_number || undefined,
          matchScore,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score descending
      .slice(0, limit); // Limit results

    const response: SearchResponse = {
      patients: results,
      totalCount: results.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in patient search:', error);
    return NextResponse.json(
      {
        error: 'Onverwachte fout',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

