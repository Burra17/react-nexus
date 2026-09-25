import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { Result } from '../types/result';

// Två svar som båda påstår sig vara klara. Det andra saknar data.
//
// De är typade som unknown med flit: så ser data ut när den kommer utifrån - ur
// ett API, ur localStorage - innan någon har lovat något om formen.
const HONEST_RESPONSE: unknown = { status: 'done', data: ['Ada', 'Grace', 'Katherine'] };
const LYING_RESPONSE: unknown = { status: 'done' };

// Utfallet av ett försök att läsa svaret.
type Outcome = { kind: 'ok'; text: string } | { kind: 'crash'; text: string };

// Samma typ, samma kod, två svar. TypeScript skiljer dem inte åt - det gör bara
// webbläsaren, och först när koden redan kör.
export const LyingAssertionDemo = () => {
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const handleRead = (response: unknown) => {
    // Avsiktligt osäker kod, och hela poängen med demon. as utför ingen kontroll:
    // TypeScript tar löftet på ordet och raden försvinner vid kompileringen, så
    // ingenting finns kvar som kan upptäcka att svaret ljög.
    const result = response as Result;

    // try/catch, och kraschen sker i en klickhanterare. Ett ofångat fel under
    // renderingen hade avmonterat hela vyn i stället för att visa felet.
    try {
      if (result.status === 'done') {
        setOutcome({ kind: 'ok', text: `Listan har ${result.data.length} namn: ${result.data.join(', ')}` });
      }
    } catch (error) {
      setOutcome({ kind: 'crash', text: error instanceof Error ? `${error.name}: ${error.message}` : String(error) });
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant='contained' onClick={() => handleRead(HONEST_RESPONSE)}>
          Läs svaret som har data
        </Button>
        <Button variant='outlined' onClick={() => handleRead(LYING_RESPONSE)}>
          Läs svaret som saknar data
        </Button>
        <Button onClick={() => setOutcome(null)}>Nollställ</Button>
      </Stack>

      {outcome !== null && (
        <Paper variant='outlined' sx={{ p: 2, borderColor: outcome.kind === 'crash' ? 'error.main' : undefined }}>
          <Typography variant='body2' color='textSecondary'>
            {outcome.kind === 'crash' ? 'Fel vid körning' : 'Läsningen gick igenom'}
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', mt: 1 }}>{outcome.text}</Typography>
        </Paper>
      )}

      <Typography variant='body2' color='textSecondary'>
        Båda knapparna kör exakt samma rader: samma <code>as Result</code>, samma kontroll av <code>status</code>, samma{' '}
        <code>result.data.length</code>. Bygget är grönt för båda, eftersom <code>as</code> inte kontrollerar någonting — det talar bara om för
        TypeScript vad du påstår att värdet är. Den högra knappen visar vad påståendet var värt.
      </Typography>
    </Stack>
  );
};
