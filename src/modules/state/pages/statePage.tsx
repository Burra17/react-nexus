import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { stateQuestions } from '../stateQuestions';
import { BatchingDemo } from '../components/batchingDemo';
import batchingSource from '../components/batchingDemo.tsx?raw';
import renderCounterSource from '../../../shared/components/renderCounter.tsx?raw';
import { SnapshotDemo } from '../components/snapshotDemo';
import snapshotSource from '../components/snapshotDemo.tsx?raw';

const Theory = () => (
  <>
    <Typography>
      En komponent i React är en funktion som returnerar det som ska synas. Varje gång React <em>ritar</em> komponenten, på engelska <em>render</em>,
      anropar den funktionen på nytt, och allt som skapas inuti den skapas på nytt: variabler, beräkningar och klickhanterare. En vanlig variabel
      börjar därför om från början vid varje ritning. <strong>State är komponentens minne mellan ritningarna.</strong> Med{' '}
      <code>const [count, setCount] = useState(0)</code> ber du React spara ett värde åt komponenten. Du får tillbaka ett par: <code>count</code>,
      värdet för den här ritningen, och <code>setCount</code>, funktionen som ber om ett nytt värde. Nollan är bara startvärdet, som används första
      gången. Varje komponent på sidan har sitt eget state, också när två komponenter ser likadana ut.
    </Typography>

    <Typography>
      Det viktigaste att förstå är att <code>count</code> är en <strong>ögonblicksbild</strong>. När React anropar komponenten får <code>count</code>{' '}
      värdet för just den ritningen, och klickhanterarna som skapas i samma anrop ser det värdet, också när de körs senare. Var <code>count</code> 0
      när knappen ritades är <code>count</code> 0 i dess klickhanterare, vad som än händer där inne. Det finns alltså två saker: värdet som React
      sparar, och kopian i ögonblicksbilden.
    </Typography>

    <Typography>
      Därför ändrar <code>setCount(count + 1)</code> inte <code>count</code> på stället. Anropet lägger en beställning hos React, som ställer den i en
      kö och sedan ritar om komponenten. Det är anropet till <code>setCount</code> som utlöser ritningen, och först i nästa ritning har{' '}
      <code>count</code> det nya värdet. Säger beställningen samma värde som redan står där hoppar React över ritningen, eftersom ingenting skulle
      ändras.
    </Typography>

    <Typography>
      Anropar du <code>setCount(count + 1)</code> tre gånger i samma klickhanterare blir resultatet 1 och inte 3. <code>count</code> är 0 i
      ögonblicksbilden, så alla tre beställer samma sak: sätt värdet till 0 + 1. Det beror på ögonblicksbilden och hade blivit 1 även om React ritat
      om efter varje anrop. En annan sak är att React väntar tills klickhanteraren är klar och sedan ritar om en enda gång för alla beställningarna.
      Det kallas <strong>batchning</strong> och finns för att slippa ritningar som ingen hinner se. Batchningen avgör hur många ritningar det blir,
      inte vilket värde som hamnar i <code>count</code>.
    </Typography>

    <Typography>
      Beror det nya värdet på det gamla kan du skicka in en funktion i stället: <code>setCount((c) =&gt; c + 1)</code>. En sådan funktion kallas på
      engelska <em>updater function</em>. React ställer den i kön och anropar den med det senaste värdet, <code>c</code>, alltså resultatet av
      beställningarna före den. Tre anrop ger då 3. Skillnaden syns när flera beställningar görs innan nästa ritning, som i en och samma
      klickhanterare. Gör varje klick bara en beställning spelar formen ingen roll, eftersom React ritar om mellan två klick och nästa klick får en ny
      ögonblicksbild. Undantaget är kod som körs senare, till exempel efter en <code>setTimeout</code>, som fortfarande ser den ögonblicksbild den
      skapades i. Därför skriver många alltid funktionen när värdet beror på det gamla.
    </Typography>

    <Typography variant='body2' color='textSecondary'>
      Bra att känna till i äldre kodbaser: före React 18 batchades bara beställningar som gjordes direkt i en klickhanterare. Beställningar i kod som
      kördes senare, efter ett <code>await</code> eller i en <code>.then()</code>, ritade om komponenten en gång var. Värdet blev ändå detsamma,
      eftersom ögonblicksbilden var densamma. Sedan React 18 batchas också de. Två separata klick batchas aldrig ihop.
    </Typography>
  </>
);

export const StatePage = () => (
  <ConceptTemplate
    title='State'
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            Tre anrop, två sätt att skriva dem
          </Typography>
          <Typography color='textSecondary'>
            Båda knapparna med kod på anropar <code>setCount</code> tre gånger i samma klickhanterare. Gissa först vad <code>count</code> blir när du
            trycker på ”setCount(count + 1) tre gånger”, och tryck sedan. Gör samma sak med den andra knappen. Räknaren längst ner visar hur många
            gånger komponenten har ritats, och ritningen när sidan laddades räknas med. Titta på hur mycket den ökar per tryck. Trycker du Nollställ
            när <code>count</code> redan är 0 står räknaren still: värdet ändras inte, och då hoppar React över ritningen.
          </Typography>
          <BatchingDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            Vad står i count direkt efter setCount?
          </Typography>
          <Typography color='textSecondary'>
            Den här demon har ett eget <code>count</code>, skilt från demon ovan, och börjar därför på 0. Knappen anropar{' '}
            <code>setCount(count + 1)</code> och läser <code>count</code> på raden direkt efter. Efter klicket syns två tal: <code>count</code> i den
            nya ritningen, och vad <code>count</code> var inne i klickhanteraren. Jämför dem.
          </Typography>
          <SnapshotDemo />
        </Stack>
      </Stack>
    }
    sources={[
      {
        fileName: 'src/modules/state/components/batchingDemo.tsx',
        code: batchingSource,
        language: 'tsx',
        // Raderna som skiljer de två sätten åt: samma tre anrop, olika resultat.
        highlight: ['setCount(count + 1);', 'setCount((c) => c + 1);'],
      },
      {
        fileName: 'src/modules/state/components/snapshotDemo.tsx',
        code: snapshotSource,
        language: 'tsx',
        // Avläsningen som visar att count inte ändrats av raden ovanför.
        highlight: ['setCount(count + 1);', 'setReadBack(count);'],
      },
      {
        fileName: 'src/shared/components/renderCounter.tsx',
        code: renderCounterSource,
        language: 'tsx',
      },
    ]}
    quiz={stateQuestions}
  />
);
