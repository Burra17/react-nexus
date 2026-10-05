import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { ControlledForm } from './controlledForm';
import { UncontrolledForm } from './uncontrolledForm';

// De två formulären sida vid sida, så att räknarna går att jämföra utan att
// hålla ett tal i huvudet mellan två vyer.
//
// Fälten är två och inte tre. Rollen, som är en Select, hör till nästa del:
// en Select kan inte vara okontrollerad på ett vettigt sätt, och att visa den
// här skulle betyda att förklara undantaget innan regeln.
export const ControlledVsUncontrolledDemo = () => (
  <Stack spacing={2}>
    <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
      <ControlledForm />
      <UncontrolledForm />
    </Stack>

    {/* Den här noten står här och inte bara i teorin, och det är avsiktligt.
        Utan den lär demon ut att kontrollerade fält är dyra, och det är inte
        sant. Jämförelsen är mot den vanligaste koden, inte mot den bästa. */}
    <Alert severity='info'>
      <strong>Jämförelsen är mot den kod man oftast skriver, inte mot den bästa möjliga.</strong> Det kontrollerade formuläret har all sin state i
      formulärkomponenten, så ett tangenttryck i ett fält ritar om hela formuläret, med båda fälten. Flyttar man ner varje fälts state i en egen
      komponent ritas bara det fält man skriver i om, och skillnaden krymper betydligt. Men något ritas fortfarande om vid varje tangenttryck, medan
      det okontrollerade formuläret inte ritas om alls. Det är den verkliga skillnaden, inte hur stort talet blir.
    </Alert>
  </Stack>
);
