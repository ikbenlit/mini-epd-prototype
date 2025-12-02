import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/auth/server'

const payloadSchema = z.object({
  action: z.enum(['start', 'stop', 'final']),
  context: z.string().min(1),
  patientId: z.string().min(1).optional(),
  intakeId: z.string().min(1).optional(),
  reportId: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const payload = payloadSchema.safeParse(json)

    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, context, patientId, intakeId, reportId, metadata } = payload.data

    // @ts-expect-error speech_usage_events table not in generated types yet
    const { error } = await supabase.from('speech_usage_events').insert({
      action,
      context,
      user_id: user.id,
      patient_id: patientId ?? null,
      intake_id: intakeId ?? null,
      report_id: reportId ?? null,
      metadata: metadata ?? {},
    })

    if (error) {
      console.error('Failed to persist speech telemetry', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Speech telemetry error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
