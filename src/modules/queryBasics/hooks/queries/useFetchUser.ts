import { skipToken, useQuery } from '@tanstack/react-query';
import { getUser } from '../../../../services/api/users';
import { usersKeys } from '../usersKeys';

type FetchUserArgs = {
  // null betyder att ingen användare är vald än. Då görs ingen hämtning.
  id: string | null;
  delayMs: number;
  shouldFail: boolean;
};

// Hämtar en användare och håller svaret i cachen.
//
// Hooken anropar servicen direkt i queryFn. Behöver svaret bearbetas hör det
// hemma i servicen - ett lager emellan som bara vidarebefordrar ser ut som
// arkitektur utan att vara det.
//
// retry: false är ett medvetet val för demon och inte hur du normalt skriver en
// query. Standarden är tre försök med växande paus emellan, vilket är rimligt
// mot ett riktigt API men gör att felläget här tar flera sekunder att visa sig -
// och då ser demon hängd ut i stället för trasig, vilket är sämre.
//
// De globala standardvärdena på QueryClient är orörda med flit. Allt som är en
// del av lektionen sätts här, där det syns bredvid det som påverkas.
export const useFetchUser = ({ id, delayMs, shouldFail }: FetchUserArgs) =>
  useQuery({
    queryKey: usersKeys.detail(id, shouldFail),

    // skipToken pausar hämtningen så länge ingen användare är vald. Queryn
    // finns, men den kör inte: status blir 'pending' medan fetchStatus är
    // 'idle', vilket är exakt den kombination som visar att de två fälten
    // svarar på olika frågor.
    //
    // Det vanligare sättet att pausa är enabled: false. skipToken gör samma sak
    // men också för TypeScript: här vet kompilatorn att queryFn aldrig körs utan
    // ett id, medan enabled hade krävt en typassertion - och en assertion som
    // lovar något kompilatorn inte kan kontrollera är precis vad modul 4 varnar
    // för.
    // Svaret bär med sig vilken fördröjning anropet kördes med.
    //
    // Fördröjningen står inte i nyckeln, så reglagets värde och det som gällde
    // vid hämtningen kan skilja sig åt - och just den skillnaden är vad demon
    // vill visa. Värdet hör därför till svaret: det beskriver hur den här datan
    // hämtades, och ska cachas tillsammans med den.
    //
    // Ett första försök sparade det i en ref i stället. Det stoppades av
    // lintregeln react-hooks/refs, med rätta: en ref som läses under
    // renderingen kan hinna bli inaktuell, eftersom en ändring av den inte
    // utlöser någon omrendering.
    queryFn:
      id === null
        ? skipToken
        : async () => ({
            user: await getUser(id, { delayMs, shouldFail }),
            usedDelayMs: delayMs,
          }),

    retry: false,
  });
