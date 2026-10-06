import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import tsconfigSource from '../../../../tsconfig.app.json?raw';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { LyingAssertionDemo } from '../components/lyingAssertionDemo';
import lyingAssertionSource from '../components/lyingAssertionDemo.tsx?raw';
import { NarrowingDemo } from '../components/narrowingDemo';
import narrowingSource from '../components/narrowingDemo.tsx?raw';
import resultSource from '../types/result.ts?raw';
import { typescriptQuestions } from '../typescriptQuestions';

const Theory = () => (
  <>
    <Typography>
      TypeScript är JavaScript med typer. Du skriver vanlig JavaScript och lägger till uppgifter om vilken sorts värden koden hanterar:{' '}
      <code>{"const namn: string = 'Ada'"}</code> säger att <code>namn</code> är en text. Med <code>type</code> ger du en typ ett eget namn,{' '}
      <code>{"type Status = 'idle' | 'klar'"}</code>, där <code>|</code> betyder antingen eller, och en text som <code>{"'idle'"}</code> på en typs
      plats betyder just det värdet och inget annat. Hela sidan handlar om en enda idé: <strong>typerna finns inte när koden kör</strong>.
    </Typography>

    <Typography>
      Det blir begripligt först när man ser de tre tillfällen då koden behandlas. Medan du skriver kontrollerar editorn typerna och stryker under det
      som inte går ihop. När appen byggs, med kommandot <code>yarn build</code>, kör <em>kompilatorn</em> <code>tsc</code> samma kontroll och stoppar
      bygget vid minsta fel, men den skriver ingen kod: i <code>tsconfig.app.json</code> under Kod står <code>{'"noEmit": true'}</code>. Därefter tar
      byggverktyget Vite över, stryker allt som är typer och skriver ut ren JavaScript. Det är den som körs i webbläsaren, och där finns inte en enda
      typ kvar. Strykningen är så enkel att Node, som kör JavaScript utanför webbläsaren, i sina senaste versioner själv kan köra en <code>.ts</code>
      -fil genom att bara stryka typerna. Det kräver att allt TypeScript-specifikt går att stryka och lämna giltig JavaScript kvar.
    </Typography>

    <Typography>
      Därför vägrar den här appen <code>enum</code>. <code>{'enum Status { Idle, Klar }'}</code> ser ut som en typ, men blir ett riktigt objekt i den
      körda koden, där <code>Status[0]</code> ger texten <code>{"'Idle'"}</code>. Det går inte att stryka, och flaggan <code>erasableSyntaxOnly</code>{' '}
      i <code>tsconfig.app.json</code> får kompilatorn att stoppa bygget med{' '}
      <code>{"This syntax is not allowed when 'erasableSyntaxOnly' is enabled."}</code> Samma sak gäller ett <code>namespace</code> med kod i och
      parameter-properties, som <code>{'constructor(private namn: string)'}</code>. Unionen <code>{"'idle' | 'klar'"}</code> gör samma jobb som en
      enum utan att lämna något efter sig.
    </Typography>

    <Typography>
      Samma idé förklarar <code>import type</code>. En typ finns bara för kompilatorn, medan en funktion eller en konstant är ett <em>värde</em> som
      finns kvar när koden kör. Importerar du en typ som om den vore ett värde, <code>{"import { Result } from '../types/result'"}</code>, kan
      kompilatorn gissa att raden ska strykas. Gissningen kallas <em>import elision</em>, och den kan slå fel: att importera en fil kör också filens
      kod, och har den koden en uppgift, till exempel att registrera något när filen laddas, försvinner den tyst med raden. Flaggan{' '}
      <code>verbatimModuleSyntax</code> stänger av gissandet. Raden står kvar som den skrevs, och eftersom <code>Result</code> inte finns när koden
      kör stoppar kompilatorn bygget: <code>{"'Result' is a type and must be imported using a type-only import"}</code>. Det som ska stå är{' '}
      <code>{"import type { Result } from '../types/result'"}</code>, och då stryks hela raden. Formen <code>{'import { type Result }'}</code> stryker
      bara namnet, och filen laddas ändå.
    </Typography>

    <Typography>
      Också <em>generics</em> stryks. <code>{'<T>'}</code> är en platshållare för en typ som väljs där funktionen används, som i{' '}
      <code>{'useState<Result>'}</code> i koden till demo 1. Med <code>as</code> påstår du att ett värde har en viss typ:{' '}
      <code>{'värde as Result'}</code> får kompilatorn att behandla värdet som ett <code>Result</code>. Kompilatorn vägrar bara påståenden som är
      uppenbart omöjliga, och när koden kör kontrollerar ingenting dem, eftersom både <code>as</code> och <code>T</code> är strukna. Appen sparar till
      exempel dina quizsvar i webbläsarens lagring, som bara kan hålla text, och läser tillbaka dem med <code>{'JSON.parse(text) as Stored<T>'}</code>
      . Saknas svaren, går texten inte att tolka eller har den fel version, används ett standardvärde. Men att svaren verkligen har den form typen
      påstår kontrollerar ingen. Ett värde som kommer utifrån typas därför ofta som <code>unknown</code>, typen för något man ännu inte vet något om,
      och som inte går att använda förrän det kontrollerats eller påståtts vara något.
    </Typography>

    <Typography>
      Mot strykningen står <strong>narrowing</strong>, och den bygger på det enda som blir kvar: vanliga jämförelser. Demona använder typen{' '}
      <code>{"type Result = { status: 'loading' } | { status: 'error'; message: string } | { status: 'done'; data: string[] }"}</code>, en union av
      tre objekt som kallas dess <em>varianter</em>. Skriver du <code>{"if (result.status === 'done')"}</code> körs jämförelsen på riktigt när koden
      kör, och kompilatorn läser den medan du skriver: i den grenen kan värdet bara vara den sista varianten, så där får du läsa <code>data</code> men
      ingen annanstans. Har två grenar redan uteslutit loading och error återstår bara done, utan någon kontroll alls. Formen kallas{' '}
      <strong>diskriminerad union</strong>, och <code>status</code> är dess <em>diskriminant</em>: ett fält som finns i alla varianter och har ett
      eget fast värde i var och en.
    </Typography>

    <Typography>
      Svar från en server modelleras ofta just så, på väg, misslyckat eller klart, och det är formen datahämtningen i{' '}
      <Link component={RouterLink} to='/query-basics'>
        Query: grunder
      </Link>{' '}
      bygger på. Får en komponent ett sådant värde kan den inte läsa <code>data</code> förrän den har kontrollerat <code>status</code>. Det skyddet
      gäller så länge värdet verkligen har den form typen påstår.
    </Typography>

    <Typography>
      <strong>Regeln att ta med sig:</strong> TypeScript skyddar dig medan du skriver och när appen byggs, inte medan koden kör. Typerna är strukna
      före körningen, och kvar står bara de jämförelser du själv skrev. Ett <code>as</code> är därför ett påstående som ingen kontrollerar. Demo 2
      nedan visar vad det är värt när påståendet inte stämmer.
    </Typography>
  </>
);

