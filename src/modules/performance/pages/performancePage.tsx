import Typography from '@mui/material/Typography';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { ExpensiveFilterDemo } from '../components/expensiveFilterDemo';
import expensiveFilterSource from '../components/expensiveFilterDemo.tsx?raw';
import { performanceQuestions } from '../performanceQuestions';

const Theory = () => (
  <>
    <Typography>
      Nästan all memoisering som skrivs läggs dit på känsla. Något kändes trögt, eller en kollega sa att det brukar vara bra, eller så klagade ESLint
      på en beroendelista och <code>useCallback</code> fick tyst på den. Nästan ingen har kört en mätning före och en efter. Den här modulen handlar
      inte om hur du memoiserar — det har du redan sett — utan om hur du vet att du behöver det.
    </Typography>

    <Typography>
      Först en inramning som knyter ihop det du redan mött. <code>useMemo</code>, <code>useCallback</code> och <code>React.memo</code> är inte tre
      olika idéer utan <strong>en idé på tre nivåer</strong>: spara ett resultat mellan renderingar, så att arbetet kan hoppas över när ingenting
      ändrats. <code>useMemo</code> sparar ett värde, <code>useCallback</code> en funktion, <code>React.memo</code> en hel komponent.
      Rendering-modulen visade den tredje, Context-modulen de två första. Ingen av dem svarade på när det är värt besväret.
    </Typography>

    <Typography>
      Svaret börjar med en mätning, och den är enklare än man tror. Lägg <code>console.time</code> före beräkningen och <code>console.timeEnd</code>{' '}
      efter, gör det du vill mäta, och läs av. react.dev ger ett riktmärke: landar den samlade tiden på ungefär en millisekund eller mer kan det vara
      värt att memoisera. Under det finns ingenting att vinna. Det tar tjugo sekunder att skriva och svarar på frågan som annars blir en gissning.
    </Typography>

    <Typography>
      Två saker gör mätningen svårare än den ser ut. Den första är att <strong>din maskin inte är användarens</strong> — react.dev föreslår att man
      bromsar processorn på konstgjord väg för att komma närmare verkligheten. Den andra är att <strong>utvecklingsläget inte är produktion</strong>.
      StrictMode renderar varje komponent två gånger, koden är inte optimerad, och siffrorna blir därefter. Demon nedan säger rakt ut vilket läge du
      är i, eftersom en modul om att mäta rätt inte får tiga om att dess egen mätning är missvisande lokalt.
    </Typography>

    <Typography>
      Den tredje svårigheten är bruset. Samma beräkning kan ta 0,8 ms en gång och 2,3 ms nästa, eftersom JavaScript-motorn optimerar kod som körs ofta
      och skräpsamlingen kan pausa tråden när som helst. Ett enstaka mätvärde betyder därför ingenting. Demon visar ett snitt över de tio senaste
      körningarna, och det är inte en detalj — det är skillnaden mellan att mäta och att titta på en siffra.
    </Typography>

    <Typography>
      Sedan kommer det obekväma: <strong>memoisering är inte gratis, och den lönar sig mer sällan än man tror.</strong> Jämförelsen av beroendena
      kostar också tid, koden blir längre och svårare att läsa, och vinsten uteblir helt om beroendena ändras ändå. Skriver användaren i ett sökfält
      ändras söksträngen vid varje tangenttryck — då betalar du jämförelsen och kör beräkningen. react.dev lägger till en varning som är värd att
      minnas: ett enda värde som alltid är nytt räcker för att slå ut memoiseringen för en hel komponent.
    </Typography>

    <Typography>
      Ofta är det bättre att ta bort behovet än att optimera det. react.dev listar fem vanor som gör mycket memoisering onödig: låt komponenter som
      omsluter andra ta emot JSX som <code>children</code>, håll state så lokalt som möjligt, håll renderingskoden ren, undvik effekter som bara
      sätter state, och rensa onödiga beroenden ur de effekter du har. Ingen av dem är en optimering. De är sätt att låta bli att skapa problemet.
    </Typography>

    <Typography>
      <strong>En not om React Compiler.</strong> Det finns numera en kompilator som memoiserar åt dig, automatiskt, så att manuella{' '}
      <code>useMemo</code>, <code>useCallback</code> och <code>React.memo</code> inte längre behövs. Den fungerar bäst med React 19, som det här repot
      kör — men här är den avstängd, och skälet är värt att veta. Renderräknaren som modulerna bygger på skriver till en ref mitt under renderingen,
      vilket inte är ren kod, och en kompilator som förutsätter renhet får då optimera bort hela komponenten. Med compilern påslagen slutade räknarna
      räkna i fyra moduler medan apparna i övrigt fungerade som vanligt. Kompilatorn gör alltså inget fel — det är mätinstrumentet som medvetet bryter
      mot regeln den bygger på. Samma orenhet är också skälet till att två lintregler är avstängda i demons källkod nedan.
    </Typography>

    <Typography>
      <strong>Regeln att ta med sig:</strong> optimera aldrig något du inte har mätt. En memoisering utan en siffra före och en efter är inte en
      förbättring utan en gissning som blivit kod — och till skillnad från en gissning måste koden underhållas. Mät först. Oftast visar det sig att
      problemet inte fanns.
    </Typography>
  </>
);

export const PerformancePage = () => (
  <ConceptTemplate
    title="Performance"
    theory={<Theory />}
    demo={<ExpensiveFilterDemo />}
    sources={[
      {
        fileName: 'src/modules/performance/components/expensiveFilterDemo.tsx',
        code: expensiveFilterSource,
        language: 'tsx',
        // Tidtagningen, listans egen useMemo som håller mätningen ärlig, och
        // knepet som stänger av memoiseringen utan att ta bort hooken.
        highlight: ['const started = performance.now();', 'const items = useMemo', 'const alwaysNew'],
      },
    ]}
    quiz={performanceQuestions}
  />
);
