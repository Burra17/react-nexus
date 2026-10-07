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
// en katalog lär inte ut något. Poängen är inte att minnas vilka de är utan
// att känna igen situationerna när de dyker upp någon annanstans.
const DECISIONS: Decision[] = [
  {
    kind: 'En förenkling',
    title: 'Anropen är funktioner, inte en klass',
    template:
      'En basklass, BaseAPI, som varje resurs ärver och därmed får Get, GetAll, Create, Update och Delete gratis av. En resurs är en sorts data som API:et har, till exempel användare.',
    ours: 'En funktion per anrop, skriven rakt ut.',
    why: 'Arvet lönar sig i förlagan, som har tjugosju resurser. Här finns en enda, användare, och då blir basklassen en inpackning som döljer vad anropet gör. Den här appen ska visa hur koden fungerar, och det gör den sämre om det viktiga ligger gömt i en basklass. Samma mönster kan alltså vara rätt i ett projekt och fel i ett annat, och skillnaden är storlek och inte smak.',
  },
  {
    kind: 'Ett dyrare val',
    title: 'Axios, fast fetch hade räckt',
    template: 'Axios med en interceptor som lägger på en inloggningsnyckel, en så kallad auth-token, på varje anrop.',
    ours: 'Axios utan inloggning. Webbläsarens inbyggda fetch hade räckt för det appen gör.',
    why: 'Axios är ett bibliotek till att ladda ner och hålla uppdaterat, och det är det som gör valet dyrare. Skälet är pedagogiskt och inte tekniskt: det är axios du möter i produktionskod, och en lärobok som lär ut fetch förbereder dig sämre på den kod du faktiskt ska läsa. Ibland väljer man det som är dyrare i sig för att det är billigare i sammanhanget.',
  },
  {
    kind: 'Ett avsteg från dokumentationen',
    title: 'MSW körs också i den publicerade appen',
    template:
      'MSW:s egen guide startar MSW bara i utvecklingsläget, när appen körs direkt från källkoden, och inte i bygget, den version som publiceras.',
    ours: 'MSW startas i alla lägen, också i den publicerade appen.',
    why: 'I guiden står MSW i för en riktig server medan appen utvecklas. Här finns ingen server, och MSW är datakällan. Den publicerade appen är läroboken, och en vy som bara fungerar på utvecklarens dator är inte färdig. En guide beskriver det vanliga fallet. Ditt fall kan vara ett annat, och då är avsteget rätt så länge skälet står utskrivet där någon annars hade rättat tillbaka.',
  },
  {
    kind: 'Ett avsteg från den egna regeln',
    title: 'Query-nycklarna börjar med modulens namn',
    template:
      'Projektets egen regelfil, CLAUDE.md i repot, säger om nyckelfabriken, objektet som bygger alla nycklar för en resurs på ett ställe: "Fabriken hör till resursen, inte till modulen". En nyckel för användare skulle då börja med \'users\'.',
    ours: "Nycklarna börjar med modulens namn: ['queryBasics', 'users'], ['queryCache', 'users'] och ['mutations', 'users']. Tre moduler hämtar samma resurs, användare, med var sin nyckel.",
    why: 'Cachen delas av hela appen. Hade alla tre modulerna börjat sina nycklar med samma ord hade de delat poster: en vy hade hittat data som en annan vy lagt in, och betett sig olika beroende på i vilken ordning läsaren öppnat dem. En kodregel är ett verktyg och inte en lag, och den som avviker skriver ut skälet. Utan skälet läses avvikelsen som okunskap nästa gång någon jämför.',
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
