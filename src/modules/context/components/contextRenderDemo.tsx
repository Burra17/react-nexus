import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { createContext, memo, useCallback, useContext, useMemo, useState } from 'react';
import { RenderCounter } from '../../../shared/components/renderCounter';

type AuthUser = { name: string; role: string };

// Ett värde och en funktion, precis som react.dev:s eget AuthContext-exempel.
// Kombinationen är inte en tillfällighet: det är just därför value blir ett
// objekt, och ett objekt är en ny referens varje gång det skapas.
type AuthValue = {
  currentUser: AuthUser;
  login: (name: string) => void;
};

type CardProps = { title: string };

const USERS: AuthUser[] = [
  { name: 'Ada', role: 'utvecklare' },
  { name: 'Grace', role: 'amiral' },
  { name: 'Katherine', role: 'matematiker' },
  { name: 'Gäst', role: 'inte inloggad' },
];

// Contexten exporteras inte, och det är avsiktligt på två sätt.
//
// Mekaniken hänger ihop: provider och konsumenter är grannar i den här filen, så
// läsaren ser hela kedjan utan att byta fil. Dessutom klagar
// react-refresh/only-export-components på en fil som exporterar både en komponent
// och något annat - en lokal const triggar ingen regel.
//
// Startvärdet används bara av en konsument utan provider ovanför sig. Här finns
// alltid en, så det är en formalitet som gör typen enklare än null.
const AuthContext = createContext<AuthValue>({ currentUser: USERS[0], login: () => {} });

// Roll 1: läser currentUser, och är den enda konsumenten utan memo.
//
// Den finns för att visa varför de andra tre är memoiserade. Ett barn ritas om när
// föräldern gör det, oavsett context - det lär Rendering-modulen ut. Utan memo hade
// alla kort tickat vid varje klick, och då hade demon mätt föräldern i stället för
// contexten.
const UserCard = ({ title }: CardProps) => {
  const { currentUser } = useContext(AuthContext);

  return (
    <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
      <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      <Typography sx={{ mb: 1 }}>
        {currentUser.name}, {currentUser.role}
      </Typography>
      <RenderCounter />
    </Paper>
  );
};

// Roll 4: exakt samma komponent som roll 1, inpackad i memo.
//
// memo jämför props, och title är samma sträng varje gång, så förälderns
// omrenderingar stoppas här. Men när användaren byts tickar räknaren ändå:
// omrenderingen kommer då inte uppifrån via props utan från contexten komponenten
// själv läser, och den vägen ser memo aldrig.
const MemoUserCard = memo(UserCard);

// Roll 2: läser bara login och bryr sig inte om vem som är inloggad.
//
// Den behöver alltså inte ritas om när currentUser byts. Men den prenumererar på
// hela contexten, inte på ett fält i den, så den följer med varje gång value blir
// en ny referens.
const LoginCardBase = ({ title }: CardProps) => {
  const { login } = useContext(AuthContext);

  return (
    <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
      <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      <Button size="small" variant="outlined" onClick={() => login('Gäst')} sx={{ mb: 1 }}>
        Logga in som gäst
      </Button>
      <RenderCounter />
    </Paper>
  );
};

const MemoLoginCard = memo(LoginCardBase);

// Roll 3: kontrollgrupp. Läser ingen context alls.
const StaticCardBase = ({ title }: CardProps) => (
  <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
    <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
      Läser ingenting ur contexten.
    </Typography>
    <RenderCounter />
  </Paper>
);

// Kontrollgruppen måste vara memoiserad för att duga som kontrollgrupp.
//
// Utan memo ritas den om ändå - inte för contextens skull, utan för att den är
// barn till en förälder som renderar om. Det är precis vad Rendering-modulen lär
// ut, och här hade det gjort räknaren oläsbar: den hade tickat av fel skäl.
//
// Med memo blir det här kortet och kort 4 ett par som skiljer sig på en enda sak.
// Båda är memoiserade, båda får samma props. Det ena läser contexten, det andra
// inte - och bara det ena ritas om.
const StaticCard = memo(StaticCardBase);

