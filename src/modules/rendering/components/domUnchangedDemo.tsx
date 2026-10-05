import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { RenderCounter } from '../../../shared/components/renderCounter';

// Visar att en ritning inte byter ut det som redan finns i DOM:en.
//
// Textfältet är okontrollerat: det har ingen value-prop, så det är
// webbläsaren som håller texten, och React vet inte vad som står i det.
// Hade React byggt ett nytt element vid varje ritning hade texten försvunnit.
// Den står kvar, alltså behåller React samma element.
export const DomUnchangedDemo = () => {
  const [count, setCount] = useState(0);

  return (
    <Stack spacing={2}>
      <TextField label='Skriv något här' size='small' sx={{ alignSelf: 'flex-start', minWidth: 280 }} />

      <Button variant='outlined' onClick={() => setCount(count + 1)} sx={{ alignSelf: 'flex-start' }}>
        Räkna upp ({count})
      </Button>

      {count > 0 && (
        <Typography color='textSecondary'>
          Varje tryck ändrade state, och komponenten ritades om. React ändrade bara det som skilde sig från den förra beskrivningen, som talen i
          knappen och i räknaren. Fältet fanns kvar i varje beskrivning, så React behöll samma element i DOM:en i stället för att bygga ett nytt, och
          därför står det du skrev kvar.
        </Typography>
      )}

      <RenderCounter />
    </Stack>
  );
};
