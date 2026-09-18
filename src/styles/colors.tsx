// Appens färgpalett. Varje hex-kod i projektet står här och ingen annanstans,
// så att en färg går att byta på ett ställe i stället för i trettio komponenter.
//
// Varje färg finns i två toner: en för ljust läge och en för mörkt. Samma nyans,
// olika ljushet - en accent som fungerar mot vitt är för mörk mot grafit.
// Alla kombinationer nedan är kontrollerade mot WCAG AA (4.5:1).

// Accenten bär knappar, länkar och aktiv navigering.
// Ljus: 6.61:1 mot vitt. Mörk: 11.07:1 mot mörk yta.
export const accent = {
  light: '#00695C',
  dark: '#5EEAD4',
};

// Texten som ligger ovanpå accentfärgen, till exempel i en ifylld knapp.
//
// Den följer inte text-färgerna nedan, eftersom den ska kontrastera mot
// accenten och inte mot sidans bakgrund. Ljust läge har en mörk accent och
// behöver ljus text; mörkt läge har en ljus accent och behöver mörk.
// Ljus: 6.61:1 mot accenten. Mörk: 12.05:1.
export const onAccent = {
  light: '#FFFFFF',
  dark: '#14181D',
};

// Ytorna: background är sidan, paper är kort och paneler ovanpå den.
// Skillnaden mellan dem är medvetet liten - ett kort ska läsas som upphöjt,
// inte som ett eget färgfält.
export const surface = {
  light: { background: '#F7F9FA', paper: '#FFFFFF', border: '#E1E6EB' },
  dark: { background: '#14181D', paper: '#1B2027', border: '#2A313A' },
};

// Text. Sekundär används för förklaringar och bildtexter, aldrig för
// något som måste läsas för att förstå vyn.
export const text = {
  light: { primary: '#14181D', secondary: '#55606D' },
  dark: { primary: '#E6EAEF', secondary: '#98A3B0' },
};

// Statusfärger. De kommer till användning först i query-modulerna, där en vy
// behöver visa laddning, lyckat svar och fel bredvid varandra.
export const status = {
  success: { light: '#1B7A4B', dark: '#4ADE80' },
  warning: { light: '#9A6300', dark: '#FBBF24' },
  error: { light: '#B3261E', dark: '#F87171' },
  info: { light: '#0B5FA5', dark: '#60A5FA' },
};
