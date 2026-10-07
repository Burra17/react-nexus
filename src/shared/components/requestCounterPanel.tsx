import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useRequestCount } from '../hooks/useRequestCount';

type RequestCounterPanelProps = {
  // Vilken demo panelen mäter. Backenden räknar anropen per demo, enligt
  // märkningen i anropet, och panelen läser den räkningen. Den ändrar den inte.
  demo: string;
  // Vad läsaren ska göra med talet i just den här demon.
  caption: string;
};

// Visar hur många anrop som gått iväg sedan läsaren själv nollställde.
//
// Räknaren i den mockade backenden är ett tal per demo som bara växer, men varje
// påstående demonstrationerna gör handlar om effekten av ETT klick: fyra kort
// ger ett anrop, ett brett prefix träffar tre poster. En totalsumma tvingar
// läsaren att subtrahera i huvudet. Den avläsningen gick fel två gånger för den
// som skrev demonstrationerna. Då är det inte rimligt att begära att läsaren
// ska klara den.
//
// "Nollställ" rör därför aldrig backendens räknare. Knappen flyttar bara
// panelens egen nollpunkt upp till dagens totalsumma, och det som visas är
// skillnaden. Två paneler på samma sida mäter på så vis var för sig, och en
// nollställning i den ena rör inte den andra. Exporterade backenden i stället
// en funktion som nollade totalsumman skulle en demo kunna radera en annan
// demos mätning mitt i.
export const RequestCounterPanel = ({ demo, caption }: RequestCounterPanelProps) => {
  // Backendens egen räkning av demons anrop sedan sidladdning. Panelen ritas om
  // i samma ögonblick som backenden räknar ett anrop, inte först när svaret
  // kommer.
  const total = useRequestCount(demo);

  // Startvärdet sätts vid första renderingen, så att panelen börjar på noll.
  //
  // Hämtningar som demon själv gör när sidan öppnas landar strax efter, och de
  // syns i talet. Det är avsiktligt och sant: de anropen gick verkligen iväg,
  // och de var demons egna. En annan demos hämtningar syns däremot aldrig här,
  // eftersom backenden räknar varje demo för sig.
  const [zeroPoint, setZeroPoint] = useState(total);

  // Om läsaren nollställt än. Innan dess räknar panelen från när vyn öppnades,
  // och etiketten säger det. "Sedan du nollställde" hade varit osant tills
  // knappen tryckts första gången.
  const [hasReset, setHasReset] = useState(false);

  const sinceReset = total - zeroPoint;

  const reset = () => {
    setZeroPoint(total);
    setHasReset(true);
  };

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack direction='row' spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant='body2' color='textSecondary'>
            {hasReset ? 'anrop sedan du nollställde' : 'anrop sedan vyn öppnades'}
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
              av {total} i den här demon sedan sidladdning
            </Typography>

            <Button size='small' onClick={reset}>
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
