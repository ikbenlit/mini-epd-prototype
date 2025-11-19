#!/usr/bin/env tsx
/**
 * Setup Script: Configure Auth Hook Link
 *
 * Dit script configureert de link tussen Supabase Auth Hook en onze Postgres functie.
 *
 * Helaas ondersteunt Supabase Management API nog geen Auth Hooks configuratie,
 * dus dit script geeft instructies voor handmatige configuratie.
 *
 * In de toekomst kan dit worden geautomatiseerd zodra Supabase API dit ondersteunt.
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('   Make sure .env.local is loaded with:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupAuthHook() {
  console.log('🔐 Auth Hook Setup Script\n')

  // Extract project ID from URL
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

  // Check if function exists by trying to call it with a test payload
  // This is more reliable than querying pg_proc directly
  try {
    const testPayload = {
      user: {
        email: 'test@example.com'
      }
    }

    const { data, error } = await supabase.rpc('hook_check_duplicate_email', {
      event: testPayload
    })

    // If function doesn't exist, we'll get a "function does not exist" error
    if (error && error.message?.includes('does not exist')) {
      console.error('❌ Function niet gevonden:', error.message)
      console.log('\n📝 Stap 1: Run eerst de migration:')
      console.log('   1. Ga naar: https://supabase.com/dashboard/project/' + projectId + '/sql')
      console.log('   2. Open migration file: supabase/migrations/20251119094908_auth_hook_duplicate_email.sql')
      console.log('   3. Kopieer de inhoud en plak in SQL Editor')
      console.log('   4. Klik "RUN" om de functie aan te maken')
      console.log('\n   Of via CLI (als je Supabase CLI hebt geconfigureerd):')
      console.log('   npx supabase db push')
      return
    }

    console.log('✅ Function exists: hook_check_duplicate_email')
    console.log('   Test call succeeded with response:', data || '{}')

  } catch (error: any) {
    console.error('⚠️  Could not verify function:', error.message)
    console.log('   Continuing with setup instructions...\n')
  }

  console.log('\n📝 Stap 2: Configureer hook link in Supabase Dashboard:')
  console.log('   1. Ga naar: https://supabase.com/dashboard/project/' + projectId + '/auth/hooks')
  console.log('   2. Klik "Add a new hook" of "Enable Hooks"')
  console.log('   3. Selecteer:')
  console.log('      - Hook Type: "Send a hook on before a user is created" (before-user-created)')
  console.log('      - Select hook: "Postgres Function"')
  console.log('      - Schema: "public"')
  console.log('      - Function Name: "hook_check_duplicate_email"')
  console.log('   4. Klik "Create hook" of "Save"')
  console.log('\n💡 Tip: Deze stap moet handmatig omdat Supabase Management API')
  console.log('   Auth Hooks configuratie nog niet ondersteunt.')
  console.log('\n✅ Setup compleet na Dashboard configuratie!')
  console.log('\n🧪 Test de hook:')
  console.log('   1. Ga naar je signup pagina')
  console.log('   2. Probeer te registreren met een bestaand emailadres')
  console.log('   3. Je zou een error moeten zien: "Dit emailadres is al geregistreerd..."')
}

setupAuthHook().catch(console.error)
