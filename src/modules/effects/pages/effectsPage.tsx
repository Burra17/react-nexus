import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { EffectLifecycleDemo } from '../components/effectLifecycleDemo';
import effectLifecycleSource from '../components/effectLifecycleDemo.tsx?raw';
import effectLogSource from '../components/effectLog.tsx?raw';
import { RaceConditionDemo } from '../components/raceConditionDemo';
import raceConditionSource from '../components/raceConditionDemo.tsx?raw';
import { UnnecessaryEffectDemo } from '../components/unnecessaryEffectDemo';
import unnecessaryEffectSource from '../components/unnecessaryEffectDemo.tsx?raw';
import { effectsQuestions } from '../effectsQuestions';

const Theory = () => (
  <>
    <Typography>
      En komponent i React är en funktion som returnerar det som ska synas. Att React kör funktionen kallas att komponenten <em>ritas</em>, på
      engelska <em>render</em>, och en ritning ska bara räkna fram vad som ska synas. Den ska inte ändra något annat, eftersom React kan rita en
      komponent när som helst och hur många gånger som helst. Ibland måste en komponent ändå göra något utanför React: ansluta till en chattkanal,
      lyssna på tangentbordet, rulla en lista. Det kallas en <strong>effekt</strong>, och den skrivs inuti komponenten med{' '}
      <code>{'useEffect(() => { … }, [beroenden])'}</code>. Det första argumentet är funktionen som gör jobbet. React kör den efter att ritningen är
      klar, och oftast först efter att webbläsaren har <em>målat</em> skärmen, alltså ritat ut pixlarna. Kommer ritningen av ett klick kan React köra
      effekten före målningen. Syskonhooken <code>useLayoutEffect</code> körs alltid före målningen. Den behövs när effekten mäter eller ändrar något
      i layouten, så att skärmen inte hinner visa ett läge som genast flimrar bort. Loggen i demona nedan använder den.
    </Typography>

    <Typography>
      En komponent <em>monteras</em> när React lägger in den i trädet av komponenter och den visas första gången, och <em>avmonteras</em> när den tas
      bort. Det andra argumentet, <strong>beroendelistan</strong>, avgör när effekten körs igen. Ingen lista alls: efter varje ritning. Tom lista:
      bara när komponenten monteras. Lista med värden: när något av dem har ändrats sedan förra ritningen. Listan ska innehålla allt effekten läser
      från komponenten, alltså props, state och funktioner som skapas inuti den. React jämför varje värde med det förra: ett tal eller en sträng är
      lika när innehållet är lika, men ett objekt eller en funktion är bara lika med sig självt. Ett objekt eller en funktion som skapas inuti
      komponenten är därför nytt vid varje ritning, och står det i listan körs effekten om varje gång. <code>useCallback</code> ger samma funktion
      från ritning till ritning, och därför står den runt funktionerna som demona skickar in i sina effekter.
    </Typography>

    <Typography>
      En effekt får returnera en funktion, och den är <strong>städningen</strong>. Ändras ett beroende kör React städningen efter den nya ritningen,
      och först därefter effekten med de nya värdena. En sista gång körs städningen när komponenten avmonteras. Ordningen är poängen: det gamla
      kopplas ner innan det nya kopplas upp, så att de två aldrig är igång samtidigt. Städfunktionen ser värdena från den körning den skapades i,
      eftersom en funktion minns variablerna omkring sig när den skapas. I demo 1 nedan kopplar den därför ner ”allmänt” fast du just valt ”teknik”. I
      loggen står uppsättningen som SETUP och städningen som CLEANUP, de engelska ord react.dev använder.
    </Typography>

    <Typography>
      Appen ligger i <code>StrictMode</code>, ett hjälpmedel i React som bara verkar i utvecklingsläge, alltså när appen körs direkt från källkoden
      och inte som den publicerade versionen du läser nu. Där monterar React om varje komponent en gång direkt efter den första monteringen och
      behåller dess state. Effekten körs alltså, städas och körs igen: tre rader i loggen där den publicerade versionen ger en. Det är ett{' '}
      <strong>test</strong>, inte en bugg. Går effekten sönder av att köras om, till exempel med två anslutningar öppna samtidigt, saknar den
      städning. Samma fel hade visat sig när någon lämnar vyn och kommer tillbaka.
    </Typography>

    <Typography>
      <strong>Det viktigaste:</strong> de flesta effekter du skriver behöver inte finnas, eftersom inget i dem rör något utanför React. Ett värde som
      går att räkna fram ur props eller state, ett <em>härlett värde</em>, räknas fram under ritningen. Ska något hända när någon klickar läggs det i
      klickhanteraren, i stället för att sätta state och låta en effekt reagera på det. Är beräkningen tung sparar <code>useMemo</code> resultatet
      mellan ritningarna. Ska ett barn börja om när en prop ändras ger du det en ny <code>key</code>, och då blir det en ny komponent med nytt state.
      Lägger du ett härlett värde i state och sätter det i en effekt kostar det en ritning extra, och värdet kan hamna i otakt med det som det
      räknades fram ur.
    </Typography>

    <Typography>
      Kvar blir de fall där effekten verkligen rör något utanför React. Datahämtning är ett av dem, och det svåraste att få rätt för hand. Byter du
      användare medan en hämtning pågår startar en andra hämtning innan den första svarat, och kommer det gamla svaret sist skriver det över det nya.
      Det kallas en <em>kapplöpning</em>. Skärmen visar då data som hör till något du inte längre tittar på, utan att något kraschar eller ett
      felmeddelande syns. Botemedlet står i städningen: effekten skapar en flagga, <code>let ignore = false</code>, städningen sätter den till{' '}
      <code>true</code>, och ett svar som kommer när flaggan är satt får inte röra state. Själva anropet fortsätter. Vill man verkligen avbryta det
      finns webbläsarens <code>AbortController</code>, men för att skärmen ska visa rätt räcker flaggan.
    </Typography>

    <Typography>
      <strong>Regeln att ta med sig:</strong> hämta inte data med en egen effekt i en riktig app. Flaggan löser kapplöpningen men inget annat. Hämtar
      två komponenter samma sak blir det två anrop. Lämnar du vyn och kommer tillbaka hämtas allt igen, eftersom inget sparades. Och varje hämtning
      kräver sitt eget laddningsläge, sitt eget felläge och samma flagga en gång till. Därför avråder react.dev från mönstret och pekar på bibliotek
      som sparar svaren i en <em>cache</em>, ett minne av tidigare svar. I den här appen är det TanStack Query, som beskrivs i{' '}
      <Link component={RouterLink} to='/query-basics'>
        Query: grunder
      </Link>
      . Demo 3 nedan visar felet och flaggan, alltså den del av arbetet som ett sådant bibliotek tar över.
    </Typography>
  </>
);

