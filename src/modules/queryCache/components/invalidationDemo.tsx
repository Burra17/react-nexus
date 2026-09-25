import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { readUserRequestCount } from '../../../services/mocks/handlers';
import { useFetchUser } from '../hooks/queries/useFetchUser';
import { useFetchUsers } from '../hooks/queries/useFetchUsers';
import { usersKeys } from '../hooks/usersKeys';
import { useRerenderOnCacheChange } from '../hooks/useRerenderOnCacheChange';
import { CacheInspector } from './cacheInspector';

type DetailCardProps = {
  title: string;
  name: string | undefined;
  isFetching: boolean;
};

const DetailCard = ({ title, name, isFetching }: DetailCardProps) => (
  <Paper variant='outlined' sx={{ p: 2, flex: 1, minWidth: 180 }}>
    <Stack spacing={0.5}>
      <Stack direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='body2' color='textSecondary'>
          {title}
        </Typography>
        {isFetching && <CircularProgress size={14} />}
      </Stack>
      <Typography>{name ?? 'hämtar …'}</Typography>
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
            <Typography>{list.data ? `${list.data.length} användare` : 'hämtar …'}</Typography>
          </Stack>
        </Paper>

        <DetailCard title='Detalj: ada' name={ada.data?.name} isFetching={ada.fetchStatus === 'fetching'} />
        <DetailCard title='Detalj: bo' name={bo.data?.name} isFetching={bo.fetchStatus === 'fetching'} />
      </Stack>

      <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {/* Prefixet avgör vad som träffas. usersKeys.all ligger överst i
            fabriken, så det matchar både listan och detaljerna - tre poster,
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

      <Paper variant='outlined' sx={{ p: 2 }}>
        <Stack direction='row' spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Typography variant='body2' color='textSecondary'>
            HTTP-anrop hittills
          </Typography>
          <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
            {requestCount}
          </Typography>
        </Stack>

        <Typography variant='caption' color='textSecondary'>
          Skriv upp talet före varje knapptryck. Skillnaden är beviset: det breda prefixet träffar tre poster, det smala en.
        </Typography>
      </Paper>

      {/* Samma inspektor som i föregående del, här som mätinstrument. Posterna
          växlar till "inaktuell" i samma ögonblick som knappen trycks, och
          tillbaka till "färsk" när hämtningen kommit tillbaka. */}
      <CacheInspector />
    </Stack>
  );
};
