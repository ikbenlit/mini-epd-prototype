# FAQ Spraakherkenning

## Wat is spraakgestuurde verslaglegging?

Met spraakgestuurde verslaglegging kun je rapportages dicteren in plaats van typen. Het systeem transcribeert spraak naar tekst in real-time via Deepgram Nova-2, geoptimaliseerd voor Nederlands.

**Kernvoordelen:**
- Sneller rapporteren (dicteren vs. typen)
- Hands-free invoer tijdens of direct na het consult
- Nederlandse spraakherkenning van hoge kwaliteit
- Visuele feedback tijdens opname

## Waar kan ik spraakherkenning gebruiken?

Spraakherkenning is beschikbaar in de **Rapportage** sectie van een cliëntdossier. Je herkent het aan de groene microfoonknop in de werkbalk van de editor.

## Hoe gebruik ik spraakherkenning?

### Stap 1: Start de opname
Klik op de **groene microfoonknop** om de spraakopname te starten.

**Wat je ziet:**
- De knop wordt oranje met een waveform animatie
- Een klein vierkant (stop-icoon) verschijnt
- De browser vraagt eenmalig om microfoontoegang

### Stap 2: Dicteer
Spreek duidelijk en in een normaal tempo. Terwijl je spreekt:
- **Live preview**: Onder de editor verschijnt een oranje balk met de tekst die wordt herkend
- **Automatische interpunctie**: Punten en komma's worden automatisch toegevoegd
- **Pauzes worden herkend**: Na een korte stilte wordt de zin als definitief opgeslagen

### Stap 3: Stop de opname
Klik op het **oranje stop-icoon** om de opname te beëindigen. De getranscribeerde tekst blijft in de editor staan.

### Stap 4: Bewerk en sla op
- Controleer de getranscribeerde tekst
- Pas eventuele fouten aan
- Klik op **Analyseer met AI** voor automatische categorisatie
- Klik op **Opslaan** om de rapportage vast te leggen

## Tips voor optimale herkenning

- Spreek in een rustige omgeving
- Houd de microfoon op normale afstand
- Dicteer natuurlijk, alsof je tegen een collega spreekt
- Vermeld bij voorkeur de cliëntnaam aan het begin
- Spreek in volledige zinnen

## Welke browsers worden ondersteund?

Spraakopname werkt in alle moderne browsers:
- Chrome (aanbevolen)
- Firefox
- Safari
- Edge

Op oudere browsers of zonder microfoon wordt de knop grijs weergegeven.

## Moet ik iets installeren?

Nee, de spraakherkenning werkt volledig in de browser. Bij eerste gebruik vraagt de browser eenmalig om toegang tot je microfoon.

## Hoe zit het met privacy?

- Audio wordt versleuteld verzonden naar Deepgram voor transcriptie
- Audio wordt **niet** opgeslagen na transcriptie
- Alleen de getranscribeerde tekst wordt bewaard in het EPD
- Deepgram is AVG-compliant

## Mijn microfoon werkt niet, wat nu?

Controleer het volgende:
1. **Browsertoestemming** - Heeft de browser toegang tot je microfoon?
   - Chrome: Instellingen > Privacy en beveiliging > Site-instellingen > Microfoon
2. **Systeeminstellingen** - Staat de microfoon aan in je besturingssysteem?
3. **Juiste microfoon** - Is de juiste microfoon geselecteerd?

## Wat als de herkenning fouten maakt?

De tekst in de editor is volledig bewerkbaar. Corrigeer eventuele fouten handmatig voordat je opslaat. Voor medische termen of eigennamen kan handmatige correctie nodig zijn.

## Hoeveel mag ik dicteren?

Er geldt een limiet van 5 opnamesessies per uur per gebruiker. Dit is ruim voldoende voor normale rapportage. Bij het bereiken van de limiet verschijnt een melding.

## Bekende beperkingen

- **Achtergrondgeluid**: Veel omgevingsgeluid kan de herkenning verstoren
- **Meerdere sprekers**: Het systeem is geoptimaliseerd voor één spreker
- **Medische termen**: Sommige specialistische termen worden mogelijk niet correct herkend
- **Dialect**: Standaard Nederlands wordt het beste herkend

## Technische specificaties

- Model: Deepgram Nova-2 (geoptimaliseerd voor Nederlands)
- Latentie: < 300ms
- Nauwkeurigheid: > 95% voor duidelijke spraak
