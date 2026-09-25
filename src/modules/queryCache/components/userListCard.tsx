import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFetchSharedUsers } from '../hooks/queries/useFetchSharedUsers';

type UserListCardProps = {
  title: string;
};

// Ett kort som visar listan med användare.
//
// Kortet vet ingenting om de andra korten. Det anropar bara hooken, precis som
// vilken komponent som helst i en riktig app skulle göra - och det är just
// därför demon bevisar något: att fyra sådana här ger ett enda anrop följer av
// att de delar nyckel, inte av att någon samordnat dem.
export const UserListCard = ({ title }: UserListCardProps) => {
  const { data, isPending, isError, error, fetchStatus } = useFetchSharedUsers();

  return (
    <Paper variant='outlined' sx={{ p: 2, minWidth: 210, flex: 1 }}>
      <Stack spacing={1}>
        <Stack direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {title}
          </Typography>

          {/* Snurran syns i ALLA kort samtidigt när listan hämtas om. Det är
              inte fyra hämtningar som råkar gå ihop - det är en hämtning som
              fyra komponenter tittar på. */}
          {fetchStatus === 'fetching' && <CircularProgress size={14} />}
        </Stack>

        {isPending && <Typography color='textSecondary'>Hämtar …</Typography>}

        {isError && (
          <Typography color='error' variant='body2'>
            {error.message}
          </Typography>
        )}

        {data && (
          <Stack spacing={0.25}>
            {data.map((user) => (
              <Typography key={user.id} variant='body2' color='textSecondary'>
                {user.name}
              </Typography>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
