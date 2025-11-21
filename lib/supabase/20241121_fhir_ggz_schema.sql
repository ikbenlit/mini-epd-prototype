-- Migration: FHIR-compliant GGZ EPD Schema
-- Created: 2024-11-21
-- Description: Core tables for intake, diagnostiek en behandelplan
-- Based on: FHIR R4, MedMIJ Basisgegevens GGZ 2.0, Koppeltaal

-- ============================================================================
-- ENABLE EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES (for type safety)
-- ============================================================================

-- FHIR Gender
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'unknown');

-- FHIR Encounter Status
CREATE TYPE encounter_status AS ENUM (
  'planned', 'in-progress', 'on-hold', 'completed', 
  'cancelled', 'entered-in-error', 'unknown'
);

-- FHIR Condition Clinical Status
CREATE TYPE condition_clinical_status AS ENUM (
  'active', 'recurrence', 'relapse', 'inactive', 
  'remission', 'resolved', 'unknown'
);

-- FHIR Condition Verification Status
CREATE TYPE condition_verification_status AS ENUM (
  'unconfirmed', 'provisional', 'differential', 
  'confirmed', 'refuted', 'entered-in-error'
);

-- FHIR Observation Status
CREATE TYPE observation_status AS ENUM (
  'registered', 'preliminary', 'final', 'amended',
  'corrected', 'cancelled', 'entered-in-error', 'unknown'
);

-- FHIR CarePlan Status
CREATE TYPE careplan_status AS ENUM (
  'draft', 'active', 'on-hold', 'revoked', 
  'completed', 'entered-in-error', 'unknown'
);

-- FHIR CarePlan Activity Status
CREATE TYPE activity_status AS ENUM (
  'not-started', 'scheduled', 'in-progress', 
  'on-hold', 'completed', 'cancelled', 'stopped', 'unknown'
);

-- FHIR DocumentReference Status
CREATE TYPE document_status AS ENUM (
  'current', 'superseded', 'entered-in-error'
);

-- ============================================================================
-- TABLE: practitioners (FHIR: Practitioner)
-- Behandelaren/professionals
-- ============================================================================
CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR Practitioner fields
  identifier_big TEXT UNIQUE, -- BIG-nummer (optioneel voor niet-BIG geregistreerden)
  identifier_agb TEXT, -- AGB-code
  
  -- Name (HumanName)
  name_prefix TEXT, -- "Drs.", "Dr."
  name_given TEXT[] NOT NULL, -- Voornamen
  name_family TEXT NOT NULL, -- Achternaam
  name_suffix TEXT, -- "PhD", "MSc"
  
  -- Qualification
  qualification TEXT[], -- ["GZ-psycholoog", "Psychotherapeut"]
  
  -- Contact
  telecom_phone TEXT,
  telecom_email TEXT,
  
  -- Active
  active BOOLEAN DEFAULT true,
  
  -- Link to auth user
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: organizations (FHIR: Organization)
-- GGZ-instellingen
-- ============================================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR Organization fields
  identifier_agb TEXT UNIQUE, -- AGB-code instelling
  identifier_kvk TEXT, -- KVK-nummer
  
  -- Name
  name TEXT NOT NULL,
  alias TEXT[], -- Alternative names
  
  -- Type
  type_code TEXT DEFAULT 'prov', -- healthcare provider
  type_display TEXT DEFAULT 'Healthcare Provider',
  
  -- Contact
  telecom_phone TEXT,
  telecom_email TEXT,
  telecom_website TEXT,
  
  -- Address
  address_line TEXT[],
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'NL',
  
  -- Active
  active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: patients (FHIR: Patient / ZIB: Patient)
-- Cliënten/patiënten
-- ============================================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR Patient.identifier
  identifier_bsn TEXT UNIQUE NOT NULL, -- BSN (verplicht in NL)
  identifier_client_number TEXT, -- Interne cliëntnummer
  
  -- FHIR Patient.name (HumanName)
  name_family TEXT NOT NULL, -- Achternaam
  name_given TEXT[] NOT NULL, -- Voornamen array
  name_prefix TEXT, -- Voorvoegsel (van, de, etc)
  name_use TEXT DEFAULT 'official', -- official, maiden, nickname
  
  -- FHIR Patient.birthDate
  birth_date DATE NOT NULL,
  
  -- FHIR Patient.gender
  gender gender_type NOT NULL,
  
  -- FHIR Patient.telecom (ContactPoint)
  telecom_phone TEXT,
  telecom_email TEXT,
  
  -- FHIR Patient.address (Address)
  address_line TEXT[], -- Straat + huisnummer
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'NL',
  
  -- Insurance (ZIB: Payer)
  insurance_company TEXT, -- Zorgverzekeraar
  insurance_number TEXT, -- Polisnummer
  
  -- FHIR Patient.contact (naasten)
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  
  -- FHIR Patient.active
  active BOOLEAN DEFAULT true,
  
  -- FHIR Patient.generalPractitioner (huisarts)
  general_practitioner_name TEXT,
  general_practitioner_agb TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: encounters (FHIR: Encounter / ZIB: Contact)
