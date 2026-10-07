import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { createContext, memo, useCallback, useContext, useMemo, useState } from 'react';
import { RenderCounter } from '../../../shared/components/renderCounter';

type AuthUser = { name: string; role: string };

// Ett värde och en funktion som ändrar det, så att en konsument långt ner kan
// byta användare. Kombinationen är skälet till att value blir ett objekt, och
// ett objekt är en ny referens varje gång det skapas.
type AuthValue = {
  currentUser: AuthUser;
  login: (name: string) => void;
};

type CardProps = { title: string };

const USERS: AuthUser[] = [
  { name: 'Ada', role: 'utvecklare' },
  { name: 'Grace', role: 'amiral' },
  { name: 'Katherine', role: 'matematiker' },
  { name: 'Gäst', role: 'utan konto' },
];

// Contexten exporteras inte. Provider och konsumenter ligger i samma fil, så hela
// kedjan syns utan att byta fil. I en riktig app exporteras den, så att
// konsumenter i andra filer kan läsa den.
//
// Argumentet är startvärdet, som en konsument bara får om det inte finns någon
// provider ovanför den. Här finns alltid en. Ett vanligt alternativ är null som
// startvärde, men då kan värdet vara null och varje konsument måste kontrollera
// det innan den läser. Ett påhittat startvärde slipper det.
const AuthContext = createContext<AuthValue>({ currentUser: USERS[0], login: () => {} });

// Kort 1: läser currentUser och saknar memo.
//
// Ett barn ritas om när föräldern ritas om, oavsett context. Kortet följer därför
// varje ritning av föräldern, alltså komponenten som håller providern, och är
// mätaren för den. De andra tre korten ligger i memo. Annars hade de också
// tickat vid varje klick och visat föräldern i stället för contexten.
//
// Noten om StrictMode visas bara på kort 1, eftersom demon bara behöver
// förklara den en gång.
const UserCard = ({ title, showStrictModeNote = false }: CardProps & { showStrictModeNote?: boolean }) => {
  const { currentUser } = useContext(AuthContext);

  return (
    <Paper variant='outlined' sx={{ p: 2, flex: 1 }}>
      <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      <Typography sx={{ mb: 1 }}>
        {currentUser.name}, {currentUser.role}
      </Typography>
      <RenderCounter showStrictModeNote={showStrictModeNote} />
    </Paper>
  );
};

// Kort 4: samma komponent som kort 1, inpackad i memo. memo och React.memo är
// samma funktion.
//
// memo jämför props, och title är samma sträng varje gång, så föräldern kan inte
// rita om kortet. Men varje gång value är nytt ritas det om ändå: den ritningen
// kommer inte genom props utan från contexten kortet läser, och den vägen går
// förbi memo.
const MemoUserCard = memo(UserCard);

// Kort 2: läser bara login och bryr sig inte om vem som är inloggad.
//
// Kortet behöver alltså inte ritas om när currentUser byts. Men en konsument får
// alltid hela value och aldrig ett enskilt fält, så kortet ritas om varje gång
// value är ett nytt objekt.
//
// Knappen anropar login inifrån en konsument. Är Gäst redan inloggad får state
// samma värde som förut, och då ritar React inte om någonting.
const LoginCardBase = ({ title }: CardProps) => {
  const { login } = useContext(AuthContext);

  return (
    <Paper variant='outlined' sx={{ p: 2, flex: 1 }}>
      <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      <Button size='small' variant='outlined' onClick={() => login('Gäst')} sx={{ mb: 1 }}>
        Logga in som gäst
      </Button>
      <RenderCounter />
    </Paper>
  );
};

const MemoLoginCard = memo(LoginCardBase);

// Kort 3: läser ingen context alls.
const StaticCardBase = ({ title }: CardProps) => (
  <Paper variant='outlined' sx={{ p: 2, flex: 1 }}>
    <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
    <Typography variant='body2' color='textSecondary' sx={{ mb: 1 }}>
      Läser ingenting ur contexten.
    </Typography>
    <RenderCounter />
  </Paper>
);

// Kort 3 behöver memo för att jämförelsen med kort 4 ska gå att lita på.
//
// Utan memo ritas det om varje gång föräldern ritas om, eftersom ett barn ritas
// om med sin förälder, och då hade räknaren tickat av fel skäl.
//
// Med memo blir kort 3 och kort 4 ett par som skiljer sig på en enda sak. Båda
// ligger i memo och får samma props. Kort 4 läser contexten, kort 3 gör det inte.
// Bara kort 4 ritas om när value är nytt.
const StaticCard = memo(StaticCardBase);