export const TypescriptPage = () => (
  <ConceptTemplate
    title='TypeScript'
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            1. Vad vet TypeScript i varje gren?
          </Typography>
          <Typography color='textSecondary'>
            Demon har tre färdiga svar med typen <code>Result</code>, ett per variant, och den ifyllda knappen visar vilket som är valt. Funktionen{' '}
            <code>inspect</code> kontrollerar <code>status</code> och väljer gren. Välj ett svar i taget och jämför vilken gren som körs och vilka
            fält kompilatorn tillåter att koden läser där. Fälten i panelen är utskrivna för hand ur koden. De räknas inte fram när koden kör,
            eftersom typerna då är borta.
          </Typography>
          <NarrowingDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            2. När påståendet inte håller
          </Typography>
          <Typography color='textSecondary'>
            Två färdiga svar som båda har <code>{"status: 'done'"}</code>. Det ena har fältet <code>data</code>, det andra saknar det. Båda läses av
            samma kod: värdet påstås vara ett <code>Result</code> med <code>as</code>, <code>status</code> kontrolleras, och sedan används{' '}
            <code>result.data.length</code>. Kontrollen släpper igenom båda, eftersom båda har rätt <code>status</code>. Tryck på svaret som har data,
            och sedan på svaret som saknar det.
          </Typography>
          <LyingAssertionDemo />
        </Stack>
      </Stack>
    }
    sources={[
      {
        fileName: 'src/modules/typescript/components/narrowingDemo.tsx',
        code: narrowingSource,
        language: 'tsx',
        // Raden som inte går att skriva, och den sista grenen som klarar sig utan
        // kontroll eftersom de andra varianterna redan är uteslutna.
        highlight: ['// @ts-expect-error', 'result.data.join'],
      },
      {
        fileName: 'src/modules/typescript/types/result.ts',
        code: resultSource,
        language: 'ts',
        // Diskriminanten: fältet som finns i alla tre varianterna.
        highlight: ['export type Result'],
      },
      {
        fileName: 'src/modules/typescript/components/lyingAssertionDemo.tsx',
        code: lyingAssertionSource,
        language: 'tsx',
        // Löftet som ingen kontrollerar, och svaret som inte håller det.
        highlight: ['const result = response as Result;', 'const LYING_RESPONSE'],
      },
      {
        fileName: 'tsconfig.app.json',
        code: tsconfigSource,
        language: 'json',
        // De två flaggorna hör ihop: den ena kräver att allt går att radera, den
        // andra att kompilatorn inte gissar vad som ska raderas.
        highlight: ['verbatimModuleSyntax', 'erasableSyntaxOnly'],
      },
    ]}
    quiz={typescriptQuestions}
  />
);
