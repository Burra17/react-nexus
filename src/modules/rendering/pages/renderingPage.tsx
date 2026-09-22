import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { renderingQuestions } from '../renderingQuestions';
import { DomUnchangedDemo } from '../components/domUnchangedDemo';
import domUnchangedSource from '../components/domUnchangedDemo.tsx?raw';
import { RenderTriggerDemo } from '../components/renderTriggerDemo';
import renderTriggerSource from '../components/renderTriggerDemo.tsx?raw';

const Theory = () => (
  <>
    <Typography>
      En omrendering betyder att React kör din komponentfunktion en gång till och får en ny beskrivning av hur vyn ska se ut. Första gången sker det
      när appen startar. Därefter sker det när state ändras — komponentens eget, eller en förälders längre upp i trädet. En context som komponenten
      läser räknas också. Att props ändrades står däremot inte i listan: ett barn ritas om för att föräldern gjorde det, även när barnet får exakt
      samma props som förut.
    </Typography>

    <Typography>
      Beskrivningen är inte skärmen. React jämför den nya beskrivningen med den förra och rör bara det som faktiskt skiljer. Renderas en komponent om
      utan att något ändrats händer ingenting i webbläsaren: texten står kvar, markören står kvar, rullningen står kvar. Svaret på en omrendering är
      därför sällan att genast försöka hindra den. Det kostar när komponenten som uppdateras sitter högt i trädet och drar med sig allt under sig —
      men vet du inte att det är fallet har du inte mätt, och då är optimeringen en gissning.
    </Typography>

    <Typography>
      Vill man ändå hindra en omrendering finns <code>React.memo</code>. Den säger: hoppa över det här barnet så länge alla props är lika som förra
      gången. Två förbehåll. Det är en <strong>optimering och inte en garanti</strong> — React får rendera om barnet ändå om den vill. Och haken
      sitter i ordet lika: React jämför <strong>referenser</strong>, inte innehåll, och två objekt som ser likadana ut är inte samma objekt.{' '}
      <code>{'{} === {}'}</code> är falskt.
    </Typography>

    <Typography>
      Därför tystnar memo så fort man skickar något som skapas inuti komponenten. En array, ett objekt eller en pilfunktion är ett nytt värde varje
      gång funktionen körs, även när innehållet är identiskt. Barnet får då &quot;nya&quot; props vid varje render, memo ser en skillnad och hoppar
      inte över någonting. Optimeringen står kvar i koden och gör ingenting.
    </Typography>

    <Typography>
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
        highlight: ['const stableSettings =', 'const MemoChild = memo(Child);', 'const settings = newObjectEachRender'],
      },
      {
        fileName: 'src/modules/rendering/components/domUnchangedDemo.tsx',
        code: domUnchangedSource,
        language: 'tsx',
        // Textfältet React aldrig rör vid en omrendering.
        highlight: ['<TextField'],
      },
    ]}
    quiz={renderingQuestions}
  />
);
