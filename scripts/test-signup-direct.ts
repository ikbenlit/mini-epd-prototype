#!/usr/bin/env tsx
/**
 * Test Signup Direct
 * Test wat Supabase teruggeeft bij duplicate email signup
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
  console.log('🧪 Testing Direct Signup with Existing Email\n')
  console.log('URL:', supabaseUrl)
  console.log('Testing with email: colin@ikbenlit.nl\n')

  const { data, error } = await supabase.auth.signUp({
    email: 'colin@ikbenlit.nl',
    password: 'TestPassword123!',
    options: {
      emailRedirectTo: `http://localhost:3000/auth/callback`
    }
  })

  console.log('📊 Response:')
  console.log('Data:', JSON.stringify(data, null, 2))
  console.log('\nError:', JSON.stringify(error, null, 2))

  console.log('\n📝 Analysis:')
  if (error) {
    console.log('✅ Hook is working! Error received:', error.message)
  } else if (data.user && data.session) {
    console.log('⚠️  User created with session (email confirmation disabled)')
  } else if (data.user) {
    console.log('⚠️  User object returned without session')
  } else {
    console.log('❌ No error but no user - Hook might not be working')
    console.log('   This is the "silent fail" scenario')
  }
}

testSignup().catch(console.error)
