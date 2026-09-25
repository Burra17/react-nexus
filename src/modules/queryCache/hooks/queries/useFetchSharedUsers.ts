import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../../../services/api/users';
import { sharedUsersKeys } from '../usersKeys';
import { RESPONSE_DELAY_MS } from './responseDelay';

// Hämtar listan åt delningsdemon.
//
// Den är nästan identisk med useFetchUsers, och det är avsiktligt. Skillnaden
// är nyckeln: den här ligger utanför usersKeys.all, så att invalideringsdemon
// längre ner inte påverkar korten och tvärtom. Skälet står utskrivet i
// nyckelfilen.
//
// Att bryta ut det gemensamma vore fel väg här. De två hookarna finns för att
// hållas isär, och en delad hook med nyckeln som parameter hade gjort just det
// som skiljer dem till något man måste leta efter.

// Färsk i en halv minut, till skillnad från standardens noll.
//
// Det är inte kosmetika utan en förutsättning för det demon påstår. Med
// staleTime 0 räknas posten som inaktuell direkt, och då utlöser varje ny
// konsument som monteras en hämtning i bakgrunden - det femte kortet hade gett
// ett anrop i stället för noll. Uppmätt, inte antaget.
//
// Att sätta den här är också det normala i en riktig app, och det knyter an
// till förra modulen: staleTime är tiden datan räknas som färsk.
const STALE_TIME_MS = 30_000;

export const useFetchSharedUsers = () =>
  useQuery({
    queryKey: sharedUsersKeys.list(),
    queryFn: () => getUsers({ delayMs: RESPONSE_DELAY_MS }),
    staleTime: STALE_TIME_MS,
    retry: false,
  });
