/**
 * Seed Reports Script
 *
 * This script seeds the reports table with realistic test data for demonstrating
 * AI summarization and report analysis features.
 *
 * Usage:
 *   pnpm tsx scripts/seed-reports.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

type ReportInsert = Database['public']['Tables']['reports']['Insert'];

interface SeedReport extends Omit<ReportInsert, 'id' | 'patient_id' | 'created_by'> {
  patient_family_name: string;
  patient_given_name: string;
  practitioner_index: 1 | 2 | 3;
}

const PRACTITIONER_IDS = {
  1: '10000000-0000-0000-0000-000000000001', // Dr. Sarah de Vries
  2: '10000000-0000-0000-0000-000000000002', // Drs. Mark Jansen
  3: '10000000-0000-0000-0000-000000000003', // Lisa van den Berg
} as const;

const seedReportsData: SeedReport[] = [
  // Colin Lit - Depression Treatment Reports
  {
    patient_family_name: 'Lit',
    patient_given_name: 'Colin',
    practitioner_index: 1,
    type: 'behandeladvies',
    content: `Intake gesprek met Colin Lit, 28 jaar. Cliënt presenteert zich met matige tot ernstige depressieve klachten en slaapproblemen die sinds ongeveer 3 maanden aanwezig zijn. Aanleiding is een combinatie van werkdruk en een recente relatiebreuk.

Klachten:
- Sombere stemming vrijwel de hele dag
- Verlies van interesse en plezier in activiteiten
- Slaapproblemen (moeite met inslapen, vroeg wakker worden)
- Verminderde concentratie
- Gevoelens van waardeloosheid
- Afgenomen eetlust met gewichtsverlies (5kg in 2 maanden)

ROM meetinstrumenten:
- PHQ-9: 14 (matig ernstige depressie)
- GAD-7: 8 (milde angst)

Behandeladvies:
Start met Cognitieve Gedragstherapie (CGT) gericht op gedragsactivatie en cognitieve herstructurering. Focus op:
1. Normaliseren van slaap-waakritme
2. Opbouwen van plezierige activiteiten
3. Uitdagen van negatieve gedachten
4. Stress management technieken

Voorgestelde frequentie: wekelijks, 12-16 sessies. Overleg met huisarts over eventuele medicamenteuze ondersteuning indien na 6 weken geen verbetering.`,
    created_at: '2024-10-15T11:30:00Z',
    structured_data: {
      diagnosis_codes: ['F32.1', 'F51.0'],
      rom_scores: { 'PHQ-9': 14, 'GAD-7': 8 },
      treatment_plan: {
        type: 'CGT',
        sessions: 12,
        frequency: 'wekelijks',
      },
    },
    ai_confidence: 0.92,
    ai_reasoning: 'Clearly structured intake report with treatment advice section',
  },
  {
    patient_family_name: 'Lit',
    patient_given_name: 'Colin',
    practitioner_index: 1,
    type: 'vrije_notitie',
    content: `Tweede sessie CGT met Colin. Besproken hoe de week is verlopen. Colin geeft aan dat hij kleine stappen heeft gezet met de gedragsactivatie oefeningen. Hij is 3x gaan wandelen en heeft 1x contact gehad met een vriend.

Positief: Colin merkt dat de wandelingen hem even afleiden van piekeren. Slaap is iets verbeterd, gemiddeld 6 uur per nacht.

Aandachtspunten: Colin blijft negatief denken over zijn werk situatie. "Ik ben niet goed genoeg" is een terugkerende gedachte. Hebben gedachtenregistratie oefening gedaan om deze gedachten te identificeren en uitdagen.

Huiswerk: Dagelijks één plezierige activiteit plannen en uitvoeren. Gedachtenregistratie bijhouden van negatieve gedachten over werk.

Volgende sessie: Verdiepen in cognitieve herstructurering, specifiek gericht op perfectionisme en werk-gerelateerde cognities.`,
    created_at: '2024-10-22T11:00:00Z',
    structured_data: {
      session_number: 2,
      homework_compliance: 'goed',
      mood_trend: 'licht verbeterd',
    },
  },
  {
    patient_family_name: 'Lit',
    patient_given_name: 'Colin',
    practitioner_index: 1,
    type: 'vrije_notitie',
    content: `Vierde sessie. Duidelijke vooruitgang zichtbaar. Colin rapporteert dat zijn stemming is verbeterd en dat hij meer energie heeft. PHQ-9 deze week: 9 (milde depressie).

Colin heeft deze week succesvol meerdere sociale activiteiten ondernomen en begint weer plezier te ervaren. Hij merkt dat de negatieve gedachten minder frequent zijn en dat hij ze sneller kan herkennen en uitdagen.

We hebben gewerkt aan zijn perfectionistische normen m.b.t. werk. Colin begint te zien dat zijn hoge eisen aan zichzelf bijdragen aan stress en somberheid. Hij heeft afgesproken om realistische doelen te stellen en meer zelfcompassie te oefenen.

Slaap is verder genormaliseerd, gemiddeld 7-8 uur per nacht. Eetlust is ook toegenomen.

Vervolg: Komende sessies focus op relapse preventie en omgaan met terugval in oude patronen.`,
    created_at: '2024-11-05T10:30:00Z',
    structured_data: {
      session_number: 4,
      phq9_score: 9,
      treatment_progress: 'goed',
    },
  },
  {
    patient_family_name: 'Lit',
    patient_given_name: 'Colin',
    practitioner_index: 1,
    type: 'vrije_notitie',
    content: `Tussentijds telefonisch contact met Colin. Hij belde omdat hij een moeilijke week had en twijfelde of hij wel vooruitgang boekt. Geruststelling gegeven dat terugval in oude patronen normaal is tijdens behandeling.

Colin had een conflict op werk gehad en merkte dat oude gedachtenpatronen terugkwamen. Hebben kort doorgenomen welke copingstrategieën hij heeft geleerd. Colin besefte dat hij vergeten was zijn gedachtenregistratie bij te houden.

Afgesproken: Extra sessie inplannen komende week om dit te bespreken. Colin voelt zich na gesprek rustiger en heeft vertrouwen dat hij de tools heeft om hiermee om te gaan.`,
    created_at: '2024-10-28T16:30:00Z',
    structured_data: {
      contact_type: 'telefonisch',
      crisis_level: 'laag',
      extra_session: true,
    },
  },
  {
    patient_family_name: 'Lit',
    patient_given_name: 'Colin',
    practitioner_index: 1,
    type: 'behandeladvies',
    content: `Voortgangsrapportage na 8 sessies CGT voor Colin Lit.

Behandelverloop:
Colin heeft 8 sessies CGT gevolgd gericht op depressieve klachten. De behandeling bestond uit gedragsactivatie, cognitieve herstructurering en slaaphygiëne. Colin heeft goed meegewerkt en huiswerkopdrachten consequent uitgevoerd.

Klinische vooruitgang:
- PHQ-9 intake: 14 → Huidig: 6 (minimale depressie)
- GAD-7 intake: 8 → Huidig: 4 (minimale angst)
- Stemming duidelijk verbeterd
- Slaap genormaliseerd (7-8 uur per nacht)
- Gewicht gestabiliseerd
- Sociaal functioneren verbeterd
- Werkprestaties hersteld

Ingezette interventies die succesvol waren:
1. Gedragsactivatie - opbouw plezierige en noodzakelijke activiteiten
2. Cognitieve herstructurering - uitdagen perfectionisme en zwart-wit denken
3. Slaaphygiëne protocol
4. Stress management technieken
5. Sociale activatie

Behandeladvies:
- Afbouwen naar tweewekelijkse sessies (nog 4 sessies)
- Focus op relapse preventie
- Identificeren early warning signs
- Opstellen terugvalpreventieplan
- Evaluatie na totaal 12 sessies voor mogelijke afsluiting

Prognose: Goed. Colin heeft effectieve copingvaardigheden ontwikkeld en toont goede zelfinzicht. Risico op terugval is gereduceerd door gerichte preventie strategieën.`,
    created_at: '2024-11-12T09:00:00Z',
    structured_data: {
      session_count: 8,
      rom_intake: { 'PHQ-9': 14, 'GAD-7': 8 },
      rom_current: { 'PHQ-9': 6, 'GAD-7': 4 },
      clinical_progress: 'significant improvement',
      prognosis: 'good',
    },
    ai_confidence: 0.98,
    ai_reasoning: 'Well-structured progress report with clear outcome data and treatment recommendations',
  },

  // Jan de Vriesh - Anxiety Disorder Treatment Reports
  {
    patient_family_name: 'de Vriesh',
    patient_given_name: 'Jan',
    practitioner_index: 2,
    type: 'behandeladvies',
    content: `Intake met Jan de Vriesh (35 jaar). Hoofdklacht: gegeneraliseerde angststoornis met uitgebreide piekersymptomen en fysieke spanningsklachten. Jan maakt zich voortdurend zorgen over uiteenlopende onderwerpen (werk, gezondheid, relatie, financiën).

Presenterende klachten:
- Excessief en moeilijk te controleren piekeren
- Rusteloosheid en gespannenheid
- Moeite met concentreren
- Prikkelbaarheid
- Spierspanning (vooral nek en schouders)
- Slaapstoornissen
- Vermijdingsgedrag

ROM instrumenten:
- GAD-7: 16 (matig ernstige angst)
- PHQ-9: 11 (matige depressie, secundair aan angst)
- PSWQ (Penn State Worry Questionnaire): 68 (klinisch significant)

Comorbiditeit: Relationele problematiek. Partner ervaart last van Jans constante geruststelling zoeken.

Behandelplan:
Acceptance and Commitment Therapy (ACT) met focus op:
1. Psycho-educatie over angst en piekeren
2. Mindfulness en acceptatie technieken
3. Defusie van angstige gedachten
4. Waarden clarificatie
5. Committed action richting waarden
6. Relatie counseling waar nodig

Duur: 16-20 sessies, wekelijks/tweewekelijks. Evaluatie na 8 sessies.`,
    created_at: '2024-11-01T15:45:00Z',
    structured_data: {
      diagnosis_codes: ['F41.1', 'Z63.0'],
      rom_scores: { 'GAD-7': 16, 'PHQ-9': 11, PSWQ: 68 },
      treatment_plan: {
        type: 'ACT',
        sessions: 16,
        frequency: 'wekelijks',
      },
    },
    ai_confidence: 0.95,
    ai_reasoning: 'Clear treatment advice structure with specific ACT intervention plan',
  },
  {
    patient_family_name: 'de Vriesh',
    patient_given_name: 'Jan',
    practitioner_index: 2,
    type: 'vrije_notitie',
    content: `Derde sessie ACT met Jan. Vandaag gefocust op mindfulness en acceptance. Jan vindt het moeilijk om de piekeren "los te laten" zoals hij het zelf verwoordt. We hebben uitgelegd dat het niet gaat om het loslaten maar om een andere relatie met de gedachten te ontwikkelen.

Oefening: Leaves on a stream mindfulness oefening gedaan. Jan merkte dat hij steeds weer mee ging in zijn gedachten in plaats van ze te observeren. Dit is normaal in het begin. Hebben afgesproken dat hij dit thuis 10 minuten per dag gaat oefenen.

Bespreking van metafoor: Passagiers op de bus. Jan herkent dat zijn angstige gedachten als passagiers proberen de controle over te nemen. We hebben gesproken over het verschil tussen chauffeur zijn versus passagier.

Huiswerk: Dagelijkse mindfulness oefening, observeren van piekeren zonder erin mee te gaan, en bijhouden welke waarden belangrijk zijn in zijn leven.

Jan blijft vragen om "praktische tips" om het piekeren te stoppen. Uitgelegd dat dit juist het probleem is - de strijd met de gedachten versterkt ze. Focus blijft op acceptatie en psychologische flexibiliteit.`,
    created_at: '2024-11-15T14:30:00Z',
    structured_data: {
      session_number: 3,
      act_component: 'acceptance and mindfulness',
      homework_assigned: true,
    },
  },
  {
    patient_family_name: 'de Vriesh',
    patient_given_name: 'Jan',
    practitioner_index: 2,
    type: 'vrije_notitie',
    content: `Uitgebreide sessie met Jan waarin we dieper zijn ingegaan op de relatiedynamiek en hoe zijn angststoornis zijn partnerrelatie beïnvloedt.

Jan vertelt dat zijn partner (Emma) steeds gefrustreerder raakt door zijn constante geruststelling zoeken. Hij belt haar meerdere keren per dag op werk om bevestiging te krijgen dat alles goed is. Emma heeft aangegeven dat dit voor haar belastend is en dat ze zich gecontroleerd voelt.

Voor Jan is dit gedrag een copingmechanisme om zijn angst te reguleren. Hij beseft intellectueel dat dit zijn relatie schaadt maar voelt dat hij de drang niet kan weerstaan. Dit past binnen het ACT model van experiential avoidance - Jan probeert zijn angstige gevoelens te vermijden door geruststelling te zoeken.

We hebben gewerkt aan:
1. Bewustwording van de functie van het gedrag (korte termijn angstreductie vs lange termijn schade)
2. Identificeren van waarden in zijn relatie (verbinding, vertrouwen, autonomie)
3. Het conflict tussen zijn gedrag en zijn waarden zichtbaar maken
4. Alternatieve manieren om met angst om te gaan (mindfulness, self-compassion)

Jan werd emotioneel tijdens dit gesprek toen hij besefte hoeveel druk hij op Emma legt. Dit is een belangrijk moment van zelfinzicht. We hebben samen een plan gemaakt:
- Jan gaat dagelijks max 1x bellen voor geruststelling (exposure)
- Emma en Jan gaan samen een gesprek hebben over grenzen
- Jan gaat zijn angstige gevoelens opschrijven in plaats van direct contact zoeken
- Mogelijk relatietherapie sessies indien Jan en Emma dit beiden wensen

Huiswerk: Jan gaat Emma een brief schrijven waarin hij uitlegt wat hij leert in therapie en hoe hij wil werken aan hun relatie. Deze brief gaan we volgende sessie bespreken voordat hij hem geeft.`,
    created_at: '2024-11-22T15:00:00Z',
    structured_data: {
      session_number: 6,
      focus: 'relationship dynamics',
      emotional_breakthrough: true,
      homework: 'write letter to partner',
    },
  },

  // Optimus Prime - Diagnostic Reports (Easter egg)
  {
    patient_family_name: 'Prime',
    patient_given_name: 'Optimus',
    practitioner_index: 3,
    type: 'behandeladvies',
    content: `Diagnostisch onderzoek Optimus Prime. Cliënt, van niet-Nederlandse oorsprong, presenteert zich met unieke symptomatologie die niet binnen standaard DSM-5 classificaties past.

Observaties tijdens onderzoek:
- Opvallend metallic timbre in stem
- Zeer systematische en logische denkwijze
- Uitstekende geheugen en informatieverwerkingscapaciteit
- Moeite met emotionele expressie en herkenning
- Sterke focus op "missie" en "verantwoordelijkheid voor anderen"
- Rapporteert "transformatie processen" die mogelijk metaforisch bedoeld zijn

WAIS-IV resultaten:
- Verbaal begrip: 145 (zeer superieur)
- Perceptuele redeneren: 150 (zeer superieur)
- Werkgeheugen: 155 (zeer superieur)
- Verwerkingssnelheid: 148 (zeer superieur)

Emotionele functies:
- Alexithymie kenmerken aanwezig
- Moeite met identificeren en benoemen emoties
- Compensatie door extreem hoog functionerend cognitief systeem

Provisional diagnostische indruk:
- Mogelijk autisme spectrum stoornis (ASS) met zeer hoog IQ
- Differentiaal diagnostiek: unieke neurodivergentie

Advies:
- Verder specialistisch onderzoek geïndiceerd
- Focus op emotionele ontwikkeling en sociale vaardigheden indien cliënt dit wenst
- Mogelijk contact met expertise centrum voor hoogbegaafdheid
- Overwegen of behandeling geïndiceerd is gezien hoog functioneringsniveau`,
    created_at: '2024-11-10T12:00:00Z',
    structured_data: {
      diagnosis_codes: ['Z03.2'],
      test_results: {
        'WAIS-IV': {
          Verbal: 145,
          Perceptual: 150,
          Working_Memory: 155,
          Processing: 148,
        },
      },
      notes: 'Zeer uitzonderlijk profiel, verder onderzoek aanbevolen',
    },
    ai_confidence: 0.78,
    ai_reasoning: 'Structured diagnostic report though clinical presentation is atypical',
  },
  {
    patient_family_name: 'Prime',
    patient_given_name: 'Optimus',
    practitioner_index: 3,
    type: 'vrije_notitie',
    content: `Follow-up gesprek met Optimus over diagnostische bevindingen. Cliënt geeft aan zich niet "gebroken" te voelen en vraagt zich af of behandeling wel nodig is.

Optimus legt uit dat zijn wijze van functioneren voor hem naturel is en dat hij vooral moeite heeft met het begrijpen van "menselijke emotionele complexiteit" zoals hij het noemt. Hij functioneert zeer goed in zijn werk (iets met zware voertuigen en logistiek management) en heeft een groep vrienden die hem accepteren zoals hij is.

Hoofdvraag: Hoe om te gaan met sociale situaties waar emotionele intelligentie vereist is? Optimus wil graag leren om beter te navigeren in sociale interacties zonder dat dit zijn authentieke zelf in gevaar brengt.

Afgesproken: Geen formele behandeling nodig. Wel aangeboden om enkele consultatieve sessies te doen gericht op:
1. Psycho-educatie over verschillende neurodiversiteit
2. Social skills coaching (indien gewenst)
3. Strategieën voor emotieherkenning en -regulatie

Optimus gaf aan hier over na te denken. Deur staat open voor follow-up indien gewenst.`,
    created_at: '2024-11-17T10:00:00Z',
    structured_data: {
      follow_up: 'optioneel',
      client_preference: 'consultative approach',
    },
  },
];

async function getPatientId(familyName: string, givenName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('id')
    .eq('name_family', familyName)
    .contains('name_given', [givenName])
    .single();

  if (error) {
    console.error(`Error fetching patient ${givenName} ${familyName}:`, error.message);
    return null;
  }

  return data?.id || null;
}

async function seedReports() {
  console.log('🌱 Starting reports seed process...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const report of seedReportsData) {
    try {
      // Get patient ID
      const patientId = await getPatientId(report.patient_family_name, report.patient_given_name);
      if (!patientId) {
        console.error(`❌ Patient not found: ${report.patient_given_name} ${report.patient_family_name}`);
        errorCount++;
        continue;
      }

      // Get practitioner ID
      const practitionerId = PRACTITIONER_IDS[report.practitioner_index];

      // Prepare report data
      const reportData: ReportInsert = {
        patient_id: patientId,
        created_by: practitionerId,
        type: report.type,
        content: report.content,
        created_at: report.created_at,
        structured_data: report.structured_data as any,
        ai_confidence: report.ai_confidence,
        ai_reasoning: report.ai_reasoning,
      };

      // Insert report
      const { error } = await supabase.from('reports').insert(reportData);

      if (error) {
        console.error(`❌ Error inserting report for ${report.patient_given_name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✓ Inserted ${report.type} for ${report.patient_given_name} ${report.patient_family_name}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Unexpected error:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Seed Summary:');
  console.log(`   ✓ Successfully seeded: ${successCount} reports`);
  console.log(`   ✗ Errors: ${errorCount}`);
  console.log('='.repeat(50));

  if (successCount > 0) {
    console.log('\n✅ Reports seed completed successfully!');
    console.log('\n💡 Use cases for AI summarization:');
    console.log('   - Patient report timeline visualization');
    console.log('   - Treatment progress tracking');
    console.log('   - ROM score extraction and trending');
    console.log('   - Automatic classification (behandeladvies vs vrije_notitie)');
    console.log('   - Multi-patient report analysis');
  }
}

// Run the seed function
seedReports().catch((error) => {
  console.error('💥 Fatal error during seeding:', error);
  process.exit(1);
});
