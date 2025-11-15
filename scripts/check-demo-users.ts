/**
 * Check Demo Users Script
 * Verify that demo users exist and are properly configured
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function checkDemoUsers() {
  console.log('🔍 Checking demo users...\n')

  // Check demo_users table
  const { data, error } = await supabase
    .from('demo_users')
    .select('*')
    .order('created_at')

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log(`✅ Found ${data.length} demo users in database:\n`)

  data.forEach((user, index) => {
    console.log(`${index + 1}. Demo User`)
    console.log(`   User ID: ${user.user_id}`)
    console.log(`   Access Level: ${user.access_level}`)
    console.log(`   Notes: ${user.notes}`)
    console.log(`   Expires: ${user.expires_at || 'Never'}`)
    console.log(`   Usage Count: ${user.usage_count}`)
    console.log('')
  })

  // Also check auth.users (need to match emails)
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const demoEmails = authUsers.users
    .filter(u => u.email?.includes('mini-ecd.demo'))
    .map(u => ({ email: u.email, id: u.id }))

  console.log('📧 Demo emails in auth.users:')
  demoEmails.forEach(u => {
    console.log(`   ${u.email} (${u.id})`)
  })
}

checkDemoUsers()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error:', error)
    process.exit(1)
  })
