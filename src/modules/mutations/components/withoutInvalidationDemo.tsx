import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useIsMutating } from '@tanstack/react-query';
import { readUserRequestCount } from '../../../services/mocks/handlers';
import { RequestCounterPanel } from '../../../shared/components/requestCounterPanel';
import { useRerenderOnCacheChange } from '../../../shared/hooks/useRerenderOnCacheChange';
import { useUpdateUserRole } from '../hooks/mutations/useUpdateUserRole';
import { RoleList } from './roleList';

// Demonstrationen äger Ada. De andra två delarna äger Bo och Cleo.
const USER_ID = 'ada';
const USER_NAME = 'Ada';

type RoleButtonProps = {
  role: string;
};

// En knapp med en egen mutation.
//
// Att hooken anropas HÄR och inte i föräldern är hela poängen med att det är
// två knappar. Varje knapp får sin egen useMutation, och därmed sitt eget
// isPending och sitt eget svar. Klickar du på den ena händer ingenting med den
// andra - en useQuery med samma nyckel hade delats av båda, en useMutation har
// ingen nyckel att dela.
const RoleButton = ({ role }: RoleButtonProps) => {
  const { mutate, isPending, data, isError, error } = useUpdateUserRole();

  return (
    <Stack spacing={0.5} sx={{ minWidth: 240 }}>
      <Button variant='contained' disabled={isPending} onClick={() => mutate({ id: USER_ID, role })}>
        {isPending ? 'Sparar …' : `Gör ${USER_NAME} till ${role}`}
      </Button>

      {/* Serverns eget svar, inte vad vi hoppades på. Det är beviset att
          skrivningen gick igenom trots att listan ovan står kvar oförändrad. */}
      {data && (
        <Typography variant='caption' color='textSecondary'>
          Servern svarade: {data.name} är {data.role}
        </Typography>
      )}

      {isError && (
        <Typography variant='caption' color='error'>
          {error.message}
        </Typography>
      )}
    </Stack>
  );
};

export const WithoutInvalidationDemo = () => {
  useRerenderOnCacheChange();

  // Cacheprenumerationen ovan räcker inte i just den här demon, och skälet är
  // demonstrationens egen poäng: mutationen rör aldrig cachen, så ingenting
  // händer där som kan utlösa en omritning. Utan raden nedan skulle räknaren
  // stå kvar på noll efter ett klick och säga emot Network-fliken.
  //
  // useIsMutating räknar pågående mutationer, och antalet ändras både när en
  // startar och när den blir klar. Returvärdet används inte - det är
  // omritningen vi är ute efter.
  useIsMutating();

  const requestCount = readUserRequestCount();

  return (
    <Stack spacing={3}>
      <RoleList demo='utanInvalidering' ownedUserId={USER_ID} />

      <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
        <RoleButton role='Systemarkitekt' />
        <RoleButton role='Produktägare' />
      </Stack>

      <Alert severity='warning'>
        <strong>Den här demon är med flit ofullständig.</strong> Mutationen saknar den rad som talar om för cachen att listan inte längre stämmer.
        Klicka på en knapp: anropet går iväg, servern svarar med den nya rollen — och listan ovanför står kvar på den gamla. Ladda om sidan, så ser du
        att servern verkligen sparade.
      </Alert>

      <RequestCounterPanel
        total={requestCount}
        caption='Nollställ och klicka en gång. Ett anrop går iväg, och inget mer — utan invalidering finns det ingen hämtning efteråt.'
      />
    </Stack>
  );
};
