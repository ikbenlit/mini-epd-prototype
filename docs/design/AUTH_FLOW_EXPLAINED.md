# Hoe werkt de Authenticatie Flow? 🔐

Een simpele uitleg van wat er gebeurt wanneer gebruikers zich aanmelden.

---

## 📧 Email Confirmatie Flow (nieuwe gebruikers)

### Stap 1: Gebruiker meldt zich aan
```
Gebruiker vult in op /login:
├─ Email: jan@example.com
└─ Wachtwoord: Geheim123!
```

### Stap 2: Supabase stuurt email
```
Supabase maakt account aan → Stuurt bevestigingsmail

De email bevat een link zoals:
https://aispeedrun.nl/auth/callback?token=xyz123&type=signup
                    └─────┬─────┘
                    Dit is de redirect URL!
```

### Stap 3: Gebruiker klikt op link in email
```
Browser gaat naar: /auth/callback?token=xyz123

De callback route doet:
1. ✅ Controleert de token
2. ✅ Activeert het account
3. ✅ Logt gebruiker in
4. → Stuurt door naar /epd/clients (omdat ze al wachtwoord hebben)
```

---

## 🔑 Wachtwoord Reset Flow

### Stap 1: Gebruiker klikt "Wachtwoord vergeten?"
```
Gaat naar: /reset-password
Vult in: jan@example.com
```

### Stap 2: Supabase stuurt reset email
```
Email bevat link:
https://aispeedrun.nl/auth/callback?token=abc789&type=recovery&next=/update-password
                    └─────┬─────┘                                  └────┬────┘
                  Callback route                              Waar naartoe daarna?
```

### Stap 3: Gebruiker klikt link
```
/auth/callback ontvangt de token
├─ Controleert token ✅
├─ Logt gebruiker tijdelijk in
└─ Redirect naar: /update-password (van de 'next' parameter)
```

### Stap 4: Nieuw wachtwoord instellen
```
Op /update-password:
├─ Gebruiker vult nieuw wachtwoord in
├─ Wachtwoord wordt opgeslagen
└─ Redirect naar /login → Gebruiker kan inloggen!
```

---

## ✉️ Magic Link Flow (oude methode)

### Stap 1: Gebruiker vraagt magic link aan
```
Vult alleen email in (geen wachtwoord)
```

### Stap 2: Email met magic link
```
Link: https://aispeedrun.nl/auth/callback?token=magic456
```

### Stap 3: Eerste keer inloggen
```
/auth/callback detecteert: "nieuwe magic link gebruiker"
└─ Redirect naar /set-password (optioneel wachtwoord instellen)
   ├─ Wachtwoord instellen → /epd/clients
   └─ Overslaan → /epd/clients (blijf magic link gebruiken)
```

---

## 🌐 Waarom de Redirect URLs belangrijk zijn

Supabase moet weten welke URLs **veilig** zijn om naar terug te sturen.

### Zonder redirect URLs in Supabase:
```
❌ Link in email: https://aispeedrun.nl/auth/callback?token=xyz
   ↓
   Supabase zegt: "Deze URL ken ik niet, BLOCKED!"
   ↓
   Gebruiker ziet error 😞
```

### Met redirect URLs in Supabase:
```
✅ Link in email: https://aispeedrun.nl/auth/callback?token=xyz
   ↓
   Supabase zegt: "Deze URL staat in mijn lijst, OK!"
   ↓
   Gebruiker wordt ingelogd en doorgestuurd 🎉
```

---

## 🔧 De Site URL vs Redirect URLs

### Site URL (1 URL)
```
Dit is je "hoofd" URL waar Supabase denkt dat je app draait.

Supabase gebruikt dit voor:
├─ {{ .ConfirmationURL }} in emails (de basis)
└─ Default redirects

Development: http://localhost:3000
Production:  https://aispeedrun.nl
```

### Redirect URLs (meerdere URLs mogelijk)
```
Dit is de "whitelist" van URLs waar Supabase naartoe MAG redirecten.

Je moet ALLE mogelijke auth callbacks toevoegen:
├─ /auth/callback       → Email confirmaties, magic links
├─ /update-password     → Na password reset
├─ /set-password        → Nieuwe users (optioneel wachtwoord)
└─ /reset-password      → Password reset pagina

Voor zowel localhost als productie!
```

---

## 🎯 Simpel Gezegd

1. **Site URL** = Waar draait je app?
   - Tijdens development: `http://localhost:3000`
   - Live op internet: `https://aispeedrun.nl`

2. **Redirect URLs** = Welke paginas mag Supabase bezoeken na login/reset?
   - Voeg ALLE auth-gerelateerde URLs toe
   - Voor zowel development als productie

3. **Email links** = Gebouwd met Site URL + token
   - Als Site URL = localhost → emails gaan naar localhost ❌
   - Als Site URL = aispeedrun.nl → emails gaan naar je website ✅

---

## 📝 Voorbeeld Flow in de Praktijk

```
[Gebruiker]
    ↓ Registreert op /login
[Jouw App]
    ↓ POST naar Supabase "maak account"
[Supabase]
    ↓ Stuurt email naar gebruiker
    ↓ Email link = [Site URL]/auth/callback?token=xyz
[Email Inbox]
    ↓ Gebruiker klikt link
[Browser]
    ↓ Gaat naar aispeedrun.nl/auth/callback?token=xyz
[Supabase]
    ↓ Checkt: staat "aispeedrun.nl/auth/callback" in Redirect URLs?
    ↓ JA ✅ → Verifieert token
[Jouw App - /auth/callback route]
    ↓ Token geldig? → Login gebruiker
    ↓ Nieuwe gebruiker met wachtwoord?
    ↓ JA → Redirect naar /epd/clients
[Gebruiker is ingelogd! 🎉]
```

---

## ❓ Veelgestelde Vragen

### Waarom krijg ik localhost links in productie emails?
→ Je Site URL staat nog op `http://localhost:3000` in Supabase. Wijzig naar `https://aispeedrun.nl`

### Waarom krijg ik "Invalid Redirect URL" errors?
→ De URL staat niet in je Redirect URLs lijst. Voeg hem toe in Supabase Dashboard.

### Kan ik zowel localhost als productie tegelijk gebruiken?
→ JA! Voeg beide toe aan Redirect URLs. Wissel alleen de Site URL afhankelijk van waar je test.

### Moet ik www. ook toevoegen?
→ Als je site bereikbaar is via `www.aispeedrun.nl`, voeg dan ook die URLs toe.

---

**Hopelijk is het nu duidelijk! 🚀**