// Fyra kort under en provider, och en växel som byter mellan ett value som
// skapas på nytt vid varje ritning och ett som sparas med useMemo.
export const ContextRenderDemo = () => {
  const [userIndex, setUserIndex] = useState(0);
  const [unrelated, setUnrelated] = useState(0);
  const [memoized, setMemoized] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const currentUser = USERS[userIndex];

  const setUserByName = useCallback((name: string) => {
    const index = USERS.findIndex((user) => user.name === name);
    // findIndex ger -1 om namnet inte finns, och då lämnas användaren som den
    // är. Alla namn demon skickar in finns i listan, så grenen är bara ett skydd.
    setUserIndex((current) => (index === -1 ? current : index));
  }, []);

  // Den memoiserade varianten, som på react.dev:s referenssida för useContext:
  // useCallback håller funktionen och useMemo håller objektet. Objektet räknas
  // fram på nytt bara när något i beroendelistan, [currentUser, setUserByName],
  // har ändrats. Så länge användaren är densamma får konsumenterna samma
  // referens och står still.
  const stableValue = useMemo<AuthValue>(() => ({ currentUser, login: setUserByName }), [currentUser, setUserByName]);

  // Den omemoiserade varianten. Objektet skapas på nytt vid varje ritning, och
  // login lindas i en ny pilfunktion så att också funktionen är ny varje gång,
  // som den hade varit utan useCallback. Innehållet kan vara identiskt, men
  // referensen är ny, och React jämför med Object.is.
  //
  // Båda varianterna räknas fram vid varje ritning, fast bara den ena används.
  // useMemo är en hook, och en hook måste anropas i samma ordning vid varje
  // ritning, så den kan inte stå i en if-sats.
  const freshValue: AuthValue = { currentUser, login: (name: string) => setUserByName(name) };

  const value = memoized ? stableValue : freshValue;

  return (
    <Stack spacing={2}>
      <Typography variant='body2' color='textSecondary'>
        Komponenten här håller en provider för en context med en inloggad användare, <code>currentUser</code>, och en funktion som byter den,{' '}
        <code>login</code>. Under providern ligger fyra kort. Varje kort har en räknare som ökar varje gång React kör kortets funktion, alltså vid
        varje ritning. Kort 1 saknar <code>memo</code> och ritas därför om varje gång komponenten som håller providern ritas om: det är mätaren för
        den. Kort 2, 3 och 4 ligger i <code>memo</code> och får samma props hela tiden, så för dem kan en ritning bara komma från contexten.
      </Typography>

      <Typography variant='body2' color='textSecondary'>
        <strong>Först</strong>, med växeln av: tryck på <strong>Räkna upp något orelaterat</strong>. Talet i knappen räknar dina klick. Det ligger i
        state i komponenten som håller providern, så den ritas om och skapar ett nytt <code>value</code>. Kort 1, 2 och 4 ökar, kort 3 står still.
        Kort 2 och 4 ritas om trots att ingen användare bytts.
      </Typography>

      <Typography variant='body2' color='textSecondary'>
        <strong>Sedan</strong>: slå på växeln. Bytet ger själv en ritning, eftersom <code>value</code> då blir ett annat objekt, så tryck på{' '}
        <strong>Nollställ räknarna</strong> för att låta alla räknare börja om. Tryck på <strong>Räkna upp något orelaterat</strong> igen. Nu ökar
        bara kort 1: komponenten som håller providern ritas om, men <code>value</code> är samma objekt som förut.
      </Typography>

      <Typography variant='body2' color='textSecondary'>
        <strong>Sist</strong>: tryck på <strong>Byt användare</strong>. Nu är värdet nytt på riktigt, och kort 1, 2 och 4 ökar även med växeln på.
        Knappen <strong>Logga in som gäst</strong> i kort 2 byter användare på samma sätt, fast inifrån en konsument via <code>login</code>. Trycker
        du på den när Gäst redan är inloggad händer ingenting: state får samma värde som förut, och då hoppar React över ritningen.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant='contained' onClick={() => setUserIndex((current) => (current + 1) % USERS.length)}>
          Byt användare
        </Button>
        <Button variant='outlined' onClick={() => setUnrelated((current) => current + 1)}>
          Räkna upp något orelaterat ({unrelated})
        </Button>
        <Button onClick={() => setResetKey((current) => current + 1)}>Nollställ räknarna</Button>
      </Stack>

      <FormControlLabel
        control={<Switch checked={memoized} onChange={(event) => setMemoized(event.target.checked)} />}
        label='Memoisera value med useMemo och useCallback'
      />

      {/* key är Reacts sätt att känna igen ett element mellan ritningarna. Får
          den ett nytt värde räknar React elementet som nytt: det gamla trädet tas
          bort och ett nytt monteras, med alla räknare från början. Så kan samma
          klick köras om från noll med växeln i det andra läget, och talen
          jämföras. */}
      <AuthContext key={resetKey} value={value}>
        {/* Två och två, så att kort 3 och 4 hamnar bredvid varandra. */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <UserCard title='1. Utan memo, läser currentUser' showStrictModeNote />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MemoLoginCard title='2. I memo, läser bara login' />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StaticCard title='3. I memo, läser ingen context' />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MemoUserCard title='4. I memo, läser currentUser' />
          </Grid>
        </Grid>
      </AuthContext>

      <Typography variant='body2' color='textSecondary'>
        Kort 3 och 4 är paret att jämföra. Båda ligger i <code>memo</code> och får samma props, och det enda som skiljer dem är att kort 4 läser
        contexten. Varje gång <code>value</code> är nytt ritas kort 4 om medan kort 3 står still, eftersom <code>memo</code> bara stoppar det som
        kommer genom props. Kort 2 visar gränsen för memoiseringen: det läser bara <code>login</code>, som är samma funktion så länge växeln är på,
        men ritas ändå om när användaren byts, eftersom det får hela <code>value</code>.
      </Typography>
    </Stack>
  );
};
