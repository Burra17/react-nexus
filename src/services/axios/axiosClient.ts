import axios from 'axios';
import { ensureMocking } from '../mocks/ensureMocking';

// Appens enda Axios-instans. All HTTP går genom servicelagret och därmed genom
// den här klienten, aldrig axios direkt i en komponent.
//
// Basadressen är skriven direkt i koden och relativ. Ofta läses den i stället
// från en miljövariabel, en inställning som skiljer sig mellan utveckling och
// publicering. Här fångar Mock Service Worker anropen i webbläsaren, så det
// finns ingen server att peka om till, och en inställning som aldrig ändras är
// struktur utan nytta.
//
// Axios finns kvar i stället för fetch av ett skäl som är pedagogiskt och inte
// tekniskt: det är axios du möter i produktionskod, och en lärobok som lär ut
// fetch förbereder dig sämre på den kod du faktiskt ska läsa.
export const axiosClient = axios.create({
  baseURL: '/api',
});

// Ett svar som inte är JSON är inte ett svar från vårt API, hur mycket 200 det
// än säger.
//
// Anledningen till att kontrollen behövs: appen är en ensidesapp, och allt som
// inte matchar en riktig fil besvaras med index.html. Fångar mockservern inte
// ett anrop under /api får axios alltså tillbaka en webbsida med status 200.
// Det händer om workern inte hunnit starta, om en rutt är felstavad eller om
// handlern saknas. Utan kontrollen ser det ut som en lyckad hämtning: Query
// lägger HTML-texten i cachen som data, och ingenting säger till. Ett fel som
// ser ut som ett lyckat svar är värre än ett fel, för det upptäcks inte.
//
// Det här är appens egen interceptor, den enda som alltid finns. En vy får
// lägga till egna en stund, som vyn om arkitektur gör. Appen har ingen
// inloggning och därmed ingen nyckel att lägga på varje anrop, vilket är det
// vanligaste skälet att använda interceptorer. Men en interceptor är rätt plats
// för en regel som ska gälla varje anrop, utan att varje service upprepar den.

// Headern, en etikett som skickas med anropet, märker ett anrop som redan
// gjorts om. Utan den skulle ett svar som aldrig blir JSON försöka igen i all
// oändlighet.
const RETRY_HEADER = 'x-mock-retry';

axiosClient.interceptors.response.use(async (response) => {
  const contentType = String(response.headers['content-type'] ?? '');

  if (contentType.includes('application/json')) {
    return response;
  }

  // Ett svar som inte är JSON betyder nästan alltid att mockservern sov.
  //
  // Webbläsaren stoppar en service worker som varit inaktiv en halv minut, och
  // MSW tappar då listan över anslutna flikar. Den vanligaste stunden det
  // märks är när man kommer tillbaka till en flik man lämnat, för då hämtar
  // Query om av egen kraft när fliken får fokus igen, och det anropet hinner
  // före återanslutningen.
  //
  // ensureMocking, en funktion i services/mocks som inte visas här, startar
  // MSW igen om den somnat. Att väcka MSW och göra om anropet en gång löser
  // problemet där det faktiskt syns, i stället för att varje vy får hantera det.
  if (!response.config.headers[RETRY_HEADER]) {
    await ensureMocking();

    return axiosClient.request({
      ...response.config,
      headers: { ...response.config.headers, [RETRY_HEADER]: '1' },
    });
  }

  throw new Error(`Svaret från ${response.config.url} är ${contentType || 'av okänd typ'}, inte JSON. Kör mockservern?`);
});
