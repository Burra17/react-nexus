import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link, useLocation } from 'react-router-dom';
import { ReadableColumn } from '../shared/components/readableColumn';

// Appens egen vy för en adress som inte finns.
//
// Utan den tar React Router över och visar sin utvecklarvy, som ligger utanför
// pageTemplate: rubrikraden och sidomenyn försvinner, och besökaren har ingen
// väg tillbaka utom bakåtknappen.
//
// Ligger i pages och inte i modules, eftersom den inte demonstrerar något
// koncept. Den är en av appens egna sidor, precis som startsidan.
export const NotFoundPage = () => {
  // Adressen skrivs ut för att besökaren ska se vad som faktiskt efterfrågades.
  // En felstavning är svår att upptäcka i adressfältet men syns direkt i brödtext.
  const { pathname } = useLocation();

  return (
    <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h1" gutterBottom>
        Sidan finns inte
      </Typography>

      <ReadableColumn>
        <Stack spacing={2}>
          <Typography color="textSecondary">
            {/* Rent <code>, inte Typography component="code". Typography sätter
                font-family från temat och slår därmed ut CssBaseline-regeln för
                code, så adressen hade renderats i brödtextens typsnitt. */}
            Adressen <code>{pathname}</code> leder ingenstans i appen.
          </Typography>

          {/* Den vanligaste orsaken är inte en felstavning utan ett planerat
              koncept. En modul utan vy får ingen rutt, så dess adress träffar
              den här sidan - och det är värt att säga rakt ut, annars ser det
              ut som ett fel i appen. */}
          <Typography color="textSecondary">
            Antingen är den felstavad, eller så hör den till ett koncept som ännu inte är byggt. Planerade moduler får ingen adress förrän vyn finns,
            och syns på startsidan som nedtonade kort.
          </Typography>
        </Stack>
      </ReadableColumn>

      {/* Button med component={Link} renderar ett <a>: navigering ska vara en
          länk, inte en knapp, så att den går att öppna i en ny flik. */}
      <Button variant="contained" component={Link} to="/">
        Till startsidan
      </Button>
    </Stack>
  );
};
