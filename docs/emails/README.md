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

1. Log in op je Supabase Dashboard
2. Ga naar **Authentication** → **Email Templates**
3. Selecteer het juiste template type (Confirm signup of Reset Password)
4. Kopieer de volledige HTML inhoud van het corresponderende `.html` bestand
5. Plak deze in het Supabase email template veld
6. Klik op **Save**

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

