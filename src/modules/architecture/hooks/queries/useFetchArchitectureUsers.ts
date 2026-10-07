import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../../../services/api/users';
import { architectureKeys } from '../architectureKeys';

// Fördröjningen finns för att de fyra stegen ska hinna synas var för sig.
//
// Utan den kommer svaret så snabbt att steg 2 och 3 tänds i samma ögonblick,
// och demon visar en lista i stället för ett förlopp.
const RESPONSE_DELAY_MS = 900;

// Hämtningen som demon spårar.
//
// Hooken är med flit vanlig. Den ser ut som de andra vyernas hookar för
// användare, och det är poängen: det som demonstreras är inte den här filen
// utan kedjan den ingår i. Den är ingen kopia i den mening regeln om att
// flytta och inte kopiera avser, eftersom inställningarna nedan är dess egna
// och servicen den anropar är densamma som de andras.
//
// enabled: false gör att ingenting händer förrän läsaren trycker på knappen.
// En hämtning som redan skett innan man tittar går inte att spåra.
//
// gcTime: 0 tar bort posten ur cachen så fort ingen komponent visar den. Så
// länge demon syns står svaret kvar, men lämnar man vyn och kommer tillbaka
// börjar demon tom igen.
//
// retry: false stänger av omförsöken. Query försöker annars igen tre gånger
// när en hämtning misslyckas, och då hade ett fel dröjt innan det syntes.
export const useFetchArchitectureUsers = () =>
  useQuery({
    queryKey: architectureKeys.trace(),
    queryFn: () => getUsers({ delayMs: RESPONSE_DELAY_MS }),
    enabled: false,
    gcTime: 0,
    retry: false,
  });