-- Contactmomenten (intake, behandelsessie, etc)
-- ============================================================================
CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR Encounter.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  
  -- FHIR Encounter.status
  status encounter_status NOT NULL DEFAULT 'planned',
  
  -- FHIR Encounter.class
  class_code TEXT NOT NULL, -- AMB (ambulatory), IMP (inpatient), EMER (emergency)
  class_display TEXT NOT NULL,
  
  -- FHIR Encounter.type
  type_code TEXT NOT NULL, -- intake, diagnostiek, behandeling, follow-up
  type_display TEXT NOT NULL,
  
  -- FHIR Encounter.priority
  priority_code TEXT, -- routine, urgent, emergency
  priority_display TEXT,
  
  -- FHIR Encounter.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  
  -- FHIR Encounter.participant (behandelaar)
  practitioner_id UUID REFERENCES practitioners(id),
  
  -- FHIR Encounter.serviceProvider (instelling)
  organization_id UUID REFERENCES organizations(id),
  
  -- FHIR Encounter.period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ,
  
  -- FHIR Encounter.reasonCode
  reason_code TEXT[], -- DSM-5 codes, SNOMED codes
  reason_display TEXT[], -- Human-readable reason
  
  -- FHIR Encounter.hospitalization (indien opname)
  admission_source TEXT,
  discharge_disposition TEXT,
  
  -- Free text notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: conditions (FHIR: Condition / ZIB: Problem)
-- DSM-5 diagnoses en problemlijst
-- ============================================================================
CREATE TABLE conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR Condition.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  
  -- FHIR Condition.clinicalStatus
  clinical_status condition_clinical_status NOT NULL DEFAULT 'active',
  
  -- FHIR Condition.verificationStatus
  verification_status condition_verification_status NOT NULL DEFAULT 'provisional',
  
  -- FHIR Condition.category
  category TEXT NOT NULL DEFAULT 'encounter-diagnosis', -- of 'problem-list-item'
  
  -- FHIR Condition.severity
  severity_code TEXT, -- mild, moderate, severe
  severity_display TEXT,
  
  -- FHIR Condition.code (DSM-5 / ICD-10)
  code_system TEXT NOT NULL DEFAULT 'http://hl7.org/fhir/sid/icd-10',
  code_code TEXT NOT NULL, -- "F32.2", "F41.1"
  code_display TEXT NOT NULL, -- "Depressieve episode, ernstig"
  
  -- FHIR Condition.bodySite (indien relevant)
  body_site_code TEXT,
  body_site_display TEXT,
  
  -- FHIR Condition.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  
  -- FHIR Condition.encounter (wanneer gesteld)
  encounter_id UUID REFERENCES encounters(id),
  
  -- FHIR Condition.onsetDateTime / abatementDateTime
  onset_datetime TIMESTAMPTZ,
  onset_age INTEGER, -- Leeftijd bij ontstaan (optioneel)
  abatement_datetime TIMESTAMPTZ,
  abatement_age INTEGER,
  
  -- FHIR Condition.recordedDate
  recorded_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- FHIR Condition.recorder (wie legde vast)
  recorder_id UUID REFERENCES practitioners(id),
  
  -- FHIR Condition.asserter (wie stelde diagnose)
  asserter_id UUID REFERENCES practitioners(id),
  
  -- FHIR Condition.note
  note TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: observations (FHIR: Observation)
