import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { EffectLog, type LogEntry, type LogKind } from './effectLog';

const CHANNELS = ['allmänt', 'teknik', 'design'] as const;
type Channel = (typeof CHANNELS)[number];

type ChannelConnectionProps = {
  channel: Channel;
  onLog: (kind: LogKind, message: string) => void;
};

// Komponenten som håller effekten.
//
// Den ansluter inte till något på riktigt. Den skriver en rad i loggen i
// stället. Poängen är när effekten körs och i vilken ordning, inte vad den gör.
const ChannelConnection = ({ channel, onLog }: ChannelConnectionProps) => {
  useEffect(() => {
    onLog('SETUP', `Ansluter till "${channel}"`);

    // Städfunktionen. React kör den före varje ny körning av effekten, och en
    // sista gång när komponenten försvinner. Den stänger alltid ner den kanal
    // som just den här körningen öppnade, inte den som är vald just nu.
    return () => {
      onLog('CLEANUP', `Kopplar ner "${channel}"`);
    };
  }, [channel, onLog]);

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      <Typography>
        Ansluten till <strong>{channel}</strong>.
      </Typography>
    </Paper>
  );
};

export const EffectLifecycleDemo = () => {
  // Avmonterad från början, med flit. Monteringen är det som utlöser
  // dubbelkörningen i StrictMode, och den ska ske framför läsaren, inte innan
  // loggen ens syns.
  const [isMounted, setIsMounted] = useState(false);
  const [channel, setChannel] = useState<Channel>('allmänt');
  const [entries, setEntries] = useState<LogEntry[]>([]);

  // useCallback gör att det är samma funktion från ritning till ritning.
  //
  // Utan den skapas en ny funktion varje gång demon ritas om, och en funktion
  // är bara lika med sig själv. Funktionen står i effektens beroendelista, så
  // kedjan hade blivit: effekten skriver en rad, raden ändrar state, demon ritas
  // om, funktionen blir ny, effekten körs igen och skriver en rad till. En
  // oändlig slinga.
  const addEntry = useCallback((kind: LogKind, message: string) => {
    setEntries((previous) => [...previous, { id: previous.length + 1, kind, message }]);
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <Button variant='contained' onClick={() => setIsMounted(!isMounted)} sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
          {isMounted ? 'Avmontera anslutningen' : 'Montera anslutningen'}
        </Button>

        {/* Väljaren är avstängd när ingenting är monterat. Ett byte utan
            monterad komponent hade inte skrivit någon rad, och en kontroll som
            inte gör något läses som trasig. */}
        <ToggleButtonGroup
          exclusive
          size='small'
          value={channel}
          disabled={!isMounted}
          aria-label='Kanal'
          onChange={(_event, nextChannel: Channel | null) => {
            // null kommer när man klickar på den kanal som redan är vald.
            // Då ska ingenting hända, annars hade valet kunnat tömmas.
            if (nextChannel) {
              setChannel(nextChannel);
            }
          }}
        >
          {CHANNELS.map((option) => (
            <ToggleButton key={option} value={option}>
              {option}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {isMounted ? (
        <ChannelConnection channel={channel} onLog={addEntry} />
      ) : (
        <Typography variant='body2' color='textSecondary'>
          Ingenting är monterat. Komponenten med effekten finns inte i trädet just nu.
        </Typography>
      )}

      <EffectLog entries={entries} onClear={clearEntries} />

      {/* Vad monteringen ger för rader, och varför det inte är samma sak i de
          två lägena.

          Teorin beskriver dubbelkörningen som tre rader. I den publicerade
          versionen blir det en, eftersom StrictMode bara monterar om i
          utvecklingsläge. import.meta.env.DEV är sant just då: Vite, verktyget
          som bygger appen, sätter det när appen körs direkt från källkoden. Utan den här raden läser man en förklaring och ser
          en demo som visar något annat, och drar slutsatsen att man klickat
          fel.

          Paret städning och uppsättning går ändå att se i båda lägena, genom
          att avmontera och montera för hand. Det är inte exakt samma sak, och
          noten säger varför. */}
      <Typography variant='body2' color='textSecondary'>
        {import.meta.env.DEV ? (
          <>
            Den första monteringen ger tre rader här, inte en. Appen körs i utvecklingsläge, där StrictMode monterar om komponenten en gång direkt, så
            att uppsättningen körs, städas och körs igen. Det är ett test av att effekten tål att köras om.
          </>
        ) : (
          <>
            Den första monteringen ger en rad här. I utvecklingsläge ger den tre, eftersom StrictMode då monterar om komponenten en gång direkt, så
            att uppsättningen körs, städas och körs igen. Samma mönster, städning följd av uppsättning, får du här genom att avmontera och montera
            igen. Skillnaden är att en riktig avmontering kastar komponentens state, medan StrictMode behåller det.
          </>
        )}
      </Typography>
    </Stack>
  );
};
