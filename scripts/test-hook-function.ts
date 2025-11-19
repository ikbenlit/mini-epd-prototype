#!/usr/bin/env tsx
/**
 * Test Auth Hook Function
 * Tests the hook function directly to verify it works
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testHookFunction() {
  console.log('🧪 Testing Auth Hook Function\n')

  // Test 1: New email (should allow)
  console.log('Test 1: New email (should return empty object)')
  const test1 = await supabase.rpc('hook_check_duplicate_email', {
    event: { user: { email: 'newemail@test.com' } }
  })
  console.log('Result:', test1.data)
  console.log('Error:', test1.error)

  // Test 2: Existing email (should block)
  console.log('\nTest 2: Existing email colin@ikbenlit.nl (should return error)')
  const test2 = await supabase.rpc('hook_check_duplicate_email', {
    event: { user: { email: 'colin@ikbenlit.nl' } }
  })
  console.log('Result:', test2.data)
  console.log('Error:', test2.error)

  // Test 3: Case variant (should block)
  console.log('\nTest 3: Case variant Colin@IkBenLit.nl (should return error)')
  const test3 = await supabase.rpc('hook_check_duplicate_email', {
    event: { user: { email: 'Colin@IkBenLit.nl' } }
  })
  console.log('Result:', test3.data)
  console.log('Error:', test3.error)

  // Test 4: Empty email (should block)
  console.log('\nTest 4: Empty email (should return error)')
  const test4 = await supabase.rpc('hook_check_duplicate_email', {
    event: { user: { email: '' } }
  })
  console.log('Result:', test4.data)
  console.log('Error:', test4.error)

  // Check if colin@ikbenlit.nl exists
  console.log('\n📋 Checking if colin@ikbenlit.nl exists in auth.users:')
  const { data: users, error: usersError } = await supabase.rpc('exec_sql', {
    sql: "SELECT email, created_at FROM auth.users WHERE lower(email) = 'colin@ikbenlit.nl' LIMIT 1"
  })

  if (usersError) {
    console.log('Could not query users directly (expected, requires special permissions)')
    console.log('Error:', usersError.message)
  } else {
    console.log('Users found:', users)
  }
}

testHookFunction().catch(console.error)