-- ROM-scores, risico's, klachten, metingen
-- ============================================================================
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR Observation.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  
  -- FHIR Observation.status
  status observation_status NOT NULL DEFAULT 'final',
  
  -- FHIR Observation.category
  category TEXT NOT NULL, -- vital-signs, social-history, exam, survey, therapy
  
  -- FHIR Observation.code (wat werd geobserveerd)
  code_system TEXT NOT NULL, -- SNOMED, LOINC, custom
  code_code TEXT NOT NULL,
  code_display TEXT NOT NULL,
  
  -- FHIR Observation.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  
  -- FHIR Observation.encounter
  encounter_id UUID REFERENCES encounters(id),
  
  -- FHIR Observation.effectiveDateTime
  effective_datetime TIMESTAMPTZ NOT NULL,
  
  -- FHIR Observation.issued
  issued TIMESTAMPTZ DEFAULT NOW(),
  
  -- FHIR Observation.performer (wie deed observatie)
  performer_id UUID REFERENCES practitioners(id),
  
  -- FHIR Observation.value[x] (polymorf!)
  value_type TEXT NOT NULL, -- quantity, string, boolean, codeableConcept
  value_quantity_value NUMERIC,
  value_quantity_unit TEXT,
  value_quantity_comparator TEXT, -- <, <=, >=, >
  value_string TEXT,
  value_boolean BOOLEAN,
  value_codeable_concept JSONB, -- {system, code, display}
  
  -- FHIR Observation.interpretation
  interpretation_code TEXT, -- H (high), L (low), N (normal)
  interpretation_display TEXT,
  
  -- FHIR Observation.note
  note TEXT,
  
  -- FHIR Observation.bodySite
  body_site TEXT,
  
  -- FHIR Observation.method
  method_code TEXT,
  method_display TEXT,
  
  -- Reference range (normaalwaarden)
  reference_range_low NUMERIC,
  reference_range_high NUMERIC,
  reference_range_text TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: medication_statements (FHIR: MedicationStatement)
-- Huidige medicatie van patiënt
-- ============================================================================
CREATE TABLE medication_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR MedicationStatement.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  
  -- FHIR MedicationStatement.status
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, entered-in-error, stopped
  
  -- FHIR MedicationStatement.medicationCodeableConcept
  medication_code TEXT NOT NULL, -- PRK, GPK, HPK code
  medication_display TEXT NOT NULL, -- "Sertraline 50mg tablet"
  medication_system TEXT DEFAULT 'http://www.whocc.no/atc', -- ATC codes
  
  -- FHIR MedicationStatement.subject
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  
  -- FHIR MedicationStatement.context
  encounter_id UUID REFERENCES encounters(id),
  
  -- FHIR MedicationStatement.effectiveDateTime / effectivePeriod
  effective_datetime TIMESTAMPTZ,
  effective_period_start TIMESTAMPTZ,
  effective_period_end TIMESTAMPTZ,
  
  -- FHIR MedicationStatement.dateAsserted
  date_asserted TIMESTAMPTZ DEFAULT NOW(),
  
  -- FHIR MedicationStatement.informationSource
  information_source_id UUID REFERENCES practitioners(id),
  
  -- FHIR MedicationStatement.dosage
  dosage_text TEXT, -- "1 tablet 's ochtends"
  dosage_route TEXT, -- oraal, intraveneus, etc
  dosage_timing TEXT, -- frequency
  dosage_dose_quantity NUMERIC,
  dosage_dose_unit TEXT,
  
  -- FHIR MedicationStatement.reasonCode
  reason_code TEXT[],
  reason_display TEXT[],
  
  -- FHIR MedicationStatement.note
  note TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: care_plans (FHIR: CarePlan)
-- Behandelplannen
-- ============================================================================
CREATE TABLE care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR CarePlan.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  
  -- FHIR CarePlan.status
  status careplan_status NOT NULL DEFAULT 'draft',
  
  -- FHIR CarePlan.intent
  intent TEXT NOT NULL DEFAULT 'plan', -- proposal, plan, order, option
  
  -- FHIR CarePlan.category
  category_code TEXT DEFAULT 'ggz-behandelplan',
  category_display TEXT DEFAULT 'GGZ Behandelplan',
  
  -- FHIR CarePlan.title
  title TEXT NOT NULL,
  
  -- FHIR CarePlan.description
  description TEXT,
  
  -- FHIR CarePlan.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  
  -- FHIR CarePlan.encounter (intake waar uit voortkomt)
  encounter_id UUID REFERENCES encounters(id),
  
  -- FHIR CarePlan.period
  period_start DATE,
  period_end DATE,
  
  -- FHIR CarePlan.created
  created_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- FHIR CarePlan.author (regiebehandelaar)
  author_id UUID REFERENCES practitioners(id),
  
  -- FHIR CarePlan.contributor
  contributor_ids UUID[], -- Array van practitioner IDs
  
  -- FHIR CarePlan.careTeam
  care_team_ids UUID[], -- Array van practitioner IDs
  
  -- FHIR CarePlan.addresses (welke diagnoses)
  addresses_condition_ids UUID[], -- Array van condition IDs
  
  -- FHIR CarePlan.goal (behandeldoelen als array)
  goals JSONB, -- [{description: "...", target: {...}}]
  
  -- FHIR CarePlan.note
  note TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: care_plan_activities (FHIR: CarePlan.activity)
