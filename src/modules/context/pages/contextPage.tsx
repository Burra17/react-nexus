import { ConceptTemplate } from '../../../templates/conceptTemplate';
import Typography from '@mui/material/Typography';
import { ContextRenderDemo } from '../components/contextRenderDemo';
import contextRenderSource from '../components/contextRenderDemo.tsx?raw';
import { contextQuestions } from '../contextQuestions';

const Theory = () => (
  <>
    <Typography>
      Context löser ett verkligt problem: ett värde som ligger högt i trädet och behövs långt ner måste annars skickas genom varje komponent
      däremellan, också de som inte har någon användning för det. Men react.dev är ovanligt bestämd om att det inte är första utvägen. Försök med
      vanliga props först. Går det trögt beror det ofta på att någon komponent borde ha brutits ut — skickar du in färdig JSX som{' '}
      <code>children</code> försvinner ofta hela kedjan av mellanled. Först när ingetdera fungerar är Context rätt svar.
    </Typography>

    <Typography>
      Skälet till försiktigheten är inte smak. Det här repot har ett eget exempel två mappar bort: appens tema växlar mellan ljust och mörkt via
      CSS-variabler i stället för genom att byta tema i en provider, och kommentaren i <code>src/styles/theme.tsx</code> förklarar varför — att byta
      hela temat i en <code>ThemeProvider</code> renderar om hela React-trädet vid varje lägesbyte. I en app som ska visa vad som orsakar en
      omrendering vore det, som det står där, en lögn inbyggd i grunden.
    </Typography>

    <Typography>
      Och det är precis mekanismen den här modulen handlar om. När en provider får ett nytt <code>value</code> renderar React om <strong>alla</strong>{' '}
      komponenter som läser den contexten. Inte de som råkar sitta i trädet under den — de som faktiskt läser den. Jämförelsen mellan det gamla och
      det nya värdet görs med <code>Object.is</code>, samma jämförelse som avgjorde om <code>React.memo</code> fick hoppa över ett barn i
      Rendering-modulen.
    </Typography>

    <Typography>
      Där ligger fällan. Ett <code>value</code> är nästan alltid ett objekt, eftersom man sällan skickar bara ett värde — man skickar ett värde och en
      funktion som ändrar det. Och ett objekt som skrivs direkt i JSX skapas på nytt varje gång komponenten körs. Innehållet kan vara identiskt; det
      spelar ingen roll, för <code>Object.is</code> jämför referenser. Renderar providern om av vilket skäl som helst får varenda konsument ett värde
      som React räknar som nytt.
    </Typography>

    <Typography>
      Botemedlet står i dokumentationen: lägg funktionen i <code>useCallback</code> och objektet i <code>useMemo</code>. Då är det samma objekt så
      länge ingenting i det har ändrats, och konsumenterna står still när providern renderar om av andra skäl. Det är en riktig vinst, och det är den
      demon nedan visar med växeln.
    </Typography>

    <Typography>
      Men var noga med vad det löser. <code>useMemo</code> hjälper när providern ritar om <em>utan</em> att värdet ändrats. Ändras värdet på riktigt —
      någon byter användare — är det nya objektet nytt med rätta, och då ritas alla konsumenter om. Också den som bara ville åt funktionen och aldrig
      läste användaren. Vill man komma åt det problemet räcker ingen memoisering: då delar man contexten i två, en för värdet och en för funktionen,
      så att den som bara behöver funktionen prenumererar på något som aldrig ändras.
    </Typography>

    <Typography>
      En sak till, och den är lätt att gå bet på med Rendering-modulen färsk i minnet: <code>React.memo</code> skyddar inte en konsument.{' '}
      <code>memo</code> jämför props, och props kan vara helt oförändrade — men omrenderingen kommer inte uppifrån genom trädet. Den kommer från
      contexten komponenten själv läser, och den vägen går rakt förbi <code>memo</code>. Kort 3 och 4 i demon visar det så rent det går: båda är
      memoiserade och får samma props, men bara kort 4 läser contexten. Kort 3 står still hela tiden, kort 4 tickar vid varje ändring.
    </Typography>

    <Typography>
      <strong>En not om versioner.</strong> Providern skrivs här <code>{'<AuthContext value={...}>'}</code>. Från React 19 går det att rendera själva
      contexten som provider. I äldre kodbaser — och i de flesta guider som ligger ute — står det i stället{' '}
      <code>{'<AuthContext.Provider value={...}>'}</code>. Det gör exakt samma sak; React 19 gjorde bara komponenten direkt renderbar, och
      dokumentationen kallar numera <code>.Provider</code> för det gamla sättet.
    </Typography>

    <Typography>
      <strong>Regeln att ta med sig:</strong> Context flyttar inte bara data genom trädet — den flyttar omrenderingar. Den som läser en context har
      abonnerat på varje ändring av hela dess värde, inte på den del hen faktiskt använder. Därför är frågan inte bara om värdet ska ligga i en
      context, utan hur ofta det kommer att ändras och vilka som då följer med.
    </Typography>
  </>
);

export const ContextPage = () => (
  <ConceptTemplate
    title="Context"
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
