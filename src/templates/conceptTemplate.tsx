import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { CodeBlock, type CodeLanguage } from '../shared/components/codeBlock';
import { ReadableColumn } from '../shared/components/readableColumn';

export type ConceptSource = {
  fileName: string;
  code: string;
  language: CodeLanguage;
  highlight?: string[];
};

type ConceptTemplateProps = {
  title: string;
  theory: ReactNode;
  demo: ReactNode;
  sources: ConceptSource[];
};

// Sidmallen för en konceptvy: Teori, Demo, Kod - i den ordningen, varje gång.
//
// Ordningen ligger här och inte i modulerna. Bestämdes den per modul skulle den
// elfte vyn inte se ut som den första, och i en lärobok är igenkänning halva
// poängen: läsaren ska veta var teorin står utan att leta.
//
// Mallen bestämmer ramen, inte innehållet. Teoridelen är fri text, eftersom
// useState klarar sig på tre stycken medan Context behöver fler.
export const ConceptTemplate = ({ title, theory, demo, sources }: ConceptTemplateProps) => (
  <Stack spacing={5}>
    <Typography variant="h1">{title}</Typography>

    {/* section + aria-labelledby gör delarna till landmärken en skärmläsare kan
        hoppa mellan, i stället för tre rubriker i ett enda textflöde. */}
    <Stack component="section" aria-labelledby="rubrik-teori" spacing={1.5}>
      <Typography id="rubrik-teori" variant="h2">
        Teori
      </Typography>

      {/* Bara teoridelen smalnas av. Demon och koden får hela sidans bredd,
          eftersom de inte läses rad för rad på samma sätt som text.

          Stacken inuti ger avstånd mellan teorins stycken. Utan den blir de en
          textmassa: ReadableColumn är ett enda barn till sektionen, så
          sektionens avstånd hamnar runt hela spalten i stället för mellan
          styckena. Rytmen tillhör mallen, av samma skäl som ordningen gör det -
          bestäms den per modul ser den elfte vyn inte ut som den första. */}
      <ReadableColumn>
        <Stack spacing={2}>{theory}</Stack>
      </ReadableColumn>
    </Stack>

    <Stack component="section" aria-labelledby="rubrik-demo" spacing={1.5}>
      <Typography id="rubrik-demo" variant="h2">
        Demo
      </Typography>
      {/* Demon får en egen ram så att det syns var det interaktiva börjar. */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        {demo}
      </Paper>
    </Stack>

    <Stack component="section" aria-labelledby="rubrik-kod" spacing={1.5}>
      <Typography id="rubrik-kod" variant="h2">
        Kod
      </Typography>
      {/* Flera filer, eftersom en demo ofta är en komponent plus en hook.
          Källkoden läses med ?raw ur de riktiga filerna - se CLAUDE.md. */}
      {sources.map((source) => (
        <CodeBlock key={source.fileName} code={source.code} language={source.language} fileName={source.fileName} highlight={source.highlight} />
      ))}
    </Stack>
  </Stack>
);