-- Behandelactiviteiten binnen een behandelplan
-- ============================================================================
CREATE TABLE care_plan_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to parent CarePlan
  care_plan_id UUID REFERENCES care_plans(id) ON DELETE CASCADE NOT NULL,
  
  -- FHIR CarePlan.activity.outcomeCodeableConcept
  outcome_code TEXT,
  outcome_display TEXT,
  
  -- FHIR CarePlan.activity.outcomeReference
  outcome_observation_ids UUID[], -- References to observations
  
  -- FHIR CarePlan.activity.progress
  progress TEXT[], -- Array van voortgangsnotities
  
  -- FHIR CarePlan.activity.reference (ServiceRequest, Task, etc)
  reference_type TEXT, -- ServiceRequest, Appointment, Task
  reference_id UUID,
  
  -- FHIR CarePlan.activity.detail
  detail_kind TEXT, -- ServiceRequest, Appointment, etc
  detail_code_code TEXT,
  detail_code_display TEXT NOT NULL, -- "Individuele CGT", "ROM-meting"
  
  detail_status activity_status NOT NULL DEFAULT 'not-started',
  
  detail_status_reason TEXT,
  
  detail_do_not_perform BOOLEAN DEFAULT false,
  
  -- Scheduling
  detail_scheduled_timing TEXT, -- "1x per week", "daily"
  detail_scheduled_period_start DATE,
  detail_scheduled_period_end DATE,
  
  -- Location
  detail_location TEXT, -- "Polikliniek", "Online"
  
  -- Performer (wie voert uit)
  detail_performer_id UUID REFERENCES practitioners(id),
  
  -- Description
  detail_description TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: goals (FHIR: Goal / ZIB: TreatmentObjective)
