import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { readUserRequestCount } from '../../../services/mocks/handlers';
import { RequestCounterPanel } from '../../../shared/components/requestCounterPanel';
import { useFetchCachedUser } from '../hooks/queries/useFetchCachedUser';
import { usersKeys } from '../hooks/usersKeys';

// En fast användare, utan väljare. Den första demon handlar om VILKEN data du
// tittar på; den här handlar om tiden. Två val att göra samtidigt gör det oklart
// vilket av dem som orsakade det man ser.
const USER_ID = 'ada';

// De två reglagen har olika lägsta värde, och det är uppmätt och inte tyckt.
//
// staleTime börjar på noll eftersom det ÄR standarden: data räknas som inaktuell
// direkt. Det är en av modulens poänger och måste gå att se.
//
// gcTime börjar på en sekund. Med noll tas posten bort i samma ögonblick som den
// sista komponenten slutar titta - också i den lilla lucka StrictMode skapar när
// den avmonterar och monterar om varje komponent en extra gång i utvecklingsläge.
// Då kan posten hinna försvinna mitt i en pågående hämtning, och demon blir
// ryckig på ett sätt som inte lär ut något om gcTime. En sekund räcker för att
// alla tre utfallen ska gå att framkalla, och beteendet blir förutsägbart.
const STALE_TIMES_MS = [0, 5000, 30000];
const GC_TIMES_MS = [1000, 5000, 30000];

const formatSeconds = (ms: number) => `${Math.round(ms / 1000)} s`;

// En rad i panelen. Kopierad från userQueryDemo med flit: det är andra
// förekomsten, och CLAUDE.md bryter ut vid tredje.
const StatusRow = ({ label, value }: { label: string; value: string }) => (
  <Stack direction='row' spacing={2} sx={{ justifyContent: 'space-between' }}>
    <Typography variant='body2' color='textSecondary'>
      {label}
    </Typography>
    <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
      {value}
    </Typography>
  </Stack>
);

type CachedUserCardProps = {
  staleTimeMs: number;
  gcTimeMs: number;
};

// Komponenten som faktiskt kör frågan. Den monteras av och på, och det är hela
// mekaniken: gcTime börjar ticka först när den sista komponenten som tittar på
// en cachepost försvinner.
const CachedUserCard = ({ staleTimeMs, gcTimeMs }: CachedUserCardProps) => {
  const { data, isPending, fetchStatus, isError, error } = useFetchCachedUser({ id: USER_ID, staleTimeMs, gcTimeMs });

  if (isPending) {
    return (
      <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress size={24} />
        <Typography>Hämtar från början — posten fanns inte i cachen.</Typography>
      </Stack>
    );
  }

  if (isError) {
    return <Alert severity='error'>{error.message}</Alert>;
  }

  return (
    <Stack spacing={0.5}>
      <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant='h3' component='p'>
          {data.name}
        </Typography>

        {/* Samma snurra som i den första demon, av samma skäl: utan den är en
            bakgrundshämtning osynlig, eftersom namnet på skärmen står kvar. */}
        {fetchStatus === 'fetching' && <CircularProgress size={14} />}
      </Stack>
      <Typography color='textSecondary'>{data.role}</Typography>
    </Stack>
  );
};

