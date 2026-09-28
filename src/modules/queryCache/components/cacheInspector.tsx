import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { usersKeys } from '../hooks/usersKeys';
import { useRerenderOnCacheChange } from '../../../shared/hooks/useRerenderOnCacheChange';

// Modulens egen rot. Allt annat i cachen kommer från andra vyer.
const MODULE_ROOT = usersKeys.all[0];

// Inspektorn över hela cachen.
//
// Den filtrerar med flit INTE bort andra modulers poster. Har du besökt en
// annan konceptvy i samma flik ligger dess data kvar här - data från en sida du
// lämnat, som finns kvar för att cachen tillhör appen och inte vyn. Det är
// modulens tema, synligt utan att någon behöver argumentera för det.
//
// Följden är att panelen ser olika ut beroende på vad du besökt. Det står
// utskrivet under demon, eftersom det annars läses som en bugg.
export const CacheInspector = () => {
  const queryClient = useQueryClient();

  // Utan prenumerationen visar panelen läget som rådde när den senast råkade
  // rita om av någon annan anledning.
  useRerenderOnCacheChange();

  const queries = queryClient.getQueryCache().getAll();

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction='row' spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            Allt som ligger i cachen just nu
          </Typography>
          <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
            {queries.length} poster
          </Typography>
        </Stack>

        {queries.length === 0 && <Typography color='textSecondary'>Cachen är tom.</Typography>}

        {queries.map((query) => {
          const isThisModule = query.queryKey[0] === MODULE_ROOT;

          return (
            <Stack
              key={query.queryHash}
              spacing={0.5}
              sx={{
                p: 1,
                borderRadius: 1,
                // Den egna modulens poster lyfts fram, men de andra döljs inte.
                // Bakgrunden är inte den enda skillnaden: etiketten nedan säger
                // samma sak i ord, eftersom ett läge aldrig får bäras av färg.
                bgcolor: isThisModule ? 'action.hover' : 'transparent',
              }}
            >
              <Typography variant='body2' sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {JSON.stringify(query.queryKey)}
              </Typography>

              <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                <Chip size='small' label={isThisModule ? 'den här modulen' : 'en annan vy'} variant='outlined' />
                <Chip size='small' label={query.state.status} variant='outlined' />
                <Chip size='small' label={query.isStale() ? 'inaktuell' : 'färsk'} variant='outlined' />
                <Chip size='small' label={`${query.observers.length} tittar`} variant='outlined' />
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
};
