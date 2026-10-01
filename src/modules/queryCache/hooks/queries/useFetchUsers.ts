import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../../../services/api/users';
import { usersKeys } from '../usersKeys';
import { INVALIDATION_DEMO } from './requestDemos';
import { RESPONSE_DELAY_MS } from './responseDelay';

// Hämtar listan med användare.
//
// Hooken ser ut precis som vilken useQuery som helst, och det är poängen. Allt
// som demon visar följer av att de använder samma nyckel: att fyra kort ger ett
// anrop, att ett femte kort fylls direkt, att en invalidering får alla att hämta
// om. Ingenting av det behöver skrivas in någonstans.
export const useFetchUsers = () =>
  useQuery({
    queryKey: usersKeys.lists(),
    queryFn: () => getUsers({ delayMs: RESPONSE_DELAY_MS, demo: INVALIDATION_DEMO }),
    retry: false,
  });
