import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const BUCKET = 'screening-documents';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ screeningId: string; documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const { data: document, error } = await supabase
      .from('screening_documents')
      .select('*')
      .eq('id', documentId)
      .maybeSingle();

    if (error) {
      console.error('Fetch document error:', error);
      return NextResponse.json(
        { error: 'Document niet gevonden', details: error.message },
        { status: 500 }
      );
    }

    if (!document) {
      return NextResponse.json({ error: 'Document niet gevonden' }, { status: 404 });
    }

    const { error: deleteError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([document.file_path]);

    if (deleteError) {
      console.error('Storage delete error:', deleteError);
      // Don't stop here; attempt DB delete even if storage failed
    }

    const { error: dbError } = await supabase
      .from('screening_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      console.error('DB delete error:', dbError);
      return NextResponse.json(
        { error: 'Verwijderen mislukt', details: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /documents/[documentId]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
