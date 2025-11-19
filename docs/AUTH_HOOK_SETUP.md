# Auth Hook Setup Guide

## Overzicht

Deze hook detecteert duplicate emails VOOR een user wordt aangemaakt,
waardoor gebruikers direct feedback krijgen als hun email al geregistreerd is.

**Voordelen:**
- ✅ Server-side validatie (kan niet omzeild worden)
- ✅ Duidelijke foutmeldingen voor gebruikers
- ✅ Betrouwbaar (werkt ongeacht password)
- ✅ Case-insensitive email matching
- ✅ Email normalisatie (lowercase + trim)

## Setup (Eerste Keer)

### Stap 1: Deploy Migration

**Optie A: Via Supabase Dashboard (Aanbevolen)**

1. Ga naar: [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/dqugbrpwtisgyxscpefg/sql)
2. Open het migration bestand: `supabase/migrations/20251119094908_auth_hook_duplicate_email.sql`
3. Kopieer de volledige inhoud
4. Plak in de SQL Editor
5. Klik "RUN" om de functie aan te maken

**Optie B: Via Supabase CLI (Als geconfigureerd)**

```bash
npx supabase db push
```

### Stap 2: Verificatie & Instructies

Run het setup script om te verifiëren dat de functie bestaat:

```bash
pnpm run setup:auth-hook
```

Dit script:
- ✅ Checkt of de functie bestaat
- 📋 Geeft instructies voor Dashboard configuratie
- 🔗 Biedt directe links naar relevante Dashboard pagina's

### Stap 3: Configureer Hook Link

**⚠️ Deze stap moet handmatig via Dashboard** (Supabase ondersteunt dit nog niet via API):

1. Ga naar: [Supabase Dashboard → Auth → Hooks](https://supabase.com/dashboard/project/dqugbrpwtisgyxscpefg/auth/hooks)
2. Klik **"Add a new hook"** of **"Enable Hooks"**
3. Vul in:
   - **Hook Type:** "Send a hook on before a user is created" (`before-user-created`)
   - **Select hook:** "Postgres Function"
   - **Schema:** `public`
   - **Function Name:** `hook_check_duplicate_email`
4. Klik **"Create hook"** of **"Save"**

### Stap 4: Test

Test de hook door:

1. Ga naar je signup pagina: `http://localhost:3000/login`
2. Probeer te registreren met een **bestaand** emailadres (bijv. `demo@mini-ecd.demo`)
3. Je zou een error moeten zien: _"Dit emailadres is al geregistreerd. Probeer in te loggen of gebruik 'Wachtwoord vergeten?'."_
4. Probeer te registreren met een **nieuw** emailadres
5. Dit zou normaal moeten werken (verificatie email verzonden)

## Test Cases

| Test Case | Scenario | Expected Result |
|-----------|----------|-----------------|
| TC1 | Signup met nieuw email | ✅ Account aangemaakt, email verzonden |
| TC2 | Signup met bestaand email | ❌ Error: "Dit emailadres is al geregistreerd..." |
| TC3 | Signup met bestaand email (case variant: `Email@Example.com`) | ❌ Error (case-insensitive match) |
| TC4 | Signup met lege/NULL email | ❌ Error: "Email adres is verplicht." |
| TC5 | Hook disabled → signup met bestaand email | ⚠️ Oude gedrag (geen error, maar ook geen email) |

## Herhaalbaarheid

- ✅ **Functie code** staat in migrations (version controlled)
- ⚠️ **Hook link** moet per omgeving handmatig worden geconfigureerd
- ✅ **Documentatie** staat in Git
- ✅ **Setup script** voor validatie en instructies

## Technische Details

### Wat Doet de Hook?

De `hook_check_duplicate_email` functie:

1. Ontvangt signup event van Supabase Auth
2. Haalt email adres uit event payload
3. Valideert email (niet NULL/empty)
4. Normaliseert email (lowercase + trim)
5. Checkt of email al bestaat in `auth.users` table (case-insensitive)
6. Als email bestaat → return error object
7. Als email nieuw is → return empty object (allow signup)

### Security

- **Security Definer:** Functie draait met elevated permissions
- **Search Path:** Expliciet ingesteld op `public, auth` voor veilige schema access
- **Permissions:** Alleen `supabase_auth_admin` kan de functie uitvoeren
- **Email Enumeration Protection:** Werkt samen met bestaande email confirmation

### Performance

- ⚡ Direct database check (geen extra HTTP calls)
- ⚡ Indexed lookup op `auth.users.email`
- ⚡ Minimale overhead (< 10ms typisch)

## Toekomstige Verbeteringen

Zodra Supabase Management API Auth Hooks ondersteunt, kunnen we:

- [ ] Hook link volledig automatiseren
- [ ] Setup script uitbreiden met API calls
- [ ] CI/CD pipeline voor hook configuratie
- [ ] Automated tests voor hook functionaliteit

## Flexibiliteit

De functie is geschreven in standaard PostgreSQL, waardoor:

- ✅ Werkt met elke auth provider die Postgres functies ondersteunt
- ✅ Makkelijk te migreren naar andere auth systemen
- ✅ Geen vendor lock-in voor de logica zelf

## Troubleshooting

### "Function does not exist" error

**Probleem:** De hook functie is niet aangemaakt in de database.

**Oplossing:**
1. Controleer of migration is uitgevoerd via Dashboard of CLI
2. Run `pnpm run setup:auth-hook` voor verificatie
3. Check Supabase logs voor SQL errors

### Hook lijkt niet te werken

**Probleem:** Signup met bestaand email geeft geen error.

**Mogelijke oorzaken:**
1. Hook link niet geconfigureerd in Dashboard → Ga naar Auth → Hooks
2. Hook is disabled → Check hook status in Dashboard
3. Email confirmation staat uit → Check Auth → Email Templates

**Verificatie:**
```sql
-- Check of functie bestaat
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'hook_check_duplicate_email';

-- Test functie handmatig
SELECT hook_check_duplicate_email('{"user": {"email": "demo@mini-ecd.demo"}}'::jsonb);
```

### Wrong error message

**Probleem:** Error message klopt niet of is in het Engels.

**Oplossing:**
1. Check of je de laatste versie van de migration hebt gebruikt
2. Update functie via SQL Editor met correcte error messages
3. Rebuild client error handling (`app/login/page.tsx`)

## Related Documentation

- [Supabase Auth Hooks Documentation](https://supabase.com/docs/guides/auth/auth-hooks)
- [Bouwplan: Auth Hook Implementation](./bouwplan-auth-hook-duplicate-email-v1.0.md)
- [Main README](../README.md)

## Support

Voor vragen of problemen:
1. Check deze documentatie
2. Check Supabase logs in Dashboard
3. Run `pnpm run setup:auth-hook` voor diagnostics
4. Review `supabase/migrations/20251119094908_auth_hook_duplicate_email.sql`
