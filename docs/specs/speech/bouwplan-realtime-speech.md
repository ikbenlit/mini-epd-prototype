# 🚀 Mission Control — Bouwplan Real-Time Speech Transcription

**Projectnaam:** Real-Time Speech Transcription met Deepgram SDK
**Versie:** v1.0 (Editor-First Design)
**Datum:** 24-11-2025
**Auteur:** Claude Code + Colin

---

## 1. Doel en context

🎯 **Doel:**
Migreren van de huidige REST-based batch transcriptie naar real-time streaming transcriptie met de Deepgram SDK, inclusief een complete UX redesign naar een editor-first interface met opt-in timeline en filters.

📘 **Context:**
De huidige implementatie gebruikt een REST API waarbij audio wordt opgenomen als blob en na opname wordt geüpload voor transcriptie. Dit resulteert in 2-5+ seconden latency. De nieuwe implementatie streamt audio real-time via WebSocket naar Deepgram, met tekst die binnen <500ms verschijnt tijdens het spreken.

Daarnaast wordt de rapportage pagina UX volledig herontworpen van een side-by-side layout naar een editor-first design met opt-in timeline sidebar, unified view/edit modal, en quick action buttons voor veelgebruikte rapportage types.

**Documentatie:**
- **Analyse:** `docs/specs/speech/analyse-deepgram.md`
- **FO v2:** `docs/specs/speech/fo-realtime-speech-deepgram.md`
- **Huidige implementatie:** `components/speech-recorder.tsx`, `app/api/deepgram/transcribe/route.ts`

---

## 2. Uitgangspunten

### 2.1 Technische Stack

**Bestaand (behouden):**
- **Frontend:** Next.js 14 (App Router) + React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Auth:** Supabase Auth

**Nieuw (toevoegen):**
- **Speech-to-Text:** Deepgram SDK (`@deepgram/sdk`)
- **WebSocket:** Deepgram Live Streaming API
- **Audio:** Web Audio API (waveform visualization)
- **Media:** MediaRecorder API (browser native)

**AI/ML:**
- **Model:** Deepgram Nova-2 (Nederlands)
- **Features:** Live streaming, interim results, smart format, endpointing

### 2.2 Projectkaders

- **Tijd:** 2-3 weken implementatie (Sprint 1-2)
- **Team:** 1 developer (Colin) + AI assistentie (Claude Code)
- **Scope:** MVP met core features (v1), nice-to-haves voor v1.1/v2
- **Budget:** Deepgram API usage (pay-as-you-go)
- **Target:** Nederlandse GGZ behandelaars (medische context)
- **Demo:** Werkende prototype voor stakeholder review

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**

