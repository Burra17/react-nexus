import { useQuery } from '@tanstack/react-query';
import { getMutationUsers } from '../../../../services/api/mutationUsers';
import type { MutationDemo } from '../mutationUsersKeys';
import { mutationUsersKeys } from '../mutationUsersKeys';
import { RESPONSE_DELAY_MS } from './responseDelay';

// Hämtar listan för en av sidans tre demonstrationer.
//
// staleTime är tiden datan räknas som färsk. Infinity är inte en optimering
// här, det är vad som gör demonstrationerna mätbara.
//
// Query hämtar om inaktuell data på egen hand i två lägen: när fönstret får
// fokus igen, och när en komponent som visar den monteras. Med standardvärdet
// staleTime: 0 är datan inaktuell direkt, så en läsare som klickar bort till en
// annan flik och tillbaka får se listan uppdatera sig själv, i den demo vars
// hela poäng är att den INTE gör det utan invalidering.
//
// Det är uppmätt och inte befarat: innan orsaken var hittad sköt
// fokushämtningen iväg fyra anrop, fyra gånger i rad.
//
// refetchOnWindowFocus: false hade räckt mot just flikväxlingen, men lämnat
// monteringen öppen. Infinity stänger båda: datan blir aldrig inaktuell av sig
// själv, och det enda som kan uppdatera vyn är något läsaren gjort.
//
// Invalidering fungerar ändå. Dokumentationen är uttrycklig om att det
// inaktuella läget en invalidering sätter väger tyngre än staleTime. Annars
// hade den andra och tredje demon inte kunnat visa någonting.
//
// retry: false stänger av omförsöken. En query försöker annars tre gånger till
// när en hämtning misslyckas, och då skulle räknaren visa fyra anrop för ett.
export const useFetchMutationUsers = (demo: MutationDemo) =>
  useQuery({
    queryKey: mutationUsersKeys.list(demo),
    queryFn: () => getMutationUsers({ delayMs: RESPONSE_DELAY_MS, demo }),
    staleTime: Infinity,
    retry: false,
  });
