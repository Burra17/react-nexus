import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { queryClient } from './services/queryClient';
import { theme } from './styles/theme';

// CssBaseline nollställer webbläsarens egna marginaler och typografi och sätter
// bakgrunden från temat. Den ersätter den index.css som Vite-mallen hade.
//
// defaultMode 'system' betyder att appen följer operativsystemet tills
// användaren aktivt väljer något annat. Växlaren byggs i #3.
const renderApp = () =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider theme={theme} defaultMode='system'>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  );

// Mockservern startas i ALLA lägen, även i ett produktionsbygge.
//
// MSW:s egen dokumentation startar workern bara när NODE_ENV är 'development'.
// Den vägen går inte här, och avsteget står utskrivet eftersom varje guide säger
// motsatsen: i det här repot är mocken inte en ställföreträdare för en riktig
// backend under utveckling - den ÄR datakällan. Den publicerade sidan är
// läroboken, och en modul som bara fungerar på utvecklarens maskin är inte byggd.
//
// Renderingen väntar in registreringen. Att registrera en service worker är en
// asynkron operation, och startas appen innan den är klar hinner det första
// anropet lämna klienten innan workern lyssnar. Då får läsaren ett riktigt 404 -
// sporadiskt, vilket är den värsta sorten. MSW rekommenderar själva att skjuta
// upp renderingen tills löftet har löst ut.
//
// onUnhandledRequest: 'bypass' släpper igenom allt vi inte mockar utan att säga
// något. Standarden varnar i konsolen för varje sådan förfrågan, och läsaren som
// öppnar DevTools ska inte mötas av en vägg av varningar och tro att appen är
// trasig.
//
// MSW hämtas med en dynamisk import och inte med en vanlig import högst upp.
// Skälet är uppmätt: statiskt importerad hamnar den i startchunken och tar den
// från 87.91 till 254.13 kB gzip, medan react-query och axios tillsammans bara
// står för 7 av de 166 kilobyten. Med import() här hamnar MSW i en egen fil.
//
// Användaren laddar ner exakt lika mycket - renderingen väntar ju in workern
// oavsett. Vinsten är att mockens vikt inte längre ligger i samma fil som
// appkoden: MSW byts ut sällan och appkoden ofta, så den egna filen ligger kvar
// i webbläsarens cache mellan publiceringar.
import('./services/mocks/browser')
  .then(async ({ worker, keepWorkerAlive }) => {
    await worker.start({ onUnhandledRequest: 'bypass' });

    // Utan den här raden kan mockningen vara ur funktion när man kommer
    // tillbaka till en flik som legat i bakgrunden en stund. Skälet står
    // utskrivet i browser.ts.
    keepWorkerAlive();
  })
  // Appen renderas även om mockservern inte gick att starta.
  //
  // Utan den här grenen hoppas renderApp över, och läsaren möts av en vit sida
  // utan ett ord om varför. Renderas appen ändå fungerar teorin, koden och
  // quizen som vanligt, och demon visar felrutan från axiosClient i stället -
  // ett begripligt fel slår en tom skärm, precis som interceptorn resonerar.
  .catch((error: unknown) => {
    console.error('Mockservern kunde inte startas. Appen visas ändå, men alla anrop mot /api kommer att misslyckas.', error);
  })
  .then(renderApp);
