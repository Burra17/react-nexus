import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import mutationUsersServiceSource from '../../../services/api/mutationUsers.ts?raw';
import handlersSource from '../../../services/mocks/handlers.ts?raw';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { OptimisticDemo } from '../components/optimisticDemo';
import optimisticDemoSource from '../components/optimisticDemo.tsx?raw';
import roleListSource from '../components/roleList.tsx?raw';
import { WithInvalidationDemo } from '../components/withInvalidationDemo';
import withInvalidationDemoSource from '../components/withInvalidationDemo.tsx?raw';
import { WithoutInvalidationDemo } from '../components/withoutInvalidationDemo';
import withoutInvalidationDemoSource from '../components/withoutInvalidationDemo.tsx?raw';
import useUpdateUserRoleSource from '../hooks/mutations/useUpdateUserRole.ts?raw';
import useUpdateUserRoleOptimisticSource from '../hooks/mutations/useUpdateUserRoleOptimistic.ts?raw';
import useUpdateUserRoleWithInvalidationSource from '../hooks/mutations/useUpdateUserRoleWithInvalidation.ts?raw';
import mutationUsersKeysSource from '../hooks/mutationUsersKeys.ts?raw';
import useFetchMutationUsersSource from '../hooks/queries/useFetchMutationUsers.ts?raw';
import { mutationsQuestions } from '../mutationsQuestions';

