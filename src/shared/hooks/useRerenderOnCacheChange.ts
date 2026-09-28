import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

// En sammanfattning av allt panelerna faktiskt visar.
//
// Nyckeln, statusen, färskheten och antalet som tittar - inget annat. Två
// avläsningar som ger samma sträng betyder att ingenting som syns har ändrats,
// och då behöver ingenting ritas om.
const buildSignature = (queryClient: QueryClient) =>
  queryClient
    .getQueryCache()
    .getAll()
    .map((query) => `${query.queryHash}:${query.state.status}:${query.isStale()}:${query.observers.length}`)
    .join('|');

// Ritar om den som anropar den när något i cachen faktiskt har ändrats.
//
// Låg i modulen om cachen tills modulen om mutationer behövde den. Då flyttades
// den hit i stället för att kopieras: en hook som två moduler använder hör
// hemma i shared/hooks, och två kopior driver isär första gången den ena rättas.
//
// Hooken returnerar ingenting med flit. Allt den gör är en biverkan - en
// omrendering - och ett returvärde hade lovat ett tillstånd att läsa, som ingen
// anropare har användning för.
//
// VARFÖR useSyncExternalStore OCH INTE useState PLUS useEffect:
//
// Cachen är ett tillstånd som lever utanför React och ändras när som helst.
// Att prenumerera på den med en effekt och svara med setState ser enklare ut,
// men går sönder på två sätt som båda uppstod här under bygget:
//
// 1. En omrendering uppdaterar query-hookarnas observers, och det är i sig en
//    händelse i cachen. Svarar man på varje händelse med setState blir det en
//    loop som React bryter med "Maximum update depth exceeded". Symptomet var
//    att sidan inte gick att lämna - adressen ändrades när man klickade i
//    menyn, men vyn hann aldrig ritas om.
// 2. Händelsen kan komma medan React renderar en annan komponent, och då blir
//    det "Cannot update a component while rendering a different component".
//
// useSyncExternalStore är byggd för precis det här: React sköter
// prenumerationen och läser av tillståndet vid ett tillfälle den själv väljer.
// Signaturen gör att avläsningen är stabil - samma sträng när ingenting ändrats
// - vilket är hookens enda krav.
export const useRerenderOnCacheChange = () => {
  const queryClient = useQueryClient();

  useSyncExternalStore(
    (onStoreChange) => queryClient.getQueryCache().subscribe(onStoreChange),
    () => buildSignature(queryClient),
  );
};
