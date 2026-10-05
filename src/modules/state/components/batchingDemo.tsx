import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { RenderCounter } from '../../../shared/components/renderCounter';

// Vilken knapp som trycktes senast, och vad count var i ögonblicksbilden när
// den trycktes. Förklaringen under knapparna byggs ur det, så att den visas
// först efter ett tryck och stämmer för varje tryck och inte bara det första.
type LastPress = { kind: 'direct' | 'functional'; from: number } | null;

// Samma tre anrop, skrivna på två sätt. Resultatet skiljer sig.
export const BatchingDemo = () => {
  const [count, setCount] = useState(0);
  const [lastPress, setLastPress] = useState<LastPress>(null);

  // Alla tre anropen läser count ur samma ögonblicksbild. Var count 0 när
  // knappen ritades säger alla tre "sätt värdet till 0 + 1".
  const handleDirect = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    setLastPress({ kind: 'direct', from: count });
  };

  // Den här formen läser inte ögonblicksbilden. React ställer varje funktion
  // i kön och anropar den med resultatet av beställningarna före den, så
  // varje anrop bygger vidare på det föregående.
  const handleFunctional = () => {
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setLastPress({ kind: 'functional', from: count });
  };

  // Nollställer både siffran och förklaringen. Står båda redan på sitt
  // startläge ändras inget värde, och då hoppar React över ritningen.
  const handleReset = () => {
    setCount(0);
    setLastPress(null);
  };

  return (
    <Stack spacing={2}>
      <Stack spacing={0}>
        <Typography variant='caption' color='textSecondary'>
          count
        </Typography>
        <Typography variant='h3' component='p'>
          {count}
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant='contained' onClick={handleDirect}>
          setCount(count + 1) tre gånger
        </Button>
        <Button variant='outlined' onClick={handleFunctional}>
          {'setCount((c) => c + 1) tre gånger'}
        </Button>
        <Button onClick={handleReset}>Nollställ</Button>
      </Stack>

      {lastPress?.kind === 'direct' && (
        <Typography color='textSecondary'>
          Alla tre anropen läste <code>count</code> ur samma ögonblicksbild, där det var {lastPress.from}, och beställde samma sak: sätt värdet till{' '}
          {lastPress.from} + 1. <code>count</code> ökade med ett, och räknaren med en ritning, eftersom React batchade de tre beställningarna.
        </Typography>
      )}

      {lastPress?.kind === 'functional' && (
        <Typography color='textSecondary'>
          De tre funktionerna ställdes i kön och fick var sitt senaste värde: {lastPress.from}, {lastPress.from + 1} och {lastPress.from + 2}.{' '}
          <code>count</code> ökade med tre, och räknaren ändå bara med en ritning, eftersom React batchade de tre beställningarna.
        </Typography>
      )}

      <RenderCounter showStrictModeNote />
    </Stack>
  );
};
