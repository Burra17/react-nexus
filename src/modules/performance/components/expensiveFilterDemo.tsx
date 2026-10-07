import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useRef, useState } from 'react';

type Person = { id: number; name: string; role: string };

const ROLES = ['utvecklare', 'designer', 'testare', 'arkitekt', 'analytiker'];

// Stegen är uppmätta på förhand, inte valda på känsla. Filtreringen passerar
// react.dev:s riktmärke på ungefär en millisekund strax över 20 000 poster, så
// spannet lägger tröskeln i mitten: läsaren kan dra sig både under och över den.
const SIZES = [1000, 5000, 20000, 50000, 100000, 200000];

// Hur många mätvärden snittet räknas på.
const SAMPLE_SIZE = 10;

const makeItems = (count: number): Person[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    name: `Person ${index}`,
    role: ROLES[index % ROLES.length],
  }));

// Beräkningen som tidtas. Ingenting märkvärdigt: den är bara stor nog att synas.
const filterItems = (items: Person[], query: string): Person[] => {
  const needle = query.toLowerCase();

  return items.filter((item) => item.name.toLowerCase().includes(needle) || item.role.toLowerCase().includes(needle));
};

// Bara två mått, och det är ett medvetet val.
//
// Första försöket visade också antal renderingar och hur många i rad som hoppat
// över beräkningen. Båda var opålitliga lokalt: StrictMode dubblerar renderingar
// och kan dessutom köra en useMemo-beräkning en extra gång för att upptäcka att
// den inte är ren. Panelen visade då "5 körningar på 4 renderingar" och påstod
// att beräkningen hoppats över direkt efter att den körts.
//
// Antal körningar är i stället ett absolut tal. Att det står helt stilla när
// memoiseringen träffar är ett starkare bevis än ett förhållande som kräver en
// brasklapp för att kunna läsas.
type Stats = {
  times: number[];
  runs: number;
};

