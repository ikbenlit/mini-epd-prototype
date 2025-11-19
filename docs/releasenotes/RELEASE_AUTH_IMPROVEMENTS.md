# Release Notes - Verbeterde Authenticatie Flow

**Datum:** 19 November 2025
**Versie:** 1.1.0

---

## 🔐 Authenticatie Verbeteringen

We hebben de login en registratie ervaring flink verbeterd met duidelijkere feedback en een gebruiksvriendelijkere interface.

### ✨ Nieuwe Features

#### 1. **Wachtwoord Zichtbaarheid Toggle**
- Toon/verberg je wachtwoord met een klik op het oog-icoon
- Werkt voor zowel wachtwoord als bevestig wachtwoord velden
- Maakt het makkelijker om typefouten te voorkomen

#### 2. **Verbeterde Foutmeldingen**
Alle foutmeldingen zijn nu duidelijker en helpen je beter op weg:

| Situatie | Nieuwe Melding |
|----------|----------------|
| Login met onjuist wachtwoord | "Email of wachtwoord is onjuist. Controleer je gegevens en probeer opnieuw." |
| Registratie met bestaand email | "Dit emailadres is al geregistreerd. Probeer in te loggen." |
| Email niet geverifieerd | "Je email is nog niet geverifieerd. Check je inbox voor de verificatie link." |

#### 3. **Automatische Account Herkenning**
- Probeer je te registreren met een bestaand email? Je wordt automatisch naar de login modus gestuurd
- Als het systeem detecteert dat je al bent ingelogd met dezelfde credentials, word je direct doorgestuurd

#### 4. **Wachtwoord Vergeten Flow**
- De "Wachtwoord vergeten?" link werkt nu correct
- Vraag eenvoudig een reset link aan via je email
- Reset links zijn 1 uur geldig

### 🛠️ Technische Verbeteringen

- **Duplicate Email Detectie**: Auth hook met fallback mechanisme voorkomt verwarrende situaties
- **Security**: Geen email enumeration - je kunt niet zien welke emails geregistreerd zijn
- **Middleware Fix**: Reset password routes zijn nu correct toegankelijk voor niet-ingelogde gebruikers

### 🎨 UI/UX Verbeteringen

- Consistente Nederlandse taalgebruik door de hele flow
- Visuele feedback bij hover op password toggle
- Toegankelijke aria-labels voor screen readers
- Smooth transitions en loading states

---

## 📋 Voor Bestaande Magic Link Gebruikers

Heb je je eerder aangemeld met een magic link en wil je nu ook met een wachtwoord kunnen inloggen? Dat kan!

### Hoe stel je een wachtwoord in?

1. **Ga naar de wachtwoord reset pagina**
   - Klik op "Wachtwoord vergeten?" op de login pagina
   - Of ga direct naar `/reset-password`

2. **Vul je email in**
   - Gebruik hetzelfde emailadres waarmee je via magic link inlogt
   - Klik op "Stuur Reset Link"

3. **Check je inbox**
   - Je ontvangt binnen enkele minuten een email
   - Klik op de link in de email (geldig voor 1 uur)

4. **Stel je wachtwoord in**
   - Kies een sterk wachtwoord (minimaal 8 tekens)
   - Bevestig het wachtwoord
   - Klaar!

### Na het instellen van een wachtwoord

Je kunt nu kiezen hoe je wilt inloggen:

- 🔑 **Met wachtwoord** - Sneller, direct inloggen zonder email te checken
- ✉️ **Met magic link** - Blijft ook gewoon werken zoals voorheen

Beide methodes blijven beschikbaar, je kiest zelf wat je het prettigst vindt!

---

## 🚀 Voor Ontwikkelaars

De volgende functies zijn toegevoegd aan `lib/auth/client.ts`:

- Verbeterde error handling met custom error codes
- `invalid_credentials` error code voor login failures
- `user_already_registered` error code met optionele auto-login data
- `email_not_confirmed` error code voor verificatie issues

Middleware is uitgebreid met publieke routes:
- `/reset-password` - Wachtwoord reset aanvragen
- `/update-password` - Nieuw wachtwoord instellen

---

**Veel plezier met de verbeterde authenticatie ervaring!** 🎉
