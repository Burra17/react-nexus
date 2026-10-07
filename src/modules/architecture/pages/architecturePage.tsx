import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import mainSource from '../../../main.tsx?raw';
import usersServiceSource from '../../../services/api/users.ts?raw';
import axiosClientSource from '../../../services/axios/axiosClient.ts?raw';
import handlersSource from '../../../services/mocks/handlers.ts?raw';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { DecisionList } from '../components/decisionList';
import { FlowTraceDemo } from '../components/flowTraceDemo';
import flowTraceDemoSource from '../components/flowTraceDemo.tsx?raw';
import architectureKeysSource from '../hooks/architectureKeys.ts?raw';
import useFetchArchitectureUsersSource from '../hooks/queries/useFetchArchitectureUsers.ts?raw';
import { architectureQuestions } from '../architectureQuestions';

const Theory = () => (
  <>
    <Typography>
      Den här vyn handlar om appen du läser i. React Nexus är en lärobok, men den är också en app byggd i React, och{' '}
      <Link href='https://github.com/Burra17/react-nexus'>källkoden ligger öppet på GitHub</Link>, i ett så kallat repo. Varje sida i appen kallas här
      en <strong>vy</strong>. Koden bakom vyerna ligger i mappar, och mappen för ett ämne kallas en <strong>modul</strong>. Vyn ställer en annan sorts
      fråga än de andra: inte hur något fungerar, utan <strong>varför det ligger där det ligger</strong>. En mappstruktur är inte en sanning någon
      upptäckt. Den är en rad beslut, tagna av människor med ofullständig information, och nästan alla hade kunnat tas annorlunda med ett resultat som
      också hade fungerat.
    </Typography>

    <Typography>
      Tråden att följa är vad som händer när en vy behöver data. Appen har ingen riktig server. I stället svarar <strong>MSW</strong>, Mock Service
      Worker, ett bibliotek som fångar anropen inne i webbläsaren och svarar med påhittad data, som om en server hade gjort det. Det MSW svarar för
      kallas här API:et, gränssnittet appen hämtar data från. Anropen görs med <strong>axios</strong>, ett bibliotek för HTTP-anrop, alltså de
      förfrågningar en webbläsare skickar till en server. Datan hålls av <strong>TanStack Query</strong>, ett bibliotek som hämtar data, sparar svaret
      i en cache som hela appen delar och vet när det behöver hämtas igen. En komponent läser datan med bibliotekets hook <code>useQuery</code>, och
      varje post i cachen känns igen på en <strong>nyckel</strong>, en lista som <code>{"['architecture', 'trace']"}</code>.
    </Typography>

    <Typography>
      Anropet passerar fyra led i koden innan det når API:et: <code>vy → hook → service → axiosClient → API</code>. Vyn är komponenten som visar
      datan. Hooken är en egen funktion runt <code>useQuery</code>, som vet vilken nyckel som gäller men ingenting om HTTP. Servicen är en vanlig
      funktion som vet hur man pratar med API:et men ingenting om React. <code>axiosClient</code> är appens enda uppsättning av axios, inställd en
      gång för alla anrop. Varje gräns mellan leden är ett beslut, och ingen av dem är gratis: varje led är en fil till att öppna när något går fel.
      Det du får tillbaka är att kunna läsa ett led utan att förstå resten, och att kunna ändra ett utan att röra de andra. Byts MSW mot en riktig
      server behöver varken hookarna eller vyerna ändras.
    </Typography>

    <Typography>
      Det mesta i strukturen följer av två enkla regler. Den första: <strong>skapa en del först när något faktiskt behöver den.</strong> Mappen{' '}
      <code>services/</code>, där servicarna ligger, fanns inte förrän den första modulen som hämtar data byggdes. En mapp för formulärkomponenter som
      flera moduler delar finns fortfarande inte, eftersom bara modulen för Forms har formulär. En tom mapp är struktur utan nytta. Den andra:{' '}
      <strong>
        när en andra modul behöver något flyttas det till <code>shared/</code>, mappen för det flera moduler använder, och det flyttas, det kopieras
        inte.
      </strong>{' '}
      Två kopior driver isär första gången den ena rättas.
    </Typography>

    <Typography>
      Appens struktur har ett produktionsprojekt som förlaga, en riktig app vars mappindelning den här följer, och på fyra ställen avviker den med
      flit. Korten nedan visar de fyra. De är valda för att vart och ett är en egen <em>sorts</em> beslut: en förenkling som följer av att appen är
      liten, ett dyrare val av pedagogiska skäl, ett avsteg från ett biblioteks dokumentation, och ett avsteg från appens egen kodregel. Det sista
      säger mest om hur arkitektur fungerar: en regel är ett verktyg och inte en lag, och priset för att avvika är att skriva ut skälet. Gör man inte
      det läses avvikelsen som okunskap nästa gång någon jämför de två projekten, och reflexen blir att rätta tillbaka.
    </Typography>

    <Typography>
      Demon nedan mäter ett riktigt anrop utan att appens kod har ändrats för dess skull. Den använder två <strong>interceptorer</strong>. En
      interceptor är en funktion som axios kör för varje anrop som går ut eller varje svar som kommer in, och den kan läggas till och tas bort
      utifrån. Demon lägger till två när vyn öppnas och tar bort dem när den lämnas, och den lyssnar på händelserna i Querys cache.{' '}
      <code>axiosClient.ts</code> har en egen interceptor, som kontrollerar varje svar, men ingen rad för den här vyns skull. Hade det funnits en
      sådan rad skulle demon beskriva något annat än det som faktiskt körs. Servicen har däremot två valfria inställningar, en fördröjning och ett
      felsvar, som bara finns för att MSW ska gå att styra från vyerna. De står i Kod-delen med skälet utskrivet.
    </Typography>

    <Typography>Det här är bokens sista vy, men den går lika bra att läsa först: det den bygger på förklaras här.</Typography>
  </>
);

