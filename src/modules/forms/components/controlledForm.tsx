import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { RenderCounter } from '../../../shared/components/renderCounter';

// Formuläret som de flesta skriver först.
//
// Varje fält får ett eget useState, och båda ligger här i formulärkomponenten.
// Det är vad "kontrollerat" betyder i praktiken: React äger värdet, och
// inputen visar det React säger åt den att visa.
//
// value är det enda som gör en input kontrollerad. Inte onChange, inte att
// värdet råkar ligga i ett useState - utan att value skickas in. Reacts egen
// dokumentation är tydlig med att en input inte kan vara både och, och inte
// heller byta sida under sin livstid.
//
// onChange är däremot obligatoriskt så fort value är satt. Utan den står
// värdet stilla vid det du skickade in, och det går bokstavligen inte att
// skriva i fältet.
//
// VARFÖR ALL STATE LIGGER HÄR, OCH INTE I VARJE FÄLT:
//
// För att det är så den vanliga koden ser ut, och därför den som är värd att
// mäta. Konsekvensen syns i räknaren nedan: ett tangenttryck i ett fält ritar
// om hela formuläret, inklusive det andra fältet.
//
// Det är inte en nödvändig konsekvens av att vara kontrollerad, och den saken
// står utskriven i demon. Se noten i formsPage.
export const ControlledForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Paper variant='outlined' sx={{ p: 2, flex: 1, minWidth: 280 }}>
      <Stack
        component='form'
        spacing={2}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(`${name} — ${email}`);
        }}
      >
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          Kontrollerat
        </Typography>

        {/* value in, onChange ut. React äger värdet mellan de två. */}
        <TextField label='Namn' value={name} onChange={(event) => setName(event.target.value)} size='small' />
        <TextField label='E-post' value={email} onChange={(event) => setEmail(event.target.value)} size='small' />

        <Button type='submit' variant='outlined'>
          Skicka
        </Button>

        {/* Värdet går att läsa när som helst, utan att fråga DOM:en. Det är
            den verkliga vinsten med kontrollerade fält, och skälet till att
            man väljer dem när något annat på sidan ska reagera på vad som
            står i fältet. */}
        <Typography variant='caption' color='textSecondary'>
          React vet just nu: {name || '—'} / {email || '—'}
        </Typography>

        {submitted && <Typography variant='body2'>Skickade: {submitted}</Typography>}

        <RenderCounter showStrictModeNote />
      </Stack>
    </Paper>
  );
};
