import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import usersServiceSource from '../../../services/api/users.ts?raw';
import handlersSource from '../../../services/mocks/handlers.ts?raw';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { CacheInspector } from '../components/cacheInspector';
import cacheInspectorSource from '../components/cacheInspector.tsx?raw';
import { InvalidationDemo } from '../components/invalidationDemo';
import invalidationDemoSource from '../components/invalidationDemo.tsx?raw';
import { SharedCacheDemo } from '../components/sharedCacheDemo';
import sharedCacheDemoSource from '../components/sharedCacheDemo.tsx?raw';
import userListCardSource from '../components/userListCard.tsx?raw';
import useFetchSharedUsersSource from '../hooks/queries/useFetchSharedUsers.ts?raw';
import useFetchUserSource from '../hooks/queries/useFetchUser.ts?raw';
import useFetchUsersSource from '../hooks/queries/useFetchUsers.ts?raw';
import useRerenderOnCacheChangeSource from '../../../shared/hooks/useRerenderOnCacheChange.ts?raw';
import usersKeysSource from '../hooks/usersKeys.ts?raw';
import { queryCacheQuestions } from '../queryCacheQuestions';

const Theory = () => (
  <>
    <Typography>
      Förra modulen byggde på en regel: en konsument, en nyckel. Den var inte hela sanningen utan en avgränsning — ett sätt att visa lägena och
      nyckeln utan att allt annat hände samtidigt. Nu tas den bort, och det som återstår är det som gör en cache till något annat än ett kortare sätt
      att skriva en hämtning. Du lärde dig att nyckeln identifierar datan och inte komponenten som råkade hämta den. Här får du se vad det faktiskt
      innebär.
    </Typography>

    <Typography>
      Det innebär att <strong>datan är delad</strong>. Nyckeln är en adress i appens cache, inte i din komponent, och alla som frågar efter samma
      adress får samma post. Monterar du fyra komponenter som alla vill visa listan går det iväg <em>ett</em> anrop — de tre andra hittar en hämtning
      som redan pågår och hakar på den. När svaret kommer ritas alla fyra om samtidigt, eftersom de tittar på samma sak. Lägger du till en femte
      komponent efteråt sker ingen hämtning alls: posten finns redan, och den fylls direkt. Det kallas dedupering, och det är skillnaden mellan en
      lista som kostar ett anrop och en lista som kostar ett anrop per ställe den visas på.
    </Typography>

    <Typography>
      Nästa fråga blir hur man säger att något inte gäller längre. Svaret är <strong>invalidering</strong>, och den skiljer sig från att hämta om på
      ett sätt som är lätt att missa: du talar inte om <em>vem</em> som ska hämta, bara att datan är inaktuell. Query avgör resten — poster som någon
      tittar på hämtas om direkt, poster som ingen tittar på får vänta tills de efterfrågas igen. Datan ligger kvar under tiden, så skärmen blir
      aldrig tom. Och märkningen arbetar med <strong>prefix</strong>: en kort nyckel träffar allt som börjar likadant. Det är hela skälet till att
      nycklarna byggs i en fabrik där de staplas ovanpå varandra — med <code>usersKeys.all</code> invaliderar du resursens allt, med{' '}
      <code>usersKeys.lists()</code> bara listorna, och du behöver aldrig minnas vilka nycklar som finns. Kontrasten är <code>refetch()</code>, som
      ber en bestämd query att hämta om oavsett om den räknas som färsk. Det är ett hammarslag; invalidering är ett meddelande.
    </Typography>

    <Typography>
      Eftersom cachen är appens och inte vyns går den att titta i, och det är värt att göra en vana av. Panelen nedan listar varje post med sin
      nyckel, sin status, om den räknas som färsk och hur många komponenter som tittar på den just nu. Har du besökt en annan konceptvy i samma flik
      ser du dess data ligga kvar där — från en sida du lämnat. I praktiken inspekterar man dock inte cachen med en panel man byggt själv, utan med
      bibliotekets eget utvecklingsverktyg: ett tillägg som visar varje post, när den senast hämtades, vad den innehåller, och som låter dig
      invalidera eller kasta den för hand. Panelen nedan visar samma data i mindre format — kan du läsa den kan du läsa verktyget.
    </Typography>
  </>
);

