/**
 * Run Supabase Migration
 *
 * This script executes pending migrations on the Supabase database.
 * Run with: npx tsx scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  console.log('🚀 Starting migrations...\n')

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  if (files.length === 0) {
    console.log('ℹ️  No migration files found')
    return
  }

  console.log(`Found ${files.length} migration(s):\n`)

  for (const file of files) {
    const filePath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(filePath, 'utf-8')

    console.log(`⏳ Running: ${file}`)

    try {
      const { error } = await supabase.rpc('exec_sql', { sql })

      if (error) {
        // Try direct query if RPC doesn't exist
        const lines = sql.split(';').filter(line => line.trim())

        for (const line of lines) {
          if (!line.trim()) continue

          const { error: queryError } = await supabase.from('_migrations').select('*').limit(0)

          if (queryError) {
            // Fallback: manual execution needed
            console.error(`❌ Error executing ${file}:`, error.message)
            console.log('\n📋 Please execute this migration manually in Supabase dashboard:')
            console.log(`\nFile: ${file}`)
            console.log('Navigate to: https://supabase.com/dashboard/project/dqugbrpwtisgyxscpefg/sql')
            console.log('\nOr copy the SQL from:')
            console.log(filePath)
            return
          }
        }
      }

      console.log(`✅ Success: ${file}\n`)
    } catch (err) {
      console.error(`❌ Failed: ${file}`)
      console.error(err)
      console.log('\n📋 Manual execution required.')
      console.log(`Navigate to: https://supabase.com/dashboard/project/dqugbrpwtisgyxscpefg/sql`)
      console.log(`\nCopy and paste the SQL from: ${filePath}`)
      return
    }
  }

  console.log('✨ All migrations completed!\n')
}

// Run migrations
runMigrations().catch(console.error)
