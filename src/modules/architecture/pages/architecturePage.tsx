import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import mainSource from '../../../main.tsx?raw';
import usersServiceSource from '../../../services/api/users.ts?raw';
import axiosClientSource from '../../../services/axios/axiosClient.ts?raw';
import handlersSource from '../../../services/mocks/handlers.ts?raw';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import useFetchUsersSource from '../../queryCache/hooks/queries/useFetchUsers.ts?raw';
import { DecisionList } from '../components/decisionList';
import { FlowTraceDemo } from '../components/flowTraceDemo';
import flowTraceDemoSource from '../components/flowTraceDemo.tsx?raw';
import architectureKeysSource from '../hooks/architectureKeys.ts?raw';
import { architectureQuestions } from '../architectureQuestions';

const Theory = () => (
  <>
    <Typography>
      De tio föregående modulerna handlade om React. Den här handlar om appen du läst dem i. Och den ställer en annan sorts fråga än de andra: inte
      hur något fungerar, utan <strong>varför det ligger där det ligger</strong>. En mappstruktur är nämligen inte en sanning någon upptäckt — den är
      en rad beslut, tagna av människor med ofullständig information, och nästan alla hade kunnat tas annorlunda med ett annat resultat som också hade
      fungerat.
    </Typography>

    <Typography>
      Tråden att följa är vad som händer när en vy behöver data. Anropet färdas genom fyra lager —{' '}
      <code>page → hook → service → axiosClient → API</code> — och varje gräns mellan dem är någonting någon bestämt. Hooken vet vilken nyckel som
      gäller men ingenting om HTTP. Servicen vet hur man pratar med API:et men ingenting om React. <code>axiosClient</code> vet vad som gäller för
      varje anrop, oavsett vem som gjorde det. Ingen av gränserna är gratis: varje lager är en fil till att öppna när något går fel. Det du får
      tillbaka är att kunna byta ut ett lager utan att röra de andra, och att kunna läsa ett lager utan att förstå resten.
    </Typography>

    <Typography>
      Det mesta i strukturen följer av två enkla regler, och de är värda mer än kartan de gav upphov till. Den första:{' '}
      <strong>skapa en del först när något faktiskt behöver den.</strong> Därför fanns inget <code>services/</code> förrän modul 7 behövde hämta
      något, ingen <code>mutations/</code>-mapp förrän den första mutationen fanns, och fortfarande ingen <code>shared/forms/</code> trots att kartan
      nämner den — bara en modul har formulär. Tomma mappar är ceremoni. Den andra:{' '}
      <strong>
        flytta något till <code>shared/</code> när en andra modul behöver det, och flytta — kopiera inte.
      </strong>{' '}
      Två kopior driver isär första gången den ena rättas.
    </Typography>

    <Typography>
      Den här appens struktur har ett produktionsprojekt som förlaga, och på fyra ställen avviker den medvetet. De fyra nedan är valda för att var och
      en är en egen <em>sorts</em> beslut: en förenkling som följer av skala, ett dyrare val som togs av pedagogiska skäl, ett avsteg från
      bibliotekets egen dokumentation, och — det viktigaste — ett avsteg från appens egen kodregel. Det är den sista som säger mest om hur arkitektur
      faktiskt fungerar: en regel är ett verktyg och inte en lag, och priset för att avvika är att skriva ut skälet. Gör man inte det läses avvikelsen
      som okunskap nästa gång någon jämför de två projekten, och reflexen blir att rätta tillbaka.
    </Typography>

    <Typography>
      En sista sak, som gäller allt du läst hittills. Ingenting i den här modulen är instrumenterat för demonstrationens skull. Panelen nedan
      observerar anropet med två interceptorer som modulen hakar på <code>axiosClient</code> när den monteras och tar bort igen när den lämnas, plus
      de fält vilken komponent som helst kan läsa ur en <code>useQuery</code>. <code>axiosClient.ts</code> innehåller inte en rad som finns där för
      den här sidans skull. Hade den gjort det skulle panelen beskriva något annat än det som faktiskt körs — och en lärobok som ljuger om sin egen
      kod är värre än ingen lärobok.
    </Typography>
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
            Tryck på knappen och se anropet vandra genom fyra lager. Klicka på ett steg för att läsa varför just det lagret finns.
          </Typography>
          <FlowTraceDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            2. Fyra avsteg, och skälen
          </Typography>
          <Typography color='textSecondary'>
            Rubriken över varje kort är viktigare än exemplet under. Det är sorten av beslut som går att ta med sig någon annanstans.
          </Typography>
          <DecisionList />
        </Stack>
      </Stack>
    }
    // Ordningen är flödets: panelen först, sedan kedjan den spårar, och sist de
    // två filer som bär avsteg som inte syns i kedjan.
    //
    // Den här modulen är unik i att Kod-delen inte är koden bakom demon utan
    // koden demon beskriver. Att de flesta filerna redan är bekanta är
    // meningen: nu ses de som ett system i stället för som fem lektioner.
    sources={[
      {
        fileName: 'src/modules/architecture/components/flowTraceDemo.tsx',
        code: flowTraceDemoSource,
        language: 'tsx',
        // Interceptorerna som hakas på och av - hela skälet till att
        // axiosClient kan lämnas orörd.
        highlight: ['const requestId = axiosClient.interceptors.request.use', 'axiosClient.interceptors.request.eject(requestId);'],
      },
      {
        fileName: 'src/modules/queryCache/hooks/queries/useFetchUsers.ts',
        code: useFetchUsersSource,
        language: 'ts',
        // Hooken vet nyckeln men ingenting om HTTP.
        highlight: ['queryKey: usersKeys.lists()', 'queryFn: () => getUsers('],
      },
      {
        fileName: 'src/services/api/users.ts',
        code: usersServiceSource,
        language: 'ts',
        // Servicen innehåller ingen React - bara en funktion som returnerar
        // typad data.
        highlight: ['export const getUsers'],
      },
      {
        fileName: 'src/services/axios/axiosClient.ts',
        code: axiosClientSource,
        language: 'ts',
        // Basadressen, och kontrollen som gör att ett svar som inte är JSON
        // aldrig når cachen.
        highlight: ['baseURL:', "if (contentType.includes('application/json'))"],
      },
      {
        fileName: 'src/services/mocks/handlers.ts',
        code: handlersSource,
        language: 'ts',
        // Andra änden av kedjan.
        highlight: ["http.get('/api/users',"],
      },
      {
        fileName: 'src/main.tsx',
        code: mainSource,
        language: 'tsx',
        // Avsteget: workern startas i alla lägen, och renderingen väntar in
        // den.
        highlight: ["import('./services/mocks/browser')", 'await worker.start('],
      },
      {
        fileName: 'src/modules/architecture/hooks/architectureKeys.ts',
        code: architectureKeysSource,
        language: 'ts',
        // Avsteget: roten bär modulens namn och inte bara resursens.
        highlight: ["all: ['architecture'] as const,"],
      },
    ]}
    quiz={architectureQuestions}
  />
);
