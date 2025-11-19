# Email Templates voor Supabase

Deze directory bevat HTML email templates die gebruikt kunnen worden in Supabase Authentication emails.

## Beschikbare Templates

### 1. `confirm-signup.html`
**Gebruik:** Email bevestiging voor nieuwe gebruikersregistratie

**Supabase variabelen:**
- `{{ .ConfirmationURL }}` - De bevestigingslink die de gebruiker moet klikken

**Waar te gebruiken in Supabase:**
- Authentication → Email Templates → Confirm signup

---

### 2. `reset-password.html`
**Gebruik:** Wachtwoord reset email

**Supabase variabelen:**
- `{{ .ConfirmationURL }}` - De reset link die de gebruiker moet klikken

**Waar te gebruiken in Supabase:**
- Authentication → Email Templates → Reset Password

---

## Hoe te gebruiken in Supabase

### Stap 1: Site URL Configureren

**BELANGRIJK:** Zorg eerst dat je Site URL correct is ingesteld, anders verwijzen alle email links naar localhost!

1. Log in op je Supabase Dashboard
2. Ga naar **Authentication** → **URL Configuration**
3. Stel de **Site URL** in:
   - **Development:** `http://localhost:3000`
   - **Production:** `https://aispeedrun.nl`
4. Voeg de volgende **Redirect URLs** toe (één per regel):
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/update-password
   http://localhost:3000/set-password
   http://localhost:3000/reset-password
   https://aispeedrun.nl/auth/callback
   https://aispeedrun.nl/update-password
   https://aispeedrun.nl/set-password
   https://aispeedrun.nl/reset-password
   ```

   **Note:** Je kunt zowel localhost als productie URLs toevoegen, zodat beide omgevingen werken.

5. Klik op **Save**

### Stap 2: Email Templates Instellen

1. Ga naar **Authentication** → **Email Templates**
2. Selecteer het juiste template type (Confirm signup of Reset Password)
3. Kopieer de volledige HTML inhoud van het corresponderende `.html` bestand
4. Plak deze in het Supabase email template veld
5. Klik op **Save**

## Design Kenmerken

- **Brand kleur:** Teal (#0D9488) - consistent met AI Speedrun branding
- **Responsive:** Werkt op desktop en mobiel
- **Email client compatibiliteit:** Gebruikt table-based layout voor maximale compatibiliteit
- **Toegankelijkheid:** Goede contrast ratios en duidelijke call-to-action buttons
- **Nederlandse taal:** Alle teksten zijn in het Nederlands

## Aanpassingen

Als je de templates wilt aanpassen:
- Kleuren kunnen worden aangepast in de inline styles (zoek naar `#0D9488` voor de primary kleur)
- Teksten kunnen direct worden aangepast in de HTML
- Let op: Supabase gebruikt Go template syntax (`{{ .VariableName }}`), dus behoud deze variabelen