export const CacheClockDemo = () => {
  const queryClient = useQueryClient();

  const [staleTimeMs, setStaleTimeMs] = useState(5000);
  const [gcTimeMs, setGcTimeMs] = useState(5000);
  const [isVisiting, setIsVisiting] = useState(true);

  // När man senast lämnade vyn. Behövs för nedräkningen mot gcTime, som börjar
  // just då och inte när datan hämtades.
  const [leftAt, setLeftAt] = useState<number | null>(null);

  // Klockan som får panelen att rita om medan tiden går.
  //
  // En effekt är rätt val här: ett intervall är något utanför React som måste
  // startas och städas, vilket är precis vad effekter finns till för. Utan den
  // skulle nedräkningen stå still tills något annat råkade orsaka en rendering.
  //
  // Startvärdet sätts med en funktion och inte med Date.now() rakt av. Ett
  // argument beräknas vid varje rendering även när det bara används första
  // gången, och en klocka avläst mitt under renderingen gör komponenten oren -
  // lintregeln react-hooks/purity stoppar det.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);

    return () => window.clearInterval(timer);
  }, []);

  // Cachen läses direkt, utanför hooken. Det är enda sättet att se posten när
  // ingen komponent tittar på den - och det är precis det läget demon handlar om.
  //
  // getQueryState returnerar undefined när posten är borta. Skillnaden mellan
  // "finns kvar men inaktuell" och "borttagen" är hela lektionen.
  const cacheState = queryClient.getQueryState(usersKeys.clock(USER_ID));
  const requestCount = readUserRequestCount();

  const dataUpdatedAt = cacheState?.dataUpdatedAt ?? 0;
  const freshMsLeft = dataUpdatedAt === 0 ? 0 : Math.max(0, dataUpdatedAt + staleTimeMs - now);
  const gcMsLeft = leftAt === null ? 0 : Math.max(0, leftAt + gcTimeMs - now);

  const leaveView = () => {
    setLeftAt(Date.now());
    setIsVisiting(false);
  };

  const returnToView = () => {
    setLeftAt(null);
    setIsVisiting(true);
  };

  // Tar bort cacheposten så att nästa hämtning skapar den på nytt.
  //
  // Behövs för att gcTime ska gå att sänka. Biblioteket sätter en posts gcTime
  // till det STÖRSTA värde den någonsin sett - i query-core står det ordagrant
  // som Math.max(this.gcTime || 0, nytt värde) - eftersom tiden hör till
  // cacheposten och inte till hooken som tittar på den. Utan den här knappen
  // skulle ett drag nedåt i reglaget se ut att göra något utan att göra det.
  //
  // removeQueries är inte invalidering, som markerar data som inaktuell och
  // hämtar om. Den tar bort posten, vilket är precis vad demon behöver för att
  // kunna börja om från ett känt läge.
  const resetCacheEntry = () => {
    queryClient.removeQueries({ queryKey: usersKeys.clock(USER_ID) });
    setLeftAt(null);
  };

  const cacheValue = cacheState === undefined ? 'borttagen' : 'finns kvar';

  const freshnessValue = (() => {
    if (cacheState === undefined) {
      return '—';
    }

    return freshMsLeft > 0 ? `färsk i ${Math.ceil(freshMsLeft / 1000)} s till` : 'inaktuell';
  })();

  const gcValue = (() => {
    if (isVisiting) {
      return 'tickar inte — någon tittar';
    }

    return cacheState === undefined ? 'posten är städad' : `städas om ${Math.ceil(gcMsLeft / 1000)} s`;
  })();

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography id='staletime-etikett' variant='body2' color='textSecondary'>
          staleTime — hur länge datan räknas som färsk
        </Typography>
        <Box sx={{ pb: 2.5 }}>
          <Slider
            aria-labelledby='staletime-etikett'
            value={staleTimeMs}
            onChange={(_event, next) => setStaleTimeMs(next as number)}
            min={STALE_TIMES_MS[0]}
            max={STALE_TIMES_MS[STALE_TIMES_MS.length - 1]}
            step={null}
            marks={STALE_TIMES_MS.map((value) => ({ value, label: formatSeconds(value) }))}
            valueLabelDisplay='off'
          />
        </Box>
      </Stack>

      <Stack spacing={1}>
        <Typography id='gctime-etikett' variant='body2' color='textSecondary'>
          gcTime — hur länge posten ligger kvar när ingen tittar
        </Typography>
        <Box sx={{ pb: 2.5 }}>
          <Slider
            aria-labelledby='gctime-etikett'
            value={gcTimeMs}
            onChange={(_event, next) => setGcTimeMs(next as number)}
            min={GC_TIMES_MS[0]}
            max={GC_TIMES_MS[GC_TIMES_MS.length - 1]}
            step={null}
            marks={GC_TIMES_MS.map((value) => ({ value, label: formatSeconds(value) }))}
            valueLabelDisplay='off'
          />
        </Box>
      </Stack>

      <Stack direction='row' spacing={2}>
        <Button variant={isVisiting ? 'outlined' : 'contained'} onClick={isVisiting ? leaveView : returnToView}>
          {isVisiting ? 'Lämna vyn' : 'Kom tillbaka'}
        </Button>

        <Button onClick={resetCacheEntry}>Nollställ cacheposten</Button>
      </Stack>

      <Alert severity='info'>
        <strong>gcTime går bara att höja för en post som redan finns.</strong> Biblioteket tar det största värde posten sett, eftersom tiden hör till
        cacheposten och inte till hooken som råkar titta på den. Drar du ner reglaget händer alltså ingenting förrän posten är borta — nollställ den
        med knappen ovan, så gäller det nya värdet från nästa hämtning.
      </Alert>

      <Paper variant='outlined' sx={{ p: 2, minHeight: 124 }}>
        <Stack spacing={1.5}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            Vad vyn visar
          </Typography>

          {isVisiting ? (
            <CachedUserCard staleTimeMs={staleTimeMs} gcTimeMs={gcTimeMs} />
          ) : (
            <Typography color='textSecondary'>Du har lämnat vyn. Komponenten är avmonterad — men posten kan ligga kvar i cachen.</Typography>
          )}
        </Stack>
      </Paper>

      <Paper variant='outlined' sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            Vad cachen säger just nu
          </Typography>

          <StatusRow label='posten i cachen' value={cacheValue} />
          <StatusRow label='färskhet (staleTime)' value={freshnessValue} />
          <StatusRow label='städning (gcTime)' value={gcValue} />
        </Stack>
      </Paper>

      {/* Anropen står i en egen panel och inte som en fjärde StatusRow. Raderna
          ovan är avläsningar av cachen just nu; den här är en mätning läsaren
          själv startar, och den behöver en knapp. */}
      <RequestCounterPanel
        total={requestCount}
        caption='Träffar i den mockade backenden, inte renderingar — ett tal som betyder samma sak här som i ett bygge. Nollställ före varje steg, så syns det direkt om återbesöket kostade ett anrop eller inte.'
      />
    </Stack>
  );
};
