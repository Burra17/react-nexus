import { createTheme } from '@mui/material/styles';
import { accent, status, surface, text } from './colors';

// Säger till TypeScript att temat har CSS-variabler påslagna.
//
// Utan den här augmenteringen är theme.vars typad som möjligen undefined, för
// MUI kan inte se att vi skickar cssVariables till createTheme längre ner i
// filen. Den som vill läsa theme.vars i en sx-prop får annars ett byggfel.
declare module '@mui/material/styles' {
  interface CssThemeVariables {
    enabled: true;
  }
}

// Typsnittet för kod. Exporteras separat eftersom kodvisaren i #5 behöver samma
// stack, och den ska inte gissa sig till namnet.
export const monoFontFamily = "'JetBrains Mono Variable', ui-monospace, Consolas, monospace";

const sansFontFamily = "'Inter Variable', system-ui, -apple-system, 'Segoe UI', sans-serif";

// Ett tema med två färglägen, inte två teman.
//
// MUI kan lägga ljust och mörkt i samma tema och växla via CSS-variabler.
// Alternativet - att byta hela temat i ThemeProvider - renderar om hela
// React-trädet vid varje lägesbyte. I en app som ska visa vad som orsakar
// en omrendering vore det en lögn inbyggd i grunden.
//
// colorSchemeSelector: 'class' betyder att läget styrs av en klass på <html>
// i stället för av operativsystemets inställning ensam. Det är förutsättningen
// för en växlare som användaren styr själv.
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },

  colorSchemes: {
    light: {
      palette: {
        primary: { main: accent.light, contrastText: '#FFFFFF' },
        background: { default: surface.light.background, paper: surface.light.paper },
        text: { primary: text.light.primary, secondary: text.light.secondary },
        divider: surface.light.border,
        success: { main: status.success.light },
        warning: { main: status.warning.light },
        error: { main: status.error.light },
        info: { main: status.info.light },
      },
    },
    dark: {
      palette: {
        // Mörk text på den ljusa accenten, inte tvärtom: 12.05:1 mot 1.3:1.
        primary: { main: accent.dark, contrastText: surface.dark.background },
        background: { default: surface.dark.background, paper: surface.dark.paper },
        text: { primary: text.dark.primary, secondary: text.dark.secondary },
        divider: surface.dark.border,
        success: { main: status.success.dark },
        warning: { main: status.warning.dark },
        error: { main: status.error.dark },
        info: { main: status.info.dark },
      },
    },
  },

  typography: {
    fontFamily: sansFontFamily,
    h1: { fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },

  shape: { borderRadius: 8 },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Inline-kod får rätt typsnitt utan att varje vy behöver be om det.
        'code, pre': { fontFamily: monoFontFamily },
      },
    },
  },
});
