import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../../../services/api/users';
import { sharedUsersKeys } from '../usersKeys';
import { SHARING_DEMO } from './requestDemos';
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
// konsument som monteras en hämtning i bakgrunden. Det femte kortet hade gett
// ett anrop i stället för noll. Uppmätt, inte antaget.
//
// Att sätta den är också det normala i en riktig app. staleTime är tiden datan
// räknas som färsk, och de två klockor som styr färskhet och bortkastning gås
// igenom i vyn Query: grunder.
const STALE_TIME_MS = 30_000;

// retry: false stänger av omförsöken. Query gör annars tre nya försök när ett
// anrop misslyckas, och då skulle räknaren i demon visa fyra anrop för en enda
// misslyckad hämtning. Varje hook i vyn sätter den av samma skäl.
export const useFetchSharedUsers = () =>
  useQuery({
    queryKey: sharedUsersKeys.list(),
    queryFn: () => getUsers({ delayMs: RESPONSE_DELAY_MS, demo: SHARING_DEMO }),
    staleTime: STALE_TIME_MS,
    retry: false,
  });