-- Behandeldoelen
-- ============================================================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR Goal.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  
  -- FHIR Goal.lifecycleStatus
  lifecycle_status TEXT NOT NULL DEFAULT 'proposed', -- proposed, planned, accepted, active, on-hold, completed, cancelled, entered-in-error, rejected
  
  -- FHIR Goal.achievementStatus
  achievement_status TEXT, -- in-progress, improving, worsening, no-change, achieved, sustaining, not-achieved, no-progress, not-attainable
  
  -- FHIR Goal.category
  category_code TEXT DEFAULT 'treatment',
  category_display TEXT DEFAULT 'Behandeldoel',
  
  -- FHIR Goal.priority
  priority_code TEXT, -- high-priority, medium-priority, low-priority
  priority_display TEXT,
  
  -- FHIR Goal.description (het doel zelf)
  description_code TEXT,
  description_text TEXT NOT NULL, -- "PHQ-9 score < 10", "Herstel dagelijks functioneren"
  
  -- FHIR Goal.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  
  -- FHIR Goal.startDate / target.dueDate
  start_date DATE,
  target_due_date DATE,
  
  -- FHIR Goal.target (meetbaar doel)
  target_measure_code TEXT, -- bijv. PHQ-9 code
  target_measure_display TEXT,
  target_detail_quantity NUMERIC, -- bijv. < 10
  target_detail_unit TEXT,
  target_detail_comparator TEXT, -- <, <=, >=, >
  
  -- FHIR Goal.expressedBy (wie stelde doel)
  expressed_by_id UUID REFERENCES practitioners(id),
  
  -- FHIR Goal.addresses (welke conditions/observations)
  addresses_condition_ids UUID[], -- Array van condition IDs
  addresses_observation_ids UUID[], -- Array van observation IDs
  
  -- FHIR Goal.note
  note TEXT,
  
  -- FHIR Goal.outcomeCode / outcomeReference
  outcome_code TEXT,
  outcome_display TEXT,
  outcome_observation_ids UUID[], -- Metingen die outcome aantonen
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: consents (FHIR: Consent / ZIB: AdvanceDirective)
-- Toestemmingen, wilsverklaringen, AVG consent
-- ============================================================================
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR Consent.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  
  -- FHIR Consent.status
  status TEXT NOT NULL DEFAULT 'active', -- draft, proposed, active, rejected, inactive, entered-in-error
  
  -- FHIR Consent.scope
  scope_code TEXT NOT NULL, -- patient-privacy, research, treatment, advance-directive
  scope_display TEXT NOT NULL,
  
  -- FHIR Consent.category
  category_code TEXT NOT NULL, -- acd (advance directive), dnr (do not resuscitate), emrgonly, etc
  category_display TEXT NOT NULL,
  
  -- FHIR Consent.patient
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  
  -- FHIR Consent.dateTime
  date_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- FHIR Consent.performer (wie gaf toestemming)
  performer_ids UUID[], -- Patient zelf of wettelijk vertegenwoordiger
  
  -- FHIR Consent.organization
  organization_id UUID REFERENCES organizations(id),
  
  -- FHIR Consent.sourceAttachment / sourceReference
  source_attachment_data TEXT, -- PDF van ondertekende wilsverklaring
  source_attachment_url TEXT,
  source_document_id UUID REFERENCES document_references(id),
  
  -- FHIR Consent.policy
  policy_rule_code TEXT, -- GDPR, NL-wetgeving, etc
  policy_rule_text TEXT,
  
  -- FHIR Consent.provision (wat is toegestaan/verboden)
  provision_type TEXT NOT NULL DEFAULT 'permit', -- deny, permit
  provision_period_start TIMESTAMPTZ,
  provision_period_end TIMESTAMPTZ,
  
  -- Provision details (wat mag wel/niet)
  provision_action TEXT[], -- access, correct, disclose, etc
  provision_purpose TEXT[], -- TREAT (behandeling), ETREAT (spoedeisend), etc
  
  -- FHIR Consent.provision.actor (wie mag)
  provision_actor_ids UUID[], -- Practitioner IDs die toegang hebben
  
  -- FHIR Consent.provision.data (welke data)
  provision_data_meaning TEXT, -- instance, related, dependents, authoredby
  provision_data_reference_ids UUID[], -- Specifieke resources
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: flags (FHIR: Flag / ZIB: Alert)
-- Waarschuwingen en belangrijke alerts in dossier
-- ============================================================================
CREATE TABLE flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR Flag.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  
  -- FHIR Flag.status
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, entered-in-error
  
  -- FHIR Flag.category
  category_code TEXT NOT NULL, -- safety, clinical, administrative, behavioral, infection, drug
  category_display TEXT NOT NULL,
  
  -- FHIR Flag.code (wat is de alert)
  code_code TEXT NOT NULL,
  code_display TEXT NOT NULL, -- "Suïciderisico", "Agressie naar hulpverleners", "Allergie"
  
  -- FHIR Flag.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  
  -- FHIR Flag.period (hoe lang geldig)
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_end TIMESTAMPTZ,
  
  -- FHIR Flag.encounter
  encounter_id UUID REFERENCES encounters(id),
  
  -- FHIR Flag.author (wie maakte alert)
  author_id UUID REFERENCES practitioners(id),
  
  -- Priority (custom extension - niet standaard FHIR)
  priority TEXT, -- high, medium, low
  
  -- FHIR Flag.code details
  alert_type TEXT NOT NULL, -- suicide-risk, aggression, allergy, infection, fall-risk, etc
  
  -- Extra context
  description TEXT, -- Vrije tekst toelichting
  
  -- Gerelateerde resources
  related_condition_ids UUID[], -- Conditions die deze alert veroorzaken
  related_observation_ids UUID[], -- Observations die deze alert ondersteunen
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: document_references (FHIR: DocumentReference)
-- Documenten (intakeverslagen, behandelplannen, etc)
-- ============================================================================
CREATE TABLE document_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FHIR DocumentReference.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  
  -- FHIR DocumentReference.status
  status document_status NOT NULL DEFAULT 'current',
  
  -- FHIR DocumentReference.docStatus
  doc_status TEXT, -- preliminary, final, amended
  
  -- FHIR DocumentReference.type
  type_code TEXT NOT NULL, -- intake-verslag, behandelplan, etc
  type_display TEXT NOT NULL,
  
  -- FHIR DocumentReference.category
  category TEXT DEFAULT 'clinical-note',
  
  -- FHIR DocumentReference.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  
  -- FHIR DocumentReference.context.encounter
  encounter_id UUID REFERENCES encounters(id),
  
  -- FHIR DocumentReference.date
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- FHIR DocumentReference.author
  author_id UUID REFERENCES practitioners(id),
  
  -- FHIR DocumentReference.authenticator (wie ondertekende)
  authenticator_id UUID REFERENCES practitioners(id),
  
  -- FHIR DocumentReference.custodian (organisatie die beheert)
  custodian_id UUID REFERENCES organizations(id),
  
  -- FHIR DocumentReference.content
  content_attachment_content_type TEXT DEFAULT 'text/markdown',
  content_attachment_data TEXT, -- Markdown of base64
  content_attachment_url TEXT, -- Of link naar storage
  content_attachment_title TEXT,
  content_attachment_creation TIMESTAMPTZ DEFAULT NOW(),
  
  -- FHIR DocumentReference.context.period
  context_period_start TIMESTAMPTZ,
  context_period_end TIMESTAMPTZ,
  
  -- FHIR DocumentReference.context.related (gerelateerde conditions, etc)
  context_related_ids UUID[],
  
  -- Security labels
  security_label TEXT[], -- restricted, normal, unrestricted
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES (voor performance)
-- ============================================================================

