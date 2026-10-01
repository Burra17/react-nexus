import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import handlersSource from '../../../services/mocks/handlers.ts?raw';
import usersServiceSource from '../../../services/api/users.ts?raw';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { CacheClockDemo } from '../components/cacheClockDemo';
import cacheClockDemoSource from '../components/cacheClockDemo.tsx?raw';
import { UserQueryDemo } from '../components/userQueryDemo';
import userQueryDemoSource from '../components/userQueryDemo.tsx?raw';
import useFetchCachedUserSource from '../hooks/queries/useFetchCachedUser.ts?raw';
import useFetchUserSource from '../hooks/queries/useFetchUser.ts?raw';
import usersKeysSource from '../hooks/usersKeys.ts?raw';
import { queryBasicsQuestions } from '../queryBasicsQuestions';

const Theory = () => (
  <>
    <Typography>
      Det vanliga första sättet att hämta data i React är för hand: en <code>useEffect</code> som anropar API:et och tre <code>useState</code> för
      datan, laddningen och felet. Det fungerar tills två svar kommer i fel ordning. Klickar läsaren på en användare och sedan snabbt på en annan kan
      det första, långsammare svaret landa sist och skriva över det andra, och skärmen visar då fel person. Skyddet är en flagga i effektens
      städfunktion, och den måste skrivas varje gång. Reacts egen dokumentation räknar upp fler invändningar: hämtningen startar först när komponenten
      redan renderat, en förälder som hämtar innan barnet får hämta gör anropen till ett vattenfall i stället för till parallella anrop, och ingenting
      sparas: avmonteras komponenten och monteras igen hämtas allt om från början. Rekommendationen därefter är kort: använd, eller bygg, en cache på
      klientsidan.
    </Typography>

    <Typography>
      Den här vyn handlar om en sådan cache, biblioteket <strong>TanStack Query</strong>. Appen har en enda <code>QueryClient</code>, skapad en gång
      och given till hela komponentträdet längst upp, och den håller cachen. En komponent som behöver data anropar hooken <code>useQuery</code> med
      två saker: en <strong>nyckel</strong>, som säger vilken data det gäller, och en <code>queryFn</code>, funktionen som hämtar den. Det som ligger
      i cachen under en nyckel kallas en <strong>query</strong>: datan, läget den befinner sig i, och funktionen som kan hämta den igen. Komponenten
      äger inte datan. Den tittar på en query, och det kan flera komponenter göra samtidigt.
    </Typography>

    <Typography>
      Det som gör serverdata svårt är inte hämtningen utan <strong>ägandeskapet</strong>. Ett vanligt state äger du: det ändras när du ändrar det, och
      däremellan står det stilla. Ett svar från ett API är i stället en <strong>kopia av något någon annan äger</strong>, lånad för att visas på
      skärmen. Kopian kan bli inaktuell medan den ligger stilla, utan att något i komponenten märker det, och hämtningen kan misslyckas på ett sätt en{' '}
      <code>useState</code> aldrig kan. Därför är laddning och fel inte något du bygger själv, utan lägen <code>useQuery</code> redan har.{' '}
      <code>status</code> svarar på frågan <em>hur gick det att få data?</em> med <code>pending</code> (ingen data än), <code>error</code> (hämtningen
      misslyckades) eller <code>success</code> (datan finns). <code>fetchStatus</code> svarar på <em>kör hämtningen just nu?</em> med{' '}
      <code>fetching</code>, <code>paused</code> (den vill köra, men nätverket är borta) eller <code>idle</code>. Hooken ger också genvägar till
      lägena: <code>isPending</code> är samma sak som <code>status === &apos;pending&apos;</code>, och <code>isError</code> och <code>isSuccess</code>{' '}
      fungerar likadant.
    </Typography>

    <Typography>
      Att det är två fält och inte ett är ingen dubblering: en query med data kan hämta om i bakgrunden, och en query utan data kan stå still. Demon
      nedan börjar därför utan vald användare. En query kan vara avstängd tills den har det den behöver, och här väntar den på ett id. Innan du
      klickar står därför <code>status: pending</code> bredvid <code>fetchStatus: idle</code>: det finns ingen data, och ingenting hämtas. Väljer du
      sedan en användare blir det <code>pending</code> och <code>fetching</code> tillsammans, och har du redan data står <code>success</code> bredvid{' '}
      <code>fetching</code>. Tre olika lägen, av två fält som ofta antas säga samma sak.
    </Typography>

    <Typography>
      Den andra halvan är <strong>nyckeln</strong>, en array som fungerar som en adress i cachen. Datan identifieras inte av komponenten som råkade
      hämta den, utan av nyckeln: frågar två komponenter i olika delar av appen efter samma nyckel tittar de på samma query. Byter en komponent nyckel
      tittar den i stället på en annan query, och finns den inte än hämtas den. Därav regeln att allt som avgör <em>vilken</em> data servern svarar
      med ska stå i nyckeln. I demon nedan syns det direkt: byt användare och nyckeln ändras, men dra i latensreglaget och den står still, eftersom
      svarstiden ändrar <em>när</em> svaret kommer och inte vilken användare det handlar om.
    </Typography>

    <Typography>
      Nyckeln jämförs på innehåll, inte på referens. En komponent som bygger en ny array vid varje rendering, med samma värden i, frågar efter samma
      query varje gång, också när arrayen innehåller ett objekt. Där skiljer sig nyckeln från en effekts beroendelista, som jämför referenser och kör
      om för ett nytt objekt även om innehållet är detsamma. Nycklarna skrivs i en liten fabrik, ett objekt med en funktion per sorts nyckel, i
      stället för för hand på varje ställe. Då blir en glömd parameter ett typfel i stället för en query som tyst visar fel data.
    </Typography>

    <Typography>
      Klickar du tillbaka till en användare du redan hämtat fylls kortet direkt, utan laddningsläge, men ett nytt anrop går ändå i bakgrunden. Det
      syns som den lilla snurran i kortets överkant, och det är därför den står där: utan den vore hämtningen osynlig, eftersom namnet på skärmen inte
      ändras medan den pågår. Varför det blir både och förklaras av två klockor.
    </Typography>

    <Typography>
      <code>staleTime</code> gäller <em>datan du tittar på</em>: hur länge den räknas som färsk. <code>gcTime</code> gäller{' '}
      <em>en query som ingen tittar på</em>: hur länge den ligger kvar i cachen innan den kastas bort. Förkortningen gc står för garbage collection,
      alltså städning. De två blandas ihop för att båda mäter tid för cachad data. Dessutom hette <code>gcTime</code> förr <code>cacheTime</code>, ett
      namn som lät som &quot;så länge datan cachas&quot;. Det betyder det inte, eftersom klockan inte börjar ticka förrän den sista komponenten slutat
      titta. Standarden är <code>staleTime: 0</code> och <code>gcTime: 5 minuter</code>: datan räknas som inaktuell direkt, men queryn ligger kvar i
      fem minuter efter att ingen längre tittar. Inaktuell är alltså inte samma sak som borta. Inaktuell data visas ändå direkt från cachen medan en
      ny hämtning går i bakgrunden, och det är därför en vy nästan aldrig visar ett tomt laddningsläge två gånger.
    </Typography>

    <Typography>
      <code>staleTime: 0</code> låter aggressivt, men betyder inte att varje omrendering hämtar. Inaktuell data hämtas om i bakgrunden vid tre
      tillfällen: när en komponent börjar titta på queryn, när fönstret får fokus igen, och när nätverket kommer tillbaka. Det första är vad du ser i
      demon när du klickar tillbaka till en användare, eftersom kortet då börjar titta på den användarens query igen. Det andra är värt att minnas:
      byter du till en annan flik och tillbaka ser du ett anrop du inte själv utlöste, och det är lätt att tro att något är trasigt när det i själva
      verket är biblioteket som håller din kopia aktuell.
    </Typography>

    <Typography>
      Den andra demon visar gcTime i arbete. Ställ gcTime på en sekund, tryck på Nollställ cacheposten så att det nya värdet gäller, och tryck sedan
      på Lämna vyn. Kortet slutar då titta, och klockan börjar ticka. Vänta några sekunder och tryck på Kom tillbaka: queryn har hunnit städas bort,
      och allt börjar om med ett tomt laddningsläge.
    </Typography>

    <Typography>
      <strong>En not om versioner.</strong> I version 5 bytte biblioteket namn på saker, och ett av bytena är värt att känna till eftersom det inte
      syns. <code>isLoading</code> betydde förr <em>det finns ingen data än</em>. Det heter numera <code>isPending</code>, men <code>isLoading</code>{' '}
      finns kvar, med en ny innebörd: <em>det finns ingen data än och hämtningen kör just nu</em>. Samma namn, olika betydelse i olika versioner, och
      koden kompilerar i båda fallen. Möter du <code>isLoading</code> i en äldre kodbas betyder det alltså inte det du tror, och inget verktyg säger
      till. I samma veva försvann <code>onSuccess</code>, <code>onError</code> och <code>onSettled</code>, funktioner som kördes när en hämtning
      lyckats, misslyckats eller avslutats, från <code>useQuery</code>. De finns kvar på <code>useMutation</code>, hooken för att skriva till servern.
      Värt att veta är också att biblioteket har ett eget utvecklingsverktyg, TanStack Query Devtools, som visar hela cachen i en panel. Det är så man
      inspekterar den i praktiken, medan panelerna i demona nedan är byggda för hand för att visa just de fält den här vyn handlar om.
    </Typography>
  </>
);

