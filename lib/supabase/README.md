# Supabase Configuration

Deze folder bevat de Supabase client configuratie voor het Mini-EPD project.

## Bestanden

- **`client.ts`** - Client-side Supabase client (browser-safe, gebruikt anon key)
- **`server.ts`** - Server-side Supabase client (admin, gebruikt service role key)
- **`types.ts`** - TypeScript types (auto-gegenereerd uit database schema)
- **`index.ts`** - Export file voor makkelijke imports

## Gebruik

### Client-side (React components)
```typescript
import { supabase } from '@/lib/supabase'

// Voorbeeld: ophalen van clients
const { data, error } = await supabase
  .from('clients')
  .select('*')
```

### Server-side (API routes, Server Components)
```typescript
import { supabaseAdmin } from '@/lib/supabase/server'

// Voorbeeld: admin operatie
const { data, error } = await supabaseAdmin
  .from('clients')
  .insert({ ... })
```

## TypeScript Types Genereren

Na het aanmaken van database schema (EP01), run:

```bash
pnpm run types:generate
```

Dit genereert TypeScript types uit je Supabase database schema.

## Environment Variables

Zorg dat deze variabelen in `.env.local` staan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dqugbrpwtisgyxscpefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Security

⚠️ **Belangrijk:**
- `NEXT_PUBLIC_*` variabelen zijn zichtbaar in de browser
- `SUPABASE_SERVICE_ROLE_KEY` moet **NOOIT** naar de client worden gestuurd
- Gebruik `supabase` (client) voor frontend operaties
- Gebruik `supabaseAdmin` (server) alleen in API routes en Server Components

## Volgende Stappen

1. ✅ EP00-ST03: Supabase configuratie (Done)
2. ⏳ EP01-ST01: Database schema aanmaken
3. ⏳ EP01-ST02: Row Level Security policies
4. ⏳ EP02-ST01: Authentication implementeren