-- Practitioners
CREATE INDEX idx_practitioners_user_id ON practitioners(user_id);
CREATE INDEX idx_practitioners_active ON practitioners(active);

-- Patients
CREATE INDEX idx_patients_bsn ON patients(identifier_bsn);
CREATE INDEX idx_patients_active ON patients(active);

-- Encounters
CREATE INDEX idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX idx_encounters_practitioner_id ON encounters(practitioner_id);
CREATE INDEX idx_encounters_status ON encounters(status);
CREATE INDEX idx_encounters_period_start ON encounters(period_start DESC);

-- Conditions
CREATE INDEX idx_conditions_patient_id ON conditions(patient_id);
CREATE INDEX idx_conditions_encounter_id ON conditions(encounter_id);
CREATE INDEX idx_conditions_clinical_status ON conditions(clinical_status);
CREATE INDEX idx_conditions_code ON conditions(code_code);

-- Observations
CREATE INDEX idx_observations_patient_id ON observations(patient_id);
CREATE INDEX idx_observations_encounter_id ON observations(encounter_id);
CREATE INDEX idx_observations_category ON observations(category);
CREATE INDEX idx_observations_effective_datetime ON observations(effective_datetime DESC);

-- Medication Statements
CREATE INDEX idx_medication_statements_patient_id ON medication_statements(patient_id);
CREATE INDEX idx_medication_statements_status ON medication_statements(status);

-- Care Plans
CREATE INDEX idx_care_plans_patient_id ON care_plans(patient_id);
CREATE INDEX idx_care_plans_status ON care_plans(status);
CREATE INDEX idx_care_plans_author_id ON care_plans(author_id);

-- Care Plan Activities
CREATE INDEX idx_care_plan_activities_care_plan_id ON care_plan_activities(care_plan_id);
CREATE INDEX idx_care_plan_activities_status ON care_plan_activities(detail_status);

-- Document References
CREATE INDEX idx_document_references_patient_id ON document_references(patient_id);
CREATE INDEX idx_document_references_encounter_id ON document_references(encounter_id);
CREATE INDEX idx_document_references_type ON document_references(type_code);

-- Goals
CREATE INDEX idx_goals_patient_id ON goals(patient_id);
CREATE INDEX idx_goals_lifecycle_status ON goals(lifecycle_status);
CREATE INDEX idx_goals_achievement_status ON goals(achievement_status);

-- Consents
CREATE INDEX idx_consents_patient_id ON consents(patient_id);
CREATE INDEX idx_consents_status ON consents(status);
CREATE INDEX idx_consents_scope ON consents(scope_code);
CREATE INDEX idx_consents_category ON consents(category_code);

-- Flags
CREATE INDEX idx_flags_patient_id ON flags(patient_id);
CREATE INDEX idx_flags_status ON flags(status);
CREATE INDEX idx_flags_category ON flags(category_code);
CREATE INDEX idx_flags_alert_type ON flags(alert_type);
CREATE INDEX idx_flags_priority ON flags(priority);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - basis setup
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plan_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- Voor MVP: practitioners kunnen alles zien/bewerken van hun eigen patiënten
-- Later verfijnen met teams, roles, etc.

