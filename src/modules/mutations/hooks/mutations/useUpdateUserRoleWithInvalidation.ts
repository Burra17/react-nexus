import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateUserRolePayload } from '../../../../services/api/mutationUsers';
import { updateMutationUserRole } from '../../../../services/api/mutationUsers';
import { mutationUsersKeys } from '../mutationUsersKeys';
import { RESPONSE_DELAY_MS } from '../queries/responseDelay';

// Samma mutation som i del 1, plus den rad som saknades.
//
// onSuccess kör när servern svarat att det gick bra. invalidateQueries gör två
// saker med de poster nyckeln träffar, och det är värt att hålla isär dem:
//
// 1. Posten markeras som inaktuell. Det läget åsidosätter staleTime, vilket är
//    varför det fungerar trots att listan står på Infinity.
// 2. Renderas posten av en monterad komponent hämtas den om i bakgrunden.
//
// invalidateQueries skriver alltså inte det nya värdet i cachen. Den säger att
// det som ligger där inte längre går att lita på, och låter Query hämta
// sanningen från servern. Skillnaden märks först i nästa demo: en optimistisk
// uppdatering skriver i cachen, en invalidering gör det aldrig.
//
// Varför onSuccess och inte onSettled här: den här mutationen ändrar ingenting
// i cachen på egen hand. Går anropet fel ligger den gamla listan kvar och är
// fortfarande korrekt, så det finns inget att hämta om. I nästa demo är det
// tvärtom, och då byter raden plats.
export const useUpdateUserRoleWithInvalidation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserRolePayload) => updateMutationUserRole(payload, { delayMs: RESPONSE_DELAY_MS }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mutationUsersKeys.list('medInvalidering') }),
  });
};
