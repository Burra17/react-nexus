import { delay, http, HttpResponse } from 'msw';
import type { User } from '../api/users';

// Den mockade backendens hela datamängd.
//
// Filen är appens enda backend och betjänar alla vyer, så här finns sökvägar och
// data som den vy du läser just nu inte använder. Den besvarar riktiga
// HTTP-anrop i webbläsaren, med hjälp av Mock Service Worker, i stället för att
// lämna ifrån sig ett löst löfte inne i koden. Det är därför anropen syns i
// webbläsarens Network-flik och går att räkna.
//
// Fem poster och inte två. De demonstrationer som hämtar en enskild användare
// klarar sig på två, men en lista på två poster ser inte ut som en lista, och
// då blir det svårt att se att det är samma lista som visas på flera ställen.
const USERS: Record<string, User> = {
  ada: { id: 'ada', name: 'Ada Lovelace', role: 'Analytiker', email: 'ada@example.com' },
  bo: { id: 'bo', name: 'Bo Nilsson', role: 'Systemarkitekt', email: 'bo@example.com' },
  cleo: { id: 'cleo', name: 'Cleo Ahlgren', role: 'Frontendutvecklare', email: 'cleo@example.com' },
  dag: { id: 'dag', name: 'Dag Ternström', role: 'Testare', email: 'dag@example.com' },
  elin: { id: 'elin', name: 'Elin Kvist', role: 'Produktägare', email: 'elin@example.com' },
};

// En egen kopia av datamängden, och den enda som får skrivas i.
//
// Skrivningar hör hemma i en vy som demonstrerar dem, och bara där. Gick de mot
// USERS ovan skulle en ändrad roll ligga kvar och möta läsaren i varje annan vy
// som hämtar användare, tills sidan laddades om och den tyst återställdes. Varje
// vy ska bete sig likadant oavsett vad läsaren gjort dessförinnan.
//
// Objekten kopieras med spread och inte genom att peka på USERS poster, så att
// en skrivning här inte når den delade datamängden via referensen.
const MUTATION_USERS: Record<string, User> = {
  ada: { ...USERS.ada },
  bo: { ...USERS.bo },
  cleo: { ...USERS.cleo },
};

type RequestControls = {
  delayMs: number;
  shouldFail: boolean;
  // null när anropet inte är märkt med någon demo.
  demo: string | null;
};

// Läser demons styrning ur anropets sökparametrar.
//
// Styrningen ligger i URL:en och inte i en delad variabel någon annanstans. Då
// syns det i Network-fliken exakt vad som styrde svaret, vilket är hela skälet
// till att vi mockar på nätverksnivå i stället för att fejka ett löfte.
//
// Sökparametrar får inte stå i mönstret till http.get. MSW matchar bara på
// sökvägen och läser parametrarna ur anropet.
const readControls = (request: Request): RequestControls => {
  const params = new URL(request.url).searchParams;

  // Number(null) är 0, så en hämtning utan delay-parameter får ingen fördröjning.
  const delayMs = Number(params.get('delay'));

  return {
    delayMs: Number.isFinite(delayMs) ? delayMs : 0,
    shouldFail: params.get('fail') === '1',
    demo: params.get('demo'),
  };
};

// Ett serverfel med samma form som ett riktigt API skulle svara med, så att
// felläget i demon inte är en specialkonstruktion.
const serverError = () => HttpResponse.json({ message: 'Kunde inte hämta användaren just nu.' }, { status: 500 });