const Theory = () => (
  <>
    <Typography>
      Den här vyn handlar om att skriva till servern med biblioteket <strong>TanStack Query</strong>. Appen har en enda <code>QueryClient</code>,
      skapad en gång och given till hela komponentträdet, och den håller en cache med allt som hämtats. Det som ligger i cachen under en nyckel kallas
      en <strong>query</strong>: datan, läget den befinner sig i, och funktionen som kan hämta den igen. En komponent läser en query med hooken{' '}
      <code>useQuery</code>, och når själva klienten med <code>useQueryClient</code>. Det är på klienten funktionerna för att ändra i cachen sitter.
    </Typography>

    <Typography>
      En hämtning sköter sig själv: <code>useQuery</code> kör när komponenten monteras, och hämtar om när datan räknas som inaktuell. En skrivning gör
      ingenting förrän du säger till. Den hör till ett klick, ett formulär, ett beslut, och därför heter hooken <code>useMutation</code> och ger dig
      en funktion, <code>mutate</code>, att anropa i stället för att köra av sig själv. Lägena känns igen: <code>isPending</code> medan anropet pågår,{' '}
      <code>data</code> när det lyckats och <code>error</code> när det inte gjorde det, och <code>status</code> går från <code>pending</code> till{' '}
      <code>success</code> eller <code>error</code>. Ett ord betyder dock olika saker på de två hookarna. På en query är <code>isPending</code> sant
      så länge det inte finns någon data än, på en mutation så länge anropet pågår.
    </Typography>

    <Typography>
      Den verkliga skillnaden märks först efteråt. <strong>En lyckad skrivning säger ingenting till cachen.</strong> Servern har det nya värdet, men
      listan på skärmen kommer från en query som hämtades för en stund sedan, och ingen har talat om för den att den inte längre stämmer. Det ser ut
      som en bugg och är det inte. Det följer av att cachen är en kopia av något du inte äger. Antingen markerar du queryn som inaktuell med{' '}
      <code>invalidateQueries</code>, så att Query hämtar om den, eller så skriver du det nya värdet i cachen själv med <code>setQueryData</code>. Den
      första demon nedan gör ingetdera, med flit, så att du får se vad som faktiskt saknas. Den andra lägger till invalideringen, och den tredje visar{' '}
      <code>setQueryData</code> i en variant där värdet skrivs redan innan servern svarat.
    </Typography>

    <Typography>
      <code>invalidateQueries</code> returnerar ett löfte som uppfylls när omhämtningen är klar. Returnerar du det från mutationens callback väntar
      mutationen in hämtningen och står kvar som pending tills listan stämmer. Det är ett vanligt val i en app, eftersom knappen då säger att något
      pågår ända tills skärmen är rätt. Demona nedan returnerar det inte, med flit: då går mutationen till <code>success</code> i samma ögonblick som
      servern svarar, och hämtningen efteråt syns för sig. Det är just den ordningen som ska gå att se.
    </Typography>

    <Typography>
      <code>useMutation</code> skiljer sig också på en annan punkt: <strong>den har ingen nyckel</strong>. En <code>useQuery</code> identifieras av
      sin nyckel, och flera komponenter som frågar efter samma nyckel tittar på samma query. En mutation identifieras inte av någonting. Två
      komponenter som anropar samma mutationshook får varsin mutation med eget tillstånd, och den ena vet inte om att den andra sparar. Det som delas
      är i så fall ett och samma anrop av hooken: används dess resultat av två knappar, är det en mutation de delar. Det finns en{' '}
      <code>mutationKey</code>, men den delar inte heller tillstånd. Med den kan du ge alla mutationer med samma nyckel gemensamma
      standardinställningar, och leta upp pågående mutationer från en annan del av appen.
    </Typography>

    <Typography>
      Sedan kommer frågan om väntan. Ett anrop tar tid, och under den tiden kan gränssnittet antingen stå still eller <strong>hoppa i förväg</strong>.
      Att hoppa kallas en optimistisk uppdatering: du skriver det nya värdet i cachen innan servern svarat, i tron att det kommer att gå bra. Mönstret
      använder tre av mutationens callbacks, och var och en löser ett eget problem. <code>onMutate</code> kör innan anropet skickas. Den avbryter
      hämtningar av listan som redan är på väg, till exempel en som startade när fönstret fick fokus, så att ett gammalt svar inte skriver över
      hoppet. Sedan sparar den undan det som låg i cachen, en så kallad ögonblicksbild, och skriver dit det nya värdet. Ögonblicksbilden returneras,
      och Query skickar den vidare till de två andra. <code>onError</code> använder den för att rulla tillbaka om anropet misslyckas.{' '}
      <code>onSettled</code> kör oavsett hur det gick, och invaliderar listan så att den hämtas om.
    </Typography>

    <Typography>
      Att invalideringen ligger i <code>onSettled</code> och inte i <code>onSuccess</code> är den detalj som skiljer ett fungerande mönster från ett
      som nästan fungerar. Den andra demon klarar sig med <code>onSuccess</code>, eftersom den aldrig skriver i cachen själv: går anropet fel står
      listan orörd och är lika pålitlig som innan. Den optimistiska demon har däremot skrivit i cachen, och efter båda utfallen står där något
      klienten bestämt och inte servern. Vid ett lyckat anrop är det klientens gissning om vad servern sparade. Vid ett misslyckat är det
      ögonblicksbilden, och den kan vara äldre än det servern har nu: <code>onMutate</code> kan ha avbrutit en hämtning som var på väg med nyare data,
      och någon annan kan ha ändrat under tiden. Därför hämtas listan om i båda fallen.
    </Typography>

    <Typography>
      <strong>En not om versioner.</strong> I version 5 försvann <code>onSuccess</code>, <code>onError</code> och <code>onSettled</code> från{' '}
      <code>useQuery</code>, men de finns kvar på <code>useMutation</code>. Skrivsidan bytte också namn: det som nu heter <code>isPending</code> på en
      mutation hette <code>isLoading</code> i version 4. En äldre kodbas känns alltså igen på callbacks i sina queries och på <code>isLoading</code> i
      sina mutationer.
    </Typography>
  </>
);

