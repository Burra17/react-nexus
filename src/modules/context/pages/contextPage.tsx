import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { ContextRenderDemo } from '../components/contextRenderDemo';
import contextRenderSource from '../components/contextRenderDemo.tsx?raw';
import { contextQuestions } from '../contextQuestions';

const Theory = () => (
  <>
    <Typography>
      En komponent i React är en funktion som returnerar en beskrivning av vad som ska synas. Varje gång React kör funktionen igen kallas det här en{' '}
      <strong>ritning</strong>, och komponenten sägs ritas om. Komponenterna bildar ett träd: varje komponent ritar ut sina barn, som ritar ut sina,
      och så vidare nedåt. Två saker utlöser en ritning. Den första är att komponentens eget state ändras. Den andra är att föräldern ritas om: då
      ritas barnen om med den, vare sig deras props har ändrats eller inte.
    </Typography>

    <Typography>
      Ett värde som ligger högt i trädet och behövs långt ner måste annars skickas som props genom varje komponent däremellan, också de mellanled som
      själva inte har någon användning för det. <strong>Context</strong> är Reacts sätt att hoppa över mellanleden. Men{' '}
      <Link href='https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context'>react.dev:s sida om context</Link> avråder från att
      ta till det först. Försök med props. Går det trögt kan komponenten som har värdet ofta skapa barnet själv och lämna över det färdigt till
      mellanledet, som propen <code>children</code>. Då ritar mellanledet ut barnet utan att veta vad det innehåller, och värdet passerar aldrig genom
      det.
    </Typography>

    <Typography>
      En context skapas med <code>createContext</code>, till exempel <code>const AuthContext = createContext(startvärde)</code>. En komponent högt upp
      lägger ut ett värde åt allt under sig genom att rita ut contexten med propen <code>value</code>: <code>{'<AuthContext value={...}>'}</code>. Det
      elementet kallas en <strong>provider</strong>, och komponenten som ritar ut det kallas här komponenten som håller providern. En komponent längre
      ner läser värdet med <code>useContext(AuthContext)</code> och kallas då en <strong>konsument</strong>. Den får värdet från närmaste provider
      ovanför sig, och startvärdet bara om det inte finns någon.
    </Typography>

    <Typography>
      När providern får ett nytt <code>value</code> ritar React om <strong>alla</strong> konsumenter under den. Om värdet är nytt avgörs med{' '}
      <code>Object.is</code>, en jämförelse som för tal och text jämför innehållet men för objekt jämför <em>referensen</em>, alltså om det är samma
      objekt i minnet. Två objekt med exakt samma innehåll är ändå två olika objekt: <code>{'Object.is({}, {})'}</code> är <code>false</code>.
    </Typography>

    <Typography>
      Där ligger fällan. Ett <code>value</code> är nästan alltid ett objekt, eftersom man sällan skickar bara ett värde. Man skickar värdet och en
      funktion som ändrar det, så att en konsument långt ner kan ändra state som ligger högt upp. I demon nedan heter de <code>currentUser</code> och{' '}
      <code>login</code>. Skrivs objektet direkt i komponentens funktion, som <code>{'{ currentUser, login }'}</code>, skapas ett nytt objekt vid
      varje ritning. Innehållet kan vara detsamma, men referensen är ny. Ritas komponenten som håller providern om av vilket skäl som helst, till
      exempel för att ett helt annat state i den ändrades, får varenda konsument ett värde som React räknar som nytt.
    </Typography>

    <Typography>
      <code>React.memo</code>, som också skrivs bara <code>memo</code>, hjälper inte här. Den packar in en komponent så att React hoppar över dess
      ritning när föräldern ritas om, om varje prop är oförändrad enligt <code>Object.is</code>. Det stoppar ritningar som kommer uppifrån genom
      props. En konsument ritas om av ett annat skäl: React ritar om den direkt när contexten den läser får ett nytt värde, och den vägen går förbi{' '}
      <code>memo</code>. Kort 3 och 4 i demon nedan är ett par som visar det.
    </Typography>

    <Typography>
      Botemedlet är att låta objektet leva kvar mellan ritningarna. <code>useMemo</code> sparar ett värde och räknar fram det på nytt bara när något i
      dess <em>beroendelista</em> har ändrats, alltså listan med värden som skickas med som sista argument. <code>useCallback</code> gör samma sak för
      en funktion. Funktionen behöver sin egen <code>useCallback</code>, eftersom den står i objektets beroendelista: vore den ny vid varje ritning
      skulle den dra med sig objektet. Med båda på plats är <code>value</code> samma objekt så länge användaren är densamma, och konsumenterna står
      still när komponenten som håller providern ritas om av andra skäl. Det är vad växeln i demon slår på.
    </Typography>

    <Typography>
      Men det löser bara ritningar där ingenting har ändrats. Byts användaren är objektet nytt med rätta, och då ritas alla konsumenter om, också den
      som bara läser funktionen. Ingen memoisering kommer åt det, eftersom en konsument alltid får hela <code>value</code> och aldrig ett enskilt
      fält. Vill man skydda den som bara behöver funktionen delar man upp i två contexts, en för användaren och en för funktionen, med var sin
      provider. Den som bara läser funktionens context ritas då inte om när användaren byts, eftersom det värdet aldrig ändras.
    </Typography>

    <Typography>
      <strong>En not om versioner.</strong> Providern skrivs ovan som <code>{'<AuthContext value={...}>'}</code>, med contexten själv som element. Det
      går från och med React 19. Äldre kod och de flesta guider skriver <code>{'<AuthContext.Provider value={...}>'}</code>. Det gör samma sak och
      fungerar fortfarande, men react.dev kallar det numera det äldre sättet.
    </Typography>

    <Typography>
      <strong>Regeln att ta med sig:</strong> context flyttar inte bara data genom trädet, den flyttar ritningar. En konsument ritas om varje gång{' '}
      <code>value</code> är nytt, hela värdet och inte bara den del den använder. En context nära roten vars värde ändras ofta ritar alltså om varje
      komponent som läser den, var den än sitter. Fråga därför inte bara om ett värde ska ligga i en context, utan hur ofta det ändras och vilka som
      då ritas om.
    </Typography>
  </>
);

export const ContextPage = () => (
  <ConceptTemplate
    title='Context'
    theory={<Theory />}
    demo={<ContextRenderDemo />}
    sources={[
      {
        fileName: 'src/modules/context/components/contextRenderDemo.tsx',
        code: contextRenderSource,
        language: 'tsx',
        // Objektet som skapas på nytt vid varje render, den memoiserade
        // varianten, och konsumenten som memo inte räddar.
        highlight: ['const freshValue', 'const stableValue', 'const MemoUserCard'],
      },
    ]}
    quiz={contextQuestions}
  />
);