export const QueryCachePage = () => (
  <ConceptTemplate
    title='Query: cache'
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            1. Flera konsumenter, ett anrop
          </Typography>
          <SharedCacheDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            2. Vad som faktiskt ligger i cachen
          </Typography>
          <Typography color='textSecondary'>
            Panelen visar hela cachen, inte bara den här modulens poster. Den ser därför olika ut beroende på vilka konceptvyer du besökt i samma flik
            — och det är poängen: posterna tillhör appen, inte vyn som hämtade dem.
          </Typography>
          <CacheInspector />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            3. Invalidering med prefix
          </Typography>
          <InvalidationDemo />
        </Stack>
      </Stack>
    }
    // Ordningen följer anropet: demo, dess kort, dess hook, nycklarna och
    // sist det som delas med resten av appen.
    sources={[
      {
        fileName: 'src/modules/queryCache/components/sharedCacheDemo.tsx',
        code: sharedCacheDemoSource,
        language: 'tsx',
        // Korten skapas i en loop och vet inget om varandra - deduperingen
        // följer av nyckeln, inte av någon samordning här.
        highlight: ['Array.from({ length: cardCount }', 'const requestCount = readUserRequestCount();'],
      },
      {
        fileName: 'src/modules/queryCache/components/userListCard.tsx',
        code: userListCardSource,
        language: 'tsx',
        // Ett vanligt anrop till hooken. Inget i kortet röjer att tre andra
        // kort gör exakt samma sak.
        highlight: ['const { data, isPending, isError, error, fetchStatus } = useFetchSharedUsers();'],
      },
      {
        fileName: 'src/modules/queryCache/components/invalidationDemo.tsx',
        code: invalidationDemoSource,
        language: 'tsx',
        // De tre knapparna: brett prefix, smalt prefix, och en enskild query
        // som tvingas hämta om.
        highlight: ['queryKey: usersKeys.all }', 'queryKey: usersKeys.lists() }', 'void ada.refetch()'],
      },
      {
        fileName: 'src/modules/queryCache/components/cacheInspector.tsx',
        code: cacheInspectorSource,
        language: 'tsx',
        // Avläsningen av hela cachen, och markeringen av modulens egna poster.
        highlight: ['const queries = queryClient.getQueryCache().getAll();', 'const isThisModule ='],
      },
      {
        fileName: 'src/shared/hooks/useRerenderOnCacheChange.ts',
        code: useRerenderOnCacheChangeSource,
        language: 'ts',
        // Prenumerationen som gör att panelerna visar nuet och inte det läge
        // som rådde vid senaste renderingen.
        highlight: ['.subscribe('],
      },
      {
        fileName: 'src/modules/queryCache/hooks/queries/useFetchSharedUsers.ts',
        code: useFetchSharedUsersSource,
        language: 'ts',
        // En helt vanlig query. Allt delningsdemon visar följer av nyckeln.
        highlight: ['queryKey: sharedUsersKeys.list(),'],
      },
      {
        fileName: 'src/modules/queryCache/hooks/queries/useFetchUsers.ts',
        code: useFetchUsersSource,
        language: 'ts',
        // Samma anrop, annan nyckel - den som invalideringsdemon arbetar mot.
        highlight: ['queryKey: usersKeys.lists(),'],
      },
      {
        fileName: 'src/modules/queryCache/hooks/queries/useFetchUser.ts',
        code: useFetchUserSource,
        language: 'ts',
        // Detaljposterna. Utan dem finns ingenting under den andra grenen, och
        // skillnaden mellan de två prefixen går inte att visa.
        highlight: ['queryKey: usersKeys.detail(id),'],
      },
      {
        fileName: 'src/modules/queryCache/hooks/usersKeys.ts',
        code: usersKeysSource,
        language: 'ts',
        // Nivåerna som gör prefixinvalidering möjlig.
        highlight: ['all:', 'lists: () =>', 'details: () =>'],
      },
      {
        fileName: 'src/services/api/users.ts',
        code: usersServiceSource,
        language: 'ts',
        // Listan, som byggdes först när den här modulen behövde den.
        highlight: ['export const getUsers'],
      },
      {
        fileName: 'src/services/mocks/handlers.ts',
        code: handlersSource,
        language: 'ts',
        // Backendens lista, och räknaren som gör påståendena om anrop
        // kontrollerbara.
        highlight: ["http.get('/api/users',", 'userRequestCount += 1;'],
      },
    ]}
    quiz={queryCacheQuestions}
  />
);
