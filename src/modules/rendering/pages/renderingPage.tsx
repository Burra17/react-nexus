import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { renderingQuestions } from '../renderingQuestions';
import { DomUnchangedDemo } from '../components/domUnchangedDemo';
import domUnchangedSource from '../components/domUnchangedDemo.tsx?raw';
import { RenderTriggerDemo } from '../components/renderTriggerDemo';
import renderTriggerSource from '../components/renderTriggerDemo.tsx?raw';
import renderCounterSource from '../../../shared/components/renderCounter.tsx?raw';

const Theory = () => (
  <>
    <Typography>
      En komponent i React är en funktion som returnerar en beskrivning av vad som ska synas. Beskrivningen skrivs i JSX, taggarna som ser ut som
      HTML. Att React kör funktionen och får en ny beskrivning kallas att komponenten <em>ritas</em>, på engelska <em>render</em>. Komponenterna
      ligger i varandra som ett träd: den som har en annan komponent i sin JSX är dess <em>förälder</em>, och den inre är dess <em>barn</em>. En
      komponent ritas första gången när den visas. Sedan ritas den om i tre fall: när dess eget <em>state</em> ändras, alltså ett värde som React
      sparar åt komponenten mellan ritningarna, när dess förälder ritas om, och när en <em>context</em> som den läser får ett nytt värde. En context
      är ett sätt att dela ett värde med många komponenter utan att skicka det genom varje led. Ändrade <em>props</em>, värdena en förälder skickar
      till sina barn, är inget eget fall. Props kan bara ändras när föräldern ritas om, så barnet ritas om för att föräldern gjorde det, också när det
      får exakt samma props som förra gången.
    </Typography>

    <Typography>
      En ritning är inte att skärmen ritas om. Det som syns i webbläsaren är <strong>DOM:en</strong>, webbläsarens egna element. Efter varje ritning
      jämför React den nya beskrivningen med den förra och ändrar bara de delar av DOM:en som skiljer. Ändras ett tal i en knapp byts talet, men ett
      textfält bredvid får vara samma element som förut, och det du skrivit i det står kvar. Hade React byggt upp DOM:en på nytt vid varje ritning
      hade fältet bytts mot ett tomt. Det en ritning kostar är alltså tid: funktionen körs, och ritas en komponent högt upp i trädet om följer allt
      under den med. Det blir ett prestandaproblem först när den tiden märks för den som använder appen, och därför är svaret på en ritning sällan att
      genast försöka hindra den. Räknaren i demona visar hur många gånger en komponent ritas, och webbläsartillägget React Developer Tools har en
      Profiler som visar hur lång tid ritningarna tar. Att hindra ritningar utan att ha mätt är att gissa.
    </Typography>

    <Typography>
      Vill man ändå hindra att ett barn ritas om med föräldern finns <code>memo</code>, som också skrivs <code>React.memo</code>. Det är en funktion
      som läggs runt en komponent, <code>memo(Child)</code>, och ger en ny komponent som hoppar över ritningen så länge varje prop är lika med förra
      gången. Den hoppar bara över ritningar som föräldern drar med sig: ändras barnets eget state eller en context det läser ritas det om ändå. Och
      det är en <strong>optimering och inte en garanti</strong>. React lovar inte att hoppa över barnet, så koden måste fungera likadant om det ritas
      om ändå.
    </Typography>

    <Typography>
      Haken sitter i ordet lika. memo jämför varje prop för sig, det gamla värdet mot det nya, med samma jämförelse som <code>===</code>. En sträng
      eller ett tal är lika när innehållet är lika, så en titel som skrivs som text i föräldern räknas som samma prop vid varje ritning. Ett objekt,
      en array eller en funktion jämförs däremot på <strong>referens</strong>: om det är samma värde i minnet, inte om innehållet stämmer.{' '}
      <code>{'{} === {}'}</code> är falskt, eftersom det är två olika objekt. Skapar föräldern ett objekt inuti sin funktion blir det ett nytt objekt
      vid varje ritning, och då ser memo en ändrad prop varje gång och ritar om barnet. Det gäller också en prop som barnet aldrig läser, eftersom
      memo jämför alla props.
    </Typography>

    <Typography>
      <strong>Regeln att ta med sig:</strong> memo hjälper bara när varje prop har samma referens från ritning till ritning, det som kallas att den är
      stabil. Ett värde som aldrig ändras kan ligga utanför komponenten, som i demon nedan. Ett värde som räknas fram ur state eller props kan sparas
      mellan ritningarna med <code>useMemo</code>, och en funktion med <code>useCallback</code>. Att göra props stabila är oftast det riktiga arbetet,
      inte att lägga till memo.
    </Typography>
  </>
);

export const RenderingPage = () => (
  <ConceptTemplate
    title='Rendering'
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            Vem ritas om, och när slutar memo hjälpa?
          </Typography>
          <Typography color='textSecondary'>
            Hela rutan nedan är en komponent, föräldern, med två state: talet överst och reglaget. De två korten längst ner är dess barn. De är samma
            komponent och får samma props, men det högra ligger i <code>memo</code>. Varje komponent har en egen räknare som visar hur många gånger
            den har ritats, och ritningen när sidan laddades räknas med. Förälderns räknare står direkt under knappen. Tryck först på ”Ändra
            förälderns state” några gånger och jämför hur mycket de tre räknarna ökar per tryck. Slå sedan på reglaget och tryck igen. Efter varje
            tryck står en förklaring under korten.
          </Typography>
          <RenderTriggerDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            En ritning ändrar bara det som skiljer
          </Typography>
          <Typography color='textSecondary'>
            Hela demon nedan är en komponent med ett eget state, talet i knappen. Fältet är <em>okontrollerat</em>: det har ingen <code>value</code>
            -prop, så det är webbläsaren som håller texten, och React vet inte vad som står där. Att skriva i fältet ändrar därför inget state och
            ritar inte om något. Skriv något i fältet, tryck sedan på ”Räkna upp” några gånger och titta på fältet. Räknaren räknar också ritningen
            när sidan laddades, och därför ligger den före talet i knappen.
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
        highlight: {
          fragments: ['const stableSettings =', 'const MemoChild = memo(Child);', 'const settings = newObjectEachRender'],
          why: 'Objektet som ligger still, memo-inpackningen, och raden där ett nytt objekt skapas vid varje ritning.',
        },
      },
      {
        fileName: 'src/modules/rendering/components/domUnchangedDemo.tsx',
        code: domUnchangedSource,
        language: 'tsx',
        highlight: {
          fragments: ['<TextField'],
          why: 'Textfältet som React behåller mellan ritningarna. Det saknar value, och det är det som gör det okontrollerat.',
        },
      },
      {
        fileName: 'src/shared/components/renderCounter.tsx',
        code: renderCounterSource,
        language: 'tsx',
      },
    ]}
    quiz={renderingQuestions}
  />
);
