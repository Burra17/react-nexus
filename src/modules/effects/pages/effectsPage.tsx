import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
      En effekt är kod som körs för att komponenten renderades, inte för att någon klickade. React ritar först färdigt, låter webbläsaren måla upp
      skärmen, och kör sedan effekten. Därför passar den för att prata med sådant som ligger <strong>utanför</strong> React: en prenumeration, en
      tangentbordslyssnare, ett bibliotek som inte vet vad en komponent är. Det finns en syskonhook, <code>useLayoutEffect</code>, som körs före
      målningen — du behöver den nästan aldrig, och när du gör det handlar det om att mäta något i layouten innan användaren hinner se den.
    </Typography>

    <Typography>
      Andra argumentet till <code>useEffect</code> avgör när den körs igen. Ingen lista alls: efter varje rendering. Tom lista: bara när komponenten
      monteras. Lista med värden: när något av dem har ändrats sedan sist. Och <em>ändrats</em> avgörs med <code>Object.is</code>, alltså på{' '}
      <strong>referens</strong> — exakt samma jämförelse som fick <code>React.memo</code> att tystna i modul 2. Ett objekt eller en funktion som
      skapas inuti komponenten är ett nytt värde varje gång, och står den i beroendelistan körs effekten om vid varenda rendering.
    </Typography>

    <Typography>
      En effekt får returnera en funktion, och den är städningen. React kör den innan effekten körs nästa gång, och en sista gång när komponenten
      försvinner. Ordningen är poängen: städningen efter det gamla värdet kommer <strong>före</strong> uppsättningen för det nya, så att de två aldrig
      är igång samtidigt. Städfunktionen ser dessutom värdena från sin egen körning — den kopplar ner &quot;allmänt&quot; även om du just har valt
      &quot;teknik&quot;.
    </Typography>

    <Typography>
      I utvecklingsläge monterar React om varje komponent en gång direkt efter den första monteringen. Effekten körs alltså, städas, och körs igen:
      tre rader i loggen där du väntade dig en. Det sker aldrig i ett byggt projekt. Och det är ett <strong>test</strong>, inte en bugg — går effekten
      sönder av att köras om saknar den städning, och det felet fanns där redan innan React visade det för dig.
    </Typography>

    <Typography>
      <strong>Det viktigaste:</strong> de flesta effekter du skriver behöver inte finnas. En effekt är till för att synkronisera med något utanför
      React. Ska du räkna fram ett värde ur props eller state — gör det under renderingen. Ska något hända när någon klickar — lägg det i
      klickhanteraren. Är beräkningen dyr — <code>useMemo</code>. Ska ett barn börja om när en prop ändras — ge det en <code>key</code>. Lägger du ett
      härlett värde i state kostar det en omritning extra, och du har skapat något som kan hamna i otakt med det som det räknades fram ur.
    </Typography>

    <Typography>
      Kvar blir de fall där en effekt verkligen behövs, och datahämtning är det svåraste av dem. Byter du användare medan en hämtning pågår startar en
      andra hämtning innan den första svarat, och kommer det gamla svaret sist skriver det över det nya. Skärmen visar då data som hör till något du
      inte längre tittar på. Ingenting kraschar och inget felmeddelande syns — det är därför felet är så lätt att missa. Botemedlet står i
      städfunktionen: en flagga som varje körning äger själv, och som säger åt ett svar som hunnit bli inaktuellt att lämna state i fred. Anropet går
      inte att ta tillbaka, men resultatet går att kasta.
    </Typography>

    <Typography>
      <strong>Regeln att ta med sig:</strong> flaggan löser kapplöpningen, men ingenting annat. Hämtar två komponenter samma sak blir det två anrop.
      Lämnar du vyn och kommer tillbaka hämtas allt igen, eftersom ingenting sparades. Och varje ny hämtning i appen kräver sitt eget laddningsläge,
      sitt eget felläge och samma flagga en gång till. Det är därför react.dev själva avråder från att hämta direkt i en effekt och pekar på ett
      bibliotek som håller en cache — här TanStack Query, som är hela modul 7. Det du bygger för hand i demon nedan är precis det den tar över.
    </Typography>
  </>
);

export const EffectsPage = () => (
  <ConceptTemplate
    title="Effects"
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h3" component="h3">
            1. Så fungerar en effekt
          </Typography>
          <EffectLifecycleDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="h3" component="h3">
            2. Effekten som inte behövdes
          </Typography>
          <UnnecessaryEffectDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="h3" component="h3">
            3. När hämtningen springer om sig själv
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
        // framräknat under renderingen.
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
        // Loggpanelens egen effekt - ett exempel på när en effekt är rätt val:
        // den rör webbläsarens rullningsläge, som ligger utanför React.
        highlight: ['container.scrollTop = container.scrollHeight;'],
      },
    ]}
    quiz={effectsQuestions}
  />
);
