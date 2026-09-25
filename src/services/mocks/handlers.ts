import { delay, http, HttpResponse } from 'msw';
import type { User } from '../api/users';

// Den mockade backendens hela datamängd.
//
// Namnen är desamma som i kapplöpningsdemon i modul 3. Där hämtades de med ett
// löfte inne i komponenten; här går samma hämtning över riktig HTTP, och det är
// hela poängen med modulen - det är din egen trasiga hämtning, gjord om.
const USERS: Record<string, User> = {
  ada: { id: 'ada', name: 'Ada Lovelace', role: 'Analytiker', email: 'ada@example.com' },
  bo: { id: 'bo', name: 'Bo Nilsson', role: 'Systemarkitekt', email: 'bo@example.com' },
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

export const handlers = [
  http.get('/api/users/:id', async ({ request, params }) => {
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
