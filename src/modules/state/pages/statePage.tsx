import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { BatchingDemo } from '../components/batchingDemo';
import batchingSource from '../components/batchingDemo.tsx?raw';
import renderCounterSource from '../../../shared/components/renderCounter.tsx?raw';
import { SnapshotDemo } from '../components/snapshotDemo';
import snapshotSource from '../components/snapshotDemo.tsx?raw';

const Theory = () => (
  <>
    <Typography color="textSecondary">
      I vanliga JavaScript-variabler försvinner data så fort en funktion körs om. State är komponentens eget minne. När du använder{' '}
      <code>const [count, setCount] = useState(0)</code> ber du React att spara ett värde och komma ihåg det, även när komponenten ritas om.
    </Typography>

    <Typography color="textSecondary">
      Det absolut viktigaste att förstå med state är att det fungerar som en ögonblicksbild — ett foto. När React ritar upp din vy låser den värdet
      för just den ritningen. Om <code>count</code> är 0, är den 0 under exakt hela det rendret.
    </Typography>

    <Typography color="textSecondary">
      När du anropar <code>setCount(count + 1)</code> ändrar du alltså inte variabeln <code>count</code> magiskt på stället. I stället lägger du en
      beställning hos React: &quot;nästa gång du ritar om vyn, låt värdet vara 1&quot;.
    </Typography>

    <Typography color="textSecondary">
      Eftersom state är en ögonblicksbild kan du inte anropa <code>setCount(count + 1)</code> tre gånger på rad och förvänta dig att siffran ökar med
      tre. Eftersom <code>count</code> är 0 i det nuvarande fotot säger alla tre anropen exakt samma sak: &quot;sätt nästa värde till 0 + 1&quot;. Att
      React dessutom samlar ihop alla dessa beställningar och bara gör en enda omrendering kallas för <strong>batching</strong>.
    </Typography>

    <Typography color="textSecondary">
      <strong>Regeln att ta med sig:</strong> om ditt nya värde beror på det gamla — som när du plussar på en räknare — skicka in en funktion i
      stället: <code>setCount(c =&gt; c + 1)</code>. Då säger du åt React att utgå från det senaste värdet i minnet, i stället för värdet i den frysta
      ögonblicksbilden. Det är skillnaden mellan en app som fungerar perfekt och en som tappar bort klick under belastning.
    </Typography>

    <Typography variant="body2" color="textSecondary">
      Bra att känna till i äldre kodbaser: före React 18 samlades bara beställningar som gjordes inuti en klickhanterare ihop. En uppdatering inne i
      ett <code>.then()</code> ritade om vyn för sig. Sedan React 18 batchas allt, oavsett var uppdateringen sker.
    </Typography>
  </>
);

export const StatePage = () => (
  <ConceptTemplate
    title="State"
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h3" component="h3">
            Tre anrop, två sätt att skriva dem
          </Typography>
          <BatchingDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="h3" component="h3">
            Vad står i count direkt efter setCount?
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
        highlightedLines: [14, 15, 16, 22, 23, 24],
      },
      {
        fileName: 'src/modules/state/components/snapshotDemo.tsx',
        code: snapshotSource,
        language: 'tsx',
        // Avläsningen som visar att count inte ändrats av raden ovanför.
        highlightedLines: [12, 16],
      },
      {
        fileName: 'src/shared/components/renderCounter.tsx',
        code: renderCounterSource,
        language: 'tsx',
      },
    ]}
  />
);
