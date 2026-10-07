import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RequestCounterPanel } from '../../../shared/components/requestCounterPanel';
import { useUpdateUserRoleWithInvalidation } from '../hooks/mutations/useUpdateUserRoleWithInvalidation';
import { RoleList } from './roleList';

// Den här delen äger Bo.
const USER_ID = 'bo';
const USER_NAME = 'Bo';

const ROLES = ['Testare', 'Produktägare'];

export const WithInvalidationDemo = () => {
  const { mutate, isPending, data, variables } = useUpdateUserRoleWithInvalidation();

  return (
    <Stack spacing={3}>
      <RoleList demo='medInvalidering' ownedUserId={USER_ID} />

      <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 2 }}>
        {/* Här anropas hooken en gång, högst upp i komponenten, och båda
            knapparna använder samma resultat. Det är alltså en och samma
            mutation, till skillnad från den första demon där varje knapp
            anropar hooken själv. Därför blir båda inaktiva medan någon av dem
            sparar, vilket är vad man oftast vill ha.

            Att BÅDA blir inaktiva men bara EN säger "Sparar …" är avsiktligt.
            Delat tillstånd betyder inte att man tappar reda på vad som är på
            väg: variables är nyttolasten som skickades in, och den går att
            läsa medan anropet pågår. Utan den skillnaden ser det ut som att
            båda knapparna sparar samtidigt. */}
        {ROLES.map((role) => (
          <Button key={role} variant='contained' disabled={isPending} onClick={() => mutate({ id: USER_ID, role })}>
            {isPending && variables?.role === role ? 'Sparar …' : `Gör ${USER_NAME} till ${role}`}
          </Button>
        ))}
      </Stack>

      {data && (
        <Typography variant='caption' color='textSecondary'>
          Servern svarade: {data.name} är {data.role}
        </Typography>
      )}

      <Alert severity='info'>
        <strong>Ordningen är det som lärs ut här.</strong> Klicka och följ listan ovanför. Den står stilla medan anropet är på väg. När servern svarat
        dyker svaret upp under knapparna, och snurran till höger om listans rubrik tänds: invalideringen har utlöst en hämtning. Först när den kommit
        tillbaka byts rollen. Vyn uppdateras alltså inte av att mutationen lyckades, utan av hämtningen invalideringen orsakade. Båda knapparna
        använder samma anrop av hooken, alltså en och samma mutation, och därför är båda inaktiva medan den ena sparar. Listan hämtas från samma
        server som de andra demonas, så har du sparat något i den första demon syns det också här när listan hämtas om.
      </Alert>

      <RequestCounterPanel
        demo='medInvalidering'
        caption='Nollställ och klicka en gång. Två anrop: skrivningen, och hämtningen som invalideringen utlöste. Det andra är priset för att vyn ska stämma.'
      />
    </Stack>
  );
};
