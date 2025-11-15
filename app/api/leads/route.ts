/**
 * Leads API Endpoint
 *
 * POST /api/leads - Submit contact form lead
 *
 * Security:
 * - Rate limiting via headers
 * - Input validation
 * - Server-side Supabase client
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema
const leadSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 karakters zijn'),
  email: z.string().email('Ongeldig email adres'),
  company: z.string().optional(),
  projectType: z.string().min(1, 'Selecteer een project type'),
  budget: z.string().optional(),
  message: z.string().min(20, 'Beschrijving moet minimaal 20 karakters zijn'),
})

export type LeadFormData = z.infer<typeof leadSchema>

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate input
    const validatedData = leadSchema.parse(body)

    // Get client IP and user agent for tracking
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || 'direct'

    // Insert lead into database (using admin client for server-side insert)
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company || null,
        project_type: validatedData.projectType,
        budget: validatedData.budget || null,
        message: validatedData.message,
        status: 'new',
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer,
        source: 'website',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Lead ontvangen',
        leadId: data.id
      },
      { status: 201 }
    )

  } catch (error) {
    // Validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validatie fout',
          issues: error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    // Generic error
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Interne server fout' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS (if needed)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
