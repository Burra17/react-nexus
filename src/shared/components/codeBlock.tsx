import CheckOutlined from '@mui/icons-material/CheckOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import bash from 'shiki/langs/bash.mjs';
import json from 'shiki/langs/json.mjs';
import tsx from 'shiki/langs/tsx.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';
import { monoFontFamily } from '../../styles/theme';

export type CodeLanguage = 'ts' | 'tsx' | 'json' | 'bash';

// Färgläggaren skapas en gång när modulen laddas, inte en gång per kodstycke.
//
// createHighlighterCoreSync är synkron, så komponenten slipper ett laddningsläge.
// Den asynkrona varianten hade gett mindre bundle men också ett kodstycke som
// blinkar in efter att sidan ritats - störande i en vy man läser.
const highlighter = createHighlighterCoreSync({
  themes: [githubLight, githubDark],
  // Både typescript och tsx laddas. Att bara ha tsx hade sparat 16 kB gzip, men
  // tsx-grammatiken läser <T>expr som JSX i stället för som en type assertion,
  // och ett läroexempel som färgläggs fel är värre än 16 kB.
  langs: [typescript, tsx, json, bash],
  engine: createJavaScriptRegexEngine(),
});

type CodeBlockProps = {
  code: string;
  language: CodeLanguage;
  fileName?: string;
  // Textbitar ur koden som ska pekas ut - "det är de här raderna som är poängen".
  //
  // Innehåll i stället för radnummer. Källkoden läses med ?raw ur den riktiga
  // filen just för att en kopia driver isär från originalet, och ett handskrivet
  // radnummer är en kopia av samma sort: flyttas raden pekar det tyst på fel
  // rad. Ett textfragment följer med raden det hör till.
  highlight?: string[];
  // Stycket börjar helt hopfällt, oavsett hur kort filen är.
  //
  // Sätts på sidans sekundära filer. Tröskeln nedan mäter en fil i taget, men
  // det är summan som bygger väggen: tre filer som var för sig ryms under
  // tröskeln blir ändå längre än allt annat på sidan tillsammans.
  startCollapsed?: boolean;
};

// Längre filer fälls ihop. Utan gränsen trycker en demo på åttio rader ner
// teoridelen utom synhåll, och vyn blir en vägg av kod.
const COLLAPSE_AFTER_LINES = 25;

// Slår upp vilka rader som ska markeras genom att leta efter texten i koden.
//
// Ett fragment får träffa flera rader, och det är meningen: tre likadana
// setCount-anrop i följd är ett påstående, inte tre.
const findHighlightedLines = (code: string, fragments: string[], fileName?: string) => {
  const lines = code.split('\n');
  const highlighted = new Set<number>();

  fragments.forEach((fragment) => {
    // flatMap i stället för filter: raden ska bli sitt radnummer, och rader utan
    // träff ska försvinna. Radnumren är 1-indexerade, som Shikis.
    const hits = lines.flatMap((line, index) => (line.includes(fragment) ? [index + 1] : []));

    // Ett fragment utan träff betyder att koden skrivits om under markeringen.
    // Utan raden nedan vore det tyst, och tyst fel är hela skälet till att
    // radnumren byttes ut mot innehåll.
    if (hits.length === 0 && import.meta.env.DEV) {
      console.warn(`CodeBlock: ingen rad i ${fileName ?? 'kodstycket'} innehåller "${fragment}". Markeringen uteblir.`);
    }

    hits.forEach((lineNumber) => highlighted.add(lineNumber));
  });

  return highlighted;
};

