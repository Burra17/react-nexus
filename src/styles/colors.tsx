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

// Plattan bakom inline-kod i löptext.
//
// Halvtransparent och inte solid, så att lyftet blir detsamma oavsett underlag.
// Inline-kod står på två ytor i appen: teorin ligger direkt på sidbakgrunden,
// medan quizens frågor och demotexterna ligger inuti ett Paper-kort. En solid
// platta hade blivit identisk på båda medan omgivningen skiljer sig, och därmed
// synts sämre inuti kortet.
//
// Tonen är textfärgen och inte rent svart eller vitt, så att plattan hör ihop
// med resten av paletten.
//
// Kontrasten mellan texten och plattan är aldrig det svåra här: texten behåller
// sin vanliga färg, så alla fyra kombinationerna ligger långt över WCAG AA.
// Uppmätt text mot platta:
//
//   Ljust läge: 12,93:1 på sidan, 13,61:1 i ett kort
//   Mörkt läge: 9,77:1 på sidan, 8,92:1 i ett kort
//
// Det som avgör hur plattan faktiskt ser ut är i stället hur den står mot sin
// omgivning, och den skillnaden har inget WCAG-krav: 1,31:1 i ljust läge och
// 1,51:1 i mörkt. Syns plattan inte alls är det de två talen som ska upp, inte
// kontrasten ovan.
//
// Alfanivåerna är olika med flit, och skillnaden är större än man väntar sig.
// En ljus yta behöver mycket mer påslag för samma upplevda lyft: 0,13 i ljust
// läge ger ungefär vad 0,10 ger i mörkt, och för att nå mörkt lägets 1,51:1
// skulle ljust behöva 0,20. Samma tal i båda lägena ger alltså inte samma
// resultat - de här två är valda för att se lika starka ut, inte för att vara
// lika stora.
export const codeSurface = {
  light: 'rgba(20, 24, 29, 0.13)',
  dark: 'rgba(230, 234, 239, 0.15)',
};

// Statusfärger. De kommer till användning först i query-modulerna, där en vy
// behöver visa laddning, lyckat svar och fel bredvid varandra.
export const status = {
  success: { light: '#1B7A4B', dark: '#4ADE80' },
  warning: { light: '#9A6300', dark: '#FBBF24' },
  error: { light: '#B3261E', dark: '#F87171' },
  info: { light: '#0B5FA5', dark: '#60A5FA' },
};