// Hur många anrop den mockade backenden faktiskt tagit emot, per demo.
//
// Räknaren finns för de demonstrationer som påstår saker om när ett anrop sker
// och när det uteblir. Ett sådant påstående måste gå att kontrollera mot något
// annat än en renderräknare: React kör renderingar två gånger i utvecklingsläge
// men inte i ett bygge, så ett mått som är ett förhållande mellan renderingar
// och anrop ljuger på utvecklarens maskin. Absoluta tal gör det inte.
//
// Den räknas upp här och ingen annanstans, för att det som räknas ska vara
// anrop som verkligen nådde backenden, inte hookar som kördes.
//
// Varje handler räknar, också skrivningen. Räknaren mäter anrop och inte
// hämtningar. En skrivning som följs av en invalidering kostar ett skrivanrop
// plus de hämtningar invalideringen utlöser, och räknades bara GET skulle
// panelen visa ett tal som säger emot Network-fliken.
//
// Talet hålls isär per demo, enligt märkningen i anropets demo-parameter. En
// enda totalsumma för hela appen räcker inte så fort två demonstrationer står
// på samma sida och hämtar när sidan öppnas: deras anrop landar i samma tal,
// och en panel som säger att ingenting hämtats visar ändå tre. Ett anrop utan
// märkning hör inte till någon panel och räknas inte.
const requestCounts = new Map<string, number>();

const countRequest = (demo: string | null) => {
  if (demo !== null) {
    requestCounts.set(demo, (requestCounts.get(demo) ?? 0) + 1);
  }
};

// Hur många anrop en demo gjort sedan sidladdning.
export const readRequestCount = (demo: string) => requestCounts.get(demo) ?? 0;

export const handlers = [
  // Listan står före :id-varianten. Ordningen spelar ingen roll för MSW, som
  // matchar på hela sökvägen, men den läses lättare uppifrån och ner.
  http.get('/api/users', async ({ request }) => {
    const { delayMs, shouldFail, demo } = readControls(request);

    countRequest(demo);

    await delay(delayMs);

    if (shouldFail) {
      return serverError();
    }

    return HttpResponse.json(Object.values(USERS));
  }),

  http.get('/api/users/:id', async ({ request, params }) => {
    const { delayMs, shouldFail, demo } = readControls(request);

    countRequest(demo);

    // Fördröjningen ligger före allt annat: också ett fel ska ta tid att komma
    // fram, annars går felläget inte att se.
    await delay(delayMs);

    if (shouldFail) {
      return serverError();
    }

    const user = typeof params.id === 'string' ? USERS[params.id] : undefined;

    if (!user) {
      return HttpResponse.json({ message: 'Användaren finns inte.' }, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  // Läsningen som hör ihop med skrivningen nedan. Egen sökväg, egen datamängd,
  // se MUTATION_USERS.
  http.get('/api/mutations/users', async ({ request }) => {
    const { delayMs, shouldFail, demo } = readControls(request);

    countRequest(demo);

    await delay(delayMs);

    if (shouldFail) {
      return serverError();
    }

    return HttpResponse.json(Object.values(MUTATION_USERS));
  }),

  // Skrivningen. Den enda handlern i filen som ändrar något.
  //
  // Felet styrs av samma fail-parameter som hämtningarna, och det är avsiktligt:
  // en demonstration som visar hur en misslyckad skrivning tas tillbaka behöver
  // ett fel den kan beställa. Att felet kommer FÖRE skrivningen spelar roll:
  // ett misslyckat anrop ska inte ha ändrat något, annars visar demon en
  // rollback av en ändring som blev kvar på servern.
  http.put('/api/mutations/users/:id', async ({ request, params }) => {
    const { delayMs, shouldFail, demo } = readControls(request);

    countRequest(demo);

    await delay(delayMs);

    if (shouldFail) {
      return HttpResponse.json({ message: 'Kunde inte spara rollen just nu.' }, { status: 500 });
    }

    const user = typeof params.id === 'string' ? MUTATION_USERS[params.id] : undefined;

    if (!user) {
      return HttpResponse.json({ message: 'Användaren finns inte.' }, { status: 404 });
    }

    const { role } = (await request.json()) as { role: string };

    MUTATION_USERS[user.id] = { ...user, role };

    return HttpResponse.json(MUTATION_USERS[user.id]);
  }),
];
