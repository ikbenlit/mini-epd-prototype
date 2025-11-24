import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';

const uuidSchema = z.string().uuid('reportId moet een geldige UUID zijn');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    if (!uuidSchema.safeParse(reportId).success) {
      return NextResponse.json(
        { error: 'reportId moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Rapport niet gevonden' }, { status: 404 });
      }

      console.error('Error fetching report:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen rapport', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in GET /api/reports/[reportId]:', error);
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const body = await request.json();

    if (!uuidSchema.safeParse(reportId).success) {
      return NextResponse.json(
        { error: 'reportId moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Rapport niet gevonden' }, { status: 404 });
      }

      console.error('Error updating report:', error);
      return NextResponse.json(
        { error: 'Fout bij updaten rapport', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in PATCH /api/reports/[reportId]:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Ongeldige JSON in request body' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    if (!uuidSchema.safeParse(reportId).success) {
      return NextResponse.json(
        { error: 'reportId moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('reports')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) {
      console.error('Error deleting report:', error);
      return NextResponse.json(
        { error: 'Verwijderen mislukt', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/reports/[reportId]:', error);
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}
