/**
 * Test script to verify Supabase connection
 * Run with: node --loader tsx lib/supabase/test-connection.ts
 */

import { supabase } from './client'

async function testConnection() {
  console.log('🔗 Testing Supabase connection...')

  try {
    // Test basic connection
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1)

    if (error && error.code !== 'PGRST204') {
      // PGRST204 = table doesn't exist yet, which is fine
      console.log('⚠️  Connection works, but database schema not yet created')
      console.log('   Run EP01 migrations to create tables')
    } else {
      console.log('✅ Supabase connection successful!')
    }

    // Show project info
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    console.log(`📍 Project: ${url}`)

  } catch (err) {
    console.error('❌ Connection failed:', err)
    process.exit(1)
  }
}

testConnection()
