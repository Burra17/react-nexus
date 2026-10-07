import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { axiosClient } from '../../../services/axios/axiosClient';
import { architectureKeys } from '../hooks/architectureKeys';
import { useFetchArchitectureUsers } from '../hooks/queries/useFetchArchitectureUsers';

type StepId = 'hook' | 'request' | 'response' | 'cache';

type TraceStep = {
  id: StepId;
  label: string;
  file: string;
  // Varför det här lagret finns. Det är hela modulens innehåll, och flödet är
  // bara tråden att hänga besluten på.
  decision: string;
};

const STEPS: TraceStep[] = [
  {
    id: 'hook',
    label: 'Hooken startar hämtningen',
    file: 'src/modules/architecture/hooks/queries/useFetchArchitectureUsers.ts',
    decision:
      'Hooken är gränsen mellan React och data. Den vet vilken nyckel som gäller, men ingenting om HTTP: den anropar bara servicen. Demon har en egen hook i stället för att låna en annan moduls, och det är inte en kopia i den mening regeln förbjuder. Den hämtar först när du trycker, och dess nyckel är demons egen, så att posten i cachen inte blandas ihop med en annan vys. Servicen den anropar är densamma som de andra modulernas.',
  },
  {
    id: 'request',
    label: 'Servicen skickar anropet',
    file: 'src/services/api/users.ts → src/services/axios/axiosClient.ts',
    decision:
      'Servicen anropar axiosClient, och axios skickar anropet. Servicelagret ligger i services/ på rotnivå, alltså bredvid modulerna och inte inne i någon av dem, eftersom de flesta moduler inte hämtar något alls. Servicen innehåller ingen React. Den tar argument och returnerar data med en känd form, och går därför att läsa utan att veta något om komponenten som anropade den.',
  },
  {
    id: 'response',
    label: 'Svaret kommer tillbaka',
    file: 'src/services/axios/axiosClient.ts',
    decision:
      'Här kör axiosClient sin egen interceptor på svaret, den enda i appen utöver de två som den här vyn lägger till. Den kontrollerar att svaret är JSON. Appen är en ensidesapp, en enda HTML-sida som byter innehåll utan att laddas om, och därför svarar servern med den sidan, index.html, på varje adress den inte känner igen. Det gäller också ett anrop under /api som MSW missat, och svaret har då status 200, som betyder att allt gick bra. Utan kontrollen hade axios tagit webbsidan för data. Är svaret inte JSON väcker interceptorn MSW och gör om anropet en gång, eftersom MSW kan ha somnat. En regel som ska gälla varje anrop hör hemma på ett ställe, inte upprepad i varje service.',
  },
  {
    id: 'cache',
    label: 'Query lägger svaret i cachen',
    file: 'src/services/queryClient.ts',
    decision:
      'Cachen tillhör appen och inte komponenten som hämtade. Därför ger flera komponenter som frågar efter samma nyckel bara ett anrop, och därför finns datan kvar när du kommer tillbaka till en vy. Filen services/queryClient.ts, som inte visas i Kod-delen, skapar cachen och lämnar bibliotekets standardinställningar orörda, till exempel hur länge ett svar räknas som färskt. En inställning för hela appen hade varit osynlig i hookarna, och en hook som kopieras härifrån till ett annat projekt hade betett sig annorlunda utan att något i den avslöjar varför.',
  },
];

// Är det här cachehändelsen om demons egen hämtning?
//
// Cachen är appens, så prenumerationen får händelser om varje query i hela
// appen, även poster andra moduler lagt in i samma flik. Utan filtret skulle
// panelen stämpla någon annans hämtning som sin egen.
const isTraceQuery = (queryKey: readonly unknown[]) => queryKey[0] === architectureKeys.all[0] && queryKey[1] === 'trace';