export const QueryBasicsPage = () => (
  <ConceptTemplate
    title='Query: grunder'
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            1. Lägena och nyckeln
          </Typography>
          <UserQueryDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            2. De två klockorna
          </Typography>
          <CacheClockDemo />
        </Stack>
      </Stack>
    }
    // Blocken står i samma ordning som anropet färdas:
    // demo -> hook -> nycklar -> service -> mockad backend.
    //
    // Det är första gången hela kedjan syns på en och samma sida, och ordningen
    // är därför en del av lektionen och inte en godtycklig lista.
    //
    // Varje demo står direkt före sin egen hook, så att paret går att läsa ihop.
    // De tre sista filerna delas av båda och står därför sist.
    //
    // axiosClient utelämnas: fyra rader konfiguration som inte tillför något
    // förrän arkitekturmodulen ska prata om den.
    sources={[
      {
        fileName: 'src/modules/queryBasics/components/userQueryDemo.tsx',
        code: userQueryDemoSource,
        language: 'tsx',
        // Raden som ersätter tre useState och en useEffect, och nyckeln som
        // skrivs ut så att den går att se ändras.
        highlight: ['const { data, status, fetchStatus', 'const queryKey = JSON.stringify'],
      },
      {
        fileName: 'src/modules/queryBasics/hooks/queries/useFetchUser.ts',
        code: useFetchUserSource,
        language: 'ts',
        // Nyckeln, pausningen, anropet till servicen och avstängningen av
        // omförsöken.
        highlight: ['queryKey: usersKeys.detail', '? skipToken', 'await getUser(', 'retry: false,'],
      },
      {
        fileName: 'src/modules/queryBasics/components/cacheClockDemo.tsx',
        code: cacheClockDemoSource,
        language: 'tsx',
        // Avmonteringen som får gcTime att börja ticka, och avläsningen av
        // cachen utanför hooken, det enda sättet att se posten när ingen tittar.
        highlight: ['<CachedUserCard staleTimeMs=', 'const cacheState = queryClient.getQueryState'],
      },
      {
        fileName: 'src/modules/queryBasics/hooks/queries/useFetchCachedUser.ts',
        code: useFetchCachedUserSource,
        language: 'ts',
        // De två klockorna, och den egna nyckelgrenen som håller demon isär
        // från den första.
        highlight: ['queryKey: usersKeys.clock(id)', 'staleTime: staleTimeMs,', 'gcTime: gcTimeMs,'],
      },
      {
        fileName: 'src/modules/queryBasics/hooks/usersKeys.ts',
        code: usersKeysSource,
        language: 'ts',
        // Hur nycklarna byggs ovanpå varandra, att felflaggan står i nyckeln
        // medan fördröjningen inte gör det, och den egna grenen för klockorna.
        highlight: ['details: () =>', 'detail: (id:', 'clock: (id:'],
      },
      {
        fileName: 'src/services/api/users.ts',
        code: usersServiceSource,
        language: 'ts',
        // Servicen innehåller ingen React, bara en funktion som returnerar
        // typad data.
        highlight: ['export const getUser'],
      },
      {
        fileName: 'src/services/mocks/handlers.ts',
        code: handlersSource,
        language: 'ts',
        // Den mockade backenden: hur styrningen läses ur sökparametrarna, var
        // fördröjningen läggs in, och räknaren som gör påståendena om anrop
        // kontrollerbara. Den räknar per demo, enligt märkningen i anropet.
        highlight: ['const readControls', 'await delay(delayMs);', 'const countRequest ='],
      },
    ]}
    quiz={queryBasicsQuestions}
  />
);
