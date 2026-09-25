import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateUserRolePayload } from '../../../../services/api/mutationUsers';
import { updateMutationUserRole } from '../../../../services/api/mutationUsers';
// User bor i users.ts och delas av båda resurserna - se kommentaren i
// mutationUsers.ts om varför typen inte kopierades.
import type { User } from '../../../../services/api/users';
import { mutationUsersKeys } from '../mutationUsersKeys';
import { RESPONSE_DELAY_MS } from '../queries/responseDelay';

// Vad demon skickar in. shouldFail hör till demonstrationen och inte till
// rolländringen, därför ligger den bredvid nyttolasten och inte i den.
export type OptimisticRoleVariables = UpdateUserRolePayload & {
  shouldFail: boolean;
};

// Samma mutation, men vyn väntar inte på servern.
//
// Mönstret har tre delar, och var och en löser ett eget problem:
//
// onMutate kör INNAN anropet går iväg. Den avbryter pågående hämtningar,
// sparar undan det som ligger i cachen, och skriver dit det nya värdet. Det
// den returnerar skickas vidare till onError och onSettled.
//
// onError rullar tillbaka till det sparade. Utan ögonblicksbilden finns inget
// att rulla tillbaka TILL - det är hela skälet till att onMutate returnerar
// något.
//
// onSettled kör oavsett hur det gick, och hämtar sanningen från servern.
export const useUpdateUserRoleOptimistic = () => {
  const queryClient = useQueryClient();

  const queryKey = mutationUsersKeys.list('optimistisk');

  return useMutation({
    mutationFn: ({ shouldFail, ...payload }: OptimisticRoleVariables) => updateMutationUserRole(payload, { delayMs: RESPONSE_DELAY_MS, shouldFail }),

    onMutate: async ({ id, role }) => {
      // Utan den här raden kan en hämtning som redan är på väg landa EFTER vår
      // optimistiska skrivning och skriva över den med det gamla värdet. Att
      // avbryta den är inte en försiktighetsåtgärd, det är vad som gör
      // ordningen förutsägbar.
      await queryClient.cancelQueries({ queryKey });

      const previousUsers = queryClient.getQueryData<User[]>(queryKey);

      queryClient.setQueryData<User[]>(queryKey, (current) => current?.map((user) => (user.id === id ? { ...user, role } : user)));

      // Returvärdet är ögonblicksbilden. Query skickar det vidare som TREDJE
      // argument till onSuccess, onError och onSettled.
      return { previousUsers };
    },

    // Tredje argumentet är det onMutate returnerade. Dokumentationen kallar det
    // numera onMutateResult; äldre material och v4-kod kallar samma värde för
    // context. Det är inte bara ett namnbyte att hålla reda på: i v5 finns nu
    // ETT FJÄRDE argument som faktiskt heter context, och det är något helt
    // annat - { client, meta, mutationKey }. Läser man ett gammalt exempel och
    // tar fjärde platsen i tron att det är ögonblicksbilden får man tyst fel
    // värde.
    onError: (_error, _variables, onMutateResult) => {
      // Villkoret finns för att en rollback till undefined vore värre än ingen
      // rollback: den hade tömt listan i stället för att återställa den.
      if (onMutateResult?.previousUsers) {
        queryClient.setQueryData(queryKey, onMutateResult.previousUsers);
      }
    },

    // Här, och inte i onSuccess. Efter ett misslyckat försök står cachen på
    // något klienten själv skrivit och sedan rullat tillbaka - ett värde som
    // aldrig kontrollerats mot servern. onSuccess hade hoppat över just det
    // fallet, alltså det enda fall där cachen faktiskt behöver kontrolleras.
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
};
