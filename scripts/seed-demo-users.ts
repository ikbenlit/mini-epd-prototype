/**
 * Seed Demo Users Script
 *
 * Creates demo user accounts in Supabase Auth
 * Run this script once after deployment to set up demo accounts
 *
 * Usage:
 *   tsx scripts/seed-demo-users.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Demo users to create
const demoUsers = [
  {
    email: 'demo@mini-ecd.demo',
    password: 'Demo2024!',
    access_level: 'interactive' as const,
    notes: 'Main interactive demo account - full CRUD access for presentations'
  },
  {
    email: 'readonly@mini-ecd.demo',
    password: 'Demo2024!',
    access_level: 'read_only' as const,
    notes: 'Read-only demo account - view only access for public demos'
  },
  {
    email: 'presenter@mini-ecd.demo',
    password: 'Demo2024!',
    access_level: 'presenter' as const,
    notes: 'Presenter account for live demo sessions with special features'
  }
]

async function seedDemoUsers() {
  console.log('🌱 Starting demo user seed...\n')

  for (const user of demoUsers) {
    console.log(`Creating user: ${user.email}...`)

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          access_level: user.access_level,
          is_demo: true
        }
      })

      if (authError) {
        // Check if user already exists
        if (authError.message.includes('already registered')) {
          console.log(`  ℹ️  User already exists, fetching existing user...`)

          // Get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existingUser = existingUsers.users.find(u => u.email === user.email)

          if (!existingUser) {
            throw new Error('User exists but cannot be found')
          }

          // Step 2: Upsert to demo_users table
          const { error: demoError } = await supabase
            .from('demo_users')
            .upsert({
              user_id: existingUser.id,
              access_level: user.access_level,
              notes: user.notes,
              expires_at: null, // No expiration for main demo accounts
              usage_count: 0
            }, {
              onConflict: 'user_id'
            })

          if (demoError) throw demoError

          console.log(`  ✅ Updated demo_users entry for ${user.email}`)
        } else {
          throw authError
        }
      } else {
        console.log(`  ✅ Created auth user: ${authData.user.id}`)

        // Step 2: Insert into demo_users table
        const { error: demoError } = await supabase
          .from('demo_users')
          .insert({
            user_id: authData.user.id,
            access_level: user.access_level,
            notes: user.notes,
            expires_at: null, // No expiration for main demo accounts
            usage_count: 0
          })

        if (demoError) {
          // Cleanup auth user if demo_users insert fails
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw demoError
        }

        console.log(`  ✅ Created demo_users entry`)
      }

      console.log(`  ✨ ${user.email} ready!\n`)

    } catch (error: any) {
      console.error(`  ❌ Failed to create ${user.email}:`, error.message)
      console.error('')
    }
  }

  console.log('✅ Demo user seed complete!\n')
  console.log('📋 Demo Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  demoUsers.forEach(user => {
    console.log(`Email:    ${user.email}`)
    console.log(`Password: ${user.password}`)
    console.log(`Access:   ${user.access_level}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  })
}

// Run the seed
seedDemoUsers()
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
