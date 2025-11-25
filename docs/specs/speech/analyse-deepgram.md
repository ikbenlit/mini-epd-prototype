# Analyse: Migratie naar Deepgram SDK

## Huidige situatie

### Huidige implementatie

- REST API via directe `fetch()` naar `https://api.deepgram.com/v1/listen`
- Audio wordt opgenomen met `MediaRecorder`, opgeslagen als Blob
- Na opname wordt het hele bestand geüpload via FormData
- Server-side route handler (`app/api/deepgram/transcribe/route.ts`) verwerkt de upload
- Geen streaming; alles gebeurt na de opname

### Componenten betrokken

- `components/speech-recorder.tsx` - Client-side opname component
- `app/api/deepgram/transcribe/route.ts` - Server-side API route

---

## Impact van Deepgram SDK

### 1. Architectuurwijziging: REST → WebSocket streaming

**Huidige flow:**
```
Browser → MediaRecorder → Blob → FormData → POST /api/deepgram/transcribe → Deepgram REST API → Transcript
```

**Nieuwe flow met SDK:**
```
Browser → Microfoon stream → Deepgram SDK (WebSocket) → Real-time transcript chunks → UI update
```

**Impact:**
- Streaming vereist een WebSocket-verbinding
- Real-time updates tijdens opname (niet alleen na opname)
- Client-side SDK nodig (niet alleen server-side)
- Server route kan worden vereenvoudigd of verwijderd

### 2. Client-side SDK vereist

**Wat er moet gebeuren:**
- Deepgram SDK installeren: `@deepgram/sdk` of `@deepgram/browser-sdk`
- Client-side WebSocket-verbinding opzetten
- Audio stream direct naar Deepgram sturen (niet via server)
- Real-time transcript chunks ontvangen en verwerken

**Overwegingen:**
- **API key:** moet client-side beschikbaar zijn (met `NEXT_PUBLIC_` prefix) of via een proxy/token endpoint
- **Security:** API key niet direct in client code plaatsen; gebruik een proxy endpoint die tokens uitreikt

### 3. Component herstructurering

**`speech-recorder.tsx` wijzigingen:**
- Verwijder `MediaRecorder` blob-opslag (of behoud voor lokale backup)
- Verwijder FormData upload naar `/api/deepgram/transcribe`
- Voeg Deepgram SDK WebSocket-verbinding toe
- Implementeer real-time transcript updates tijdens opname
- Update state management voor streaming chunks
- Voeg error handling toe voor WebSocket-verbindingen

**Nieuwe functionaliteit:**
- Real-time transcript updates tijdens opname
- Mogelijkheid tot pauzeren/hervatten zonder verbinding te verbreken
- Endpointing (automatische detectie van spraakpauzes)
- Betere error handling voor netwerkproblemen

### 4. Server-side route aanpassing

**Opties voor `/api/deepgram/transcribe/route.ts`:**

**Optie A: Verwijderen**
- Als alles client-side gebeurt, is deze route niet meer nodig
- Vereist client-side API key exposure (niet aanbevolen)

**Optie B: Proxy voor API key security**
- Route wordt een proxy die tokens uitreikt of de verbinding proxyt
- Client maakt verbinding via deze proxy
- API key blijft server-side

**Optie C: Hybride**
- Streaming via client-side SDK
- Fallback naar REST API voor batch-verwerking
- Route behouden voor backward compatibility

### 5. State management wijzigingen

**Huidige state:**
- `isRecording` - boolean
- `isUploading` - boolean
- `error` - string
- `chunksRef` - Blob array

**Nieuwe state nodig:**
- `isStreaming` - WebSocket verbinding status
- `transcriptChunks` - Array van real-time transcript delen
- `connectionStatus` - 'connecting', 'connected', 'disconnected', 'error'
- `partialTranscript` - Huidige incomplete transcript
- `finalTranscript` - Voltooide transcripties

### 6. Error handling uitbreiding

**Nieuwe error scenarios:**
- WebSocket verbindingsfouten
- Netwerk onderbrekingen tijdens streaming
- Deepgram quota/rate limiting tijdens live sessie
- Microfoon toegang tijdens actieve stream
- Herverbindingslogica nodig

### 7. UX verbeteringen mogelijk

**Met streaming beschikbaar:**
- Real-time tekst tijdens spreken
- Visual feedback per woord/chunk
- Lagere latency (<500ms per chunk vs 2+ seconden voor hele opname)
- Mogelijkheid tot directe correcties tijdens opname
- Pauzeren/hervatten zonder opnieuw opnemen

### 8. Dependencies

**Te installeren:**
```json
"@deepgram/sdk": "^latest" // of "@deepgram/browser-sdk"
```

**Mogelijk te verwijderen:**
- Geen directe fetch naar Deepgram REST API meer nodig
- FormData handling kan worden vereenvoudigd

### 9. Configuratie wijzigingen

**Environment variables:**
- `DEEPGRAM_API_KEY` blijft nodig
- Overweeg `NEXT_PUBLIC_DEEPGRAM_API_KEY` alleen als je client-side direct verbindt (niet aanbevolen)
- Beter: proxy endpoint die tokens uitreikt

**Deepgram configuratie:**
- Model: `nova-2` (blijft hetzelfde)
- Language: `nl` (blijft hetzelfde)
- Nieuwe opties: `endpointing`, `interim_results`, `punctuate`, `smart_format`

### 10. Backward compatibility

**Overwegingen:**
- Bestaande code die `/api/deepgram/transcribe` gebruikt
- Migratiepad voor andere componenten
- Fallback mechanisme als streaming faalt

---

## Aanbevolen migratiepad

### Fase 1: Voorbereiding
1. Deepgram SDK installeren
2. Proxy endpoint maken voor secure token/key management
3. Test implementatie maken naast bestaande REST implementatie

### Fase 2: Core streaming
1. WebSocket verbinding opzetten in `speech-recorder.tsx`
2. Real-time transcript updates implementeren
3. Basis error handling toevoegen

### Fase 3: UX verbeteringen
1. Visual feedback voor real-time updates
2. Pauzeren/hervatten functionaliteit
3. Endpointing configureren

### Fase 4: Cleanup
1. Oude REST API route verwijderen of deprecaten
2. Code cleanup
3. Documentatie updaten

---

## Risico's en aandachtspunten

1. **Security:** API key niet direct in client code
2. **Kosten:** Streaming kan meer API calls genereren
3. **Netwerk:** WebSocket vereist stabiele verbinding
4. **Browser compatibiliteit:** WebSocket en MediaStream API support
5. **Testing:** Complexer dan REST (real-time flows)

---

## Conclusie

De migratie vereist:
- Architectuurwijziging van REST naar WebSocket streaming
- Client-side SDK integratie
- Herstructurering van `speech-recorder.tsx`
- Aanpassing/verwijdering van server route
- Uitgebreidere state management
- Betere error handling
- Security overwegingen voor API key management

**De belangrijkste winst:** real-time transcriptie tijdens opname in plaats van alleen na opname, wat beter aansluit bij de live transcriptie-vereisten in de documentatie.
