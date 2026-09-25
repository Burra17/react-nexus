import { delay, http, HttpResponse } from 'msw';
import type { User } from '../api/users';

// Den mockade backendens hela datamängd.
//
// Namnen är desamma som i kapplöpningsdemon i modul 3. Där hämtades de med ett
// löfte inne i komponenten; här går samma hämtning över riktig HTTP, och det är
// hela poängen med modulen - det är din egen trasiga hämtning, gjord om.
//
// De två första har egna knappar i den modulen. De övriga syns bara när hela
// listan hämtas, vilket först behövdes i modulen om cachen - en lista på två
// poster ser inte ut som en lista.
const USERS: Record<string, User> = {
  ada: { id: 'ada', name: 'Ada Lovelace', role: 'Analytiker', email: 'ada@example.com' },
  bo: { id: 'bo', name: 'Bo Nilsson', role: 'Systemarkitekt', email: 'bo@example.com' },
  cleo: { id: 'cleo', name: 'Cleo Ahlgren', role: 'Frontendutvecklare', email: 'cleo@example.com' },
  dag: { id: 'dag', name: 'Dag Ternström', role: 'Testare', email: 'dag@example.com' },
  elin: { id: 'elin', name: 'Elin Kvist', role: 'Produktägare', email: 'elin@example.com' },
};

type RequestControls = {
  delayMs: number;
  shouldFail: boolean;
};

// Läser demons styrning ur anropets sökparametrar.
//
// Styrningen ligger i URL:en och inte i en delad variabel någon annanstans. Då
// syns det i Network-fliken exakt vad som styrde svaret, vilket är hela skälet
// till att vi mockar på nätverksnivå i stället för att fejka ett löfte.
//
// Sökparametrar får inte stå i mönstret till http.get - MSW matchar bara på
// sökvägen och läser parametrarna ur anropet.
const readControls = (request: Request): RequestControls => {
  const params = new URL(request.url).searchParams;

  // Number(null) är 0, så en hämtning utan delay-parameter får ingen fördröjning.
  const delayMs = Number(params.get('delay'));

  return {
    delayMs: Number.isFinite(delayMs) ? delayMs : 0,
    shouldFail: params.get('fail') === '1',
  };
};

// Ett serverfel med samma form som ett riktigt API skulle svara med, så att
// felläget i demon inte är en specialkonstruktion.
const serverError = () => HttpResponse.json({ message: 'Kunde inte hämta användaren just nu.' }, { status: 500 });

// Hur många anrop den mockade backenden faktiskt tagit emot.
//
// Räknaren finns för demon om cachens klockor, som påstår saker om när ett
// anrop sker och när det uteblir. Ett sådant påstående måste gå att kontrollera
// mot något annat än en renderräknare: StrictMode dubblerar renderingar lokalt
// men inte i ett bygge, så ett mått som är ett förhållande mellan renderingar
// och anrop ljuger på utvecklarens maskin. Absoluta tal gör det inte.
//
// Den räknas upp här och ingen annanstans, för att det som räknas ska vara
// anrop som verkligen nådde backenden - inte hookar som kördes.
let userRequestCount = 0;

export const readUserRequestCount = () => userRequestCount;

export const handlers = [
  // Listan står före :id-varianten. Ordningen spelar ingen roll för MSW, som
  // matchar på hela sökvägen, men den läses lättare uppifrån och ner.
  http.get('/api/users', async ({ request }) => {
    userRequestCount += 1;

    const { delayMs, shouldFail } = readControls(request);

    await delay(delayMs);

    if (shouldFail) {
      return serverError();
    }

    return HttpResponse.json(Object.values(USERS));
  }),

  http.get('/api/users/:id', async ({ request, params }) => {
    userRequestCount += 1;

    const { delayMs, shouldFail } = readControls(request);

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
];