export const MutationsPage = () => (
  <ConceptTemplate
    title='Mutations'
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            1. Servern sparade, skärmen märkte det inte
          </Typography>
          <WithoutInvalidationDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            2. Raden som saknades
          </Typography>
          <WithInvalidationDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            3. Hoppa i förväg, och rulla tillbaka
          </Typography>
          <OptimisticDemo />
        </Stack>
      </Stack>
    }
    // Ordningen följer sidans tre demor: varje demo står direkt före sin egen
    // mutationshook, så att paret går att läsa ihop. Det som delas av alla tre
    // står sist.
    sources={[
      {
        fileName: 'src/modules/mutations/components/withoutInvalidationDemo.tsx',
        code: withoutInvalidationDemoSource,
        language: 'tsx',
        // Att hooken anropas inne i knappen och inte i föräldern är vad som gör
        // de två knapparna oberoende.
        highlight: [
          'const RoleButton = ({ role }: RoleButtonProps) => {',
          'const { mutate, isPending, data, isError, error } = useUpdateUserRole();',
        ],
      },
      {
        fileName: 'src/modules/mutations/hooks/mutations/useUpdateUserRole.ts',
        code: useUpdateUserRoleSource,
        language: 'ts',
        // Hela hooken är tre rader, och det som saknas är det intressanta.
        highlight: ['mutationFn: (payload: UpdateUserRolePayload)'],
      },
      {
        fileName: 'src/modules/mutations/components/withInvalidationDemo.tsx',
        code: withInvalidationDemoSource,
        language: 'tsx',
        // Ett anrop av hooken som båda knapparna använder, till skillnad från
        // den första demon: båda blir inaktiva medan någon av dem sparar.
        highlight: ['const { mutate, isPending, data, variables } = useUpdateUserRoleWithInvalidation();', 'variables?.role === role'],
      },
      {
        fileName: 'src/modules/mutations/hooks/mutations/useUpdateUserRoleWithInvalidation.ts',
        code: useUpdateUserRoleWithInvalidationSource,
        language: 'ts',
        // Raden som saknades i den första demons hook.
        highlight: ['void queryClient.invalidateQueries({ queryKey: mutationUsersKeys'],
      },
      {
        fileName: 'src/modules/mutations/components/optimisticDemo.tsx',
        code: optimisticDemoSource,
        language: 'tsx',
        // Samma ändring, två utfall. Skillnaden står i en enda flagga.
        highlight: ['role: nextRole, shouldFail: false', 'role: nextRole, shouldFail: true'],
      },
      {
        fileName: 'src/modules/mutations/hooks/mutations/useUpdateUserRoleOptimistic.ts',
        code: useUpdateUserRoleOptimisticSource,
        language: 'ts',
        // De fyra raderna som utgör mönstret: avbryt, spara, skriv, rulla
        // tillbaka. Och så invalideringen som kör oavsett utfall.
        highlight: [
          'await queryClient.cancelQueries({ queryKey });',
          'const previousUsers = queryClient.getQueryData<User[]>(queryKey);',
          'queryClient.setQueryData(queryKey, onMutateResult.previousUsers);',
          'void queryClient.invalidateQueries({ queryKey });',
        ],
      },
      {
        fileName: 'src/modules/mutations/components/roleList.tsx',
        code: roleListSource,
        language: 'tsx',
        // Samma lista i alla tre delarna, men under varsin nyckel.
        highlight: ['useFetchMutationUsers(demo)'],
      },
      {
        fileName: 'src/modules/mutations/hooks/queries/useFetchMutationUsers.ts',
        code: useFetchMutationUsersSource,
        language: 'ts',
        // staleTime: Infinity är inte en optimering här utan det som gör
        // demonstrationerna mätbara.
        highlight: ['staleTime: Infinity,'],
      },
      {
        fileName: 'src/modules/mutations/hooks/mutationUsersKeys.ts',
        code: mutationUsersKeysSource,
        language: 'ts',
        // Demonstrationens namn står i nyckeln trots att det inte påverkar
        // svaret. Skälet står i filen.
        highlight: ['list: (demo: MutationDemo) =>'],
      },
      {
        fileName: 'src/services/api/mutationUsers.ts',
        code: mutationUsersServiceSource,
        language: 'ts',
        // Skrivningen. Servicen innehåller ingen React. Den tar en nyttolast
        // och returnerar typad data.
        highlight: ['export const updateMutationUserRole'],
      },
      {
        fileName: 'src/services/mocks/handlers.ts',
        code: handlersSource,
        language: 'ts',
        // Modulens egen datamängd, och den enda handlern i filen som ändrar
        // något.
        highlight: ['const MUTATION_USERS', "http.put('/api/mutations/users/:id'", 'MUTATION_USERS[user.id] = { ...user, role };'],
      },
    ]}
    quiz={mutationsQuestions}
  />
);
