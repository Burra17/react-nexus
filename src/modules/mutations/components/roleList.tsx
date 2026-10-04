import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFetchMutationUsers } from '../hooks/queries/useFetchMutationUsers';
import type { MutationDemo } from '../hooks/mutationUsersKeys';

type RoleListProps = {
  demo: MutationDemo;
  // Vilken av användarna den här demonstrationen får ändra på. De andra två
  // står med för att det ska synas att en mutation ändrar en enda användare,
  // inte hela listan.
  ownedUserId: string;
};

// Listan som varje demonstration skriver mot.
//
// Alla tre demonstrationer hämtar samma lista från samma sökväg, men var och en
// under sin egen nyckel (se mutationUsersKeys). Delade de query skulle den
// första demons frusna vy tina så fort den andra invaliderade.
//
// Varje demonstration äger dessutom sin egen användare och ändrar bara den.
// Servern är däremot gemensam: en ändring i en demo syns i en annans lista
// nästa gång den hämtas om. Texten i den andra demon säger det.
export const RoleList = ({ demo, ownedUserId }: RoleListProps) => {
  const { data, isPending, isError, error, fetchStatus } = useFetchMutationUsers(demo);

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            Vad den här demons lista i cachen säger
          </Typography>

          {/* Snurran visar en hämtning i bakgrunden. Utan den är en invalidering
              osynlig när svaret råkar bli detsamma som det som redan står. */}
          {fetchStatus === 'fetching' && <CircularProgress size={14} />}
        </Stack>

        {/* På en query är isPending sant bara innan datan finns första gången.
            Senare hämtningar syns i fetchStatus, och därför har snurran ovan
            ett eget villkor. */}
        {isPending && <Typography color='textSecondary'>Hämtar …</Typography>}

        {isError && (
          <Typography color='error' variant='body2'>
            {error.message}
          </Typography>
        )}

        {data && (
          <Stack spacing={0.5}>
            {data.map((user) => (
              <Stack key={user.id} direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant='body2'>
                  {user.name}: <strong>{user.role}</strong>
                </Typography>

                {/* Etikett och inte bara en avvikande färg: den som inte
                    uppfattar färgskillnaden ska ändå se vilken rad demon rör. */}
                {user.id === ownedUserId && <Chip size='small' label='den här demons rad' />}
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
