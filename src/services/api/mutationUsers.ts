import { axiosClient } from '../axios/axiosClient';
import type { User, UserRequestOptions } from './users';
import { toControlParams } from './users';

// Anropen mot den uppsättning användare som får skrivas i.
//
// Egen fil och inte en tillökning i users.ts: sökvägen är en annan, och det är
// sökvägen som gör det till en annan resurs. Mönstret är en fil per resurs.
//
// Sökvägarna står utan /api. Basen sitter i axiosClient, så anropen går ut som
// /api/mutations/users, vilket är den sökväg den mockade backenden lyssnar på.
//
// User-typen importeras däremot från users.ts. Formen är densamma, och en
// kopierad typ hade drivit isär från den första gången någon lade till ett fält.

// Hämtar användarna som får skrivas i.
export const getMutationUsers = async (options: UserRequestOptions = {}): Promise<User[]> => {
  const response = await axiosClient.get<User[]>('/mutations/users', { params: toControlParams(options) });

  return response.data;
};

// Vad en rolländring behöver veta. Den ligger här och inte bland vyns egna
// filer: det är formen på det som skickas till API:et, inte ett läge i en demo.
export type UpdateUserRolePayload = {
  id: string;
  role: string;
};

// Byter roll på en användare.
//
// shouldFail hör egentligen inte hemma i ett riktigt API. Den finns för att
// demon om optimistisk uppdatering ska kunna beställa ett fel i stället för att
// vänta på otur, på samma sätt som fördröjningen styr hur länge anropet tar.
export const updateMutationUserRole = async ({ id, role }: UpdateUserRolePayload, options: UserRequestOptions = {}): Promise<User> => {
  const response = await axiosClient.put<User>(`/mutations/users/${id}`, { role }, { params: toControlParams(options) });

  return response.data;
};