export const FlowTraceDemo = () => {
  const queryClient = useQueryClient();

  const { data, error, isError, fetchStatus, refetch } = useFetchArchitectureUsers();

  const [trace, setTrace] = useState<Partial<Record<StepId, number>>>({});
  const [openStep, setOpenStep] = useState<StepId | null>(null);

  // Första stämpeln per steg vinner. En omkörning nollställer hela objektet.
  const mark = useCallback((id: StepId) => {
    // Tiden tas här, när händelsen inträffar. Inne i uppdateringen hade den
    // tagits först när React behandlar den, och det kan vara senare.
    const at = performance.now();
    setTrace((current) => (id in current ? current : { ...current, [id]: at }));
  }, []);

  // DET HÄR ÄR MODULENS VIKTIGASTE RAD, och skälet står här:
  //
  // Interceptorerna registreras HÄRIFRÅN och tas bort igen när komponenten
  // avmonteras. axiosClient.ts rörs inte med en enda rad.
  //
  // Hade panelen krävt loggning inne i axiosClient skulle modulen visa en
  // förvanskad version av just den kod den påstår sig förklara, och då vore
  // den värdelös. Att interceptorer går att haka på och av utifrån är också
  // precis varför de är rätt plats för regler som ska gälla varje anrop.
  //
  // Vår response-interceptor registreras efter appens egen, och axios kör dem
  // i registreringsordning. Content-type-kontrollen hinner alltså först, vilket
  // är rätt: gör den om anropet vill vi stämpla det slutliga svaret.
  useEffect(() => {
    const requestId = axiosClient.interceptors.request.use((config) => {
      mark('request');

      return config;
    });

    const responseId = axiosClient.interceptors.response.use((response) => {
      mark('response');

      return response;
    });

    return () => {
      axiosClient.interceptors.request.eject(requestId);
      axiosClient.interceptors.response.eject(responseId);
    };
  }, [mark]);

  // Steg 1 och 4 går inte att observera med en interceptor, eftersom de sker
  // inne i Query. Vi prenumererar på cachen i stället.
  //
  // Att det blir en prenumeration och inte två effekter som läser hookens
  // fetchStatus är inte en smaksak: setState rakt i en effektkropp ger
  // kaskadrenderingar, och lintregeln react-hooks/set-state-in-effect stoppar
  // det. En callback från ett externt system är undantaget regeln pekar ut,
  // och query-cachen ÄR ett externt system, vilket är hela skälet till att
  // useRerenderOnCacheChange i shared/hooks finns och ser ut som den gör.
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (!isTraceQuery(event.query.queryKey)) {
        return;
      }

      const { status, fetchStatus: queryFetchStatus } = event.query.state;

      if (queryFetchStatus === 'fetching') {
        mark('hook');
      }

      if (status === 'success' && queryFetchStatus === 'idle') {
        mark('cache');
      }
    });

    return unsubscribe;
  }, [queryClient, mark]);

  const startedAt = trace.hook;

  const formatOffset = (at: number | undefined) => {
    if (at === undefined || startedAt === undefined) {
      return '–';
    }

    return `+${Math.round(at - startedAt)} ms`;
  };

  const isRunning = fetchStatus === 'fetching';

  return (
    <Stack spacing={3}>
      <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Button
          variant='contained'
          disabled={isRunning}
          onClick={() => {
            setTrace({});
            setOpenStep(null);
            void refetch();
          }}
        >
          {isRunning ? 'Anropet är på väg …' : 'Gör ett anrop'}
        </Button>

        <Typography variant='body2' color='textSecondary'>
          {data ? `Senaste svaret: ${data.length} användare` : 'Inget anrop gjort än'}
        </Typography>
      </Stack>

      {isError && <Alert severity='error'>{error.message}</Alert>}

      <Stack spacing={1}>
        {STEPS.map((step, index) => {
          const at = trace[step.id];
          const isDone = at !== undefined;
          const isOpen = openStep === step.id;

          return (
            <Paper key={step.id} variant='outlined' sx={{ p: 0 }}>
              {/* Ett riktigt button-element och inte en klickbar div, så att
                  steget går att nå med tangentbord. */}
              <Stack
                component='button'
                type='button'
                onClick={() => setOpenStep(isOpen ? null : step.id)}
                aria-expanded={isOpen}
                direction='row'
                spacing={2}
                sx={{
                  width: '100%',
                  p: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'inherit',
                  font: 'inherit',
                }}
              >
                <Stack direction='row' spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
                  {/* Siffran säger ordningen även innan något hänt, och
                      "klar" står som ord bredvid. Status visas aldrig enbart
                      som färg. */}
                  <Chip size='small' label={index + 1} />

                  <Stack sx={{ minWidth: 0 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {step.label}
                    </Typography>
                    {/* overflowWrap: 'anywhere' behövs för att en sökväg inte
                        har några mellanslag att brytas vid. Utan den svämmar
                        raden över sin spalt på en smal skärm och tvingar fram
                        horisontell scroll för hela sidan, uppmätt till 511 px
                        innehåll i en 375 px vid.

                        Att korta av sökvägen med ellips vore fel: det är just
                        VAR i strukturen lagret ligger som modulen handlar om. */}
                    <Typography variant='caption' color='textSecondary' sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}>
                      {step.file}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                    {formatOffset(at)}
                  </Typography>
                  <Typography variant='caption' color='textSecondary'>
                    {isDone ? 'klar' : 'väntar'}
                  </Typography>
                </Stack>
              </Stack>

              {isOpen && (
                <Typography variant='body2' color='textSecondary' sx={{ px: 2, pb: 2 }}>
                  {step.decision}
                </Typography>
              )}
            </Paper>
          );
        })}
      </Stack>

      <Alert severity='info'>
        <strong>Tiderna räknas från steg 1 och tas i samma ögonblick som varje händelse inträffar.</strong> Steg 2 kommer några millisekunder efter
        steg 1, när servicen har anropat axios. Mellan steg 2 och 3 ligger själva anropet. Det tar runt 900 millisekunder, eftersom hooken ber MSW att
        vänta så länge innan den svarar, så att stegen hinner synas var för sig. Det finns inget nätverk, så utan fördröjningen hade svaret kommit
        nästan direkt. Steg 4 kommer samtidigt som steg 3, räknat i hela millisekunder.
      </Alert>
    </Stack>
  );
};