// Fyra konsumenter under en provider, och en växel som byter mellan ett
// nyskapat och ett memoiserat value.
export const ContextRenderDemo = () => {
  const [userIndex, setUserIndex] = useState(0);
  const [unrelated, setUnrelated] = useState(0);
  const [memoized, setMemoized] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const currentUser = USERS[userIndex];

  const setUserByName = useCallback((name: string) => {
    const index = USERS.findIndex((user) => user.name === name);
    // findIndex kan ge -1, och då lämnas användaren i fred. Alla namn demon
    // skickar in finns i listan, så grenen är ett skydd och inte en funktion.
    setUserIndex((current) => (index === -1 ? current : index));
  }, []);

  // Den memoiserade varianten, som react.dev visar den: useCallback håller
  // funktionen, useMemo håller objektet. Så länge currentUser är oförändrad får
  // konsumenterna samma referens och står still.
  const stableValue = useMemo<AuthValue>(() => ({ currentUser, login: setUserByName }), [currentUser, setUserByName]);

  // Den ometiserade varianten. Både objektet och funktionen skapas på nytt vid
  // varje render, precis som i react.dev:s exempel före optimeringen. Innehållet
  // kan vara identiskt - referensen är ny, och jämförelsen sker med Object.is.
  const freshValue: AuthValue = { currentUser, login: (name: string) => setUserByName(name) };

  const value = memoized ? stableValue : freshValue;

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="contained" onClick={() => setUserIndex((current) => (current + 1) % USERS.length)}>
          Byt användare
        </Button>
        <Button variant="outlined" onClick={() => setUnrelated((current) => current + 1)}>
          Räkna upp något orelaterat ({unrelated})
        </Button>
        <Button onClick={() => setResetKey((current) => current + 1)}>Nollställ räknarna</Button>
      </Stack>

      <FormControlLabel
        control={<Switch checked={memoized} onChange={(event) => setMemoized(event.target.checked)} />}
        label="Memoisera value med useMemo och useCallback"
      />

      {/* Providerns egen räknare, och sidans enda not om StrictMode. Den behövs
          för att knappen till höger ska synas göra något: utan den ser man att
          barnen ritas om, men inte att det var providern som utlöste det. */}
      <RenderCounter showStrictModeNote />

      {/* Nyckeln monterar om hela trädet och nollställer därmed alla räknare.
          Jämförelsen mellan av och på görs i minnet, inte sida vid sida, så den
          kräver att man kan köra om samma sekvens från noll. */}
      <AuthContext key={resetKey} value={value}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <UserCard title="1. Utan memo, läser currentUser" />
          <MemoLoginCard title="2. I memo, läser bara login" />
          <StaticCard title="3. I memo, läser ingen context" />
          <MemoUserCard title="4. I memo, läser currentUser" />
        </Stack>
      </AuthContext>

      <Typography variant="body2" color="textSecondary">
        Tryck på <strong>Räkna upp något orelaterat</strong> med växeln av: kort 2 och 4 ritas om trots att ingen användare bytts, eftersom{' '}
        <code>value</code> är ett nytt objekt. Slå på växeln, nollställ och gör om — nu står de still. Tryck sedan på <strong>Byt användare</strong>:
        då ritas de om igen även med växeln på, eftersom värdet den här gången är nytt på riktigt.
      </Typography>

      <Typography variant="body2" color="textSecondary">
        Kort 3 och 4 är paret att titta noga på. Båda ligger i <code>React.memo</code> och får samma props hela tiden. Det enda som skiljer dem är att
        kort 4 läser contexten — och det räcker. <code>memo</code> stoppar det som kommer uppifrån genom props, men en context når komponenten direkt
        och går rakt förbi. Kort 2 säger samma sak från andra hållet: den vill bara åt <code>login</code> och behöver inte veta vem som är inloggad,
        men ritas ändå om varje gång användaren byts.
      </Typography>

      <Typography variant="body2" color="textSecondary">
        Kort 1 är det enda utan <code>memo</code>, och det tickar vid varenda klick. Det är inte contextens fel — ett barn ritas om när föräldern gör
        det. Kortet står där för att visa varför de andra tre behöver <code>memo</code> för att kunna mäta något alls.
      </Typography>
    </Stack>
  );
};
