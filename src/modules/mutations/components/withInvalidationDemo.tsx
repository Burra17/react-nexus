import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useIsMutating } from '@tanstack/react-query';
import { readUserRequestCount } from '../../../services/mocks/handlers';
import { RequestCounterPanel } from '../../../shared/components/requestCounterPanel';
import { useRerenderOnCacheChange } from '../../../shared/hooks/useRerenderOnCacheChange';
import { useUpdateUserRoleWithInvalidation } from '../hooks/mutations/useUpdateUserRoleWithInvalidation';
import { RoleList } from './roleList';

// Den här delen äger Bo.
const USER_ID = 'bo';
const USER_NAME = 'Bo';

const ROLES = ['Testare', 'Produktägare'];

export const WithInvalidationDemo = () => {
  const { mutate, isPending, data } = useUpdateUserRoleWithInvalidation();

  useRerenderOnCacheChange();
  useIsMutating();

  const requestCount = readUserRequestCount();

  return (
    <Stack spacing={3}>
      <RoleList demo='medInvalidering' ownedUserId={USER_ID} />

      <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
        {/* En mutation delas här, till skillnad från i del 1. Två knappar mot
            samma hook betyder att båda blir inaktiva medan någon av dem
            sparar - vilket är vad man oftast vill ha, och skälet till att
            skillnaden mot del 1 är värd att se. */}
        {ROLES.map((role) => (
          <Button key={role} variant='contained' disabled={isPending} onClick={() => mutate({ id: USER_ID, role })}>
            {isPending ? 'Sparar …' : `Gör ${USER_NAME} till ${role}`}
          </Button>
        ))}
      </Stack>

      {data && (
        <Typography variant='caption' color='textSecondary'>
          Servern svarade: {data.name} är {data.role}
        </Typography>
      )}

      <Alert severity='info'>
        <strong>Ordningen är det som lärs ut här.</strong> Klicka och följ listan ovanför: den står stilla medan anropet är på väg, snurran tänds när
        invalideringen utlöst en hämtning, och först när den kommit tillbaka byts rollen. Vyn uppdateras alltså inte av att mutationen lyckades — den
        uppdateras av hämtningen invalideringen orsakade.
      </Alert>

      <RequestCounterPanel
        total={requestCount}
        caption='Nollställ och klicka en gång. Två anrop: skrivningen, och hämtningen som invalideringen utlöste. Det andra är priset för att vyn ska stämma.'
      />
    </Stack>
  );
};
