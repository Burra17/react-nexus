import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type RequestCounterPanelProps = {
  // Backendens egen räkning sedan sidladdning. Panelen läser den, den ändrar
  // den inte.
  total: number;
  // Vad läsaren ska göra med talet i just den här demon.
  caption: string;
};

// Visar hur många anrop som gått iväg sedan läsaren själv nollställde.
//
// Räknaren i backenden är en totalsumma, men varje påstående demonstrationerna
// gör handlar om effekten av ETT klick: fyra kort ger ett anrop, ett brett
// prefix träffar tre poster. En totalsumma tvingar läsaren att subtrahera i
// huvudet, samtidigt som talet rör sig av annat som händer på sidan. Den
// avläsningen gick fel två gånger under bygget av #107, för den som skrivit
// demon - då är det inte rimligt att begära att läsaren ska klara den.
//
// Nollpunkten är därför panelens eget tillstånd och inte backendens. Två
// paneler på samma sida mäter var för sig, och en nollställning i den ena rör
// inte den andra. Hade handlers.ts i stället exporterat en
// resetUserRequestCount() skulle en demo kunna nolla en annan demos mätning.
export const RequestCounterPanel = ({ total, caption }: RequestCounterPanelProps) => {
  // Startvärdet sätts vid första renderingen, så att panelen börjar på noll
  // och räknar just den här demons anrop.
  const [zeroPoint, setZeroPoint] = useState(total);

  const sinceReset = total - zeroPoint;

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack direction='row' spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant='body2' color='textSecondary'>
            anrop sedan du nollställde
          </Typography>

          {/* Talet, totalsumman och knappen står ihop, så att arbetsgången
              blir läsbar i den ordning den ska utföras: nollställ, gör en sak,
              läs av. */}
          <Stack direction='row' spacing={1.5} sx={{ alignItems: 'baseline' }}>
            {/* aria-live gör att en skärmläsare säger det nya talet när det
                ändras. Utan den är räknaren en siffra som tyst byts ut. */}
            <Typography variant='h3' component='p' sx={{ fontFamily: 'monospace' }} aria-live='polite'>
              {sinceReset}
            </Typography>

            <Typography variant='caption' color='textSecondary'>
              av {total} sedan sidladdning
            </Typography>

            <Button size='small' onClick={() => setZeroPoint(total)}>
              Nollställ räknaren
            </Button>
          </Stack>
        </Stack>

        <Typography variant='caption' color='textSecondary'>
          {caption}
        </Typography>
      </Stack>
    </Paper>
  );
};
