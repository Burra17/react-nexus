import { axiosClient } from '../axios/axiosClient';
import type { User, UserRequestOptions } from './users';

// Anropen mot mutationsmodulens egen kopia av användarna.
//
// Egen fil och inte en tillökning i users.ts: sökvägen är en annan, och det är
// sökvägen som gör det till en annan resurs. Mönstret är en fil per resurs.
//
// User-typen importeras däremot från users.ts. Formen är densamma, och en
// kopierad typ hade drivit isär från den första gången någon lade till ett fält.

// Hämtar mutationsmodulens användare.
export const getMutationUsers = async (options: UserRequestOptions = {}): Promise<User[]> => {
  const response = await axiosClient.get<User[]>('/mutations/users', {
    params: {
      delay: options.delayMs,
      fail: options.shouldFail ? 1 : undefined,
    },
  });

  return response.data;
};

// Vad en rolländring behöver veta. Den ligger här och inte i modulen: det är
// formen på det som skickas till API:et, inte ett läge i en demo.
export type UpdateUserRolePayload = {
  id: string;
  role: string;
};

// Byter roll på en användare.
//
// shouldFail hör egentligen inte hemma i ett riktigt API - den finns för att
// demon om optimistisk uppdatering ska kunna beställa ett fel i stället för att
// vänta på otur. Samma undantag som för hämtningarna i users.ts.
export const updateMutationUserRole = async ({ id, role }: UpdateUserRolePayload, options: UserRequestOptions = {}): Promise<User> => {
  const response = await axiosClient.put<User>(
    `/mutations/users/${id}`,
    { role },
    {
      params: {
        delay: options.delayMs,
        fail: options.shouldFail ? 1 : undefined,
      },
    },
  );

  return response.data;
};
