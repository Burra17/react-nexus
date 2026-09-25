import { useQuery } from '@tanstack/react-query';
import { getMutationUsers } from '../../../../services/api/mutationUsers';
import type { MutationDemo } from '../mutationUsersKeys';
import { mutationUsersKeys } from '../mutationUsersKeys';
import { RESPONSE_DELAY_MS } from './responseDelay';

// Hämtar listan för en av sidans tre demonstrationer.
//
// staleTime: Infinity är inte en optimering här, det är vad som gör
// demonstrationerna mätbara.
//
// refetchOnWindowFocus är på som standard, och den hämtar om allt som räknas
// som inaktuellt så fort fliken får fokus igen. Med standardvärdet staleTime: 0
// är en post inaktuell direkt, så en läsare som klickar bort till editorn och
// tillbaka får se listan uppdatera sig själv - i den demo vars hela poäng är
// att den INTE gör det utan invalidering.
//
// Det är uppmätt och inte befarat: under mätningarna i #108 sköt fokusrefetchen
// iväg fyra anrop, fyra gånger i rad, innan orsaken var hittad.
//
// refetchOnWindowFocus: false hade räckt mot just flikväxlingen, men lämnat
// omonteringen öppen. Infinity stänger båda: posten blir aldrig inaktuell av
// sig själv, och det enda som kan uppdatera vyn är något läsaren gjort.
//
// Invalidering fungerar ändå. Dokumentationen är uttrycklig om att det
// inaktuella läget en invalidering sätter åsidosätter staleTime - annars hade
// del 2 och 3 inte kunnat visa någonting.
export const useFetchMutationUsers = (demo: MutationDemo) =>
  useQuery({
    queryKey: mutationUsersKeys.list(demo),
    queryFn: () => getMutationUsers({ delayMs: RESPONSE_DELAY_MS }),
    staleTime: Infinity,
    retry: false,
  });
