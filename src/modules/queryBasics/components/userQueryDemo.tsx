import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useFetchUser } from '../hooks/queries/useFetchUser';
import { usersKeys } from '../hooks/usersKeys';

// De två användarna är desamma som i kapplöpningsdemon i modul 3. Där hämtades
// de med ett löfte inne i komponenten och svaren kunde komma i fel ordning. Här
// går samma hämtning över riktig HTTP, genom servicelagret, med cachen emellan.

// Stegen är valda så att alla lägen går att se. Noll för att svaret ska komma
// innan man hinner blinka, 1500 och 3000 för att laddningsläget ska hinna bli
// något man tittar på i stället för något som blinkar förbi.
const DELAYS = [0, 300, 800, 1500, 3000];

// En rad i statuspanelen.
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

export const UserQueryDemo = () => {
  // Ingen användare är vald från början, så demon gör ingen hämtning förrän du
  // klickar. Det är inte för att spara ett anrop: en query som hämtar direkt
  // visar alltid pending och fetching samtidigt, och då syns det aldrig att de
  // två fälten svarar på olika frågor.
  const [id, setId] = useState<string | null>(null);
  const [delayMs, setDelayMs] = useState(800);
  const [shouldFail, setShouldFail] = useState(false);

  // Hela hämtningen: en rad. Ingen useState för data, ingen för laddning, ingen
  // för fel, och ingen useEffect som håller ihop dem.
  const { data, status, fetchStatus, isPending, isError, error, dataUpdatedAt } = useFetchUser({ id, delayMs, shouldFail });

  // De tre lägena, uttryckta som kombinationer av de två fälten - inte som en
  // egen flagga vid sidan om. Det är kombinationerna som är lektionen.
  const isPaused = isPending && fetchStatus === 'idle';
  const isFirstLoad = isPending && fetchStatus === 'fetching';
  const isBackgroundFetch = !isPending && fetchStatus === 'fetching';

  // Nyckeln skrivs ut som den faktiskt ser ut. Den ändras när du byter användare
  // och när du slår på felväxeln - men inte när du drar i latensreglaget, och
  // den skillnaden är hela poängen med vad som hör hemma i en queryKey.
  const queryKey = JSON.stringify(usersKeys.detail(id, shouldFail));

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography id='anvandare-etikett' variant='body2' color='textSecondary'>
          Vilken användare som hämtas
        </Typography>
        <ToggleButtonGroup
          aria-labelledby='anvandare-etikett'
          exclusive
          value={id}
          onChange={(_event, next: string | null) => {
            // null kommer när man klickar på den redan valda knappen. Då behålls
            // valet: demon ska gå att komma till ett tomt läge från, men inte
            // ramla tillbaka dit av ett klick man inte menade.
            if (next !== null) {
              setId(next);
            }
          }}
        >
          <ToggleButton value='ada'>Ada</ToggleButton>
          <ToggleButton value='bo'>Bo</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={1}>
        <Typography id='svarstid-etikett' variant='body2' color='textSecondary'>
          Svarstid hos den mockade backenden
        </Typography>

        {/* Boxen finns för utrymmets skull, inte för layoutens.

            Sliderns marks-etiketter ligger absolut positionerade och sticker ut
            20 px under sliderns egen box, utan att räknas in i höjden - så
            texten under hamnar under dem. En marginal på slidern hjälper inte:
            Stack nollställer margin på sina direkta barn, och den regeln väger
            tyngre än sx. Padding rör Stack inte, därav wrappern. */}
        <Box sx={{ pb: 2.5 }}>
          <Slider
            aria-labelledby='svarstid-etikett'
            value={delayMs}
            onChange={(_event, next) => setDelayMs(next as number)}
            min={DELAYS[0]}
            max={DELAYS[DELAYS.length - 1]}
            step={null}
            marks={DELAYS.map((value) => ({ value, label: `${value} ms` }))}
            valueLabelDisplay='off'
          />
        </Box>

        <Typography variant='caption' color='textSecondary'>
          Fördröjningen står inte i nyckeln, så ett drag här hämtar inte om. Den gäller nästa anrop.
        </Typography>
      </Stack>

      <FormControlLabel
        control={<Switch checked={shouldFail} onChange={(event) => setShouldFail(event.target.checked)} />}
        label='Låt anropet misslyckas (500 från servern)'
      />

      <Paper variant='outlined' sx={{ p: 2, minHeight: 172 }}>
        <Stack spacing={1.5}>
          {/* Rubriken skiljer gränssnittet från tillståndet. Panelen nedanför
              säger vad hooken svarar; den här rutan säger vad läsaren ser. Utan
              rubrikerna är de två inramade rutor utan inbördes förhållande. */}
          <Stack direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              Vad vyn visar
            </Typography>

            {/* Bakgrundshämtningen är annars osynlig: data står kvar på skärmen
                medan ett nytt anrop går. Snurran har text bredvid sig, eftersom
                ett läge aldrig får bäras av enbart en rörelse eller en färg. */}
            {isBackgroundFetch && (
              <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                <CircularProgress size={14} />
                <Typography variant='caption' color='textSecondary'>
                  hämtar om i bakgrunden
                </Typography>
              </Stack>
            )}
          </Stack>

          {isPaused && (
            <Typography color='textSecondary'>Ingen användare vald. Queryn finns, men den kör inte - se de två fälten i panelen nedan.</Typography>
          )}

          {isFirstLoad && (
            <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
              <CircularProgress size={24} />
              <Typography>Hämtar användaren …</Typography>
            </Stack>
          )}

          {/* Felets eget meddelande står med, och inte bara en text vi skrivit.
              Rutan ska säga vad som faktiskt hände - annars påstår den 500 även
              den gång felet var något helt annat. Nyckeln med felflaggan är
              dessutom ny, så det finns ingen tidigare data att falla tillbaka på
              och kortet är tomt. */}
          {isError && (
            <Alert severity='error'>
              <Typography variant='body2'>
                Hämtningen misslyckades, och inget omförsök gjordes: retry är avstängt här, mot standardens tre.
              </Typography>
              <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
                {error.message}
              </Typography>
            </Alert>
          )}

          {data && (
            <Stack spacing={0.5}>
              <Typography variant='h3' component='p'>
                {data.user.name}
              </Typography>
              <Typography color='textSecondary'>{data.user.role}</Typography>
              <Typography variant='body2' color='textSecondary'>
                {data.user.email}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Paper variant='outlined' sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            Vad hooken svarar just nu
          </Typography>

          <StatusRow label='queryKey' value={queryKey} />
          <StatusRow label='status (har vi data?)' value={status} />
          <StatusRow label='fetchStatus (kör den?)' value={fetchStatus} />
          <StatusRow label='isPending' value={String(isPending)} />
          <StatusRow label='isError' value={String(isError)} />
          <StatusRow label='dataUpdatedAt' value={dataUpdatedAt === 0 ? 'aldrig' : new Date(dataUpdatedAt).toLocaleTimeString('sv-SE')} />

          {/* Raden finns för att reglaget ska gå att jämföra med verkligheten.
              Står det 3000 ovanför medan hämtningen kördes med 800 är det inte
              en bugg - det är att fördröjningen inte står i nyckeln. */}
          <StatusRow label='svarstid i senaste anropet' value={data ? `${data.usedDelayMs} ms` : 'inget anrop än'} />
        </Stack>
      </Paper>
    </Stack>
  );
};
