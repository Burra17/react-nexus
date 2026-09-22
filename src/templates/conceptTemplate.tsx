import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { CodeBlock, type CodeLanguage } from '../shared/components/codeBlock';
import { ModuleNav } from '../shared/components/moduleNav';
import { Quiz, type QuizQuestion } from '../shared/components/quiz';
import { ReadableColumn } from '../shared/components/readableColumn';
import { SECTION_SCROLL_MARGIN, sectionIds } from '../shared/components/conceptSections';
import { SectionNav } from '../shared/components/sectionNav';

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
  // Obligatorisk, inte valfri. En quiz som går att hoppa över blir en quiz i
  // modul 3 och 4 och glöms i modul 8 en kväll när man vill bli klar. Mallen
  // finns till för att den elfte vyn ska se ut som den första.
  quiz: QuizQuestion[];
};

// Sidmallen för en konceptvy: Teori, Demo, Kod, Quiz - i den ordningen, varje gång.
//
// Quizen står sist och inte före Kod. I det här repot är källkoden en del av
// läromedlet och inte ett uppslagsverk vid sidan om - testar man före den
// testar man på halva materialet.
//
// Ordningen ligger här och inte i modulerna. Bestämdes den per modul skulle den
// elfte vyn inte se ut som den första, och i en lärobok är igenkänning halva
// poängen: läsaren ska veta var teorin står utan att leta.
//
// Mallen bestämmer ramen, inte innehållet. Teoridelen är fri text, eftersom
// useState klarar sig på tre stycken medan Context behöver fler.
export const ConceptTemplate = ({ title, theory, demo, sources, quiz }: ConceptTemplateProps) => (
  <Stack spacing={5}>
    <Typography variant="h1">{title}</Typography>

    {/* Sektionsraden ligger direkt under rubriken och fäster där när man
        scrollar förbi. Quizen börjar 3672 px ner på /state - utan den här
        raden nås den bara genom att scrolla förbi hela Kod-delen. */}
    <SectionNav />

    {/* section + aria-labelledby gör delarna till landmärken en skärmläsare kan
        hoppa mellan, i stället för fyra rubriker i ett enda textflöde. */}
    <Stack component="section" aria-labelledby={sectionIds.teori} spacing={1.5}>
      <Typography id={sectionIds.teori} variant="h2" sx={{ scrollMarginTop: SECTION_SCROLL_MARGIN }}>
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

    <Stack component="section" aria-labelledby={sectionIds.demo} spacing={1.5}>
      <Typography id={sectionIds.demo} variant="h2" sx={{ scrollMarginTop: SECTION_SCROLL_MARGIN }}>
        Demo
      </Typography>
      {/* Demon får en egen ram så att det syns var det interaktiva börjar. */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        {demo}
      </Paper>
    </Stack>

    <Stack component="section" aria-labelledby={sectionIds.kod} spacing={1.5}>
      <Typography id={sectionIds.kod} variant="h2" sx={{ scrollMarginTop: SECTION_SCROLL_MARGIN }}>
        Kod
      </Typography>
      {/* Flera filer, eftersom en demo ofta är en komponent plus en hook.
          Källkoden läses med ?raw ur de riktiga filerna - se CLAUDE.md.

          Ordningen i sources är en prioritering: första filen är huvudfilen och
          visar sin kod, resten fälls ihop till en rad med filnamnet. Utan det är
          Kod-delen nästan halva sidan, och den som vill nå quizen får scrolla
          förbi varenda fil för att komma dit.

          Hopfällt och inte flikar, eftersom poängen ofta är att jämföra två
          filer - batchingDemo mot snapshotDemo. Flikar visar en i taget och
          tvingar läsaren att hålla den förra koden i huvudet. */}
      {sources.map((source, index) => (
        <CodeBlock
          key={source.fileName}
          code={source.code}
          language={source.language}
          fileName={source.fileName}
          highlight={source.highlight}
          startCollapsed={index > 0}
        />
      ))}
    </Stack>

    <Stack component="section" aria-labelledby={sectionIds.quiz} spacing={1.5}>
      <Typography id={sectionIds.quiz} variant="h2" sx={{ scrollMarginTop: SECTION_SCROLL_MARGIN }}>
        Quiz
      </Typography>
      {/* Frågorna smalnas av som teorin. De läses rad för rad, till skillnad från
          demon och koden. */}
      <ReadableColumn>
        <Quiz questions={quiz} />
      </ReadableColumn>
    </Stack>

    {/* Vägen vidare. Ligger utanför sektionerna: den hör inte till konceptet
        utan till läroboken, och ska därför inte dyka upp i sektionsraden. */}
    <ModuleNav />
  </Stack>
);
