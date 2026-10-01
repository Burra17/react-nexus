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
// Hooken anropar servicen direkt i queryFn, utan någon funktion emellan.
// Behöver svaret bearbetas görs det i servicen, så att hooken bara säger vad
// som ska hämtas och under vilken nyckel.
//
// retry: false är ett medvetet val för demon och inte hur du normalt skriver en
// query. Standarden är tre omförsök med växande paus emellan, vilket är rimligt
// mot ett riktigt API men gör att felläget här tar flera sekunder att visa sig,
// och då ser demon hängd ut i stället för trasig, vilket är sämre.
//
// De globala standardvärdena på QueryClient är orörda med flit. Allt som är en
// del av lektionen sätts här, där det syns bredvid det som påverkas.
export const useFetchUser = ({ id, delayMs, shouldFail }: FetchUserArgs) =>
  useQuery({
    queryKey: usersKeys.detail(id, shouldFail),

    // skipToken stänger av hämtningen så länge ingen användare är vald. Queryn
    // finns, men den kör inte: status blir 'pending' medan fetchStatus är
    // 'idle', vilket är exakt den kombination som visar att de två fälten
    // svarar på olika frågor.
    //
    // Det vanligare sättet att stänga av är enabled: false. skipToken gör samma
    // sak men också för TypeScript: här vet kompilatorn att queryFn aldrig körs
    // utan ett id. Med enabled hade id fått skrivas som id!, en typassertion som
    // lovar kompilatorn att värdet inte är null utan att den kan kontrollera
    // det.
    //
    // Svaret bär med sig vilken fördröjning anropet kördes med.
    //
    // Fördröjningen står inte i nyckeln, så reglagets värde och det som gällde
    // vid hämtningen kan skilja sig åt, och just den skillnaden är vad demon
    // vill visa. Värdet hör därför till svaret: det beskriver hur den här datan
    // hämtades, och ska cachas tillsammans med den.
    //
    // En ref hade inte fungerat. Den läses under renderingen, men en ändring av
    // den utlöser ingen omrendering, så panelen hade kunnat visa ett inaktuellt
    // värde.
    queryFn:
      id === null
        ? skipToken
        : async () => ({
            user: await getUser(id, { delayMs, shouldFail }),
            usedDelayMs: delayMs,
          }),

    retry: false,
  });
