import axios from 'axios';

// Appens enda Axios-instans. All HTTP går genom servicelagret och därmed genom
// den här klienten - aldrig axios direkt i en komponent.
//
// Basadressen är hårdkodad och relativ, utan miljövariabel. Mock Service Worker
// fångar anropen i webbläsaren, så det finns ingen server att peka om till, och
// en variabel som aldrig varierar är samma sorts ceremoni som en tom mapp.
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
// ett anrop under /api - för att workern inte hunnit starta, för att en rutt är
// felstavad, eller för att handlern saknas - får axios alltså tillbaka en
// webbsida med status 200. Utan den här raden ser det ut som en lyckad
// hämtning: Query lägger HTML-strängen i cachen som data, vyn renderar tomma
// fält, och ingenting säger till. Ett fel som ser ut som ett lyckat svar är
// värre än ett fel, för det upptäcks inte.
//
// Det här är också appens enda interceptor. Vi har ingen inloggning och därmed
// ingen token att haka på, vilket är det vanligaste skälet att använda dem -
// men en interceptor är rätt plats för en regel som ska gälla varje anrop utan
// att varje service upprepar den.
axiosClient.interceptors.response.use((response) => {
  const contentType = String(response.headers['content-type'] ?? '');

  if (!contentType.includes('application/json')) {
    throw new Error(`Svaret från ${response.config.url} är ${contentType || 'av okänd typ'}, inte JSON. Kör mockservern?`);
  }

  return response;
});
