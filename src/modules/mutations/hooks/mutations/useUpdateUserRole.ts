import { useMutation } from '@tanstack/react-query';
import type { UpdateUserRolePayload } from '../../../../services/api/mutationUsers';
import { updateMutationUserRole } from '../../../../services/api/mutationUsers';
import { RESPONSE_DELAY_MS } from '../queries/responseDelay';

// AVSIKTLIGT OFULLSTÄNDIG. Kopiera inte den här hooken.
//
// Den skickar rolländringen till servern och gör ingenting mer. Servern sparar,
// anropet syns i Network-fliken, mutationen går till success - och vyn står
// kvar och visar den gamla rollen.
//
// Skälet är pedagogiskt, och samma som bakom raceConditionDemo i modul 3: utan
// den här hooken står invalideringen i nästa demo som en rad man skriver för
// att alla andra gör det. Med den är den ett svar på något läsaren precis sett
// gå fel.
//
// Det som saknas är en enda rad, och den står i useUpdateUserRoleWithInvalidation.
//
// Notera också vad hooken INTE har: någon nyckel. En useQuery identifieras av
// sin queryKey och delas av alla som frågar efter samma - det var hela modul 8.
// En useMutation har ingen. Två komponenter som anropar den här hooken får
// varsitt oberoende tillstånd, och bara den man klickar på blir isPending.
// mutationKey finns som valfri inställning, men den är till för
// setMutationDefaults och useMutationState - inte för att dela tillstånd.
export const useUpdateUserRole = () =>
  useMutation({
    mutationFn: (payload: UpdateUserRolePayload) => updateMutationUserRole(payload, { delayMs: RESPONSE_DELAY_MS }),
  });
