import { lazy } from 'react';

// Konceptvyerna hämtas först när man går till dem.
//
// En konceptvy drar in kodvisaren, som drar in Shikis grammatik och teman -
// ungefär 100 kB gzip. Ligger vyn i startchunken betalar även den som bara
// tittar på startsidan för kod hen aldrig ser. Med lazy hamnar allt det i en
// egen fil som hämtas vid första besöket på modulen.
//
// then-raden finns för att lazy vill ha en default-export, medan CLAUDE.md
// säger namngivna exporter. Den plockar helt enkelt ut rätt namn.
//
// Filen innehåller bara komponenter och inget annat. Blandas komponenter och
// data i samma fil slutar Fast Refresh fungera för den, och varje ändring
// tvingar fram en full omladdning av sidan.
export const StatePage = lazy(() => import('./modules/state/pages/statePage').then((imported) => ({ default: imported.StatePage })));

export const RenderingPage = lazy(() => import('./modules/rendering/pages/renderingPage').then((imported) => ({ default: imported.RenderingPage })));

export const EffectsPage = lazy(() => import('./modules/effects/pages/effectsPage').then((imported) => ({ default: imported.EffectsPage })));

export const TypescriptPage = lazy(() =>
  import('./modules/typescript/pages/typescriptPage').then((imported) => ({ default: imported.TypescriptPage })),
);

export const ContextPage = lazy(() => import('./modules/context/pages/contextPage').then((imported) => ({ default: imported.ContextPage })));

export const PerformancePage = lazy(() =>
  import('./modules/performance/pages/performancePage').then((imported) => ({ default: imported.PerformancePage })),
);

export const QueryBasicsPage = lazy(() =>
  import('./modules/queryBasics/pages/queryBasicsPage').then((imported) => ({ default: imported.QueryBasicsPage })),
);

export const QueryCachePage = lazy(() =>
  import('./modules/queryCache/pages/queryCachePage').then((imported) => ({ default: imported.QueryCachePage })),
);