export const EffectsPage = () => (
  <ConceptTemplate
    title='Effects'
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            1. Så fungerar en effekt
          </Typography>
          <Typography color='textSecondary'>
            Komponenten i demon har en effekt som låtsas ansluta till en chattkanal. Den ansluter inte till något på riktigt, utan skriver en rad i
            loggen. Tryck på ”Montera anslutningen”, så läggs komponenten in i trädet och effekten körs. Byt sedan kanal med väljaren, som går att
            använda först när något är monterat, och titta på i vilken ordning raderna kommer. Avmontera till sist och se vad som skrivs när
            komponenten försvinner.
          </Typography>
          <EffectLifecycleDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            2. Effekten som inte behövdes
          </Typography>
          <Typography color='textSecondary'>
            Fälten ligger i en förälder, och namnen går ner som props till båda korten. Korten visar samma namn, men får fram det på olika sätt: det
            ena lägger namnet i state och sätter det i en effekt, det andra räknar fram det under ritningen. Räknaren i varje kort visar hur många
            gånger det har ritats, och ritningen när sidan laddades räknas med. Jämför räknarna redan nu, och skriv sedan en bokstav i något av
            fälten.
          </Typography>
          <UnnecessaryEffectDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            3. När hämtningen springer om sig själv
          </Typography>
          <Typography color='textSecondary'>
            Hämtningen är låtsad: en timer som svarar efter den tid som står på knappen, så att svaren går att få i fel ordning med flit. Bo är vald
            från början. Tryck på Ada och sedan på Bo inom en och en halv sekund. Bos svar kommer då först och Adas efteråt. Titta på vem som är vald
            och vem som visas. Slå sedan på städningen och gör samma sak. Växeln byter till en annan komponent och tömmer loggen.
          </Typography>
          <RaceConditionDemo />
        </Stack>
      </Stack>
    }
    sources={[
      {
        fileName: 'src/modules/effects/components/effectLifecycleDemo.tsx',
        code: effectLifecycleSource,
        language: 'tsx',
        // Uppsättningen, städningen som returneras, och beroendelistan som
        // avgör när paret körs om.
        highlight: ["onLog('SETUP',", 'return () => {', '}, [channel, onLog]);'],
      },
      {
        fileName: 'src/modules/effects/components/unnecessaryEffectDemo.tsx',
        code: unnecessaryEffectSource,
        language: 'tsx',
        // De två raderna som är hela jämförelsen: värdet i state mot värdet
        // framräknat under ritningen.
        highlight: ['// FEL:', '// RÄTT:'],
      },
      {
        fileName: 'src/modules/effects/components/raceConditionDemo.tsx',
        code: raceConditionSource,
        language: 'tsx',
        // Raden som skriver ett svar utan att fråga om det fortfarande gäller,
        // raden som kastar det i stället, och flaggan de båda hänger på.
        highlight: ['// FEL:', '// RÄTT:', 'let ignore = false;'],
      },
      {
        fileName: 'src/modules/effects/components/effectLog.tsx',
        code: effectLogSource,
        language: 'tsx',
        // Loggpanelens egen effekt, ett exempel på när en effekt är rätt val:
        // den rör webbläsarens rullningsläge, som ligger utanför React.
        highlight: ['container.scrollTop = container.scrollHeight;'],
      },
    ]}
    quiz={effectsQuestions}
  />
);
