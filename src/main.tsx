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

// Appen ritas inuti tre omslag. ThemeProvider ger alla komponenter appens tema,
// CssBaseline nollställer webbläsarens egna marginaler och typografi, och
// QueryClientProvider ger alla komponenter tillgång till samma cache.
//
// defaultMode 'system' betyder att appen följer operativsystemets ljusa eller
// mörka läge tills användaren väljer något annat i appen.
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

// MSW startas i ALLA lägen, också i den publicerade appen.
//
// MSW:s egen guide startar den bara när NODE_ENV är 'development', alltså i
// utvecklingsläget. Den vägen går inte här, och avsteget står utskrivet eftersom
// varje guide säger motsatsen: i den här appen står MSW inte i för en riktig
// server under utveckling. Den är datakällan. Den publicerade appen är
// läroboken, och en vy som bara fungerar på utvecklarens dator är inte färdig.
//
// Appen ritas först när MSW har startat. Starten tar en stund, och ritas appen
// innan den är klar når det första anropet servern i stället för MSW och får
// index.html tillbaka. Felet är sporadiskt, vilket är den värsta sorten. MSW
// rekommenderar själva att vänta in starten.
//
// onUnhandledRequest: 'bypass' släpper igenom allt vi inte mockar utan att säga
// något. Standarden varnar i konsolen för varje sådan förfrågan, och läsaren som
// öppnar DevTools ska inte mötas av en vägg av varningar och tro att appen är
// trasig.
//
// MSW hämtas med import() här och inte med en vanlig import högst upp. Skälet
// är uppmätt: med en vanlig import hamnar MSW i den fil som laddas först och tar
// den från 87,91 till 254,13 kB komprimerad, alltså 166 kB mer. Med import()
// hamnar MSW i en egen fil.
//
// Användaren laddar ner exakt lika mycket. Renderingen väntar ju in workern
// oavsett. Vinsten är att mockens vikt inte längre ligger i samma fil som
// appkoden: MSW byts ut sällan och appkoden ofta, så den egna filen ligger kvar
// i webbläsarens cache mellan publiceringar.
import('./services/mocks/browser')
  .then(async ({ worker, keepWorkerAlive }) => {
    await worker.start({ onUnhandledRequest: 'bypass' });

    // Webbläsaren stoppar en service worker som varit inaktiv en stund.
    // keepWorkerAlive, i services/mocks/browser.ts som inte visas här, håller
    // MSW vaken, så att den fungerar när man kommer tillbaka till en flik som
    // legat i bakgrunden.
    keepWorkerAlive();
  })
  // Appen ritas även om MSW inte gick att starta.
  //
  // catch fångar felet, och den sista then körs efter den, både när starten
  // lyckades och när den misslyckades. Utan catch hade renderApp hoppats över,
  // och läsaren hade mötts av en vit sida utan ett ord om varför. Ritas appen
  // ändå fungerar teorin, koden och quizen som vanligt, och demon visar felet
  // från axiosClient i stället. Ett begripligt fel slår en tom skärm.
  .catch((error: unknown) => {
    console.error('Mockservern kunde inte startas. Appen visas ändå, men alla anrop mot /api kommer att misslyckas.', error);
  })
  .then(renderApp);
