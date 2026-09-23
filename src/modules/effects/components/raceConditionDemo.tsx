import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { EffectLog, type LogEntry, type LogKind } from './effectLog';

// AVSIKTLIGT FELAKTIG KOD I DEN HÄR FILEN.
//
// CLAUDE.md förbjuder datahämtning med useEffect - all serverdata ska gå genom
// TanStack Query. Undantaget gäller en vy vars syfte är att visa vad mönstret
// gör fel, och det är precis vad BuggyUserCard nedan finns till för.
//
// Felet den demonstrerar är en kapplöpning: två hämtningar startas efter
// varandra, svaren kommer i omvänd ordning, och det gamla svaret skriver över
// det nya. Ingenting kraschar och inget felmeddelande syns - skärmen visar
// bara fel data.
//
// FixedUserCard längre ner är samma komponent med städningen på plats. Kopiera
// den, aldrig den första.

type User = {
  id: UserId;
  name: string;
  role: string;
  delayMs: number;
};

type UserId = 'ada' | 'bo';

// Två användare med mycket olika svarstid, så att kapplöpningen går att
// framkalla med två vanliga klick. Siffrorna står också i knapptexten: läsaren
// ska veta vilken ordning som utlöser felet, inte behöva gissa.
const USERS: Record<UserId, User> = {
  ada: { id: 'ada', name: 'Ada Lovelace', role: 'Analytiker', delayMs: 1800 },
  bo: { id: 'bo', name: 'Bo Nilsson', role: 'Systemarkitekt', delayMs: 300 },
};

// Den fejkade hämtningen. Ingen HTTP, ingen mockserver - bara ett löfte som
// löser ut efter användarens egen fördröjning.
//
// Den ligger i den här filen med flit. Servicelagret skapas först i modul 7 när
// något faktiskt behöver det, och en demo vars halva förklaring ligger i en
// annan fil visar inte mekanismen, den gömmer den.
const fetchUser = (userId: UserId): Promise<User> =>
  new Promise((resolve) => {
    const user = USERS[userId];
    window.setTimeout(() => resolve(user), user.delayMs);
  });

type UserCardProps = {
  userId: UserId;
  onLog: (kind: LogKind, message: string) => void;
};

type CardShellProps = {
  title: string;
  selected: User;
  shown: User | null;
};

// Kortet som båda varianterna visar sitt resultat i.
//
// Både den valda och den visade användaren står utskrivna. Skillnaden mellan
// dem är hela felet, och den ska gå att se utan att läsaren håller reda på
// vilken knapp som trycktes sist.
const CardShell = ({ title, selected, shown }: CardShellProps) => {
  const isWrong = shown !== null && shown.id !== selected.id;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>

      <Typography variant="body2" color="textSecondary">
        Vald: {selected.name}
      </Typography>
      <Typography sx={{ mb: 1 }}>Visas: {shown ? `${shown.name}, ${shown.role}` : 'hämtar ...'}</Typography>

      {isWrong && (
        <Alert severity="error" variant="outlined">
          Det som visas hör till {shown.name}, inte till den valda användaren. Ett gammalt svar kom fram efter det nya och skrev över det.
        </Alert>
      )}
    </Paper>
  );
};

// Varianten utan städning.
const BuggyUserCard = ({ userId, onLog }: UserCardProps) => {
  const [shown, setShown] = useState<User | null>(null);

  useEffect(() => {
    onLog('SETUP', `Hämtar ${USERS[userId].name} (${USERS[userId].delayMs} ms)`);

    void fetchUser(userId).then((loaded) => {
      onLog('RESOLVE', `Svar för ${loaded.name} skrivs till state`);

      // FEL: svaret skrivs oavsett om det fortfarande är aktuellt. Effekten
      // returnerar ingen städning, så den här körningen vet inte att en nyare
      // hämtning redan startat - och ett långsamt svar vinner över ett snabbt
      // bara för att det kom sist.
      setShown(loaded);
    });
  }, [userId, onLog]);

  return <CardShell title="Utan städning" selected={USERS[userId]} shown={shown} />;
};

// Samma komponent med städningen på plats.
const FixedUserCard = ({ userId, onLog }: UserCardProps) => {
  const [shown, setShown] = useState<User | null>(null);

  useEffect(() => {
    onLog('SETUP', `Hämtar ${USERS[userId].name} (${USERS[userId].delayMs} ms)`);

    // Flaggan lever i den här körningen av effekten. Varje ny körning får sin
    // egen, och städningen nedan sätter den gamlas till true.
    let ignore = false;

    void fetchUser(userId).then((loaded) => {
      // RÄTT: ett svar från en körning som redan städats undan får inte röra
      // state. Hämtningen går inte att ta tillbaka, men resultatet kan kastas.
      if (ignore) {
        onLog('IGNORED', `Svar för ${loaded.name} kastas, inte längre aktuellt`);
        return;
      }

      onLog('RESOLVE', `Svar för ${loaded.name} skrivs till state`);
      setShown(loaded);
    });

    return () => {
      onLog('CLEANUP', `Slutar lyssna på svaret för ${USERS[userId].name}`);
      ignore = true;
    };
  }, [userId, onLog]);

  return <CardShell title="Med städning" selected={USERS[userId]} shown={shown} />;
};

export const RaceConditionDemo = () => {
  const [userId, setUserId] = useState<UserId>('ada');
  const [isFixed, setIsFixed] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>([]);

  // Samma funktion mellan renderingarna, av samma skäl som i demo 1: den står
  // i effektens beroendelista, och en ny funktion vid varje render hade startat
  // om hämtningen i all oändlighet.
  const addEntry = useCallback((kind: LogKind, message: string) => {
    setEntries((previous) => [...previous, { id: previous.length + 1, kind, message }]);
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  // Växeln byter komponent, och då börjar den nya med tom logg och tomt kort.
  // Det är avsiktligt: jämförelsen ska göras genom att framkalla felet en gång
  // till, inte genom att minnas hur den förra varianten betedde sig.
  const handleFixedChange = (nextIsFixed: boolean) => {
    setIsFixed(nextIsFixed);
    setEntries([]);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="textSecondary">
        Klicka på Ada och sedan snabbt på Bo. Adas svar dröjer 1800 ms och Bos 300 ms, så Bos hinner fram först och Adas kommer efteråt.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <Stack direction="row" spacing={1}>
          <Button variant={userId === 'ada' ? 'contained' : 'outlined'} onClick={() => setUserId('ada')}>
            Ada (1800 ms)
          </Button>
          <Button variant={userId === 'bo' ? 'contained' : 'outlined'} onClick={() => setUserId('bo')}>
            Bo (300 ms)
          </Button>
        </Stack>

        <FormControlLabel
          control={<Switch checked={isFixed} onChange={(event) => handleFixedChange(event.target.checked)} />}
          label="Städa upp med ignore-flaggan"
        />
      </Stack>

      {isFixed ? <FixedUserCard userId={userId} onLog={addEntry} /> : <BuggyUserCard userId={userId} onLog={addEntry} />}

      <EffectLog entries={entries} onClear={clearEntries} />

      {/* Noten står under loggen och inte i instruktionen överst: den handlar om
          något man ser i loggen efteråt, inte om något man ska göra. */}
      <Typography variant="body2" color="textSecondary">
        Loggen börjar med två hämtningar av samma person. Det är StrictMode som monterar om komponenten en gång i utvecklingsläge, precis som i demo 1
        — och utan städning slår båda svaren igenom till state. Med städningen påslagen kastas det första, som en kapplöpning i miniatyr redan innan
        du hunnit klicka.
      </Typography>
    </Stack>
  );
};
