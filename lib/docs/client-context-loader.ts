/**
 * Client Context Loader
 *
 * Loads client-specific data from Supabase for the AI Client Assistant.
 * Uses direct database queries for performance (not HTTP APIs).
 */

import { supabaseAdmin } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type Patient = Database['public']['Tables']['patients']['Row']
type Report = Database['public']['Tables']['reports']['Row']
type Intake = Database['public']['Tables']['intakes']['Row']
type Screening = Database['public']['Tables']['screenings']['Row']
type RiskAssessment = Database['public']['Tables']['risk_assessments']['Row']

/**
 * Simplified patient info for AI context
 */
export interface ClientPatient {
  name: string
  birthDate: string
  status: string | null
}

/**
 * Simplified report for AI context
 */
export interface ClientReport {
  type: string
  content: string
  date: string
}

/**
 * Simplified intake for AI context
 */
export interface ClientIntake {
  title: string
  department: string
  status: string
  treatmentAdvice: {
    advice?: string
    outcome?: string
    program?: string
    department?: string
  } | null
  notes: string | null
}

/**
 * Simplified screening for AI context
 */
export interface ClientScreening {
  requestForHelp: string | null
  decision: string | null
  decisionNotes: string | null
}

/**
 * Simplified risk assessment for AI context
 */
export interface ClientRiskAssessment {
  type: string
  level: string
  rationale: string
  date: string
}

/**
 * Complete client context for AI prompt
 */
export interface ClientContext {
  patient: ClientPatient
  reports: ClientReport[]
  intakes: ClientIntake[]
  screening: ClientScreening | null
  riskAssessments: ClientRiskAssessment[]
}

/**
 * Format patient name from database fields
 */
function formatPatientName(patient: Patient): string {
  const givenNames = patient.name_given?.join(' ') || ''
  const prefix = patient.name_prefix ? `${patient.name_prefix} ` : ''
  return `${givenNames} ${prefix}${patient.name_family}`.trim()
}

/**
 * Format date for display (Dutch format)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Load patient basic info
 */
async function loadPatient(clientId: string): Promise<ClientPatient | null> {
  const { data, error } = await supabaseAdmin
    .from('patients')
    .select('name_given, name_family, name_prefix, birth_date, status')
    .eq('id', clientId)
    .single()

  if (error || !data) {
    console.error('Error loading patient:', error)
    return null
  }

  return {
    name: formatPatientName(data as Patient),
    birthDate: formatDate(data.birth_date),
    status: data.status,
  }
}

/**
 * Load recent reports (max 5, newest first)
 */
async function loadReports(clientId: string): Promise<ClientReport[]> {
  const { data, error } = await supabaseAdmin
    .from('reports')
    .select('type, content, created_at')
    .eq('patient_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error || !data) {
    console.error('Error loading reports:', error)
    return []
  }

  return data.map((report) => ({
    type: report.type === 'behandeladvies' ? 'Behandeladvies' : 'Vrije notitie',
    content: report.content,
    date: formatDate(report.created_at!),
  }))
}

/**
 * Load recent intakes with treatment advice (max 3, newest first)
 */
async function loadIntakes(clientId: string): Promise<ClientIntake[]> {
  const { data, error } = await supabaseAdmin
    .from('intakes')
    .select('title, department, status, treatment_advice, notes')
    .eq('patient_id', clientId)
    .order('created_at', { ascending: false })
    .limit(3)

  if (error || !data) {
    console.error('Error loading intakes:', error)
    return []
  }

  return data.map((intake) => ({
    title: intake.title,
    department: intake.department,
    status: intake.status === 'afgerond' ? 'Afgerond' : 'Bezig',
    treatmentAdvice: intake.treatment_advice as ClientIntake['treatmentAdvice'],
    notes: intake.notes,
  }))
}

/**
 * Load most recent screening
 */
async function loadScreening(clientId: string): Promise<ClientScreening | null> {
  const { data, error } = await supabaseAdmin
    .from('screenings')
    .select('request_for_help, decision, decision_notes')
    .eq('patient_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    // No screening is a valid state, not an error
    return null
  }

  return {
    requestForHelp: data.request_for_help,
    decision: data.decision === 'geschikt' ? 'Geschikt' : data.decision === 'niet_geschikt' ? 'Niet geschikt' : null,
    decisionNotes: data.decision_notes,
  }
}

/**
 * Load risk assessments via intakes (max 5, newest first)
 */
async function loadRiskAssessments(clientId: string): Promise<ClientRiskAssessment[]> {
  // First get intake IDs for this patient
  const { data: intakes, error: intakesError } = await supabaseAdmin
    .from('intakes')
    .select('id')
    .eq('patient_id', clientId)

  if (intakesError || !intakes || intakes.length === 0) {
    return []
  }

  const intakeIds = intakes.map((i) => i.id)

  // Then get risk assessments for those intakes
  const { data, error } = await supabaseAdmin
    .from('risk_assessments')
    .select('risk_type, risk_level, rationale, assessment_date')
    .in('intake_id', intakeIds)
    .order('assessment_date', { ascending: false })
    .limit(5)

  if (error || !data) {
    console.error('Error loading risk assessments:', error)
    return []
  }

  return data.map((ra) => ({
    type: ra.risk_type,
    level: ra.risk_level,
    rationale: ra.rationale,
    date: formatDate(ra.assessment_date),
  }))
}

/**
 * Load complete client context for AI assistant
 * Loads all data in parallel for performance
 *
 * @param clientId - UUID of the patient
 * @returns ClientContext or null if patient not found
 */
export async function loadClientContext(clientId: string): Promise<ClientContext | null> {
  // Load all data in parallel
  const [patient, reports, intakes, screening, riskAssessments] = await Promise.all([
    loadPatient(clientId),
    loadReports(clientId),
    loadIntakes(clientId),
    loadScreening(clientId),
    loadRiskAssessments(clientId),
  ])

  // Patient must exist
  if (!patient) {
    return null
  }

  return {
    patient,
    reports,
    intakes,
    screening,
    riskAssessments,
  }
}
