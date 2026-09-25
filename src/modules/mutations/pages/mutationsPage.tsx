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
      De två föregående modulerna handlade om att hämta. Nu ska något skickas åt andra hållet, och det första som händer är att en bekvämlighet
      försvinner. En hämtning sköter sig själv: <code>useQuery</code> kör när komponenten monteras, och Query bestämmer när det är dags igen. En
      skrivning gör ingenting förrän du säger till. Den hör till ett klick, ett formulär, ett beslut — och därför heter hooken{' '}
      <code>useMutation</code> och ger dig en funktion att anropa i stället för att köra av sig själv. Allt annat i den är sig likt:{' '}
      <code>isPending</code> medan den arbetar, <code>data</code> när den lyckats, <code>error</code> när den inte gjorde det.
    </Typography>

    <Typography>
      Den verkliga skillnaden märks först efteråt. <strong>En lyckad skrivning säger ingenting till cachen.</strong> Servern har det nya värdet, men
      listan på skärmen kommer från en post som hämtades för en stund sedan, och ingen har talat om för den att den inte längre stämmer. Det ser ut
      som en bugg och är det inte — det följer av att cachen är en kopia av något du inte äger. Antingen talar du om att kopian är inaktuell med{' '}
      <code>invalidateQueries</code>, och låter Query hämta sanningen, eller så skriver du det nya värdet i kopian själv med <code>setQueryData</code>
      . Första demon nedan gör ingetdera, med flit, så att du får se vad som faktiskt saknas.
    </Typography>

    <Typography>
      <code>useMutation</code> skiljer sig också på en punkt som är lätt att ta för given efter förra modulen: <strong>den har ingen nyckel</strong>.
      En <code>useQuery</code> identifieras av sin <code>queryKey</code>, och fyra komponenter som frågar efter samma nyckel delar en enda post — det
      var hela poängen med cachen. En mutation identifieras inte av någonting. Två komponenter som anropar samma mutationshook får varsitt oberoende
      tillstånd, och den ena vet inte om att den andra sparar. Det finns en <code>mutationKey</code>, men den delar inte tillstånd; den finns för att
      kunna sätta standardvärden och för att kunna hitta pågående mutationer utifrån.
    </Typography>

    <Typography>
      Sedan kommer frågan om väntan. Ett anrop tar tid, och under den tiden kan gränssnittet antingen stå still eller <strong>hoppa i förväg</strong>.
      Att hoppa kallas en optimistisk uppdatering: du skriver det nya värdet i cachen innan servern svarat, i tron att det kommer att gå bra. Mönstret
      har tre delar, och var och en löser ett eget problem. <code>onMutate</code> kör före anropet, avbryter pågående hämtningar så att ett svar på
      väg inte skriver över hoppet, sparar undan det som låg i cachen, och skriver dit det nya. Det den returnerar skickas vidare till de andra.{' '}
      <code>onError</code> använder det sparade för att rulla tillbaka — utan ögonblicksbilden finns ingenting att rulla tillbaka till. Och{' '}
      <code>onSettled</code> kör oavsett hur det gick och hämtar sanningen från servern.
    </Typography>

    <Typography>
      Att invalideringen ligger just i <code>onSettled</code> och inte i <code>onSuccess</code> är den detalj som skiljer ett fungerande mönster från
      ett som nästan fungerar. Efter ett misslyckat hopp står cachen på ett värde som klienten skrivit och sedan rullat tillbaka med egen kod — det
      har aldrig kontrollerats mot servern. <code>onSuccess</code> hoppar över precis det fallet, alltså det enda där kontrollen verkligen behövs. En
      versionsnot på köpet: <code>onSuccess</code> och <code>onError</code> togs bort från <code>useQuery</code> i version 5 men finns kvar på{' '}
      <code>useMutation</code>. En kodbas på version 4 ser därför likadan ut på skrivsidan och helt annorlunda på läsidan, vilket är värt att veta
      innan man drar slutsatser om vilken version man har framför sig.
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
    // Ordningen följer sidans tre delar: varje demo står direkt före sin egen
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
        fileName: 'src/modules/mutations/hooks/mutations/useUpdateUserRoleWithInvalidation.ts',
        code: useUpdateUserRoleWithInvalidationSource,
        language: 'ts',
        // Raden som saknades i förra filen.
        highlight: ['onSuccess: () => queryClient.invalidateQueries('],
      },
      {
        fileName: 'src/modules/mutations/hooks/mutations/useUpdateUserRoleOptimistic.ts',
        code: useUpdateUserRoleOptimisticSource,
        language: 'ts',
        // De fyra raderna som utgör mönstret: avbryt, spara, skriv, rulla
        // tillbaka - och invalideringen som kör oavsett utfall.
        highlight: [
          'await queryClient.cancelQueries({ queryKey });',
          'const previousUsers = queryClient.getQueryData<User[]>(queryKey);',
          'queryClient.setQueryData(queryKey, onMutateResult.previousUsers);',
          'onSettled: () => queryClient.invalidateQueries({ queryKey }),',
        ],
      },
      {
        fileName: 'src/modules/mutations/components/withInvalidationDemo.tsx',
        code: withInvalidationDemoSource,
        language: 'tsx',
        // En delad mutation, till skillnad från del 1: båda knapparna blir
        // inaktiva medan någon av dem sparar.
        highlight: ['const { mutate, isPending, data } = useUpdateUserRoleWithInvalidation();'],
      },
      {
        fileName: 'src/modules/mutations/components/optimisticDemo.tsx',
        code: optimisticDemoSource,
        language: 'tsx',
        // Samma ändring, två utfall. Skillnaden står i en enda flagga.
        highlight: ['role: nextRole, shouldFail: false', 'role: nextRole, shouldFail: true'],
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
        fileName: 'src/modules/mutations/components/roleList.tsx',
        code: roleListSource,
        language: 'tsx',
        // Samma lista i alla tre delarna, men under varsin nyckel.
        highlight: ['useFetchMutationUsers(demo)'],
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
        // Skrivningen. Servicen innehåller ingen React - den tar en nyttolast
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
