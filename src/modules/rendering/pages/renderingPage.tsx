import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { DomUnchangedDemo } from '../components/domUnchangedDemo';
import domUnchangedSource from '../components/domUnchangedDemo.tsx?raw';
import { RenderTriggerDemo } from '../components/renderTriggerDemo';
import renderTriggerSource from '../components/renderTriggerDemo.tsx?raw';

const Theory = () => (
  <>
    <Typography color="textSecondary">
      En omrendering betyder att React kör din komponentfunktion en gång till och får en ny beskrivning av hur vyn ska se ut. Tre saker utlöser det:
      komponentens eget state ändras, dess förälder renderades om, eller en context den läser ändrades. Att props ändrades står inte i listan — ett
      barn ritas om för att föräldern gjorde det, även när barnet får exakt samma props som förut.
    </Typography>

    <Typography color="textSecondary">
      Beskrivningen är inte skärmen. React jämför den nya beskrivningen med den förra och rör bara det som faktiskt skiljer. Renderas en komponent om
      utan att något ändrats händer ingenting i webbläsaren: texten står kvar, markören står kvar, rullningen står kvar. En omrendering är därför
      billig långt oftare än dyr — och att jaga bort dem innan man mätt att de kostar något är ett misstag.
    </Typography>

    <Typography color="textSecondary">
      Vill man ändå hindra en omrendering finns <code>React.memo</code>. Den säger: hoppa över det här barnet om alla props är lika som förra gången.
      Haken sitter i ordet lika. React jämför <strong>referenser</strong>, inte innehåll — och två objekt som ser likadana ut är inte samma objekt.{' '}
      <code>{'{} === {}'}</code> är falskt.
    </Typography>

    <Typography color="textSecondary">
      Därför tystnar memo så fort man skickar något som skapas inuti komponenten. En array, ett objekt eller en pilfunktion är ett nytt värde varje
      gång funktionen körs, även när innehållet är identiskt. Barnet får då &quot;nya&quot; props vid varje render, memo ser en skillnad och hoppar
      inte över någonting. Optimeringen står kvar i koden och gör ingenting.
    </Typography>

    <Typography color="textSecondary">
      <strong>Regeln att ta med sig:</strong> memo är inget man strör över appen. Den hjälper bara när props faktiskt är stabila — och att göra dem
      stabila är oftast det riktiga arbetet, inte att lägga till memo.
    </Typography>
  </>
);

export const RenderingPage = () => (
  <ConceptTemplate
    title="Rendering"
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h3" component="h3">
            Vem renderas om, och när slutar memo hjälpa?
          </Typography>
          <RenderTriggerDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="h3" component="h3">
            En omrendering syns inte alltid
          </Typography>
          <DomUnchangedDemo />
        </Stack>
      </Stack>
    }
    sources={[
      {
        fileName: 'src/modules/rendering/components/renderTriggerDemo.tsx',
        code: renderTriggerSource,
        language: 'tsx',
        // Objektet som ligger still, memo-inpackningen, och raden där ett nytt
        // objekt skapas vid varje render.
        highlightedLines: [19, 36, 45],
      },
      {
        fileName: 'src/modules/rendering/components/domUnchangedDemo.tsx',
        code: domUnchangedSource,
        language: 'tsx',
        // Textfältet React aldrig rör vid en omrendering.
        highlightedLines: [23],
      },
    ]}
  />
);
