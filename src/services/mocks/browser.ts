import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Workern som fångar appens HTTP-anrop i webbläsaren.
//
// Filerna ligger i services/mocks/ och inte i src/mocks/ som MSW föreslår. En
// mockad backend är infrastruktur som hela appen delar och som ingen enskild
// modul äger, och då hör den hemma i services/. Undantaget är
// public/mockServiceWorker.js, som verktyget genererar och som måste ligga där
// för att webbläsaren ska hitta den.
export const worker = setupWorker(...handlers);

// Kopplar upp den här fliken mot mockningen igen när den blir synlig.
//
// Problemet: webbläsaren stoppar en service worker som varit inaktiv i ungefär
// trettio sekunder. MSW håller listan över anslutna flikar i workerns MINNE, så
// den töms när det händer. Nästa anrop väcker visserligen workern, men med tom
// lista - och då träffar den sin egen regel om att släppa igenom allt när ingen
// klient är ansluten. Anropet går till servern, som svarar med appens
// index.html, och mockningen är tyst ur funktion tills sidan laddas om. Det är
// ett känt och fortfarande öppet problem i MSW (mswjs/msw#367).
//
// MSW skyddar sig redan mot det: setupWorker skickar KEEPALIVE_REQUEST var
// femte sekund, uppmätt i konsolen och bekräftat i bibliotekets källkod. Något
// eget intervall behövs alltså inte, och ett sådant skulle bara dubblera
// något som redan görs oftare.
//
// Men den timern stryps när fliken ligger i bakgrunden - webbläsare kör ofta
// bara en gång i minuten då - och det räcker för att workern ska hinna dö
// medan man är i ett annat fönster. Just då är risken som störst att något
// hämtas i samma ögonblick som man kommer tillbaka, eftersom Query hämtar om av
// egen kraft när fönstret får fokus.
//
// MOCK_ACTIVATE är samma meddelande som worker.start() skickar när den kopplar
// upp sig, och det lägger tillbaka fliken i workerns lista.
export const keepWorkerAlive = () => {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.controller?.postMessage('MOCK_ACTIVATE');
    }
  });
};
