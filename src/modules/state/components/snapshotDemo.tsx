import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

// Läser av count direkt efter att det höjts, och visar vad som står där.
export const SnapshotDemo = () => {
  const [count, setCount] = useState(0);
  const [readBack, setReadBack] = useState<number | null>(null);

  const handleClick = () => {
    setCount(count + 1);

    // count är fortfarande värdet ur fotot. Raden ovanför ändrade inte
    // variabeln - den beställde ett nytt värde till nästa ritning.
    setReadBack(count);
  };

  return (
    <Stack spacing={2}>
      <Typography>
        Räknaren står på <strong>{count}</strong>.
      </Typography>

      <Button variant="contained" onClick={handleClick} sx={{ alignSelf: 'flex-start' }}>
        Öka med ett och läs av direkt efteråt
      </Button>

      {readBack !== null && (
        <Typography color="textSecondary">
          Direkt efter anropet till setCount var count fortfarande <strong>{readBack}</strong> — inte {readBack + 1}.
        </Typography>
      )}
    </Stack>
  );
};
