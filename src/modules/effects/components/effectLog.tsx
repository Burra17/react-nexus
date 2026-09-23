import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';
import { monoFontFamily } from '../../../styles/theme';

// Vad raden beskriver: att effekten satte upp något, eller att den städade.
//
// Engelska termer i en svensk app, med flit. De står ordagrant så i react.dev,
// och den som slår upp konceptet vidare ska känna igen orden.
//
// En ren union och ingen as const-array: filen exporterar en komponent, och
// Fast Refresh slutar fungera för en fil som också exporterar värden. En
// typ-export räknas inte, eftersom den försvinner vid kompileringen.
export type LogKind = 'SETUP' | 'CLEANUP';

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
// grönt från orange läser fortfarande [SETUP] och [CLEANUP] - status ska aldrig
// sitta enbart i en färg.
const kindColor: Record<LogKind, string> = {
  SETUP: 'success.main',
  CLEANUP: 'warning.main',
};

// Loggpanelen som visar effektens körningar i den ordning de skedde.
//
// En logg och inte en räknare: det intressanta är inte hur många gånger
// effekten kört, utan att städningen låg mellan två uppsättningar. En siffra
// som står på 3 kan inte visa det.
//
// Panelen äger ingen logg. Raderna kommer utifrån, eftersom komponenten som
// skriver dem monteras och avmonteras - hade listan legat här hade den
// försvunnit tillsammans med den.
export const EffectLog = ({ entries, onClear }: EffectLogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Rullar till botten när en rad tillkommit.
  //
  // Det här är en effekt av rätt sort: den synkroniserar med något utanför
  // React - webbläsarens rullningsläge - och det går inte att göra under
  // renderingen, eftersom listan inte har sin nya höjd förrän den ritats.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || entries.length === 0) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [entries.length]);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {/* justifyContent och alignItems går via sx. MUI v9 tog bort systemprops
          från Stack, så de fungerar inte längre som egna props. */}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h3" component="h4">
          Logg
        </Typography>
        <Button size="small" onClick={onClear} disabled={entries.length === 0}>
          Rensa
        </Button>
      </Stack>

      {entries.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          Tom. Montera anslutningen nedan, så skrivs de första raderna här.
        </Typography>
      ) : (
        <Box ref={scrollRef} sx={{ maxHeight: 200, overflowY: 'auto' }}>
          {/* En ordnad lista, så att en skärmläsare säger hur många händelser
              som skett och i vilken ordning. Punkterna tas bort visuellt:
              raderna är redan numrerade med effektens eget löpnummer. */}
          <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', fontFamily: monoFontFamily, fontSize: '0.875rem' }}>
            {entries.map((entry) => (
              <Box component="li" key={entry.id} sx={{ display: 'flex', gap: 1, py: 0.25 }}>
                <Box component="span" sx={{ color: 'text.secondary', minWidth: '1.75rem', textAlign: 'right' }}>
                  {entry.id}.
                </Box>
                <Box component="span" sx={{ color: kindColor[entry.kind], fontWeight: 600, minWidth: '5.5rem' }}>
                  [{entry.kind}]
                </Box>
                <Box component="span">{entry.message}</Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};
