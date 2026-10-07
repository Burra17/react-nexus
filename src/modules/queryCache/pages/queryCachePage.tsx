import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
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
import requestDemosSource from '../hooks/queries/requestDemos.ts?raw';
import responseDelaySource from '../hooks/queries/responseDelay.ts?raw';
import useFetchSharedUsersSource from '../hooks/queries/useFetchSharedUsers.ts?raw';
import useFetchUserSource from '../hooks/queries/useFetchUser.ts?raw';
import useFetchUsersSource from '../hooks/queries/useFetchUsers.ts?raw';
import requestCounterPanelSource from '../../../shared/components/requestCounterPanel.tsx?raw';
import useRequestCountSource from '../../../shared/hooks/useRequestCount.ts?raw';
import useRerenderOnCacheChangeSource from '../../../shared/hooks/useRerenderOnCacheChange.ts?raw';
import usersKeysSource from '../hooks/usersKeys.ts?raw';
import { queryCacheQuestions } from '../queryCacheQuestions';

const Theory = () => (
  <>
    <Typography>
      Fyra komponenter i olika delar av gränssnittet ska visa samma lista med användare. Var och en anropar <code>useQuery</code>, hooken i
      biblioteket TanStack Query som hämtar data: du ger den en nyckel och en funktion som utför hämtningen, och får tillbaka datan tillsammans med
      lägen som säger om den finns och om en hämtning pågår. De fyra monteras samtidigt, så hooken körs fyra gånger. Hur många HTTP-anrop går iväg
      till servern? Gissar du fyra är det en rimlig gissning, för i ren React äger varje komponent sin egen hämtning. Demon nedan skickar ett.
    </Typography>

    <Typography>
      Skälet är att <strong>datan är delad</strong>. Cachen ägs av en <code>QueryClient</code>, ett objekt som sätts upp en gång för hela appen och
      ligger ovanför alla komponenter. Hooken <code>useQueryClient</code> ger dig tag i det när du behöver röra cachen själv, vilket demonstrationerna
      nedan gör. Nyckeln du ger <code>useQuery</code> är en adress i den cachen och inte i din komponent, så alla som frågar efter samma adress får
      samma post. Varje komponent som anropar hooken för en viss nyckel är en <strong>konsument</strong> av posten. Monterar du fyra konsumenter
      samtidigt går det iväg ett anrop: de tre andra hittar en hämtning som redan pågår och hakar på den. När svaret kommer ritas alla fyra om
      samtidigt, eftersom de tittar på samma sak. Det kallas dedupering, och det är skillnaden mellan en lista som kostar ett anrop och en lista som
      kostar ett anrop per ställe den visas på.
    </Typography>

    <Typography>
      Lägger du till en femte konsument efteråt sker ingen hämtning alls: posten finns redan och fylls direkt. Att det blir så beror på en inställning
      som heter <code>staleTime</code>, tiden en post räknas som <strong>färsk</strong>. Så länge posten är färsk nöjer sig en ny konsument med det
      som redan ligger i cachen. Är den i stället <strong>inaktuell</strong> visas datan fortfarande, men ett anrop går i bakgrunden för att hämta en
      ny version. Standardvärdet är noll, alltså inaktuell i samma stund svaret kommit hem, vilket förvånar de flesta. Listan i demon är satt till en
      halv minut, annars hade det femte kortet kostat ett anrop i stället för noll. Att datan visas samtidigt som den hämtas om är förresten skälet
      till att ett kort kan ha en snurra i hörnet trots att det redan står ett namn i det. Klockan som styr färskhet, och den som styr hur länge en
      post ligger kvar när ingen tittar, gås igenom i{' '}
      <Link component={RouterLink} to='/query-basics'>
        Query: grunder
      </Link>
      .
    </Typography>

    <Typography>
      Nästa fråga är hur man säger att något inte gäller längre. Svaret är <strong>invalidering</strong>, och den skiljer sig från att hämta om på ett
      sätt som är lätt att missa: du talar inte om <em>vem</em> som ska hämta, bara att datan är inaktuell. Query avgör resten, så att poster någon
      tittar på hämtas om direkt medan poster ingen tittar på får vänta tills de efterfrågas igen. Datan ligger kvar under tiden, så skärmen blir
      aldrig tom. Att märka poster som inaktuella arbetar dessutom med <strong>prefix</strong>: nyckeln är en array, och en kortare array träffar
      varje post vars nyckel börjar likadant. Det är hela skälet till att nycklarna inte skrivs för hand på varje ställe utan byggs i en{' '}
      <strong>fabrik</strong>, ett litet objekt vars funktioner staplar nycklarna ovanpå varandra. Med <code>usersKeys.all</code> invaliderar du allt
      som hör till resursen, med <code>usersKeys.lists()</code> bara listorna, och du behöver aldrig minnas vilka nycklar som finns. Kontrasten är{' '}
      <code>refetch()</code>, som <code>useQuery</code> ger tillbaka och som tvingar just den queryn att hämta om: ett hammarslag, där invalidering är
      ett meddelande.
    </Typography>

    <Typography>
      Eftersom cachen är appens och inte vyns går den att titta i, och det är värt att göra en vana av. Panelen längre ner listar varje post med sin
      nyckel och fyra uppgifter: om posten hör till den här vyn, vilket läge hämtningen har, om posten räknas som färsk, och hur många konsumenter som
      tittar på den just nu. Lägena är bibliotekets egna ord: <code>pending</code> innan någon data finns, <code>success</code> när svaret kommit och{' '}
      <code>error</code> om hämtningen misslyckades. Har du besökt en annan konceptvy i samma flik ser du dess data ligga kvar i listan, från en sida
      du redan lämnat.
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
          <Typography color='textSecondary'>
            Nollställ räknaren först och gör sedan en sak i taget. Montera korten: räknaren går upp med ett, inte med fyra. Knappen bredvid blir
            klickbar när korten är monterade, och lägger du till ett kort till står räknaren stilla, eftersom posten redan finns och räknas som färsk
            i en halv minut. Börja om tömmer både korten och cacheposten, så att den första mätningen går att göra en gång till.
          </Typography>
          <Typography color='textSecondary'>
            Titta också på snurrorna: de tänds i alla korten samtidigt, eftersom det är en hämtning fyra komponenter tittar på och inte fyra
            hämtningar. Att en snurra kan synas i ett kort som redan visar namn beror på att hooken har två lägen som svarar på olika frågor:{' '}
            <code>status</code> säger om vi har data, <code>fetchStatus</code> om en hämtning pågår just nu.
          </Typography>
          <SharedCacheDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            2. Vad som faktiskt ligger i cachen
          </Typography>
          <Typography color='textSecondary'>
            Panelen visar hela cachen, inte bara den här vyns poster. Den ser därför olika ut beroende på vilka konceptvyer du besökt i samma flik,
            och det är poängen: posterna tillhör appen, inte vyn som hämtade dem.
          </Typography>
          <CacheInspector />
          {/* Noten om det riktiga verktyget står här och inte i teorin. Ett
              verktyg förklaras bäst där läsaren kan jämföra det med en panel
              hen ser framför sig. Den ligger på sidan och inte i komponenten,
              eftersom inspektorn renderas en gång till längre ner. */}
          <Typography variant='body2' color='textSecondary'>
            I praktiken inspekterar man inte cachen med en panel man byggt själv, utan med React Query Devtools: ett tillägg som visar varje post, när
            den senast hämtades, vad den innehåller, och som låter dig invalidera eller kasta den för hand. Panelen ovan visar samma uppgifter i
            mindre format, så kan du läsa den kan du läsa verktyget.
          </Typography>
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            3. Invalidering med prefix
          </Typography>
          <Typography color='textSecondary'>
            Tre poster ligger under samma rot: en lista och två detaljer. Nollställ räknaren före varje knapptryck. Det breda prefixet träffar alla
            tre, det smala bara listan, och den tredje knappen hämtar om en enda post utan att märka något som inaktuellt. Titta på räknaren för att
            se hur många anrop knappen kostade, och på panelen längst ner för att se vilka poster som växlade till inaktuella på vägen.
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
        highlight: {
          fragments: ['Array.from({ length: cardCount }'],
          why: 'Korten skapas i en loop och vet inget om varandra. Deduperingen följer av nyckeln, inte av någon samordning här.',
        },
      },
      {
        fileName: 'src/shared/components/requestCounterPanel.tsx',
        code: requestCounterPanelSource,
        language: 'tsx',
        highlight: {
          fragments: [
            'const total = useRequestCount(demo);',
            'const [zeroPoint, setZeroPoint] = useState(total);',
            'const sinceReset = total - zeroPoint;',
          ],
          why: 'Räknarpanelen som varje påstående på sidan vilar på: talet som läses från den mockade backenden, nollpunkten som sparas när du nollställer, och skillnaden mot den som visas.',
        },
      },
      {
        fileName: 'src/shared/hooks/useRequestCount.ts',
        code: useRequestCountSource,
        language: 'ts',
        highlight: {
          fragments: ['useSyncExternalStore(subscribeToRequestCounts'],
          why: 'Hooken som ritar om panelen i samma ögonblick som den mockade backenden räknar ett anrop, och inte först när svaret kommer.',
        },
      },
      {
        fileName: 'src/modules/queryCache/components/userListCard.tsx',
        code: userListCardSource,
        language: 'tsx',
        highlight: {
          fragments: ['const { data, isPending, isError, error, fetchStatus } = useFetchSharedUsers();'],
          why: 'Ett vanligt anrop till hooken. Inget i kortet röjer att tre andra kort gör exakt samma sak.',
        },
      },
      {
        fileName: 'src/modules/queryCache/components/invalidationDemo.tsx',
        code: invalidationDemoSource,
        language: 'tsx',
        highlight: {
          fragments: ['queryKey: usersKeys.all }', 'queryKey: usersKeys.lists() }', 'void ada.refetch()'],
          why: 'De tre knapparna: brett prefix, smalt prefix, och en enskild query som tvingas hämta om.',
        },
      },
      {
        fileName: 'src/modules/queryCache/components/cacheInspector.tsx',
        code: cacheInspectorSource,
        language: 'tsx',
        highlight: {
          fragments: ['const queries = queryClient.getQueryCache().getAll();', 'const isThisModule ='],
          why: 'Avläsningen av hela cachen, och markeringen av den här vyns egna poster.',
        },
      },
      {
        fileName: 'src/shared/hooks/useRerenderOnCacheChange.ts',
        code: useRerenderOnCacheChangeSource,
        language: 'ts',
        highlight: {
          fragments: ['.subscribe('],
          why: 'Prenumerationen som gör att avläsningen av cachen visar hur den ser ut nu, och inte hur den såg ut när den senast ritades.',
        },
      },
      {
        fileName: 'src/modules/queryCache/hooks/queries/useFetchSharedUsers.ts',
        code: useFetchSharedUsersSource,
        language: 'ts',
        highlight: {
          fragments: ['queryKey: sharedUsersKeys.list(),'],
          why: 'En helt vanlig query. Allt delningsdemon visar följer av nyckeln.',
        },
      },
      {
        fileName: 'src/modules/queryCache/hooks/queries/useFetchUsers.ts',
        code: useFetchUsersSource,
        language: 'ts',
        highlight: {
          fragments: ['queryKey: usersKeys.lists(),'],
          why: 'Samma anrop, annan nyckel: den som invalideringsdemon arbetar mot.',
        },
      },
      {
        fileName: 'src/modules/queryCache/hooks/queries/useFetchUser.ts',
        code: useFetchUserSource,
        language: 'ts',
        highlight: {
          fragments: ['queryKey: usersKeys.detail(id),'],
          why: 'Detaljposterna. Utan dem finns ingenting under den andra grenen, och skillnaden mellan de två prefixen går inte att visa.',
        },
      },
      {
        fileName: 'src/modules/queryCache/hooks/queries/responseDelay.ts',
        code: responseDelaySource,
        language: 'ts',
        highlight: {
          fragments: ['export const RESPONSE_DELAY_MS'],
          why: 'Ett enda tal: svarstiden som alla tre hookarna ovan skickar till servicen.',
        },
      },
      {
        fileName: 'src/modules/queryCache/hooks/queries/requestDemos.ts',
        code: requestDemosSource,
        language: 'ts',
        highlight: {
          fragments: ['export const SHARING_DEMO', 'export const INVALIDATION_DEMO'],
          why: 'Märkningen som håller isär sidans två räknare. Hookarna skickar den och demona läser av den.',
        },
      },
      {
        fileName: 'src/modules/queryCache/hooks/usersKeys.ts',
        code: usersKeysSource,
        language: 'ts',
        highlight: {
          fragments: ['all:', 'lists: () =>', 'details: () =>'],
          why: 'Nivåerna som gör prefixinvalidering möjlig.',
        },
      },
      {
        fileName: 'src/services/api/users.ts',
        code: usersServiceSource,
        language: 'ts',
        highlight: {
          fragments: ['export const getUsers'],
          why: 'Funktionen som hämtar listan med användare.',
        },
      },
      {
        fileName: 'src/services/mocks/handlers.ts',
        code: handlersSource,
        language: 'ts',
        highlight: {
          fragments: ["http.get('/api/users',", 'const countRequest ='],
          why: 'Backendens lista, och räknaren som gör påståendena om anrop kontrollerbara. Den räknar per demo, enligt märkningen i anropet.',
        },
      },
    ]}
    quiz={queryCacheQuestions}
  />
);
