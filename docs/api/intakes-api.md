# Intakes API

Deze custom REST API ondersteunt de intake-flow na consolidatie van `/clients/` → `/patients/`. Alle endpoints verwachten een geldige Supabase sessie (cookies) en geven JSON terug.

## Endpoints

### GET `/api/intakes?patientId={uuid}`
Haalt alle intakes voor één patiënt op (nieuwste eerst).

**Query parameters**
- `patientId` _(verplicht)_ — UUID van de patiënt.

**Response**
```json
{
  "intakes": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "title": "Intake - Aanvang zorg",
      "department": "Volwassenen",
      "status": "bezig",
      "start_date": "2025-11-22",
      "end_date": null,
      "psychologist_id": null,
      "notes": null
    }
  ],
  "total": 1
}
```

### POST `/api/intakes`
Maakt een nieuwe intake.

**Body**
```json
{
  "patient_id": "uuid",
  "title": "Intake - Aanvang zorg",
  "department": "Volwassenen",
  "start_date": "2025-11-22",
  "psychologist_id": "uuid?",
  "notes": "optional"
}
```

**Responses**
- `201` + intake object bij succes
- `400` met `details[]` bij validatiefout

### GET `/api/intakes/{intakeId}`
Levert één intake. Retourneert `404` als het ID niet bestaat.

### PUT `/api/intakes/{intakeId}`
Partiële update. Ondersteunt `title`, `department`, `status` (`Open`/`Afgerond`), `start_date`, `end_date`, `psychologist_id`, `notes`.

### DELETE `/api/intakes/{intakeId}`
Verwijdert een intake. `204 No Content` bij succes.

## Fouten
- `401`/`403`: geen sessie of onvoldoende rechten.
- `400`: ongeldige payload (zie `details`).
- `500`: onverwachte fout; check server logs.

## Implementatieverwijzing
- Type definities: `lib/types/intake.ts`
- Server actions: `app/epd/patients/[id]/intakes/actions.ts`
- API broncode: `app/api/intakes/` en `app/api/intakes/[intakeId]/`
