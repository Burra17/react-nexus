import { useQuery } from '@tanstack/react-query';
import { getUser } from '../../../../services/api/users';
import { usersKeys } from '../usersKeys';

type FetchCachedUserArgs = {
  id: string;
  staleTimeMs: number;
  gcTimeMs: number;
};

// Svarstiden är fast och ligger här, inte i ett reglage.
//
// Den behövs för att laddningsläget ska hinna synas när cacheposten städats
// bort - annars blinkar det förbi, och just det läget är hela poängen med det
// tredje utfallet. Men den ska inte gå att ändra: demon handlar om tiden efter
// att svaret kommit, och ett reglage till hade bara gett en sak till att skylla
// på när något ser oväntat ut.
const RESPONSE_DELAY_MS = 600;

// Hämtar en användare med styrbara klockor.
//
// Det finns redan en useFetchUser i samma mapp, och den återanvänds med flit
// inte. Skälet är inte att koden skulle bli kortare av en till - CLAUDE.md
// bryter ut vid tredje förekomsten och inte andra - utan Kod-delen: useFetchUser
// visas som ett av den första demons block, mitt i lektionen om queryKey, och
// två valfria tidsinställningar där hade gjort det blocket svårare att läsa för
// en sak som inte hör dit.
//
// Den här hooken visas i sin egen demos block, där staleTime och gcTime ÄR
// lektionen och allt annat är kuliss.
//
// Nyckeln kommer från en egen gren i fabriken. Skälet står där: utan den håller
// den första demon cacheposten vid liv och gcTime hinner aldrig ticka.
//
// retry: false av samma skäl som i den första demon - standardens tre försök gör
// att ett fel tar flera sekunder att visa sig, och då ser demon hängd ut.
export const useFetchCachedUser = ({ id, staleTimeMs, gcTimeMs }: FetchCachedUserArgs) =>
  useQuery({
    queryKey: usersKeys.clock(id),
    queryFn: () => getUser(id, { delayMs: RESPONSE_DELAY_MS }),
    staleTime: staleTimeMs,
    gcTime: gcTimeMs,
    retry: false,
  });
