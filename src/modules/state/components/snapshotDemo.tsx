import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

// Beställer ett nytt count och läser count på raden direkt efter, och visar
// båda talen. Det andra visar att beställningen inte ändrade count där och då.
export const SnapshotDemo = () => {
  const [count, setCount] = useState(0);

  // Det count som klickhanteraren såg. null betyder att ingen har klickat än,
  // och då visas ingen avläsning.
  const [readBack, setReadBack] = useState<number | null>(null);

  const handleClick = () => {
    setCount(count + 1);

    // count är fortfarande värdet ur ögonblicksbilden. Raden ovanför ändrade
    // inte variabeln, den beställde ett nytt värde till nästa ritning.
    setReadBack(count);
  };

  return (
    <Stack spacing={2}>
      <Typography>
        <code>count</code> i den här ritningen: <strong>{count}</strong>
      </Typography>

      <Button variant='contained' onClick={handleClick} sx={{ alignSelf: 'flex-start' }}>
        Öka med ett och läs av direkt efteråt
      </Button>

      {readBack !== null && (
        <Typography color='textSecondary'>
          Inne i klickhanteraren, direkt efter anropet till <code>setCount</code>, var <code>count</code> fortfarande <strong>{readBack}</strong>,
          inte {readBack + 1}. Klickhanteraren hörde till ritningen där <code>count</code> var {readBack}.
        </Typography>
      )}
    </Stack>
  );
};
