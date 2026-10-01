import { axiosClient } from '../axios/axiosClient';

// Formen på det API:et svarar med för en användare. Typen ligger bredvid anropet
// den hör till. Större kodbaser samlar ofta typerna i egna mappar, men här har
// resursen bara den här typen, och en mapp för en enda fil är ceremoni.
export type User = {
  id: string;
  name: string;
  role: string;
  email: string;
};

// Det demon får styra hos den mockade backenden. Fördröjningen och felsvaret är
// inget ett riktigt API skulle erbjuda. De finns för att laddnings- och
// felläget ska gå att framkalla på begäran i stället för att vänta på otur.
//
// demo säger vilken demonstration anropet hör till. Den mockade backenden
// räknar anropen per demo, så att två demonstrationer på samma sida inte syns i
// varandras tal. Sökvägen räcker inte för att hålla isär dem: två demor kan
// mycket väl hämta samma lista.
export type UserRequestOptions = {
  delayMs?: number;
  shouldFail?: boolean;
  demo?: string;
};

// Gör om styrningen till sökparametrar, så att den syns i Network-fliken.
//
// axios utelämnar parametrar som är undefined, så en hämtning utan fördröjning
// skickar heller ingen delay-parameter.
export const toControlParams = (options: UserRequestOptions) => ({
  delay: options.delayMs,
  fail: options.shouldFail ? 1 : undefined,
  demo: options.demo,
});

// Hämtar hela listan med användare.
//
// Sökvägen står som /users och inte /api/users. Basen /api sitter i
// axiosClient, så varje anrop här går ut som /api/users, vilket är den sökväg
// den mockade backenden lyssnar på.
export const getUsers = async (options: UserRequestOptions = {}): Promise<User[]> => {
  const response = await axiosClient.get<User[]>('/users', { params: toControlParams(options) });

  return response.data;
};

// Hämtar en användare. Servicen innehåller ingen React: den returnerar typad
// data, och hooken som anropar den bestämmer vad som händer med den.
//
// Anropet är en funktion och inte en metod på en basklass. I en kodbas med
// många resurser lönar det sig ofta att låta varje resurs ärva Get, GetAll,
// Create och Update från en gemensam klass. Här finns två, och då vore klassen
// ett lager som döljer vad anropet gör.
export const getUser = async (id: string, options: UserRequestOptions = {}): Promise<User> => {
  const response = await axiosClient.get<User>(`/users/${id}`, { params: toControlParams(options) });

  return response.data;
};
