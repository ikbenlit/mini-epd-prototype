#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const manifestPath = path.join('.next', 'app-build-manifest.json')

if (!existsSync(manifestPath)) {
  console.error('✖  Bundle manifest ontbreekt. Voer eerst `next build` uit.')
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

const budgets = [
  {
    label: '/epd/patients/[id]/rapportage',
    manifestKey: '/epd/patients/[id]/rapportage/page',
    maxKB: 150,
  },
  {
    label: '/epd/patients/[id]/intakes/[intakeId]/behandeladvies',
    manifestKey: '/epd/patients/[id]/intakes/[intakeId]/behandeladvies/page',
    maxKB: 250,
  },
]

function formatKB(bytes) {
  return Math.round((bytes / 1024) * 10) / 10
}

const SHARED_CHUNK_PATTERNS = [/^static\/chunks\/webpack/, /^static\/chunks\/main-app/]

function isSharedChunk(chunkName) {
  return SHARED_CHUNK_PATTERNS.some((pattern) => pattern.test(chunkName))
}

function calculateRouteSize(manifestKey) {
  const chunks = manifest.pages?.[manifestKey]
  if (!chunks) {
    throw new Error(`Geen entry voor ${manifestKey} in app-build-manifest.json`)
  }

  const seen = new Set()
  let totalBytes = 0

  for (const chunk of chunks) {
    if (seen.has(chunk)) continue
    seen.add(chunk)
    if (isSharedChunk(chunk)) continue
    const filePath = path.join('.next', chunk)
    if (!existsSync(filePath)) continue
    totalBytes += statSync(filePath).size
  }

  return totalBytes
}

const violations = []

for (const budget of budgets) {
  try {
    const sizeBytes = calculateRouteSize(budget.manifestKey)
    const sizeKB = formatKB(sizeBytes)
    const maxKB = budget.maxKB
    if (sizeKB > maxKB) {
      violations.push(
        `${budget.label}: ${sizeKB} kB > budget ${maxKB} kB (manifest: ${budget.manifestKey})`
      )
    } else {
      console.log(`✓ ${budget.label}: ${sizeKB} kB (budget ${maxKB} kB)`)
    }
  } catch (error) {
    violations.push(error.message)
  }
}

if (violations.length > 0) {
  console.error('\nBundel-check mislukt:')
  for (const message of violations) {
    console.error(`- ${message}`)
  }
  process.exit(1)
}

console.log('\nAlle bundels binnen budget. ✅')
