import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { Result } from '../types/result';

// Två svar som båda påstår sig vara klara. Det andra saknar data.
//
// De är typade som unknown med flit. unknown är typen för ett värde man inte
// vet något om, och det går inte att använda förrän det kontrollerats eller
// påståtts vara något. Så ser data ut när den kommer utifrån, från en server
// eller ur webbläsarens lagring, innan någon har sagt något om formen.
const HONEST_RESPONSE: unknown = { status: 'done', data: ['Ada', 'Grace', 'Katherine'] };
const LYING_RESPONSE: unknown = { status: 'done' };

// Utfallet av ett försök att läsa svaret. Också det en diskriminerad union:
// här heter diskriminanten kind, eftersom den kan heta vad som helst.
type Outcome = { kind: 'ok'; text: string } | { kind: 'crash'; text: string };

// Samma typ, samma kod, två svar. TypeScript skiljer dem inte åt. Det gör bara
// webbläsaren, och först när koden redan kör.
export const LyingAssertionDemo = () => {
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const handleRead = (response: unknown) => {
    // Avsiktligt osäker kod, och hela poängen med demon. as utför ingen kontroll:
    // kompilatorn tar påståendet på orden, och as stryks i bygget, så ingenting
    // finns kvar som kan upptäcka att svaret inte stämde.
    const result = response as Result;

    // try och catch fångar felet, så att demon kan visa det. Det fungerar här
    // eftersom felet uppstår i en klickhanterare. Uppstod det medan komponenten
    // ritades skulle React ta bort hela vyn i stället.
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
        <Button variant='outlined' onClick={() => handleRead(HONEST_RESPONSE)}>
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

      {outcome?.kind === 'crash' && (
        <Typography color='textSecondary'>
          Bygget gick igenom för båda svaren, eftersom kompilatorn tar <code>as</code> på orden. När svaret som saknar data når koden blir{' '}
          <code>result.data</code> <code>undefined</code>, och <code>undefined</code> har ingen <code>length</code>. Felet kommer från webbläsaren när
          koden kör, och koden fångar det med <code>try</code> och <code>catch</code> för att kunna visa det här. Att bara läsa ett fält som saknas,
          som i demo 1, går bra. Det är när värdet används som det går fel.
        </Typography>
      )}
    </Stack>
  );
};
