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
      I Effects-modulen skrev du en hämtning för hand, och såg den gå sönder. Två klick efter varandra gav ett svar som tillhörde fel användare, och
      lösningen krävde en flagga i städfunktionen som ingen kommer ihåg att skriva varje gång. Reacts egen dokumentation räknar upp fler invändningar
      mot mönstret: hämtningen startar först när komponenten redan renderat, en förälder som hämtar innan barnet får hämta gör anropen till ett
      vattenfall i stället för till parallella anrop, och ingenting sparas — avmonteras komponenten och monteras igen hämtas allt om från början.
      Rekommendationen därefter är kort: använd, eller bygg, en cache på klientsidan. Den här modulen handlar om den cachen.
    </Typography>

    <Typography>
      Det som gör serverdata svårt är inte hämtningen utan <strong>ägandeskapet</strong>. Ett vanligt state äger du: det ändras när du ändrar det, och
      däremellan står det stilla. Ett svar från ett API är i stället en <strong>kopia av något någon annan äger</strong>, lånad för att visas på
      skärmen. Kopian kan bli inaktuell medan den ligger stilla, utan att något i komponenten märker det, och hämtningen kan misslyckas på ett sätt en{' '}
      <code>useState</code> aldrig kan. Därför är laddning och fel inte något du bygger själv av tre useState, utan lägen hooken redan har:{' '}
      <code>status</code> svarar på frågan <em>har vi data?</em> med <code>pending</code>, <code>error</code> eller <code>success</code>, medan{' '}
      <code>fetchStatus</code> svarar på <em>kör hämtningen just nu?</em> med <code>fetching</code>, <code>paused</code> eller <code>idle</code>. Att
      det är två fält och inte ett är ingen dubblering: en lyckad query kan hämta om i bakgrunden, och en pending query kan stå stilla för att
      nätverket är borta. Demon nedan börjar därför utan vald användare, så att du får se dem gå isär: innan du klickar står{' '}
      <code>status: pending</code> bredvid <code>fetchStatus: idle</code> — det finns ingen data, och ingenting hämtas. Väljer du sedan en användare
      blir det <code>pending</code> och <code>fetching</code> tillsammans, och har du redan data står <code>success</code> bredvid{' '}
      <code>fetching</code>. Tre olika lägen, av två fält som ofta antas säga samma sak.
    </Typography>

    <Typography>
      Den andra halvan är <strong>nyckeln</strong>. Datan identifieras inte av komponenten som råkade hämta den, utan av sin <code>queryKey</code> —
      en array som fungerar som en adress i cachen. Frågar två komponenter i olika delar av appen efter samma nyckel tittar de på samma post. Nyckeln
      fungerar samtidigt som en beroendelista: ändras den hämtas det om, precis som en effekt kör om när dess beroenden ändras. Därav regeln att allt
      som hämtningen beror på ska stå i nyckeln. I demon nedan syns det direkt — byt användare och nyckeln ändras, men dra i latensreglaget och den
      står still, eftersom svarstiden ändrar <em>när</em> svaret kommer och inte <em>vad</em> det innehåller. Nycklarna skrivs i en liten fabrik i
      stället för för hand på varje ställe, så att en glömd parameter blir ett typfel i stället för en cachepost som tyst visar fel data.
    </Typography>

    <Typography>
      Klickar du tillbaka till en användare du redan hämtat fylls kortet direkt, utan laddningsläge — men ett nytt anrop går ändå i bakgrunden. Det
      syns som den lilla snurran i kortets överkant, och det är därför den står där: utan den vore hämtningen osynlig, eftersom namnet på skärmen inte
      ändras medan den pågår.
    </Typography>

    <Typography>
      Att båda sakerna händer samtidigt styrs av <strong>två klockor</strong>, och de talar om olika saker. <code>staleTime</code> gäller{' '}
      <em>datan du tittar på</em>: hur länge den räknas som färsk. <code>gcTime</code> gäller <em>posten i cachen när ingen tittar</em>: hur länge den
      ligger kvar innan den kastas bort. De blandas ihop för att båda mäter tid för cachad data — och för att den senare hette <code>cacheTime</code>{' '}
      förr, ett namn som lät som &quot;så länge datan cachas&quot; utan att betyda det. Den börjar nämligen inte ticka förrän frågan blivit oanvänd.
      Standarden är <code>staleTime: 0</code> och <code>gcTime: 5 minuter</code>: datan räknas som inaktuell direkt, men posten ligger kvar i fem
      minuter efter att den sista komponenten som tittade på den försvann. Inaktuell är alltså inte samma sak som borta — inaktuell data visas ändå
      direkt från cachen medan en ny hämtning går i bakgrunden, och det är därför en vy nästan aldrig visar ett tomt laddningsläge två gånger.
    </Typography>

    <Typography>
      <code>staleTime: 0</code> låter aggressivt, men betyder inte att varje omrendering hämtar. Inaktuell data utlöser en bakgrundshämtning vid tre
      tillfällen: när en ny instans av frågan monteras, när fönstret får fokus igen, och när nätverket kommer tillbaka. Det andra är värt att minnas —
      byter du till en annan flik och tillbaka ser du ett anrop du inte själv utlöste, och det är lätt att tro att något är trasigt när det i själva
      verket är biblioteket som håller din kopia aktuell. I demon nedan kan du dra ner båda klockorna till noll och sedan lämna vyn: då hinner posten
      städas bort medan du är borta, och när du kommer tillbaka börjar allt om med ett tomt laddningsläge.
    </Typography>

    <Typography>
      <strong>En not om versioner.</strong> Biblioteket har bytt namn på saker, och ett av bytena är värt att känna till eftersom det inte syns.{' '}
      <code>isLoading</code> betydde förr <em>det finns ingen data än</em>. Det heter numera <code>isPending</code> — men <code>isLoading</code> finns
      kvar, med en ny innebörd: <em>det finns ingen data än och hämtningen kör just nu</em>. Samma namn, olika betydelse i olika versioner, och koden
      kompilerar i båda fallen. Möter du <code>isLoading</code> i en äldre kodbas betyder det alltså inte det du tror, och inget verktyg säger till. I
      samma veva försvann <code>onSuccess</code>, <code>onError</code> och <code>onSettled</code> från <code>useQuery</code>, medan de finns kvar på
      mutationer. Värt att veta är också att biblioteket har ett eget utvecklingsverktyg som visar hela cachen i en panel — det är så man inspekterar
      den i praktiken, medan panelen i demon nedan är byggd för hand för att visa just de fält den här modulen handlar om.
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
            1. Lägena, nyckeln och kedjan
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
        // cachen utanför hooken - enda sättet att se posten när ingen tittar.
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
        // Servicen innehåller ingen React - bara en funktion som returnerar
        // typad data.
        highlight: ['export const getUser'],
      },
      {
        fileName: 'src/services/mocks/handlers.ts',
        code: handlersSource,
        language: 'ts',
        // Den mockade backenden: hur styrningen läses ur sökparametrarna, var
        // fördröjningen läggs in, och räknaren som gör påståendena om anrop
        // kontrollerbara.
        highlight: ['const readControls', 'await delay(delayMs);', 'userRequestCount += 1;'],
      },
    ]}
    quiz={queryBasicsQuestions}
  />
);
