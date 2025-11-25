# Scripts Directory

This directory contains utility scripts for seeding and managing the EPD prototype database.

## Available Scripts

### `seed-reports.ts`

Seeds the database with realistic test reports for demonstrating AI summarization features.

**Usage:**
```bash
# Set required environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the script
pnpm tsx scripts/seed-reports.ts
```

**Output:**
- 10 realistic clinical reports across 3 patients
- Mix of treatment advice and session notes
- Structured data for ROM scores, diagnoses, and treatment plans
- AI confidence scores for ML training

**Prerequisites:**
- Patients must exist in database (run patient seed migration first)
- Practitioners must exist (IDs hardcoded for demo practitioners)
- Environment variables must be set

See [docs/seed-data-reports.md](../docs/seed-data-reports.md) for full documentation.

## Environment Variables

Required for all scripts:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Security Note:** Never commit these values to git. Use `.env.local` for local development.

## Alternative: SQL Migration

If you prefer SQL migrations over TypeScript scripts:

```bash
# Using Supabase CLI
npx supabase db push

# Or directly with psql
psql $DATABASE_URL -f supabase/migrations/20251124_seed_reports_data.sql
```

## Adding New Scripts

When adding new utility scripts:

1. Place them in this directory
2. Use TypeScript for type safety
3. Add proper error handling
4. Document in this README
5. Include usage examples

## Common Issues

### "Missing environment variables"
- Ensure `.env.local` exists with required variables
- Or export them in your shell before running

### "Patient not found"
- Run patient seed migration first: `npx supabase db push`
- Check that patient names match exactly

### "Permission denied"
- Ensure you're using the service role key, not anon key
- Service role key bypasses RLS policies

## Development Tips

Run scripts with `tsx` for instant TypeScript execution:

```bash
pnpm tsx scripts/your-script.ts
```

For debugging, add verbose logging:

```typescript
console.log('Debug info:', data);
```

## Related Documentation

- [Seed Data Documentation](../docs/seed-data-reports.md) - Full guide for report seeding
- [Database Types](../lib/supabase/database.types.ts) - TypeScript types for database
- [Report Types](../lib/types/report.ts) - Report-specific types and schemas