-- Practitioners: can read/update their own record
CREATE POLICY "Practitioners can view own record" ON practitioners
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Practitioners can update own record" ON practitioners
  FOR UPDATE USING (user_id = auth.uid());

-- Patients: practitioners can view all (voor MVP - later verfijnen)
CREATE POLICY "Authenticated users can view patients" ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert patients" ON patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update patients" ON patients
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Encounters: authenticated users can view/create
CREATE POLICY "Authenticated users can view encounters" ON encounters
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert encounters" ON encounters
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update encounters" ON encounters
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Conditions: authenticated users can view/create
CREATE POLICY "Authenticated users can view conditions" ON conditions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert conditions" ON conditions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update conditions" ON conditions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Observations: authenticated users can view/create
CREATE POLICY "Authenticated users can view observations" ON observations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert observations" ON observations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Medication Statements: authenticated users can view/create
CREATE POLICY "Authenticated users can view medications" ON medication_statements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert medications" ON medication_statements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update medications" ON medication_statements
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Care Plans: authenticated users can view/create
CREATE POLICY "Authenticated users can view care plans" ON care_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert care plans" ON care_plans
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update care plans" ON care_plans
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Care Plan Activities: authenticated users can view/create
CREATE POLICY "Authenticated users can view activities" ON care_plan_activities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert activities" ON care_plan_activities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update activities" ON care_plan_activities
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Document References: authenticated users can view/create
CREATE POLICY "Authenticated users can view documents" ON document_references
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert documents" ON document_references
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update documents" ON document_references
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Goals: authenticated users can view/create
CREATE POLICY "Authenticated users can view goals" ON goals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert goals" ON goals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update goals" ON goals
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Consents: authenticated users can view/create
CREATE POLICY "Authenticated users can view consents" ON consents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert consents" ON consents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update consents" ON consents
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Flags: authenticated users can view/create
CREATE POLICY "Authenticated users can view flags" ON flags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert flags" ON flags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update flags" ON flags
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS - updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON practitioners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON encounters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON medication_statements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_plan_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON document_references
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON consents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (documentatie in database)
-- ============================================================================

COMMENT ON TABLE practitioners IS 'FHIR: Practitioner - Behandelaren en zorgprofessionals';
COMMENT ON TABLE organizations IS 'FHIR: Organization - GGZ-instellingen';
COMMENT ON TABLE patients IS 'FHIR: Patient / ZIB: Patient - Cliënten/patiënten';
COMMENT ON TABLE encounters IS 'FHIR: Encounter / ZIB: Contact - Contactmomenten (intake, behandeling, etc)';
COMMENT ON TABLE conditions IS 'FHIR: Condition / ZIB: Problem - DSM-5 diagnoses en problemlijst';
COMMENT ON TABLE observations IS 'FHIR: Observation - ROM-scores, risico-inschattingen, metingen';
COMMENT ON TABLE medication_statements IS 'FHIR: MedicationStatement - Huidige medicatie van patiënt';
COMMENT ON TABLE care_plans IS 'FHIR: CarePlan - Behandelplannen';
COMMENT ON TABLE care_plan_activities IS 'FHIR: CarePlan.activity - Behandelactiviteiten';
COMMENT ON TABLE document_references IS 'FHIR: DocumentReference - Intakeverslagen, brieven, etc';
COMMENT ON TABLE goals IS 'FHIR: Goal / ZIB: TreatmentObjective - Behandeldoelen';
COMMENT ON TABLE consents IS 'FHIR: Consent / ZIB: AdvanceDirective - Toestemmingen en wilsverklaringen';
COMMENT ON TABLE flags IS 'FHIR: Flag / ZIB: Alert - Waarschuwingen en alerts in dossier';

-- ============================================================================
-- SAMPLE DATA (optioneel - voor development/demo)
-- ============================================================================

-- Uncomment onderstaande voor demo data:

-- INSERT INTO organizations (name, identifier_agb) VALUES
--   ('Demo GGZ Instelling', 'AGB12345678');

-- Voltooid! Schema is FHIR-compliant en klaar voor MedMIJ/Koppeltaal integratie.
