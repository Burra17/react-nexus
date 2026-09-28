import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type Decision = {
  // Vilken sorts beslut det är. Rubriken är viktigare än exemplet: det är
  // sorten som går att ta med sig till ett annat projekt.
  kind: string;
  title: string;
  template: string;
  ours: string;
  why: string;
};

// Fyra avsteg, valda för att var och en är en egen SORT av beslut.
//
// Repot har minst tolv dokumenterade avvikelser. Alla tolv blir en katalog, och
// en katalog lär inte ut något - poängen är inte att minnas vilka de är utan
// att känna igen situationerna när de dyker upp någon annanstans.
const DECISIONS: Decision[] = [
  {
    kind: 'Vi förenklade',
    title: 'Anropen är funktioner, inte en klass',
    template: 'En BaseAPI-klass som varje resurs ärver, och får Get, GetAll, Create, Update och Delete gratis.',
    ours: 'En funktion per anrop, skriven rakt ut.',
    why: 'Arvet lönar sig över tjugosju resurser. Här finns två eller tre mot en mockad backend, och då blir basklassen en inpackning som döljer vad anropet gör — tvärtemot regeln att demonstrationskod ska visa mekanismen. Samma mönster kan alltså vara rätt i ett projekt och fel i ett annat, och skillnaden är skala och inte smak.',
  },
  {
    kind: 'Vi behöll det dyrare',
    title: 'Axios, trots att vi inte behöver det',
    template: 'Axios med interceptors för att haka på en auth-token.',
    ours: 'Axios utan auth — vi har ingen inloggning och därmed inte den vanligaste anledningen att använda biblioteket.',
    why: 'Skälet är pedagogiskt och inte tekniskt: det är axios du möter i produktionskod, och en lärobok som lär ut fetch förbereder dig sämre på den kod du faktiskt ska läsa. Ibland väljer man det som är dyrare i sig för att det är billigare i sammanhanget.',
  },
  {
    kind: 'Vi bröt mot dokumentationen',
    title: 'Mockservern körs även i ett bygge',
    template: 'MSW:s egen guide startar workern bara när NODE_ENV är development.',
    ours: 'Workern startas i alla lägen, också i det publicerade bygget.',
    why: 'Här är mocken inte en ställföreträdare för en riktig backend under utveckling — den ÄR datakällan. Den publicerade sidan är läroboken, och en modul som bara fungerar på utvecklarens maskin är inte byggd. En guide beskriver det vanliga fallet; ditt fall kan vara ett annat, och då är avsteget rätt så länge skälet står utskrivet där någon annars hade "rättat" tillbaka.',
  },
  {
    kind: 'Vi bröt mot vår egen regel',
    title: 'Query-nycklarna bär modulens namn',
    template: 'CLAUDE.md:s eget fabriksexempel börjar på resursen: ["cacheDemo", "list"].',
    ours: "Roten bär modulen: ['queryCache', 'users'], ['mutations', 'users'], ['architecture', 'trace'].",
    why: 'Servicen som hämtar användare delas mellan modulerna, men nycklarna får inte göra det: med en delad rot skulle en modul hitta data en tidigare modul lagt in, och sidan bete sig olika beroende på i vilken ordning kapitlen lästs. Det här är det viktigaste av de fyra avstegen — en kodregel är ett verktyg och inte en lag, och den som avviker är skyldig att skriva ut skälet. Utan skälet läses avvikelsen som okunskap nästa gång någon jämför.',
  },
];

// De fyra besluten som kort. Inte interaktiva: det finns ingenting att prova,
// bara något att läsa och känna igen.
export const DecisionList = () => (
  <Stack spacing={2}>
    {DECISIONS.map((decision) => (
      <Paper key={decision.title} variant='outlined' sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Stack spacing={0.5}>
            <Typography variant='caption' color='textSecondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {decision.kind}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {decision.title}
            </Typography>
          </Stack>

          <Stack spacing={0.75}>
            <Typography variant='body2' color='textSecondary'>
              <strong>Förlagan:</strong> {decision.template}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              <strong>Här:</strong> {decision.ours}
            </Typography>
          </Stack>

          <Typography variant='body2'>{decision.why}</Typography>
        </Stack>
      </Paper>
    ))}
  </Stack>
);
