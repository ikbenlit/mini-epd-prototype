-- Migration: Fix conditions.encounter_id foreign key
-- The encounter_id column references intakes, not encounters
-- This migration drops the incorrect FK constraint and adds the correct one

-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE conditions
DROP CONSTRAINT IF EXISTS conditions_encounter_id_fkey;

-- Step 2: Add the correct foreign key constraint to intakes table
ALTER TABLE conditions
ADD CONSTRAINT conditions_intake_id_fkey
FOREIGN KEY (encounter_id) REFERENCES intakes(id) ON DELETE SET NULL;

-- Add comment for clarity
COMMENT ON COLUMN conditions.encounter_id IS 'Reference to intake (despite column name, links to intakes table for historical reasons)';
