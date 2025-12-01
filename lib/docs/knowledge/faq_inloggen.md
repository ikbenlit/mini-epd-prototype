# FAQ Inloggen & Account

## Hoe log ik in op het EPD?

1. Ga naar de login pagina
2. Vul je e-mailadres in
3. Vul je wachtwoord in (minimaal 8 karakters)
4. Klik op **Inloggen**

Na succesvolle login word je doorgestuurd naar het cliëntenoverzicht.

## Is er een demo account?

Ja! Op de login pagina kun je klikken op **"Demo Account Proberen"** om direct in te loggen met het demo account (`demo@mini-ecd.demo`). Dit is handig om het systeem te verkennen.

## Ik ben mijn wachtwoord vergeten

1. Klik op **"Wachtwoord vergeten"** op de loginpagina
2. Vul je e-mailadres in
3. Je ontvangt een e-mail met een reset link
4. Klik op de link en stel een nieuw wachtwoord in

Let op: De reset link is 24 uur geldig.

## Wat zijn de wachtwoordeisen?

Een geldig wachtwoord moet minimaal 8 karakters bevatten. Het systeem controleert ook of het e-mailadres een geldig formaat heeft.

## Hoe maak ik een nieuw account aan?

1. Ga naar de login pagina
2. Klik op **"Account aanmaken"**
3. Vul in:
   - E-mailadres (moet uniek zijn)
   - Wachtwoord (min 8 karakters)
   - Wachtwoord bevestiging
4. Klik op **"Registreren"**

Je wordt automatisch ingelogd na registratie.

**Let op:** Als je e-mailadres al bestaat, word je automatisch ingelogd op dat bestaande account.

## Hoe log ik uit?

1. Klik op je profielicoon rechtsboven
2. Klik op **Uitloggen**

## Kan ik op meerdere apparaten inloggen?

Ja, je kunt op meerdere apparaten tegelijk ingelogd zijn. Elke sessie is onafhankelijk en beveiligd met JWT tokens.

## Wie kan mijn gegevens zien?

Alleen geautoriseerde medewerkers met de juiste rollen kunnen cliëntgegevens inzien. Het systeem gebruikt Row Level Security (RLS) om data te isoleren:
- Je ziet alleen data van je eigen organisatie
- Behandelaars zien alleen eigen cliënten (tenzij supervisor)

## Mijn account is geblokkeerd

Neem contact op met de beheerder om je account te deblokkeren. Dit kan gebeuren na meerdere mislukte inlogpogingen.

## Hoe zit het met beveiliging?

Het EPD gebruikt:
- **Supabase Auth** voor veilig gebruikersbeheer
- **JWT tokens** in httpOnly cookies
- **RLS policies** voor data isolatie
- Geen API keys in frontend code
- Alle acties worden gelogd voor audit doeleinden
