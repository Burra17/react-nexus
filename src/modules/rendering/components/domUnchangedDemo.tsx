import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { RenderCounter } from '../../../shared/components/renderCounter';

// Visar att en omrendering inte är samma sak som att skärmen ritas om.
//
// Textfältet är okontrollerat: React känner inte till vad som står i det.
// Skulle React byta ut elementet vid varje omrendering skulle texten och
// markörens läge försvinna. De står kvar, alltså rörs elementet inte.
export const DomUnchangedDemo = () => {
  const [count, setCount] = useState(0);

  return (
    <Stack spacing={2}>
      <Typography color='textSecondary'>
        Skriv något i fältet och ställ markören mitt i texten. Räkna sedan upp så många gånger du vill. Komponenten renderas om vid varje klick, men
        texten och markören står kvar.
      </Typography>

      <TextField label='Skriv något här' size='small' sx={{ alignSelf: 'flex-start', minWidth: 280 }} />

      <Button variant='outlined' onClick={() => setCount(count + 1)} sx={{ alignSelf: 'flex-start' }}>
        Rendera om ({count})
      </Button>

      <RenderCounter />
    </Stack>
  );
};