// Mät en beräkning, och se vad memoiseringen faktiskt gav.
export const ExpensiveFilterDemo = () => {
  const [size, setSize] = useState(50000);
  const [query, setQuery] = useState('');
  const [unrelated, setUnrelated] = useState(0);
  const [memoized, setMemoized] = useState(false);
  // Värdet läses aldrig. Det finns för att nollställningen ska ge en omrendering
  // även när ingenting annat ändrades, så att panelen visar de tömda talen.
  const [, setResetCount] = useState(0);

  // Två lintregler stängs av här, och båda säger samma sak om koden nedan: den
  // är inte ren renderingskod. Det stämmer.
  //
  // react-hooks/refs stoppar normalt att en ref läses och skrivs under render.
  // react-hooks/purity stoppar anrop som performance.now(), som ger olika svar
  // varje gång. I vanlig kod är båda rätt: en render ska gå att köra om utan
  // att något förändras. Här är mätningen hela demonstrationen, så undantaget
  // görs medvetet. Skriv inte så här i kod som ska göra något på riktigt.
  //
  // Det är dessutom precis den orenhet som gör att React Compiler får optimera
  // bort en sådan här komponent. Se teoritexten om compilern.
  /* eslint-disable react-hooks/refs, react-hooks/purity -- mätningen är själva demonstrationen, se kommentaren ovan */
  const statsRef = useRef<Stats>({ times: [], runs: 0 });

  // Listan byggs i en egen useMemo, och det är inte en detalj.
  //
  // Att skapa 200 000 objekt tar tid. Låg den i samma mätning som filtreringen
  // hade siffran mätt fel sak helt. Demon använder alltså useMemo för att kunna
  // mäta useMemo rättvist. Ironin är avsiktlig och värd att lägga märke till.
  const items = useMemo(() => makeItems(size), [size]);

  // Växeln, och den fungerar inte som man först gissar.
  //
  // Hooks måste anropas i samma ordning varje render, så useMemo kan inte
  // plockas bort med en if. I stället läggs ett värde som är nytt vid varje
  // render i beroendelistan när växeln är av. Effekten blir densamma som ingen
  // memoisering alls: beräkningen körs om varenda gång.
  //
  // Det är dessutom exakt det react.dev varnar för: ett enda "alltid nytt"
  // värde räcker för att slå ut memoiseringen för en hel komponent.
  const alwaysNew = memoized ? null : {};

  const visible = useMemo(
    () => {
      const started = performance.now();
      const result = filterItems(items, query);
      const duration = performance.now() - started;

      statsRef.current.runs += 1;
      statsRef.current.times = [...statsRef.current.times, duration].slice(-SAMPLE_SIZE);

      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alwaysNew används inte i beräkningen, den står här för att kunna slå av memoiseringen. Se kommentaren ovan.
    [items, query, alwaysNew],
  );

  const { times, runs } = statsRef.current;

  const average = times.length > 0 ? times.reduce((total, time) => total + time, 0) / times.length : null;

  // Nollställningen rör med flit inte söksträngen.
  //
  // Tömdes fältet skulle beroendet ändras, beräkningen köras, och räknaren stå på
  // ett direkt efter en knapp som heter Nollställ. Nu börjar den på noll med
  // memoiseringen på och på ett utan, vilket är sant: då kördes den faktiskt.
  const reset = () => {
    statsRef.current = { times: [], runs: 0 };
    setUnrelated(0);
    setResetCount((current) => current + 1);
  };

  // Ett nytt antal poster startar en ny mätning. Annars blandar snittet tider
  // från olika listor, och talet på skärmen gäller ingen av dem.
  const changeSize = (next: number) => {
    // Samma storlek igen ger ingen ny ritning, och då hade panelen visat tal
    // som inte längre fanns kvar.
    if (next === size) return;
    statsRef.current = { times: [], runs: 0 };
    setSize(next);
  };

  // Rubriken säger vad talet är: inget, ett enda mätvärde eller ett snitt.
  const averageLabel =
    times.length === 0
      ? 'Tid för beräkningen'
      : times.length === 1
        ? 'Tid för den senaste körningen'
        : `Snitt över de senaste ${times.length} körningarna, högst ${SAMPLE_SIZE}`;

  // Decimalkomma, som i resten av texten på sidan.
  const formatMs = (value: number) => value.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Stack spacing={3}>
      <Typography variant='body2' color='textSecondary'>
        Demon mäter en enda beräkning: filtreringen av en lista med påhittade personer, Person 0, Person 1 och så vidare, var och en med en av fem
        roller. Filtret söker i både namn och roll. Listan visas inte, eftersom det då hade varit utritningen av raderna som tog tid och inte
        filtreringen. Panelen visar hur lång tid filtreringen tar och hur många gånger den har körts. Komponenten kan ritas om utan att beräkningen
        körs, och den skillnaden är vad demon handlar om.
      </Typography>

      <Typography variant='body2' color='textSecondary'>
        Fältet ändrar söksträngen, som är ett beroende: ett värde i <code>useMemo</code>:s beroendelista. <strong>Räkna upp något orelaterat</strong>{' '}
        ändrar ett state som filtreringen inte använder, så knappen ger en ritning men inget nytt beroende. Växeln avgör om filtreringen memoiseras.
        Med växeln av står <code>useMemo</code> kvar i koden, men med ett värde i beroendelistan som är nytt vid varje ritning, så att beräkningen
        körs varje gång. Att slå om växeln ger därför själv en körning. Mätningen börjar om när vyn öppnas, när du väljer ett annat antal poster och
        när du trycker på <strong>Nollställ mätningen</strong>.
      </Typography>

      <Typography variant='body2' color='textSecondary'>
        <strong>Först</strong>: klicka på 1 på reglaget och skriv några bokstäver i fältet. Tiden ligger runt en tiondels millisekund, långt under
        riktmärket på en millisekund, och då finns inget att vinna på att memoisera. Klicka sedan på 100 och skriv igen. Nu tar varje körning
        mångdubbelt längre. Slå gärna om växeln medan du skriver: det spelar ingen roll, eftersom varje bokstav ändrar söksträngen och beräkningen
        körs ändå.
      </Typography>

      <Typography variant='body2' color='textSecondary'>
        <strong>Sedan</strong>, med växeln av: tryck på <strong>Nollställ mätningen</strong> och därefter fem gånger på{' '}
        <strong>Räkna upp något orelaterat</strong>. Raden <strong>Beräkningen har körts</strong> ökar vid varje tryck. Den började inte på 0: med
        växeln av ger nollställningen själv en körning.
      </Typography>

      <Typography variant='body2' color='textSecondary'>
        <strong>Sist</strong>: slå på växeln, tryck på <strong>Nollställ mätningen</strong> och sedan fem gånger på knappen igen. Nu står raden på 0.
        Komponenten ritas om vid varje tryck, men inget beroende har ändrats, så <code>useMemo</code> lämnar tillbaka det sparade resultatet utan att
        köra beräkningen. Skriv sedan en bokstav i fältet: då körs den igen, eftersom söksträngen är ett beroende.
      </Typography>

      <Stack spacing={1}>
        <Typography id='storlek-etikett' variant='body2' color='textSecondary'>
          Antal poster i listan, i tusental
        </Typography>
        <Slider
          aria-labelledby='storlek-etikett'
          value={size}
          onChange={(_event, next) => changeSize(next as number)}
          min={SIZES[0]}
          max={SIZES[SIZES.length - 1]}
          step={null}
          marks={SIZES.map((value) => ({ value, label: String(value / 1000) }))}
          valueLabelDisplay='auto'
        />
      </Stack>

      {/* alignItems ligger i sx och inte som prop: MUI v9 tar inte längre emot
          ett responsivt objekt direkt på Stack. */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <TextField
          size='small'
          label='Filtrera listan'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          helperText='Ändrar ett beroende'
        />
        <Button variant='outlined' onClick={() => setUnrelated((current) => current + 1)}>
          Räkna upp något orelaterat ({unrelated})
        </Button>
        <Button onClick={reset}>Nollställ mätningen</Button>
      </Stack>

      <FormControlLabel
        control={<Switch checked={memoized} onChange={(event) => setMemoized(event.target.checked)} />}
        label='Memoisera filtreringen med useMemo'
      />

      <Paper variant='outlined' sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant='body2' color='textSecondary'>
            {averageLabel}
          </Typography>
          <Typography variant='h3' component='p'>
            {average === null ? 'ingen körning' : `${formatMs(average)} ms`}
          </Typography>
          {average === null && (
            <Typography variant='body2' color='textSecondary'>
              Beräkningen har hoppats över vid varje ritning sedan mätningen började. En överhoppad beräkning tar ingen tid alls.
            </Typography>
          )}

          <Typography variant='body2' color='textSecondary' sx={{ pt: 1 }}>
            Beräkningen har körts
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>
            {runs} {runs === 1 ? 'gång' : 'gånger'} sedan mätningen började
          </Typography>

          <Typography variant='body2' color='textSecondary' sx={{ pt: 1 }}>
            Listan har {items.length.toLocaleString('sv-SE')} poster, {visible.length.toLocaleString('sv-SE')} matchar.
          </Typography>
        </Stack>
      </Paper>

      {/* Samma grepp som RenderCounter: säg vilket läge läsaren faktiskt är i.
          En modul om att mäta rätt får inte tiga om att den egna mätningen är
          missvisande lokalt. */}
      <Typography variant='body2' color='textSecondary'>
        {import.meta.env.DEV ? (
          <>
            <strong>Appen körs i utvecklingsläge, och talen ovan är därför för höga.</strong> I utvecklingsläget kör StrictMode varje komponent en
            extra gång och koden är inte optimerad. StrictMode kör dessutom beräkningen mer än en gång per ritning, så raden{' '}
            <strong>Beräkningen har körts</strong> ökar med mer än ett i taget. Förhållandena stämmer ändå: mer data tar längre tid, och en överhoppad
            beräkning tar ingen tid. Rättvisande tal får du först i ett bygge, den optimerade version som användarna får.
          </>
        ) : (
          <>
            <strong>Det här är ett bygge, den optimerade version som användarna får, så talen påverkas inte av utvecklingsläget.</strong> De är ändå
            uppmätta på din dator och inte på användarens. I utvecklingsläget blir de högre, eftersom StrictMode där kör varje komponent en extra gång
            och koden inte är optimerad.
          </>
        )}
      </Typography>
    </Stack>
  );
};
/* eslint-enable react-hooks/refs, react-hooks/purity */
