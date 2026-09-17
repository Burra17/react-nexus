import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { theme } from './styles/theme';

// CssBaseline nollställer webbläsarens egna marginaler och typografi och sätter
// bakgrunden från temat. Den ersätter den index.css som Vite-mallen hade.
//
// defaultMode 'system' betyder att appen följer operativsystemet tills
// användaren aktivt väljer något annat. Växlaren byggs i #3.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
