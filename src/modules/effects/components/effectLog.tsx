import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLayoutEffect, useRef } from 'react';
import { monoFontFamily } from '../../../styles/theme';

// Vad raden beskriver.
//
// SETUP och CLEANUP är effektens två halvor och används av alla demos.
// RESOLVE och IGNORED hör till hämtningen: ett svar som kom tillbaka, och ett
// svar som städningen hann märka som inaktuellt innan det fick skriva något.
//
// Engelska termer i en svensk app, med flit. Setup och cleanup är orden
// react.dev använder, och den som slår upp konceptet vidare ska känna igen
// dem. RESOLVE och IGNORED är appens egna, skrivna i samma stil.
//
// En ren union och ingen lista med värden: filen exporterar en komponent, och
// en fil som också exporterar värden laddar om hela sidan när den ändras, i
// stället för att bara byta ut komponenten. En typ räknas inte, eftersom den
// försvinner när koden byggs.
export type LogKind = 'SETUP' | 'CLEANUP' | 'RESOLVE' | 'IGNORED';

export type LogEntry = {
  id: number;
  kind: LogKind;
  message: string;
};

type EffectLogProps = {
  entries: LogEntry[];
  onClear: () => void;
};

// Prefixet bär informationen, färgen förstärker den bara. Den som inte skiljer
// grönt från orange läser fortfarande [SETUP] och [CLEANUP]. Status ska aldrig
// sitta enbart i en färg.
//
// IGNORED är dämpad och inte röd. Ett bortkastat svar är resultatet av att
// städningen gjorde sitt jobb, alltså goda nyheter. En felfärg hade läst som
// att något gick sönder.
const kindColor: Record<LogKind, string> = {
  SETUP: 'success.main',
  CLEANUP: 'warning.main',
  RESOLVE: 'info.main',
  IGNORED: 'text.secondary',
};

// Loggpanelen som visar effektens körningar i den ordning de skedde.
//
// En logg och inte en räknare: det intressanta är inte hur många gånger
// effekten kört, utan att städningen låg mellan två uppsättningar. En siffra
// som står på 3 kan inte visa det.
//
// Panelen äger ingen logg. Raderna kommer utifrån, eftersom komponenten som
// skriver dem monteras och avmonteras. Hade listan legat här hade den
// försvunnit tillsammans med den.
export const EffectLog = ({ entries, onClear }: EffectLogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Rullar till botten när en rad tillkommit.
  //
  // Det här är en effekt av rätt sort: den rör något utanför React, nämligen
  // webbläsarens rullningsläge, och det går inte att göra under ritningen,
  // eftersom listan inte har sin nya höjd förrän den finns i DOM:en.
  //
  // Effekten läser bara entries.length, och därför är det det som står i
  // beroendelistan. Antalet rader är det enda som avgör om listan ska rullas.
  //
  // useLayoutEffect och inte useEffect, eftersom den mäter höjden och rullar
  // före målningen. Svaren i demo 3 kommer från en timer och inte från ett
  // klick, och med useEffect hade webbläsaren då i regel hunnit måla den nya
  // raden utanför synfältet innan listan rullades ner.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container || entries.length === 0) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [entries.length]);

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      {/* justifyContent och alignItems skrivs i sx, MUI:s sätt att ge en
          komponent stil. */}
      <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant='h3' component='h4'>
          Logg
        </Typography>
        <Button size='small' onClick={onClear} disabled={entries.length === 0}>
          Rensa
        </Button>
      </Stack>

      {entries.length === 0 ? (
        <Typography variant='body2' color='textSecondary'>
          Tom. Raderna skrivs här när effekten körs.
        </Typography>
      ) : (
        <Box ref={scrollRef} sx={{ maxHeight: 200, overflowY: 'auto' }}>
          {/* En ordnad lista, så att en skärmläsare säger hur många händelser
              som skett och i vilken ordning. Punkterna tas bort visuellt:
              varje rad har redan sitt eget nummer i loggen. */}
          <Box component='ol' sx={{ m: 0, p: 0, listStyle: 'none', fontFamily: monoFontFamily, fontSize: '0.875rem' }}>
            {entries.map((entry) => (
              <Box component='li' key={entry.id} sx={{ display: 'flex', gap: 1, py: 0.25 }}>
                <Box component='span' sx={{ color: 'text.secondary', minWidth: '1.75rem', textAlign: 'right' }}>
                  {entry.id}.
                </Box>
                <Box component='span' sx={{ color: kindColor[entry.kind], fontWeight: 600, minWidth: '5.5rem' }}>
                  [{entry.kind}]
                </Box>
                <Box component='span'>{entry.message}</Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};
