// Väntar tills mockservern säkert hanterar den här flikens anrop igen.
//
// Filen har med flit inga importer. axiosClient behöver anropa den, och
// axiosClient nås i sin tur från api/users, som handlers.ts hämtar sin typ ur -
// importerade den här filen något av det skulle beroendena gå i ring.
//
// Bakgrunden: webbläsaren stoppar en service worker som varit inaktiv i ungefär
// trettio sekunder, och MSW håller listan över anslutna flikar i workerns minne.
// Listan töms, och workern släpper då igenom allt i stället för att mocka det.
//
// MOCK_ACTIVATE är samma meddelande som worker.start() skickar när den kopplar
// upp sig, och workern svarar med MOCKING_ENABLED när fliken är inlagd igen. Att
// vänta in svaret är hela poängen: att bara skicka meddelandet och hoppas räcker
// inte, eftersom ett anrop som redan är på väg hinner före.
const ACTIVATE_TIMEOUT_MS = 1500;

export const ensureMocking = (): Promise<void> =>
  new Promise((resolve) => {
    const controller = navigator.serviceWorker?.controller;

    // Ingen worker styr sidan - då finns inget att återuppliva, och den som
    // anropade får hantera svaret som det blev.
    if (!controller) {
      resolve();
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if ((event.data as { type?: string } | null)?.type === 'MOCKING_ENABLED') {
        finish();
      }
    };

    // Tidsgränsen finns för att ett uteblivet svar inte ska hänga anropet för
    // alltid. Löftet löses ut ändå, och felet syns då som det fel det är.
    const timer = window.setTimeout(finish, ACTIVATE_TIMEOUT_MS);

    function finish() {
      window.clearTimeout(timer);
      navigator.serviceWorker.removeEventListener('message', onMessage);
      resolve();
    }

    navigator.serviceWorker.addEventListener('message', onMessage);
    controller.postMessage('MOCK_ACTIVATE');
  });
