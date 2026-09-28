import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link, useLocation } from 'react-router-dom';
import { ReadableColumn } from '../shared/components/readableColumn';
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';

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

  // Även felsidan sätter sin titel. Kommer man hit från en modul står annars
  // modulens namn kvar i fliken, och då ser det ut som att den sidan är trasig.
  useDocumentTitle('Sidan finns inte');

  return (
    <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
      <Typography variant='h1' gutterBottom>
        Sidan finns inte
      </Typography>

      <ReadableColumn>
        <Typography color='textSecondary'>
          {/* Rent <code>, inte Typography component="code". Typography sätter
              font-family från temat och slår därmed ut CssBaseline-regeln för
              code, så adressen hade renderats i brödtextens typsnitt. */}
          Adressen <code>{pathname}</code> leder ingenstans i appen. Kontrollera stavningen, eller välj ett koncept från startsidan.
        </Typography>
      </ReadableColumn>

      {/* Button med component={Link} renderar ett <a>: navigering ska vara en
          länk, inte en knapp, så att den går att öppna i en ny flik. */}
      <Button variant='contained' component={Link} to='/'>
        Till startsidan
      </Button>
    </Stack>
  );
};
