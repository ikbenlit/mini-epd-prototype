#!/usr/bin/env tsx
/**
 * Apply Migration Script
 * Executes a SQL migration file directly against the Supabase database
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration(migrationFile: string) {
  console.log(`🔄 Applying migration: ${migrationFile}\n`)

  try {
    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations', migrationFile)
    const sql = readFileSync(migrationPath, 'utf-8')

    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Try alternative approach - direct query
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        const { error: stmtError } = await supabase.rpc(statement)
        if (stmtError) {
          console.error('❌ Error executing statement:', stmtError.message)
          throw stmtError
        }
      }
    }

    console.log('✅ Migration applied successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Run: pnpm run setup:auth-hook')
    console.log('   2. Configure hook link in Supabase Dashboard')

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n💡 Alternative: Apply manually via Supabase Dashboard')
    console.log('   1. Go to: https://supabase.com/dashboard/project/_/sql')
    console.log('   2. Copy contents of:', migrationFile)
    console.log('   3. Paste and run in SQL Editor')
    process.exit(1)
  }
}

// Get migration file from command line or use latest
const migrationFile = process.argv[2] || '20251119094908_auth_hook_duplicate_email.sql'
applyMigration(migrationFile)
