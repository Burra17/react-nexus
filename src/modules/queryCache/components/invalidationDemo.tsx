import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { readUserRequestCount } from '../../../services/mocks/handlers';
import { RequestCounterPanel } from '../../../shared/components/requestCounterPanel';
import { useFetchUser } from '../hooks/queries/useFetchUser';
import { useFetchUsers } from '../hooks/queries/useFetchUsers';
import { usersKeys } from '../hooks/usersKeys';
import { useRerenderOnCacheChange } from '../../../shared/hooks/useRerenderOnCacheChange';
import { CacheInspector } from './cacheInspector';

type DetailCardProps = {
  title: string;
  name: string | undefined;
  isFetching: boolean;
  errorMessage: string | undefined;
};

// Kortet har tre lägen och inte två: namn, fel, eller hämtar.
//
// Felet måste stå med. Hookarna körs med retry: false, så en misslyckad
// hämtning lämnar data som undefined för alltid, och ett kort som bara väljer
// mellan namn och "hämtar …" påstår då i all evighet att det hämtar. I en vy om
// hur data hämtas är ett läge som ljuger värre än ett fel.
const DetailCard = ({ title, name, isFetching, errorMessage }: DetailCardProps) => (
  <Paper variant='outlined' sx={{ p: 2, flex: 1, minWidth: 180 }}>
    <Stack spacing={0.5}>
      <Stack direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='body2' color='textSecondary'>
          {title}
        </Typography>
        {isFetching && <CircularProgress size={14} />}
      </Stack>

      {errorMessage === undefined ? (
        <Typography>{name ?? 'hämtar …'}</Typography>
      ) : (
        <Typography color='error' variant='body2'>
          {errorMessage}
        </Typography>
      )}
    </Stack>
  </Paper>
);

export const InvalidationDemo = () => {
  const queryClient = useQueryClient();

  // Tre poster under samma rot: en lista och två detaljer. Utan poster i båda
  // grenarna går skillnaden mellan prefixen inte att visa.
  const list = useFetchUsers();
  const ada = useFetchUser('ada');
  const bo = useFetchUser('bo');

  useRerenderOnCacheChange();

  const requestCount = readUserRequestCount();

  return (
    <Stack spacing={3}>
      <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
        <Paper variant='outlined' sx={{ p: 2, flex: 1, minWidth: 180 }}>
          <Stack spacing={0.5}>
            <Stack direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant='body2' color='textSecondary'>
                Listan
              </Typography>
              {list.fetchStatus === 'fetching' && <CircularProgress size={14} />}
            </Stack>
            {list.error === null ? (
              <Typography>{list.data ? `${list.data.length} användare` : 'hämtar …'}</Typography>
            ) : (
              <Typography color='error' variant='body2'>
                {list.error.message}
              </Typography>
            )}
          </Stack>
        </Paper>

        <DetailCard title='Detalj: ada' name={ada.data?.name} isFetching={ada.fetchStatus === 'fetching'} errorMessage={ada.error?.message} />
        <DetailCard title='Detalj: bo' name={bo.data?.name} isFetching={bo.fetchStatus === 'fetching'} errorMessage={bo.error?.message} />
      </Stack>

      <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {/* Prefixet avgör vad som träffas. usersKeys.all ligger överst i
            fabriken, så det matchar både listan och detaljerna: tre poster,
            tre anrop. */}
        <Button variant='contained' onClick={() => queryClient.invalidateQueries({ queryKey: usersKeys.all })}>
          Invalidera allt under resursen
        </Button>

        {/* Ett steg ner i fabriken: bara listorna. Detaljerna rörs inte, och
            räknaren går upp med ett i stället för tre. */}
        <Button variant='outlined' onClick={() => queryClient.invalidateQueries({ queryKey: usersKeys.lists() })}>
          Invalidera bara listorna
        </Button>

        {/* Kontrasten. refetch ber EN bestämd query att hämta om, oavsett om
            den räknas som färsk. Invalidering säger i stället att data är
            inaktuell och låter Query avgöra vem som behöver hämta om. */}
        <Button onClick={() => void ada.refetch()}>Hämta om bara ada</Button>
      </Stack>

      <RequestCounterPanel
        total={requestCount}
        caption='Nollställ före varje knapptryck. Talet är beviset: det breda prefixet träffar tre poster, det smala en, och den sista knappen en enda utan att märka något som inaktuellt.'
      />

      {/* Samma inspektor som under rubriken Vad som faktiskt ligger i cachen,
          här som mätinstrument. Att den står två gånger sägs i texten nedan:
          på skärmen ser två likadana paneler annars ut som ett misstag. */}
      <Typography color='textSecondary'>
        Panelen nedan är samma cacheinspektor som under rubriken ovan, här som mätinstrument. Posterna växlar till inaktuella i samma ögonblick som du
        trycker på en knapp, och tillbaka till färska när hämtningen kommit hem.
      </Typography>
      <CacheInspector />
    </Stack>
  );
};