export const CodeBlock = ({ code, language, fileName, highlight = [], startCollapsed = false }: CodeBlockProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const lineCount = code.trimEnd().split('\n').length;
  const isCollapsible = startCollapsed || lineCount > COLLAPSE_AFTER_LINES;

  const highlightedLines = findHighlightedLines(code, highlight, fileName);

  // Ligger en markerad rad under vikningen börjar stycket utfällt. Att gömma
  // just den rad som är poängen vore fel, inte en inställning.
  const pointIsBelowFold = [...highlightedLines].some((line) => line > COLLAPSE_AFTER_LINES);

  // startCollapsed väger tyngre än markeringen ovan, och det är ett medvetet
  // val: varje källfil i repot har markerade rader, även de sekundära, så en
  // regel där markeringen vinner skulle inte fälla ihop någonting alls.
  //
  // De två säger inte samma sak. highlight pekar ut de viktiga raderna inuti en
  // fil; ordningen i sources pekar ut den viktiga filen på sidan. Markeringarna
  // försvinner inte - de syns så fort stycket öppnas.
  const [isExpanded, setIsExpanded] = useState(!startCollapsed && (!isCollapsible || pointIsBelowFold));

  // Hopfällt betyder två olika saker. Ett sekundärt stycke visar ingen kod alls,
  // bara filnamnet i listen - det är hela poängen med att fälla ihop det. En
  // lång huvudfil visar fortfarande sina första rader, så att sidan inte blir
  // en rad med stängda lådor där man skulle läst koden.
  const showsNoCode = startCollapsed && !isExpanded;

  // Båda temana renderas samtidigt, som CSS-variabler på varje span.
  // Alternativet vore att färglägga om vid lägesbyte, vilket skulle rendera om
  // varje kodstycke - precis det vi undvek genom att välja colorSchemes i temat.
  const html = highlighter.codeToHtml(code, {
    lang: language,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
    transformers: [
      {
        line(node, lineNumber) {
          if (highlightedLines.has(lineNumber)) {
            this.addClassToHast(node, 'markerad-rad');
          }
        },
      },
    ],
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Webbläsaren kan neka urklippet, t.ex. utan https eller utan tillåtelse.
      // Då uteblir bara kvittensen; koden går fortfarande att markera för hand.
    }
  };

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pl: 2,
          pr: 1,
          py: 0.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="body2" sx={{ flexGrow: 1, fontFamily: monoFontFamily, color: 'text.secondary' }}>
          {fileName}
        </Typography>

        <Tooltip title={isCopied ? 'Kopierad' : 'Kopiera koden'}>
          <IconButton size="small" onClick={handleCopy} aria-label={isCopied ? 'Koden är kopierad' : 'Kopiera koden'}>
            {isCopied ? <CheckOutlined fontSize="small" color="primary" /> : <ContentCopyOutlined fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Ett stycke som inte visar någon kod renderas inte alls, i stället för
          att klippas bort med CSS. Överflödet som göms med overflow: hidden
          läses fortfarande upp av en skärmläsare, och koden vore då hopfälld
          för den som ser och utfälld för den som lyssnar. */}
      {!showsNoCode && (
        <Box
          sx={(theme) => ({
            // Shiki lägger ut färgerna som --shiki-light och --shiki-dark på varje
            // span. Här väljs vilken av dem som gäller - ren CSS, ingen omrendering.
            '& .shiki, & .shiki span': { color: 'var(--shiki-light)' },
            '& .shiki': { backgroundColor: 'var(--shiki-light-bg)' },

            ...theme.applyStyles('dark', {
              '& .shiki, & .shiki span': { color: 'var(--shiki-dark)' },
              '& .shiki': { backgroundColor: 'var(--shiki-dark-bg)' },
            }),

            // Ihopfälld höjd räknas ur radhöjden, så att snittet hamnar mellan två
            // rader i stället för mitt i en.
            maxHeight: isExpanded ? 'none' : `calc(${COLLAPSE_AFTER_LINES} * 0.875rem * 1.7 + ${theme.spacing(4)})`,
            overflow: 'hidden',

            '& pre': { margin: 0, padding: theme.spacing(2), overflowX: 'auto' },
            '& code': {
              // Grid gör varje rad till ett block över hela bredden, så att en
              // markerad rad får bakgrund hela vägen ut och inte bara bakom texten.
              display: 'grid',
              fontFamily: monoFontFamily,
              fontSize: '0.875rem',
              lineHeight: 1.7,
            },

            '& .markerad-rad': {
              // mainChannel är accentfärgen som "R G B" utan alfa, vilket är hur
              // man blandar in genomskinlighet när paletten är CSS-variabler.
              backgroundColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.14)`,
              boxShadow: `inset 3px 0 0 ${theme.vars.palette.primary.main}`,
              marginInline: theme.spacing(-2),
              paddingInline: theme.spacing(2),
            },
          })}
        >
          {/* Shiki returnerar färdig HTML. Innehållet är vår egen källkod, aldrig
              något som kommer utifrån. */}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </Box>
      )}

      {isCollapsible && (
        <Button
          fullWidth
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          sx={{ borderTop: showsNoCode ? 0 : 1, borderColor: 'divider', borderRadius: 0, py: 1 }}
        >
          {/* Radantalet står i knappen och filnamnet i listen ovanför, så ett
              hopfällt stycke säger vad det innehåller utan att visa det.
              "Visa hela filen" vore fel när ingen kod syns - då visas den inte
              i sin helhet, den visas alls. */}
          {isExpanded ? 'Visa mindre' : `${showsNoCode ? 'Visa koden' : 'Visa hela filen'} (${lineCount} rader)`}
        </Button>
      )}
    </Paper>
  );
};
