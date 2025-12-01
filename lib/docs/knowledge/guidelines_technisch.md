# Technische Documentatie

Deze documentatie is bedoeld voor developers en technisch beheerders.

## Architectuur Overzicht

Het Mini-EPD is gebouwd met:
- **Frontend**: Next.js 14 (App Router) + React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authenticatie**: Supabase Auth
- **Hosting**: Vercel

## FHIR R4 Standaard

Het EPD volgt de FHIR R4 standaard voor zorgdata:

### Resources
- `Patient` - Cliëntgegevens
- `Practitioner` - Behandelaar
- `Organization` - Organisatie
- `Encounter` - Contact/afspraak
- `Observation` - Observatie/meting
- `Condition` - Diagnose
- `CarePlan` - Behandelplan

### API Endpoints

```
GET    /api/fhir/Patient           - Lijst van patiënten
GET    /api/fhir/Patient/:id       - Specifieke patiënt
POST   /api/fhir/Patient           - Nieuwe patiënt aanmaken
PUT    /api/fhir/Patient/:id       - Patiënt bijwerken
DELETE /api/fhir/Patient/:id       - Patiënt verwijderen
```

## Database Schema

### Belangrijke Tabellen

| Tabel | Beschrijving |
|-------|-------------|
| `patients` | Cliëntgegevens |
| `practitioners` | Behandelaars |
| `intakes` | Intake registraties |
| `intake_sections` | Sectie-inhoud van intakes |
| `treatment_plans` | Behandelplannen |
| `reports` | Rapportages |

### Row Level Security (RLS)

Alle tabellen hebben RLS policies:
- Gebruikers zien alleen data van hun organisatie
- Behandelaars zien alleen eigen cliënten (tenzij supervisor)

## Authenticatie

### Login Flow
1. Gebruiker vult credentials in
2. Supabase Auth valideert
3. JWT token wordt uitgegeven
4. Token wordt opgeslagen in httpOnly cookie

### Rollen
- `behandelaar` - Standaard rol
- `screener` - Screening toegang
- `admin` - Volledige toegang

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
ANTHROPIC_API_KEY=xxx
DEEPGRAM_API_KEY=xxx
```

## Development

### Lokaal draaien
```bash
pnpm install
pnpm dev
```

### Database migraties
```bash
npx supabase db push
```

### Type generatie
```bash
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

## API Rate Limits

| Endpoint | Limit |
|----------|-------|
| Auth endpoints | 10/min |
| FHIR endpoints | 100/min |
| AI endpoints | 20/min |

## Monitoring & Logging

- **Vercel Analytics** - Performance monitoring
- **Supabase Logs** - Database queries en auth events
- **Console logging** - Applicatie logs (geen PII)

## Veelvoorkomende Fouten

| Code | Betekenis | Oplossing |
|------|-----------|-----------|
| 401 | Niet geauthenticeerd | Opnieuw inloggen |
| 403 | Geen toegang | Controleer rol/rechten |
| 404 | Niet gevonden | Resource bestaat niet |
| 429 | Rate limit | Wacht en probeer opnieuw |
| 500 | Server error | Neem contact op met support |
