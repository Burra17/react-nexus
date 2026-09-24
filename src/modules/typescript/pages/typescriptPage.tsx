import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
      Första gången du lägger till en typ i en import i det här repot stoppar bygget dig. <code>{"import { Result } from './types/result'"}</code> går
      inte — det ska stå <code>import type</code>. Det ser ut som en petitess, och det är frestande att lära sig regeln utantill och gå vidare. Men
      regeln följer av något, och det något är den enda idé den här modulen handlar om: <strong>typerna finns inte när koden kör</strong>.
    </Typography>

    <Typography>
      TypeScript kompilerar nämligen inte din kod i den meningen man först tänker sig. Den läser koden, kontrollerar att den går ihop, och stryker
      sedan allt som var typer. Kvar blir JavaScript. Kravet är så pass strikt att Node numera kan köra en <code>.ts</code>-fil direkt genom att bara
      stryka typerna och köra det som blir över — och det fungerar bara om allt TypeScript-specifikt <em>går</em> att stryka och lämna giltig
      JavaScript kvar.
    </Typography>

    <Typography>
      Då blir <code>import type</code> begripligt. Kompilatorn måste veta vilka importer som ska följa med och vilka som ska bort, och utan hjälp
      gissar den: används namnet bara som en typ tas hela importraden bort. Det kallas <em>import elision</em>, och gissandet är ett problem — en
      import kan ha sidoeffekter som någon räknar med, och då försvinner de tyst. <code>verbatimModuleSyntax</code> i repots{' '}
      <code>tsconfig.app.json</code> stänger av gissandet: skriver du <code>import type</code> försvinner raden, annars står den kvar. Du talar om vad
      du menar i stället för att låta kompilatorn tolka dig.
    </Typography>

    <Typography>
      Samma idé förklarar varför <code>enum</code> är förbjuden här medan <code>{"type Status = 'idle' | 'klar'"}</code> går bra. En union är bara ett
      påstående om vilka värden som är tillåtna — det finns ingenting att lämna kvar, den försvinner helt. En <code>enum</code> blir däremot ett
      riktigt objekt i den körda koden, som man kan slå upp värden i. Den går alltså inte att stryka, och flaggan <code>erasableSyntaxOnly</code>{' '}
      säger nej. Samma sak gäller <code>namespace</code> med kod i, och parameter-properties i en konstruktor. Felmeddelandet lyder{' '}
      <code>{"This syntax is not allowed when 'erasableSyntaxOnly' is enabled."}</code>
    </Typography>

    <Typography>
      Generics raderas också, och det är lättare att glömma. Funktionen <code>readStored</code> i repots <code>services/storage/localStorage.ts</code>{' '}
      är den som gör att dina quizsvar finns kvar efter en omladdning. Den är skriven <code>{'readStored<T>(key, fallback): T'}</code>, och inuti står
      raden <code>{'JSON.parse(raw) as Stored<T>'}</code>. Vid körning är <code>T</code> borta. Funktionen läser en textsträng ur webbläsarens
      lagring, tolkar den som JSON och <em>litar</em> på att det som låg där har rätt form. Ingen kontrollerar det. Det är precis därför{' '}
      <code>readStored</code> kräver ett <code>fallback</code>: någon måste ha tänkt på att löftet kan vara falskt.
    </Typography>

    <Typography>
      Mot allt det här står <strong>narrowing</strong>, som är undantaget. Skriver du <code>{"if (result.status === 'done')"}</code> är det ingen
      typanteckning utan en helt vanlig jämförelse som körs på riktigt. Skillnaden är att TypeScript läser med: den vet att värdet i den grenen bara
      kan vara en av varianterna, och låter dig därför nå <code>data</code> där men inte någon annanstans. Formen kallas{' '}
      <strong>diskriminerad union</strong> — ett krångligt namn på något enkelt, nämligen att alla varianter har ett gemensamt fält med ett eget fast
      värde i var och en. Det fältet är flaggan som talar om vad som gäller.
    </Typography>

    <Typography>
      Formen är värd att lägga på minnet, för den återkommer. Ett svar som antingen är på väg, misslyckat eller klart är precis hur data från en
      server modelleras — och det är den form Query-modulerna längre fram bygger på. En komponent som tar emot en sådan union går heller inte att
      använda fel: det finns inget läge där man råkar läsa ett fält som inte finns än, eftersom kompilatorn hindrar det redan när man skriver.
    </Typography>

    <Typography>
      <strong>Regeln att ta med sig:</strong> TypeScript skyddar dig medan du skriver, inte medan koden kör. Allt du skrev är borta före körningen,
      och kvar står bara de vanliga jämförelserna du själv satte dit. Ett <code>as</code> är därför ingen kontroll utan ett löfte — och den andra
      demon nedan visar vad ett löfte utan täckning är värt.
    </Typography>
  </>
);

export const TypescriptPage = () => (
  <ConceptTemplate
    title="TypeScript"
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h3" component="h3">
            Vad vet TypeScript i varje gren?
          </Typography>
          <NarrowingDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="h3" component="h3">
            När löftet inte håller
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