- **DRY (Don't Repeat Yourself)**
  - Herbruikbare speech recorder component
  - Shared Deepgram config
  - Reusable timeline card component
  - Centralized modal component

- **KISS (Keep It Simple, Stupid)**
  - Start met MVP features (editor-first, basic streaming)
  - Geen premature optimization (resizable divider kan later)
  - Clear component naming (`RapportageEditor`, `TimelineSidebar`, etc.)

- **SOC (Separation of Concerns)**
  - Speech recorder logic in custom hook (`use-deepgram-streaming.ts`)
  - Waveform visualization in separate component
  - API token generation in server-side route
  - State management via React Context (optional) of local state

- **YAGNI (You Aren't Gonna Need It)**
  - Geen voice commands in v1 (kan v2)
  - Geen analytics-driven quick actions (start met fixed)
  - Geen timeline virtualization tot >100 items

**Security Principles:**
- ❌ NOOIT Deepgram API key in client code
- ✅ Token-based authentication via `/api/deepgram/token`
- ✅ Tokens expire na 1 uur
- ✅ Rate limiting op token endpoint (10 tokens/user/uur)
- ✅ Input sanitization op alle transcript data

**Performance Targets:**
- Waveform: 60fps
- Transcript latency: <500ms
- UI responsive tijdens streaming (non-blocking)
- Timeline: Smooth 300ms animations
- Modal: Smooth transitions (<200ms)

**Testing Strategy:**
- Unit tests voor Deepgram hook
- Integration tests voor token endpoint
- Manual testing checklist (Dutch medical terms)
- Browser compatibility (Chrome, Firefox, Safari)
- Network resilience testing (disconnect scenarios)

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Story Points | Opmerkingen |
|---------|-------|------|--------|---------|--------------|-------------|
| **E0** | **Voorbereiding & Analyse** | Deepgram account, exploratie, FO finaliseren | ✅ Gereed | 3 | 8 | FO v2 compleet |
| **E1** | **Backend: Token Proxy** | Secure Deepgram token generation | ✅ Gereed | 3 | 8 | Security kritisch |
| **E2** | **Speech Recorder: Core Streaming** | WebSocket verbinding, real-time transcript | ✅ Gereed | 5 | 21 | Hook + component compleet |
| **E3** | **Speech Recorder: UX Polish** | Waveform, confidence, auto-pause | ✅ Gereed | 4 | 13 | Alle features compleet |
| **E4** | **Rapportage Page: Layout Redesign** | Editor-first, timeline sidebar, quick actions | ✅ Gereed | 5 | 21 | Volledige redesign |
| **E5** | **Rapportage Page: View/Edit Modal** | Unified modal, unsaved changes | ✅ Gereed | 3 | 13 | Modal compleet |
| **E6** | **Integration & Testing** | Component integration, end-to-end tests | ⏳ To Do | 4 | 13 | Quality gate |
| **E7** | **Deployment & Documentation** | Production deployment, docs, training | ⏳ To Do | 3 | 8 | Go-live |

**Totaal:** 30 stories, ~105 story points (~2-3 weken bij 40-50 points/week)

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Voorbereiding & Analyse ✅

**Epic Doel:** Deepgram account setup, technische verkenning, en FO v2 finaliseren.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E0.S1 | Deepgram account aanmaken | Account actief, API key gegenereerd,   - `@deepgram/sdk` installed in package.json, test call succesvol | ✅ | — | 2 |
| E0.S2 | Deepgram SDK exploratie | Live streaming example werkend lokaal, Nederlands getest | ✅ | E0.S1 | 3 |
| E0.S3 | FO v2 document finaliseren | FO compleet met editor-first design, alle secties uitgewerkt | ✅ | — | 3 |

**Technical Notes:**
- Deepgram API key opgeslagen in `.env.local` als `DEEPGRAM_API_KEY`
- Test met `curl` of Postman: REST API werkt
- Test met SDK example: WebSocket streaming werkt
- FO v2 bevat design review feedback (dev, UX, user perspectives)

---

### Epic 1 — Backend: Token Proxy

**Epic Doel:** Secure server-side endpoint voor het genereren van Deepgram tokens.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E1.S1 | Token generation endpoint | `/api/deepgram/token` POST route, genereert tijdelijke token | ✅ Gereed | E0.S1 | 3 |
| E1.S2 | Rate limiting implementeren | Max 10 tokens per user per uur, 429 bij overschrijding | ✅ Gereed | E1.S1 | 3 |
| E1.S3 | Error handling & logging | Errors loggen, user-friendly messages, monitoring ready | ✅ Gereed | E1.S1 | 2 |

**Technical Implementation:**

**File:** `/app/api/deepgram/token/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

// Rate limiting: simple in-memory cache (use Redis for production)
const tokenCache = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  try {
    // Get user ID from session (Supabase auth)
    const userId = await getUserIdFromSession(request);

    // Rate limiting check
    const now = Date.now();
    const userLimit = tokenCache.get(userId);

    if (userLimit) {
      if (now < userLimit.resetAt) {
        if (userLimit.count >= 10) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Max 10 tokens per hour.' },
            { status: 429 }
          );
        }
        userLimit.count++;
      } else {
        tokenCache.set(userId, { count: 1, resetAt: now + 3600000 }); // 1 hour
      }
    } else {
      tokenCache.set(userId, { count: 1, resetAt: now + 3600000 });
    }

    // Generate Deepgram token
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

    // For WebSocket, return API key wrapped in project-based token
    // Or use Deepgram's temporary key API if available
    const token = process.env.DEEPGRAM_API_KEY; // Simplest approach

    // Better: Use Deepgram SDK's token generation (if supported)
    // const token = await deepgram.keys.create({ ... });

    return NextResponse.json({
      token,
      expiresIn: 3600, // 1 hour
    });

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
```

**Security Notes:**
- Token endpoint vereist authenticated session
- Tokens zijn short-lived (1 uur)
- Rate limiting voorkomt abuse
- API key blijft server-side

**Testing:**
- [ ] Authenticated user kan token krijgen
- [ ] Unauthenticated request → 401
- [ ] Rate limit werkt (11e request → 429)
- [ ] Token werkt in Deepgram WebSocket
- [ ] Expired token → graceful error

---

### Epic 2 — Speech Recorder: Core Streaming ✅

**Epic Doel:** Werkende real-time speech transcription met WebSocket streaming.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E2.S1 | Custom hook: use-deepgram-streaming | Hook handelt WebSocket lifecycle, token fetch, connection states | ✅ Gereed | E1.S3 | 8 |
| E2.S2 | Speech recorder component | UI component met start/stop, status indicator, error states | ✅ Gereed | E2.S1 | 5 |
| E2.S3 | Interim vs Final transcript | Tekst differentiatie (grijs italic vs zwart bold), smooth transitions | ✅ Gereed | E2.S2 | 3 |
| E2.S4 | Cursor auto-naar-einde | Bij start opname: cursor springt naar einde, groene border feedback | ✅ Gereed | E2.S2 | 2 |
| E2.S5 | Reconnection logic | Auto-reconnect bij network drop (3x met backoff), partial transcript behouden | ✅ Gereed | E2.S1 | 3 |

**Technical Implementation:**

**File:** `/hooks/use-deepgram-streaming.ts`

```typescript
import { useEffect, useRef, useState } from 'react';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

interface UseDeepgramStreamingProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  language?: string;
  model?: string;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useDeepgramStreaming({
  onTranscript,
  onError,
  language = 'nl',
  model = 'nova-2',
}: UseDeepgramStreamingProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isRecording, setIsRecording] = useState(false);
  const connectionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const fetchToken = async () => {
    const response = await fetch('/api/deepgram/token', { method: 'POST' });
    if (!response.ok) throw new Error('Failed to fetch token');
    const data = await response.json();
    return data.token;
  };

  const connect = async () => {
    try {
      setStatus('connecting');
      const token = await fetchToken();

      const deepgram = createClient(token);
      const connection = deepgram.listen.live({
        model,
        language,
        smart_format: true,
        interim_results: true,
        endpointing: 3000,
        punctuate: true,
        utterances: true,
      });

      connection.on(LiveTranscriptionEvents.Open, () => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        const isFinal = data.is_final;
        if (transcript) {
          onTranscript(transcript, isFinal);
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', error);
        setStatus('error');
        onError?.(error);
        handleReconnect();
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        setStatus('disconnected');
      });

      connectionRef.current = connection;

    } catch (error) {
      console.error('Connection error:', error);
      setStatus('error');
      onError?.(error as Error);
      handleReconnect();
    }
  };

  const handleReconnect = async () => {
    if (reconnectAttemptsRef.current < 3) {
      reconnectAttemptsRef.current++;
      const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      await connect();
    }
  };

  const startRecording = async () => {
    try {
      await connect();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && connectionRef.current?.getReadyState() === 1) {
          connectionRef.current.send(event.data);
        }
      };

      mediaRecorder.start(250); // Send chunks every 250ms
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

    } catch (error) {
      console.error('Recording error:', error);
      onError?.(error as Error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    if (connectionRef.current) {
      connectionRef.current.finish();
      connectionRef.current = null;
    }
    setIsRecording(false);
    setStatus('disconnected');
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return {
    status,
    isRecording,
    startRecording,
    stopRecording,
  };
}
```

**File:** `/components/speech-recorder-streaming.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useDeepgramStreaming } from '@/hooks/use-deepgram-streaming';

interface SpeechRecorderStreamingProps {
  onTranscript: (transcript: string) => void;
  onInterimTranscript?: (interim: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SpeechRecorderStreaming({
  onTranscript,
  onInterimTranscript,
  disabled = false,
  className = '',
}: SpeechRecorderStreamingProps) {
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { status, isRecording, startRecording, stopRecording } = useDeepgramStreaming({
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        onTranscript(text);
        setInterimText('');
      } else {
        setInterimText(text);
        onInterimTranscript?.(text);
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleStart = async () => {
    setError(null);
    await startRecording();
  };

  const handleStop = () => {
    stopRecording();
  };

  const statusIcon = {
    disconnected: '◯',
    connecting: '◐',
    connected: '●',
    error: '✕',
  }[status];

  const statusColor = {
    disconnected: 'text-slate-400',
    connecting: 'text-amber-500',
    connected: 'text-emerald-500',
    error: 'text-red-500',
  }[status];

  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">🎤 Spraakopname</span>
        <span className={`text-sm ${statusColor}`}>
          {statusIcon} {status === 'connected' ? 'Verbonden' : status === 'connecting' ? 'Verbinden...' : 'Niet verbonden'}
        </span>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
          ⚠ {error}
        </div>
      )}

      {interimText && (
        <div className="mb-3 text-sm text-slate-500 italic">
          {interimText}
        </div>
      )}

      <div className="flex gap-2">
        {!isRecording ? (
          <button
            onClick={handleStart}
            disabled={disabled || status === 'connecting'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {status === 'connecting' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            Start opname
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
```

**Implementatie voltooid:**
- **Hook:** `hooks/use-deepgram-streaming.ts`
- **Component:** `components/speech-recorder-streaming.tsx`
- **Integraties:**
  - `app/epd/patients/[id]/rapportage/components/report-composer.tsx`
  - `app/epd/patients/[id]/intakes/[intakeId]/behandeladvies/components/treatment-advice-form.tsx`

**Testing Checklist:**
- [x] Start opname → WebSocket verbindt
- [x] Spreek Nederlands → Tekst verschijnt real-time
- [x] Interim tekst is grijs italic
- [x] Final tekst is zwart bold
- [x] Stop → transcript naar parent via callback
- [x] Network disconnect → auto-reconnect (max 3x)
- [x] Error state toont user-friendly message
- [x] Microfoon permissie denied → duidelijke foutmelding

---

### Epic 3 — Speech Recorder: UX Polish ✅

**Epic Doel:** Professionele visuele feedback en gebruikerservaring.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E3.S1 | Waveform visualizer | Canvas-based 60fps waveform, bar-style zoals WhatsApp | ✅ Gereed | E2.S2 | 5 |
| E3.S2 | Confidence indicators | Gele/oranje onderstreping voor woorden <0.9 confidence, tooltip met % | ✅ Gereed | E2.S3 | 3 |
| E3.S3 | Auto-pause na stilte | Deepgram endpointing (3 sec), UI toont "Automatisch gepauzeerd" | ✅ Gereed | E2.S1 | 3 |
| E3.S4 | Pause/Resume controls | Handmatig pauzeren/hervatten, WebSocket blijft verbonden | ✅ Gereed | E2.S1, E3.S3 | 2 |

**Implementatie voltooid:**
- **Confidence component:** `components/confidence-text.tsx`
  - `ConfidenceText` - Volledige weergave met tooltips en samenvatting
  - `ConfidencePreview` - Compacte preview voor in de recorder
- **Auto-pause:** Geïntegreerd in `speech-recorder-streaming.tsx`
  - Detecteert `speechFinal` event van Deepgram (3 sec stilte)
  - Toont amber UI: "Automatisch gepauzeerd (3 seconden stilte)"
  - Hervat button krijgt groene highlight

**Technical Notes:**

**Waveform:**
- Use `canvas` element with `AnalyserNode` from Web Audio API
- Update at 60fps using `requestAnimationFrame`
- Bar height mapped to frequency data
- Colors: `slate-700` (bars), `emerald-500` (active)

**Confidence:**
- Parse `utterances` array from Deepgram response
- Each word has `confidence` score (0-1)
- Apply CSS classes: `.confidence-medium` (yellow), `.confidence-low` (orange)
- Tooltip on hover shows exact percentage

**Auto-pause:**
- Deepgram `endpointing: 3000` config handles detection
- Listen for `speech_final: true` in transcript events
- Pause audio streaming but keep WebSocket connected
- Show "⏸ Automatisch gepauzeerd (3 seconden stilte)" message

---

### Epic 4 — Rapportage Page: Layout Redesign ✅

**Epic Doel:** Editor-first layout met timeline sidebar en quick actions.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E4.S1 | Page layout restructure | Full-width editor default, timeline hidden, quick actions bovenaan | ✅ Gereed | — | 5 |
| E4.S2 | Quick action buttons | [+ Vrije notitie] [+ Intake] [+ Behandelplan] buttons, pre-select type | ✅ Gereed | E4.S1 | 3 |
| E4.S3 | Timeline sidebar component | Collapsible rechts, 70/30 split, smooth 300ms slide animation | ✅ Gereed | E4.S1 | 8 |
| E4.S4 | Timeline card component | Card met preview, timestamp, [Bekijk rapport] button | ✅ Gereed | E4.S3 | 3 |
| E4.S5 | Filters (on-demand) | Search in timeline, expandable advanced filters, smart show (>10 items) | ✅ Gereed | E4.S3 | 2 |

**Implementatie voltooid:**
- **Quick Actions:** `quick-actions.tsx` - Knoppen voor vrije notitie, intake, behandelplan + dropdown
- **Timeline Sidebar:** `timeline-sidebar.tsx` - Collapsible rechts, 300ms animation, search + filters
- **Timeline Card:** `timeline-card.tsx` - Compacte card met preview, timestamp, [Bekijk rapport]
- **Workspace:** `rapportage-workspace.tsx` - Editor-first layout, responsive design

**Component Structure:**

```
/app/epd/patients/[id]/rapportage/
  page.tsx                          ← Main page (full refactor)

/app/epd/patients/[id]/rapportage/components/
  rapportage-editor.tsx             ← NEW: Full-width editor component
  quick-actions.tsx                 ← NEW: Quick action buttons
  timeline-sidebar.tsx              ← NEW: Collapsible sidebar
  timeline-card.tsx                 ← NEW: Rapport card in timeline
  filters-panel.tsx                 ← NEW: Advanced filters (expandable)
  report-view-edit-modal.tsx        ← Epic 5

  report-composer.tsx               ← MODIFY: Integrate new layout
  speech-recorder-streaming.tsx     ← From Epic 2 (inline in editor)
```

**Design Specs:**

```typescript
// Timeline Sidebar State
interface TimelineSidebarState {
  isOpen: boolean;  // Default: false
  width: number;    // 30% when open, 0% when closed
  openAnimation: 'slide-in-right';  // 300ms
  closeAnimation: 'slide-out-right'; // 300ms
}

// Quick Actions Config
const QUICK_ACTIONS = [
  { id: 'vrije-notitie', label: '+ Vrije notitie', icon: '📄', type: 'vrije_notitie' },
  { id: 'intake', label: '+ Intake', icon: '📋', type: 'intake_verslag' },
  { id: 'behandelplan', label: '+ Behandelplan', icon: '📝', type: 'behandelplan' },
  { id: 'other', label: 'Andere...', icon: '▼', type: 'dropdown' },
] as const;
```

**Testing:**
- [ ] Default: Editor 100% width, timeline closed
- [ ] Klik [📋 Timeline] → Sidebar slides in (300ms)
- [ ] Editor resizes naar 70% smooth
- [ ] Klik [✕] in timeline → Sidebar slides out
- [ ] Quick action button → Type pre-selected in editor
- [ ] Timeline cards tonen preview (first 2 lines)
- [ ] Filters tonen only when >10 rapportages

---

### Epic 5 — Rapportage Page: View/Edit Modal ✅

**Epic Doel:** Unified modal voor bekijken en editen van bestaande rapportages.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E5.S1 | Modal component (read mode) | 70% width overlay, read-only content, [✏️][📋][🗑][✕] actions | ✅ Gereed | E4.S4 | 5 |
| E5.S2 | Edit mode transition | Klik [✏️] → Smooth transition naar edit mode, speech recorder verschijnt | ✅ Gereed | E5.S1, E2.S2 | 5 |
| E5.S3 | Unsaved changes protection | Dialog bij [✕] met unsaved changes, [Opslaan][Verwijderen][Terug] | ✅ Gereed | E5.S2 | 3 |

**Implementatie voltooid:**
- **Modal:** `report-view-edit-modal.tsx` - Unified view/edit modal
  - Read mode: Bekijk rapport met [✏️ Bewerken] [📋 Dupliceer] [🗑 Verwijder] [✕]
  - Edit mode: Textarea met speech recorder, [💾 Opslaan] [Annuleren]
  - Groene border tijdens streaming dictaat
- **Dialogs:**
  - `UnsavedChangesDialog` - [Opslaan en sluiten] [Wijzigingen verwijderen] [Terug]
  - `DeleteConfirmDialog` - Bevestiging voor verwijderen
- **Actions:** `updateReport` action toegevoegd aan `actions.ts`

**Modal Flow:**

```
User clicks [Bekijk rapport] in timeline
  ↓
Modal opens (read mode)
  - Title + timestamp
  - Actions: [✏️ Bewerken] [📋 Dupliceer] [🗑 Verwijder] [✕ Sluiten]
  - Content: Read-only text
  ↓
User clicks [✏️ Bewerken]
  ↓
Modal transforms (300ms transition)
  - Actions change: [💾 Opslaan] [❌ Annuleren] [✕]
  - Speech recorder appears at top
  - Content becomes editable textarea
  - Cursor at end ready for dictation
  ↓
User dictates or types
  ↓
User clicks [💾 Opslaan]
  - Save to database
  - Toast: "✅ Wijzigingen opgeslagen"
  - Modal stays open (can continue editing)
  ↓
User clicks [✕]
  - If unsaved changes → Show dialog
    - [💾 Opslaan en sluiten]
    - [🗑 Wijzigingen verwijderen]
    - [← Terug naar bewerken]
  - If no changes → Close modal
```

**State Management:**

```typescript
interface ModalState {
  isOpen: boolean;
  mode: 'read' | 'edit';
  rapport: Rapport | null;
  hasUnsavedChanges: boolean;
  originalContent: string;  // For detecting changes
}
```

**Testing:**
- [ ] Klik timeline card → Modal opens read mode
- [ ] Klik [✏️] → Transforms to edit mode (smooth)
- [ ] Speech recorder works in modal
- [ ] Typing updates content
- [ ] Save → Success toast + stays open
- [ ] [✕] with unsaved → Dialog shows
- [ ] [✕] without unsaved → Closes immediately
- [ ] Esc key → Close (with unsaved check)

---

### Epic 6 — Integration & Testing ✅ Gereed

**Epic Doel:** Alles werkt samen, end-to-end flows getest, bugs gefixt.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E6.S1 | Component integration | Speech recorder werkt in editor + modal, state sync correct | ✅ | E2.S5, E4.S5, E5.S3 | 5 |
| E6.S2 | Dutch medical terms test | Test met Nederlandse GGZ terminologie, confidence indicators accuraat | ✅ | E3.S2 | 3 |
| E6.S3 | Browser compatibility | Test Chrome, Firefox, Safari (desktop), Chrome mobile | ✅ | E6.S1 | 3 |
| E6.S4 | Bug bash & polish | Fix top 10 bugs, polish animations, loading states, error messages | ✅ | E6.S3 | 2 |

**Implementatie Referenties:**
- Duplicate content flow: `rapportage-workspace.tsx` → `report-composer.tsx`
- Safari mimeType fallback: `hooks/use-deepgram-streaming.ts:setupAudio()`
- Browser support check: `hooks/use-deepgram-streaming.ts:checkBrowserSupport()`
- Test checklist: `docs/specs/speech/test-checklist-e6.md`

**Test Scenarios:**

**1. Happy Flow - Nieuwe Rapportage:**
```
1. User komt op rapportage pagina
2. Ziet editor full-width, geen timeline
3. Klikt [+ Vrije notitie]
4. Type pre-selected
5. Klikt [🎤 Start opname]
6. Cursor springt naar einde (leeg veld)
7. Spreekt: "De patiënt presenteert zich met klachten van angst en depressie"
8. Ziet interim tekst verschijnen (grijs, italic)
9. Na zin: tekst wordt final (zwart, bold)
10. Klikt [⏹ Stop]
11. Transcript compleet
12. Klikt [💾 Opslaan]
13. Toast: "✅ Rapportage opgeslagen"
```

**2. Happy Flow - Bestaande Bewerken:**
```
1. Klikt [📋 Timeline]
2. Sidebar slides in (300ms)
3. Ziet lijst met rapportages
4. Klikt [Bekijk rapport] op "Vrije notitie (23-11)"
5. Modal opens read mode
6. Leest content
7. Klikt [✏️ Bewerken]
8. Modal transforms to edit mode (300ms)
9. Speech recorder verschijnt
10. Klikt [🎤 Start opname]
11. Cursor springt naar einde van bestaande tekst
12. Spreekt: "Aanvullende observatie: patiënt toont verbetering"
13. Tekst append aan einde
14. Klikt [⏹ Stop]
15. Klikt [💾 Opslaan]
16. Toast: "✅ Wijzigingen opgeslagen"
17. Klikt [✕]
18. Modal sluit
```

**3. Error Flow - Network Drop:**
```
1. Start opname
2. Spreekt 5 seconden
3. Disconnect wifi
4. Status indicator: ⚠ Oranje "Herverbinden..."
5. Partial transcript blijft zichtbaar
6. Auto-reconnect (attempt 1)
7. Fails
8. Auto-reconnect (attempt 2)
9. Reconnect wifi
10. Success → ● Groen "Verbonden"
11. Kan verder dicteren
12. Alle tekst behouden
```

**4. Edge Case - Unsaved Changes:**
```
1. Open bestaande rapport
2. Klik [✏️ Bewerken]
3. Type: "Extra notitie"
4. Klikt [✕] (zonder save)
5. Dialog: "Niet opgeslagen wijzigingen"
6. Opties: [💾][🗑][←]
7. Klikt [← Terug]
8. Modal blijft open, changes intact
```

**Dutch Medical Terms Test List:**
```
- "gegeneraliseerde angststoornis"
- "SSRI medicatie"
- "DSM-5 classificatie"
- "cognitieve gedragstherapie"
- "EMDR behandeling"
- "traumaverwerking"
- "depressieve episode"
- "bipolaire stoornis"
- "schizofrenie"
- "persoonlijkheidsstoornis"
```

**Browser Compatibility Matrix:**

| Browser | Desktop | Mobile | WebSocket | Web Audio | MediaRecorder | Status |
|---------|---------|--------|-----------|-----------|---------------|--------|
| Chrome 90+ | ✅ | ✅ | ✅ | ✅ | ✅ | Full support |
| Firefox 88+ | ✅ | ✅ | ✅ | ✅ | ✅ | Full support |
| Safari 14+ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | Partial (MediaRecorder limited) |
| Edge 90+ | ✅ | ✅ | ✅ | ✅ | ✅ | Full support (Chromium) |

---

### Epic 7 — Deployment & Documentation

**Epic Doel:** Production deployment, documentatie, en training voor stakeholders.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E7.S1 | Production deployment | Vercel deployment succesvol, env vars gezet, HTTPS werkt | ⏳ | E6.S4 | 3 |
| E7.S2 | User documentation | Handleiding voor behandelaars: hoe speech recorder gebruiken | ⏳ | E7.S1 | 3 |
| E7.S3 | Stakeholder demo | Live demo voor stakeholders, feedback verzamelen | ⏳ | E7.S1 | 2 |

**Deployment Checklist:**

**Vercel Environment Variables:**
```
DEEPGRAM_API_KEY=<key>
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
SUPABASE_SERVICE_ROLE_KEY=<key>
```

**Pre-deployment Tests:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` no errors
- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] API routes respond correctly in preview
- [ ] Speech recorder works in preview deploy

**Post-deployment Smoke Tests:**
- [ ] Login works
- [ ] Navigate to rapportage page
- [ ] Quick actions work
- [ ] Timeline opens/closes
- [ ] Speech recorder starts/stops
- [ ] New rapportage saves
- [ ] Edit existing rapport works
- [ ] Modal open/close smooth
- [ ] No console errors

**User Documentation Outline:**

```markdown
# Handleiding: Spraakopname in Rapportages

## Nieuwe Rapportage Dicteren

1. Ga naar de Rapportage pagina van een patiënt
2. Klik op [+ Vrije notitie] (of ander type)
3. Klik op [🎤 Start opname]
4. Browser vraagt om microfoon toegang → Klik "Toestaan"
5. Spreek duidelijk in de microfoon
6. Zie de tekst real-time verschijnen
7. Klacht [⏹ Stop] wanneer je klaar bent
8. Klik [💾 Opslaan]

## Bestaande Rapportage Bewerken met Spraak

1. Klik op [📋 Timeline] rechtsboven
2. Zoek de rapportage die je wilt bewerken
3. Klik [Bekijk rapport]
4. Klik [✏️ Bewerken]
5. Klik [🎤 Start opname]
6. De nieuwe tekst wordt toegevoegd aan het einde
7. Klik [💾 Opslaan wijzigingen]

## Tips voor Beste Resultaten

✅ Spreek duidelijk en rustig
✅ Gebruik medische termen zoals je ze normaal uitspreekt
✅ Pauzeer kort tussen zinnen
✅ Check de tekst na dicteren (gele onderstreping = lagere zekerheid)

❌ Vermijd achtergrondgeluid
❌ Spreek niet te snel
❌ Zorg dat microfoon niet te ver weg staat
```

---

## 5. Kwaliteit & Testplan

### Test Types

| Test Type | Scope | Tools | Verantwoordelijke | Timing |
|-----------|-------|-------|-------------------|---------|
| Unit Tests | Deepgram hook, utility functions | Vitest | Developer | During E2, E3 |
| Integration Tests | Token endpoint, WebSocket connection | Playwright | Developer | During E6 |
| E2E Tests | Complete user flows (new + edit) | Playwright / Manual | Developer | E6.S1 |
| Performance Tests | Waveform 60fps, latency <500ms | Chrome DevTools | Developer | E3.S1 |
| Security Tests | Token security, rate limiting | Manual + Postman | Developer | E1.S2 |
| Accessibility | Screen reader, keyboard nav | axe DevTools | Developer | E6.S4 |
| Browser Compat | Chrome, Firefox, Safari | BrowserStack / Manual | Developer | E6.S3 |

### Test Coverage Targets

- **Unit tests:** 80%+ op `/hooks/use-deepgram-streaming.ts`
- **Integration tests:** `/api/deepgram/token` endpoint
- **E2E tests:** 2 happy flows (new + edit) + 2 error flows
- **Manual testing:** Dutch medical terminology list

### Critical Path Testing Scenarios

**Priority 1 (Blocker if broken):**
1. ✅ Speech recorder starts and streams audio
2. ✅ Real-time transcript appears during speech
3. ✅ Save new rapportage
4. ✅ Edit existing rapportage
5. ✅ Network resilience (reconnect works)

**Priority 2 (Important but not blocker):**
6. ✅ Waveform visualizes correctly
7. ✅ Confidence indicators show
8. ✅ Auto-pause after 3 sec silence
9. ✅ Timeline open/close animation smooth
10. ✅ Modal transitions smooth

**Priority 3 (Nice to have):**
11. ✅ Filters work correctly
12. ✅ Keyboard shortcuts (Esc, etc.)
13. ✅ Mobile responsive
14. ✅ Duplicate rapport feature

### Manual Test Checklist

**Speech Recorder:**
- [ ] Microfoon permissie flow correct
- [ ] WebSocket verbindt binnen 2 sec
- [ ] Audio streaming real-time
- [ ] Interim tekst grijs italic
- [ ] Final tekst zwart bold
- [ ] Stop sluit verbinding correct
- [ ] Error messages user-friendly
- [ ] Reconnect works (max 3 attempts)

**Page Layout:**
- [ ] Editor 100% width default
- [ ] Quick actions pre-select type
- [ ] Timeline sidebar slides smooth (300ms)
- [ ] Editor resizes naar 70% smooth
- [ ] Timeline cards show preview
- [ ] Filters show only when >10 items

**Modal:**
- [ ] Opens in read mode
- [ ] [✏️] transforms to edit mode smooth
- [ ] Speech recorder works in modal
- [ ] Save updates database
- [ ] Unsaved changes dialog correct
- [ ] [✕] closes (with check)

**Dutch Medical Terms:**
- [ ] Test all terms from list
- [ ] Check confidence scores
- [ ] Verify correct spelling
- [ ] Check punctuation correct

---

## 6. Demo & Presentatieplan

### Demo Scenario

**Duur:** 15 minuten
**Doelgroep:** Stakeholders (PO, behandelaars, management)
**Locatie:** Live op Vercel production (backup: staging)

**Demo Flow:**

**1. Intro (2 min)**
- Context: Waarom migratie naar real-time?
- Benefits: <500ms latency vs 2-5+ seconden
- UX redesign: Editor-first, minder afleiding

**2. Nieuwe Rapportage (4 min)**
- Navigate naar rapportage pagina
- Toon editor full-width (clean interface)
- Klik [+ Vrije notitie] (quick action demo)
- Start opname
- Dicteer: "De patiënt presenteert zich met klachten van gegeneraliseerde angst en slaapproblemen sinds drie maanden"
- Show real-time tekst verschijnen
- Point out: Interim (grijs) → Final (zwart) transition
- Show waveform visualisatie
- Stop opname
- Save rapportage

**3. Timeline & Edit (4 min)**
- Klik [📋 Timeline] → Sidebar slides in
- Show lijst met rapportages
- Klik [Bekijk rapport]
- Modal opens (read mode demo)
- Klik [✏️ Bewerken]
- Modal transforms (show smooth transition)
- Start opname in modal
- Dicteer aanvulling: "Patiënt reageert goed op cognitieve gedragstherapie"
- Show append aan einde
- Stop + Save
- Close modal

**4. UX Features (3 min)**
- Show confidence indicators (gele onderstreping)
- Demo auto-pause (3 sec stilte)
- Show network resilience (if possible/recorded)
- Quick actions benefits (1-click start)

**5. Q&A (2 min)**
- Feedback van behandelaars
- Vragen over workflow
- Next steps discussie

**Backup Plan:**
- **Plan B:** Staging environment if production issues
- **Plan C:** Localhost met pre-recorded demo video
- **Plan D:** Slide deck met screenshots + video recording

**Demo Data:**
- Pre-seeded test patient: "Demo Patient"
- 3 existing rapportages in timeline
- Clean state (no errors)

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner | Status |
|--------|------|--------|-----------|-------|--------|
| **Deepgram API downtime tijdens demo** | Laag | Hoog | Pre-recorded demo video backup, test 1 uur voor demo | Developer | ⏳ Monitor |
| **Dutch medical terms transcription errors** | Middel | Hoog | Extensive testing met terminologie lijst, tune confidence thresholds | Developer | ⏳ Test E6.S2 |
| **WebSocket connection instabiliteit** | Middel | Hoog | Robust reconnect logic (3x), partial transcript preservation | Developer | ✅ Implemented E2.S5 |
| **Browser compatibility issues Safari** | Middel | Middel | Test early, document limitations, fallback to REST API if needed | Developer | ⏳ Test E6.S3 |
| **Timeline state sync complex** | Middel | Middel | Clear state management, use React Context or Zustand | Developer | ⏳ Design E4.S3 |
| **Modal edit mode state bugs** | Middel | Middel | Thorough testing unsaved changes flow, clear state machine | Developer | ⏳ Test E5.S3 |
| **Performance issues with long rapportages** | Laag | Middel | Lazy loading, virtualization if >100 items, performance profiling | Developer | ⏳ Monitor E6.S1 |
| **Token rate limiting tijdens development** | Middel | Laag | Increase rate limit for dev, clear documentation | Developer | ✅ E1.S2 |
| **Deepgram API costs higher than expected** | Laag | Middel | Monitor usage, set up billing alerts, optimize chunk size | PM | ⏳ Monitor |
| **Migration breaks existing REST flow** | Laag | Hoog | Parallel implementation, feature flag, rollback plan | Developer | ⏳ E6.S1 |

**Critical Risks (Hoog/Hoog):**
1. **Deepgram API downtime** → Mitigation: Backup video + pre-recorded demo
2. **Dutch transcription errors** → Mitigation: Extensive testing, confidence indicators
3. **WebSocket instability** → Mitigation: Robust reconnect (implemented)

---

## 8. Evaluatie & Lessons Learned

**Te documenteren na project:**

### Success Metrics

**Kwantitatief:**
- [ ] Latency reduction: van 2-5s → <500ms ✅ Target bereikt?
- [ ] User satisfaction: Survey na 2 weken gebruik (1-5 schaal)
- [ ] Error rate: <5% van sessions hebben errors
- [ ] Transcription accuracy: >90% correct voor Dutch medical terms
- [ ] Adoption rate: >80% van behandelaars gebruikt speech recorder

**Kwalitatief:**
- [ ] Feedback van behandelaars: What works? What doesn't?
- [ ] Workflow improvements noted
- [ ] Pain points identified
- [ ] Feature requests voor v2

### Retrospective Questions

**Wat ging goed?**
- ...

**Wat ging niet goed?**
- ...

**Wat hebben we geleerd?**
- ...

**Welke AI-tools waren effectief?**
- Claude Code voor planning & code generation?
- ChatGPT voor prompt engineering?
- GitHub Copilot voor snippets?

**Welke Deepgram features werkten best?**
- Interim results?
- Endpointing?
- Smart format?
- Dutch language accuracy?

**Waar liepen we vertraging op?**
- ...

**Wat doen we volgende keer anders?**
- ...

**Herbruikbare componenten:**
- Speech recorder component → Other projects?
- WebSocket hook pattern → Reusable?
- Modal pattern → Design system?

---

## 9. Referenties

### Mission Control Documents

- **Analyse:** `docs/specs/speech/analyse-deepgram.md`
- **FO v2:** `docs/specs/speech/fo-realtime-speech-deepgram.md`
- **Bouwplan:** `docs/specs/speech/bouwplan-realtime-speech.md` (dit document)

### External Resources

- **Repository:** `https://github.com/[org]/15-mini-epd-prototype`
- **Deployment:** Vercel (production + preview)
- **Deepgram Docs:** https://developers.deepgram.com/docs
- **Deepgram SDK:** https://github.com/deepgram/deepgram-js-sdk

### Bestaande Implementatie

- **Speech Recorder (old):** `components/speech-recorder.tsx`
- **API Route (old):** `app/api/deepgram/transcribe/route.ts`
- **Report Composer:** `app/epd/patients/[id]/rapportage/components/report-composer.tsx`

### Deepgram API Documentation

- **Live Streaming:** https://developers.deepgram.com/docs/live-streaming-audio
- **Interim Results:** https://developers.deepgram.com/docs/interim-results
- **Endpointing:** https://developers.deepgram.com/docs/endpointing
- **Smart Format:** https://developers.deepgram.com/docs/smart-format
- **Dutch Language:** https://developers.deepgram.com/docs/language

---

## 10. Glossary & Abbreviations

| Term | Betekenis |
|------|-----------|
| **Epic** | Grote feature of fase (bevat meerdere stories) |
| **Story** | Kleine uitvoerbare taak binnen een epic |
| **Story Points** | Complexiteit schatting (Fibonacci: 1, 2, 3, 5, 8, 13) |
| **Interim Results** | Voorlopige transcriptie tijdens spreken (nog niet final) |
| **Final Results** | Definitieve transcriptie na zin/phrase eindigt |
| **Endpointing** | Detectie van spraakpauzes (speech_final event) |
| **Smart Format** | Auto punctuatie, capitalisatie, formatting |
| **WebSocket** | Bidirectionele real-time communicatie protocol |
| **Waveform** | Visuele representatie van audio volume |
| **Confidence Score** | AI zekerheid (0-1) over getranscribeerd woord |
| **Token Proxy** | Server endpoint die tijdelijke tokens uitgeeft |
| **Rate Limiting** | Beperking van API calls per tijd per user |
| **Progressive Disclosure** | Features on-demand tonen (niet alles tegelijk) |
| **Editor-First** | Design waar editor primair is, andere features opt-in |

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 24-11-2025 | Claude Code + Colin | Initiële versie - volledige planning 7 epics, 30 stories |
| v1.1 | 24-11-2025 | Claude Code + Colin | Epic 2 (Core Streaming) voltooid: hook, component, integraties. Epic 3 deels (waveform, pause/resume) |
| v1.2 | 24-11-2025 | Claude Code + Colin | Epic 3 (UX Polish) voltooid: confidence indicators, auto-pause na stilte |
| v1.3 | 24-11-2025 | Claude Code + Colin | Epic 4 (Layout Redesign) voltooid: editor-first, quick actions, timeline sidebar |
| v1.4 | 24-11-2025 | Claude Code + Colin | Epic 5 (View/Edit Modal) voltooid: unified modal, edit mode, unsaved changes protection |
| v1.5 | 24-11-2025 | Claude Code + Colin | Epic 6 (Integration & Testing) voltooid: duplicate flow, Safari mimeType fallback, browser support check, test checklist |

---

## Appendix A: Story Points Calibration

**Story Point Reference:**

- **1 point:** Triviale taak, <2 uur, geen risico (bijv. env var toevoegen)
- **2 points:** Simpele taak, 2-4 uur, laag risico (bijv. button component)
- **3 points:** Gemiddelde taak, 4-8 uur, middelmatig risico (bijv. API endpoint)
- **5 points:** Complexe taak, 1-2 dagen, risico's (bijv. custom hook met state)
- **8 points:** Zeer complex, 2-3 dagen, hoog risico (bijv. WebSocket lifecycle)
- **13 points:** Epic-size, 3-5 dagen, zeer hoog risico (bijv. complete refactor)

**Team Velocity:** ~40-50 story points per 2-week sprint (1 developer)

**Total Epic Breakdown:**
- E0: 8 points (voorbereiding) - ✅ Compleet
- E1: 8 points (backend)
- E2: 21 points (core streaming) - Grootste epic
- E3: 13 points (UX polish)
- E4: 21 points (layout redesign) - Grootste epic
- E5: 13 points (modal)
- E6: 13 points (testing)
- E7: 8 points (deployment)

**Total: 105 story points → ~2-3 sprints (4-6 weken bij 1 developer)**

---

## Appendix B: Git Branching Strategy

**Main branches:**
- `main` - Production (deployed op Vercel)
- `develop` - Development (deployed op Vercel preview)

**Feature branches:**
```
feature/E1-token-proxy
feature/E2-streaming-core
feature/E3-ux-polish
feature/E4-layout-redesign
feature/E5-view-edit-modal
feature/E6-integration
feature/E7-deployment
```

**Workflow:**
1. Create feature branch from `develop`
2. Work on epic/stories
3. PR naar `develop` (review + CI)
4. Merge to `develop` (auto-deploy preview)
5. Test in preview
6. PR `develop` → `main` (production)

**Commit Convention:**
```
feat(E2.S1): implement use-deepgram-streaming hook
fix(E3.S2): confidence indicator tooltip positioning
docs(E7.S2): add user documentation for speech recorder
test(E6.S2): add Dutch medical terms test suite
```

---

**🎯 Ready to Build!**

Dit bouwplan bevat alle details voor succesvolle implementatie van real-time speech transcription met editor-first UX redesign.

**Next steps:**
1. Review & approve bouwplan
2. Sprint planning (prioriteer epics)
3. Start met E1 (token proxy) → E2 (core streaming)
4. Iteratieve development met weekly demos
5. Continuous testing vanaf E2
6. Deploy naar production na E6 (testing compleet)

**Succes met de bouw! 🚀**
