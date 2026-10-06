import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { Result } from '../types/result';

// De tre svaren demon växlar mellan. Ett per variant i unionen.
const RESULTS: Result[] = [
  { status: 'loading' },
  { status: 'error', message: 'Kunde inte hämta listan.' },
  { status: 'done', data: ['Ada', 'Grace', 'Katherine'] },
];

// Det inspect() kommer fram till om svaret den fick.
type Inspection = {
  branch: string;
  available: string;
  text: string;
};

// Här sker narrowing. TypeScript läser status och vet därefter exakt vilken av de
// tre varianterna vi håller i, och därmed vilka fält som går att skriva.
const inspect = (result: Result): Inspection => {
  if (result.status === 'loading') {
    // @ts-expect-error message finns bara på error-varianten, så den här raden är
    // ett typfel. Den står kvar med flit: tsc failar bygget om den någon gång
    // slutar vara ett fel, så påståendet i demon kan inte bli osant i tysthet.
    const missing: string | undefined = result.message;

    return {
      branch: "status === 'loading'",
      available: 'status',
      text: `Inget svar än. Koden läser ändå .message och får ${String(missing)}: fältet finns inte på den här varianten, men att läsa ett fält som saknas kraschar inte.`,
    };
  }

  if (result.status === 'error') {
    return {
      branch: "status === 'error'",
      available: 'status, message',
      text: result.message,
    };
  }

  // Tredje grenen behöver ingen kontroll. De två andra varianterna är redan
  // uteslutna, så TypeScript vet att result måste vara done här.
  return {
    branch: 'ingen kontroll kvar: done är det enda som återstår',
    available: 'status, data',
    text: result.data.join(', '),
  };
};

// Tre svar med samma typ, men med olika fält. Välj ett och se vilken gren som körs.
export const NarrowingDemo = () => {
  const [result, setResult] = useState<Result>(RESULTS[0]);
  const inspection = inspect(result);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        {RESULTS.map((candidate) => (
          <Button key={candidate.status} variant={candidate.status === result.status ? 'contained' : 'outlined'} onClick={() => setResult(candidate)}>
            {candidate.status}
          </Button>
        ))}
      </Stack>

      <Paper variant='outlined' sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant='body2' color='textSecondary'>
            Gren som kördes
          </Typography>
          <Typography sx={{ fontFamily: 'monospace' }}>{inspection.branch}</Typography>

          <Typography variant='body2' color='textSecondary' sx={{ pt: 1 }}>
            Fält kompilatorn tillåter i grenen
          </Typography>
          <Typography sx={{ fontFamily: 'monospace' }}>{inspection.available}</Typography>

          <Typography variant='body2' color='textSecondary' sx={{ pt: 1 }}>
            Utfall
          </Typography>
          <Typography>{inspection.text}</Typography>
        </Stack>
      </Paper>

      <Typography variant='body2' color='textSecondary'>
        I error-grenen får koden läsa <code>.message</code>, i done-grenen <code>.data</code> och i loading-grenen ingetdera. Raden i loading-grenen
        som ändå läser <code>.message</code> står kvar i koden under Kod, märkt med <code>@ts-expect-error</code>. Den markeringen säger åt
        kompilatorn att nästa rad ska vara ett typfel, och blir själv ett fel om raden någon gång slutar vara det.
      </Typography>
    </Stack>
  );
};
