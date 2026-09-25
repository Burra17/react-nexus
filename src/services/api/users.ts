import { axiosClient } from '../axios/axiosClient';

// Formen på det API:et svarar med för en användare. Typen ligger bredvid anropet
// den hör till, inte i en response/-mapp: resursen har bara den här typen än, och
// tre mappar med en fil i varje är ceremoni.
export type User = {
  id: string;
  name: string;
  role: string;
  email: string;
};

// Det demon får styra hos den mockade backenden. Fördröjningen och felsvaret är
// inget ett riktigt API skulle erbjuda - de finns för att laddnings- och
// felläget ska gå att framkalla på begäran i stället för att vänta på otur.
export type UserRequestOptions = {
  delayMs?: number;
  shouldFail?: boolean;
};

// Hämtar hela listan med användare.
//
// Den byggdes först när något faktiskt behövde den. Modulen om cachen visar att
// flera komponenter som frågar efter samma nyckel ger ett enda anrop, och det
// går svårligen att demonstrera utan något som flera vyer naturligt vill visa
// samtidigt.
export const getUsers = async (options: UserRequestOptions = {}): Promise<User[]> => {
  const response = await axiosClient.get<User[]>('/users', {
    params: {
      delay: options.delayMs,
      fail: options.shouldFail ? 1 : undefined,
    },
  });

  return response.data;
};

// Hämtar en användare. Servicen innehåller ingen React - den returnerar typad
// data, och hooken som anropar den bestämmer vad som händer med den.
//
// Anropet är en funktion och inte en metod på en basklass. Förlagan ärver Get,
// GetAll, Create och Update från en BaseAPI, vilket lönar sig över tjugosju
// resurser men här bara skulle packa in ett anrop i ett lager som döljer vad det
// gör.
export const getUser = async (id: string, options: UserRequestOptions = {}): Promise<User> => {
  const response = await axiosClient.get<User>(`/users/${id}`, {
    // axios utelämnar parametrar som är undefined, så en hämtning utan
    // fördröjning skickar heller ingen delay-parameter.
    params: {
      delay: options.delayMs,
      fail: options.shouldFail ? 1 : undefined,
    },
  });

  return response.data;
};
