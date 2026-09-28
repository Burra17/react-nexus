import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../../../services/api/users';
import { architectureKeys } from '../architectureKeys';

// Fördröjningen finns för att de fyra stegen ska hinna synas var för sig.
//
// Utan den kommer svaret så snabbt att steg 2 och 3 tänds i samma ögonblick,
// och panelen visar en lista i stället för ett förlopp.
const RESPONSE_DELAY_MS = 900;

// Hämtningen som demon spårar.
//
// Hooken är med flit oremarkabel. Den ser ut precis som useFetchUsers i modul
// 8, och det är poängen. Det som demonstreras är inte den här filen utan
// kedjan den ingår i.
//
// enabled: false gör att ingenting händer förrän läsaren trycker på knappen.
// En hämtning som redan skett innan man tittar går inte att spåra.
//
// gcTime: 0 tar bort posten så fort ingen tittar på den, så att varje tryck
// börjar från ett tomt läge. Utan den skulle andra trycket ha data i cachen
// redan, och steg 1 och 4 skulle inte betyda samma sak som första gången.
export const useFetchArchitectureUsers = () =>
  useQuery({
    queryKey: architectureKeys.trace(),
    queryFn: () => getUsers({ delayMs: RESPONSE_DELAY_MS }),
    enabled: false,
    gcTime: 0,
    retry: false,
  });