export const ArchitecturePage = () => (
  <ConceptTemplate
    title='Arkitektur'
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            1. Spåra ett riktigt anrop
          </Typography>
          <Typography color='textSecondary'>
            Hooken i demon hämtar inte när vyn öppnas, utan först när du trycker på knappen, så att varje anrop syns från början. Varje tryck gör ett
            nytt anrop till API:et. De fyra stegen visar händelser längs vägen, med tiden räknad från steg 1. Klicka på ett steg för att läsa varför
            just den delen av koden finns.
          </Typography>
          <FlowTraceDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            2. Fyra avsteg, och skälen
          </Typography>
          <Typography color='textSecondary'>
            Varje kort visar ett ställe där appen avviker från förlagan. Den lilla rubriken i versaler överst säger vilken sorts beslut det är, och
            den är viktigare än exemplet under: sorten går att ta med sig till ett annat projekt.
          </Typography>
          <DecisionList />
        </Stack>

        <Typography color='textSecondary'>
          Kod-delen nedan visar de riktiga filerna som appen kör, i flödets ordning: demon själv, hooken den använder, servicen, axiosClient, MSW:s
          svar i handlers.ts, main.tsx där appen och MSW startas, och nyckelfabriken från det fjärde kortet.
        </Typography>
      </Stack>
    }
    // Ordningen är flödets: demon först, sedan kedjan den spårar, och sist de
    // två filer som bär avsteg som inte syns i kedjan.
    sources={[
      {
        fileName: 'src/modules/architecture/components/flowTraceDemo.tsx',
        code: flowTraceDemoSource,
        language: 'tsx',
        highlight: {
          fragments: ['const requestId = axiosClient.interceptors.request.use', 'axiosClient.interceptors.request.eject(requestId);'],
          why: 'Interceptorerna som hakas på och av. De är hela skälet till att axiosClient kan lämnas orörd.',
        },
      },
      {
        fileName: 'src/modules/architecture/hooks/queries/useFetchArchitectureUsers.ts',
        code: useFetchArchitectureUsersSource,
        language: 'ts',
        highlight: {
          fragments: ['queryKey: architectureKeys.trace()', 'queryFn: () => getUsers('],
          why: 'Hooken vet nyckeln men ingenting om HTTP.',
        },
      },
      {
        fileName: 'src/services/api/users.ts',
        code: usersServiceSource,
        language: 'ts',
        highlight: {
          fragments: ['export const getUsers'],
          why: 'Servicen innehåller ingen React, bara en funktion som returnerar data med en känd form.',
        },
      },
      {
        fileName: 'src/services/axios/axiosClient.ts',
        code: axiosClientSource,
        language: 'ts',
        highlight: {
          fragments: ['baseURL:', "if (contentType.includes('application/json'))"],
          why: 'Basadressen, och kontrollen som gör att ett svar som inte är JSON aldrig når cachen.',
        },
      },
      {
        fileName: 'src/services/mocks/handlers.ts',
        code: handlersSource,
        language: 'ts',
        highlight: {
          fragments: ["http.get('/api/users',"],
          why: 'Andra änden av kedjan: MSW:s svar på anropet till /api/users.',
        },
      },
      {
        fileName: 'src/main.tsx',
        code: mainSource,
        language: 'tsx',
        highlight: {
          fragments: ["import('./services/mocks/browser')", 'await worker.start('],
          why: 'Avsteget: MSW startas i alla lägen, och appen väntar in den innan den ritas.',
        },
      },
      {
        fileName: 'src/modules/architecture/hooks/architectureKeys.ts',
        code: architectureKeysSource,
        language: 'ts',
        highlight: {
          fragments: ["all: ['architecture'] as const,"],
          why: 'Det fjärde avsteget på korten: nyckeln börjar med modulens namn och inte med resursens.',
        },
      },
    ]}
    quiz={architectureQuestions}
  />
);
