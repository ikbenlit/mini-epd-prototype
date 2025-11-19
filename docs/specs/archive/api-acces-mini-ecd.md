## API‑toegang Mini‑ECD

Laatste update: 2025‑11‑09 • Versie: 0.2 (MVP)

### Overzicht
De Mini‑ECD API biedt server‑side endpoints in Next.js voor AI‑functionaliteit (Claude / Anthropic). In de MVP is één endpoint beschikbaar.

### Base URL
- Ontwikkel (lokaal): `http://localhost:3000`
- Productie: n.t.b. (Vercel)

### Authenticatie
- **MVP**: geen externe client‑auth; endpoints dienen alleen in trusted context gebruikt te worden (server‑side calls of demo‑omgeving).
- Claude AI authenticatie verloopt server‑side via Anthropic API key.

### Headers
- `Content-Type: application/json`

### Endpoints

#### POST `/api/ai/summarize`
- **Doel**: vat NL intake‑tekst samen in puntsgewijze bullets (max 6), neutraal en feitelijk.
- **Request body**
```json
{
  "text": "string (1..20000)",
  "language": "string (optioneel, default: nl)"
}
```
- **Voorbeeld (PowerShell)**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/ai/summarize -Method POST -Body (@{ text = "Korte intake tekst" } | ConvertTo-Json) -ContentType "application/json"
```
- **Voorbeeld (curl)**
```bash
curl -X POST http://localhost:3000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"Korte intake tekst"}'
```
- **Response (200)**
```json
{
  "summary": "- Bullet 1\n- Bullet 2\n..."
}
```
- **Fouten**
  - 400: ongeldige body (validatie faalt)
  - 500: Claude AI fout of configuratie ontbreekt

### Omgevingsvariabelen
- **Claude AI**
  - `ANTHROPIC_API_KEY` (bv. `sk-ant-...`) — vereist voor alle AI-endpoints
- **Optioneel**
  - `ANTHROPIC_MODEL` (default `claude-3-5-sonnet-20241022`)

Voorbeeld in `.env.local` (lokaal): zie `/.env.example`.

### Implementatiedetails
- Server helper: `src/lib/server/claude.ts` initialiseert Claude client met API key.
- Endpoint: `src/app/api/ai/summarize/route.ts` (Next.js Route Handler met Zod‑validatie, Claude API call).

### Beveiliging (MVP)
- Houd `ANTHROPIC_API_KEY` uit de client; uitsluitend server‑side gebruiken.
- Gebruik Vercel Environment Variables in productie.

### Roadmap (volgende endpoints)
- `POST /api/ai/readability` – herschrijf naar B1‑niveau.
- `POST /api/ai/extract` – extracteer categorie/severity uit intake.
- `POST /api/ai/generate-plan` – genereer behandelplan (Doelen, Interventies, etc.).

### Changelog
- 0.2 (2025‑11‑09): Migratie naar Next.js + Claude AI (Anthropic); update van base URL naar :3000.
- 0.1 (2025‑09‑02): Eerste versie met `summarize` endpoint en env‑richtlijnen.

