#!/bin/bash

# ============================================================================
# Apply Organization Seed Migration
# ============================================================================
# Epic: E3.S1 - Organization seed
# Purpose: Create default organization for development
# ============================================================================

set -e

echo "🚀 Applying organization seed migration..."
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | grep -v '^$' | xargs)
fi

# Check if Supabase is available
echo "Checking Supabase connection..."
curl -s -o /dev/null -w "%{http_code}" "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" | grep -q "200" || {
  echo "❌ Cannot connect to Supabase. Please check if:"
  echo "   - Supabase is online (not under maintenance)"
  echo "   - Environment variables are set correctly"
  exit 1
}

echo "✅ Supabase is reachable"
echo ""

# Apply migration using psql
MIGRATION_FILE="supabase/migrations/20251122_seed_default_organization.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "📄 Applying migration: $MIGRATION_FILE"
echo ""

# Get database connection string from Supabase dashboard
# Format: postgresql://postgres:[PASSWORD]@db.dqugbrpwtisgyxscpefg.supabase.co:5432/postgres
# You can find this in: Supabase Dashboard > Project Settings > Database > Connection string

echo "⚠️  To apply this migration, run the SQL file in Supabase SQL Editor:"
echo ""
echo "   1. Go to https://supabase.com/dashboard/project/dqugbrpwtisgyxscpefg/sql"
echo "   2. Copy and paste the contents of:"
echo "      $MIGRATION_FILE"
echo "   3. Click 'Run'"
echo ""
echo "Or use the Supabase CLI:"
echo "   npx supabase db push"
echo ""
echo "Or use psql (if you have database password):"
echo "   psql 'postgresql://postgres:[PASSWORD]@db.dqugbrpwtisgyxscpefg.supabase.co:5432/postgres' -f $MIGRATION_FILE"
echo ""

# Alternative: Use Supabase Management API to apply migration
# This requires the service role key
# Uncomment if you want to use this method:
#
# echo "Applying migration via Supabase Management API..."
#
# MIGRATION_SQL=$(cat "$MIGRATION_FILE")
#
# curl -X POST \
#   "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
#   -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
#   -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
#   -H "Content-Type: application/json" \
#   -d "{\"query\": $(jq -Rs . <<< "$MIGRATION_SQL")}"

echo "✅ Script completed. Please apply the migration manually as described above."
