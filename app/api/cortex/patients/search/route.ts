import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { z } from 'zod';

/**
 * Swift Patient Search API
 *
 * GET /api/swift/patients/search?q=jan
 *
 * Fuzzy search for patients by name (for disambiguation).
 */

// Query parameter schema
const QuerySchema = z.object({
  q: z.string().min(1, { message: 'Zoekterm mag niet leeg zijn' }).max(100),
});

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd. Log opnieuw in.' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json(
        { error: 'Query parameter "q" is verplicht' },
        { status: 400 }
      );
    }

    const validation = QuerySchema.safeParse({ q });
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const query = validation.data.q.trim();
    
    // Capitalize first letter, lowercase rest (matches Dutch name format)
    const capitalizedQuery = query.charAt(0).toUpperCase() + 
                             query.slice(1).toLowerCase();

    // Fuzzy search on patient names
    // Search in both name_family and name_given fields
    // name_family uses ilike (case-insensitive), name_given uses cs with capitalized query
    const { data: patients, error: searchError } = await supabase
      .from('patients')
      .select('id, name_family, name_given, birth_date, identifier_bsn')
      .or(
        `name_family.ilike.%${query}%,name_given.cs.{"${capitalizedQuery}"}`
      )
      .limit(10)
      .order('name_family', { ascending: true });

    if (searchError) {
      console.error('Error searching patients:', searchError);
      return NextResponse.json(
        { error: 'Fout bij het zoeken van patiënten' },
        { status: 500 }
      );
    }

    // Format response
    const formattedPatients = (patients || []).map((patient) => {
      const givenName = Array.isArray(patient.name_given)
        ? patient.name_given[0]
        : patient.name_given;
      const fullName = `${givenName || ''} ${patient.name_family || ''}`.trim();

      return {
        id: patient.id,
        name: fullName || 'Onbekende naam',
        bsn: patient.identifier_bsn || undefined,
        birthDate: patient.birth_date || undefined,
      };
    });

    return NextResponse.json(
      {
        patients: formattedPatients,
        count: formattedPatients.length,
        query,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in patient search API:', error);
    return NextResponse.json(
      {
        error:
          'Er ging iets mis bij het zoeken van patiënten. Probeer het opnieuw.',
      },
      { status: 500 }
    );
  }
}
