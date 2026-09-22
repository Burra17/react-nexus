// Konceptvyns sektioner, och måtten som håller ihop rubrikrad, sektionsrad och
// ankarhopp.
//
// Egen fil eftersom det är ren data utan JSX. Låg den i sectionNav.tsx skulle
// den filen exportera både en komponent och konstanter, och då slutar Fast
// Refresh fungera för den - varje ändring tvingar fram en full omladdning i
// stället för en uppdatering på plats. ESLint fångar det med
// react-refresh/only-export-components, samma gräns som CLAUDE.md drar för
// lazyPages.ts.

// Rubrikradens höjd. AppBar ligger fixed, så sektionsraden måste fästa precis
// under den - annars glider innehåll in i springan mellan dem.
export const APPBAR_HEIGHT = { xs: 56, sm: 64 };

// Så långt ner ett ankarmål ska hamna när man klickar sig dit: under AppBar och
// under sektionsraden, plus lite luft. Utan den hamnar rubriken bakom raden som
// just förde dig dit - ett fel som uppstår av lösningen själv och därför är
// värre än det ursprungliga.
export const SECTION_SCROLL_MARGIN = { xs: 120, sm: 128 };

// Remsan där en rubrik räknas som aktuell. Den börjar strax under
// sektionsraden - AppBar 65 px plus radens 46 ger 111 - och slutar 30 procent
// ner i läsytan.
//
// Toppen måste ligga ovanför SECTION_SCROLL_MARGIN, annars hamnar en rubrik man
// hoppat till precis ovanför remsan och markeringen följer inte med. Uppmätt:
// ett hopp landar rubriken på 128, så remsan börjar på 112.
export const ACTIVE_SECTION_ROOT_MARGIN = '-112px 0px -70% 0px';

// Sektionernas id på ett ställe.
//
// Mallen sätter dem på sina rubriker, sektionsraden länkar till dem. Skrevs de
// som strängar på båda ställena räcker det att en av dem ändras för att
// länkarna tyst ska sluta hitta - inget byggfel, ingen varning, bara en meny
// som inte gör någonting.
export const sectionIds = {
  teori: 'rubrik-teori',
  demo: 'rubrik-demo',
  kod: 'rubrik-kod',
  quiz: 'rubrik-quiz',
} as const;

export const conceptSections = [
  { id: sectionIds.teori, label: 'Teori' },
  { id: sectionIds.demo, label: 'Demo' },
  { id: sectionIds.kod, label: 'Kod' },
  { id: sectionIds.quiz, label: 'Quiz' },
];
