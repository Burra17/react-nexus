import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useIsMutating } from '@tanstack/react-query';
import { readUserRequestCount } from '../../../services/mocks/handlers';
import { RequestCounterPanel } from '../../../shared/components/requestCounterPanel';
import { useRerenderOnCacheChange } from '../../../shared/hooks/useRerenderOnCacheChange';
import { useUpdateUserRoleOptimistic } from '../hooks/mutations/useUpdateUserRoleOptimistic';
import { useFetchMutationUsers } from '../hooks/queries/useFetchMutationUsers';
import { RoleList } from './roleList';

// Den här delen äger Cleo.
const USER_ID = 'cleo';
const USER_NAME = 'Cleo';

// De två rollerna demon växlar mellan.
//
// Rollen räknas fram ur den som står nu i stället för att stå fast i knappen.
// Med ett fast värde ändrade det andra klicket ingenting - hade den lyckade
// knappen redan satt rollen syntes inget hopp när felknappen trycktes, och det
// är hoppet som ska rullas tillbaka. Två roller att växla mellan gör att varje
// klick alltid har en synlig verkan.
const ROLES = ['Teknisk ledare', 'Lösningsarkitekt'];

export const OptimisticDemo = () => {
  const { mutate, isPending, isError } = useUpdateUserRoleOptimistic();

  // Samma nyckel som listan nedan använder, så det här kostar ingen extra
  // hämtning - det är själva poängen med en delad cache.
  const { data } = useFetchMutationUsers('optimistisk');

  useRerenderOnCacheChange();
  useIsMutating();

  const currentRole = data?.find((user) => user.id === USER_ID)?.role;
  const nextRole = ROLES.find((role) => role !== currentRole) ?? ROLES[0];

  const requestCount = readUserRequestCount();

  return (
    <Stack spacing={3}>
      <RoleList demo='optimistisk' ownedUserId={USER_ID} />

      <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
        <Button variant='contained' disabled={isPending} onClick={() => mutate({ id: USER_ID, role: nextRole, shouldFail: false })}>
          {`Gör ${USER_NAME} till ${nextRole}`}
        </Button>

        {/* Felet är beställt och inte slumpmässigt. En rollback som bara
            inträffar ibland går inte att demonstrera - och en växel hade
            tvingat läsaren att hålla reda på vilket läge den stod i mellan två
            klick. Två knappar gör jämförelsen till ett klick i taget. */}
        <Button variant='outlined' disabled={isPending} onClick={() => mutate({ id: USER_ID, role: nextRole, shouldFail: true })}>
          Samma ändring, men låt den gå fel
        </Button>
      </Stack>

      {/* Texten och inte bara en röd färg. Utfallet är det demon handlar om,
          och det ska gå att läsa. */}
      {isPending && (
        <Typography variant='body2' color='textSecondary'>
          Listan visar redan det nya värdet. Servern har ännu inte svarat.
        </Typography>
      )}

      {isError && (
        <Typography variant='body2' color='error'>
          Sparningen misslyckades. Listan rullades tillbaka till det som stod där innan.
        </Typography>
      )}

      <Alert severity='info'>
        <strong>Titta på listan direkt när du klickar.</strong> Rollen byts innan anropet hunnit fram — det är cachen som skrivits i förväg, inte ett
        svar från servern. Med den vänstra knappen står värdet kvar. Med den högra rullas det tillbaka när felet kommer, och först därefter hämtas
        listan om för att kontrollera vad som faktiskt gäller.
      </Alert>

      <RequestCounterPanel
        total={requestCount}
        caption='Nollställ före varje knapp. Båda kostar två anrop — skrivningen och hämtningen från onSettled. Att den misslyckade också hämtar om är hela skillnaden mot onSuccess.'
      />
    </Stack>
  );
};
