import CheckOutlined from '@mui/icons-material/CheckOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import Box from '@mui/material/Box';
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
  // Radnummer som ska pekas ut, 1-indexerade - "det är den här raden som är poängen".
  highlightedLines?: number[];
};

export const CodeBlock = ({ code, language, fileName, highlightedLines = [] }: CodeBlockProps) => {
  const [isCopied, setIsCopied] = useState(false);

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
          if (highlightedLines.includes(lineNumber)) {
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
    </Paper>
  );
};
