import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { ExpensiveFilterDemo } from '../components/expensiveFilterDemo';
import expensiveFilterSource from '../components/expensiveFilterDemo.tsx?raw';
import { performanceQuestions } from '../performanceQuestions';

const Theory = () => (
  <>
    <Typography>
      Det mesta som memoiseras memoiseras på känsla. Något kändes trögt, en kollega sa att det brukar vara bra, eller så varnade ESLint, verktyget som
      granskar koden, för en beroendelista och ett <code>useCallback</code> fick tyst på varningen. Nästan ingen har mätt före och efter. Den här
      sidan handlar inte om hur man memoiserar, utan om hur man vet att man behöver det.
    </Typography>

    <Typography>
      En komponent i React är en funktion som React kör igen varje gång komponenten ska ritas om, till exempel när dess state ändras. Varje sådan gång
      kallas här en <strong>ritning</strong>. Allt som står i funktionen körs om vid varje ritning, också en dyr beräkning som att filtrera en lång
      lista, fast svaret blir detsamma som förra gången. Att beräkningen körs kallas här en <strong>körning</strong>. En ritning och en körning är
      alltså två olika saker, och poängen med att memoisera är att få den första utan den andra.
    </Typography>

    <Typography>
      Att <strong>memoisera</strong> är att spara resultatet av en beräkning och lämna tillbaka det sparade resultatet så länge det beräkningen bygger
      på är oförändrat. React har tre verktyg för det. <code>{'useMemo(() => beräkning, [beroenden])'}</code> sparar ett värde. Listan sist är{' '}
      <em>beroendelistan</em>: vid varje ritning jämför React varje värde i den med förra ritningens, och bara om något har ändrats körs beräkningen
      igen. <code>useCallback</code> sparar en funktion på samma sätt, så att det är samma funktion från ritning till ritning. <code>React.memo</code>{' '}
      packar in en hel komponent och hoppar över dess ritning när föräldern ritas om, om alla props är oförändrade. Det är en idé på tre nivåer: spara
      resultatet, så att arbetet kan hoppas över.
    </Typography>

    <Typography>
      När lönar det sig? Svaret börjar med en mätning, och den är enklare än man tror. Skriv <code>{"console.time('filtrera')"}</code> före
      beräkningen och <code>{"console.timeEnd('filtrera')"}</code> efter, med samma etikett i båda. Tiden skrivs ut i webbläsarens konsol, som finns
      bland utvecklarverktygen och öppnas med F12. Demon nedan mäter på samma sätt, men med <code>performance.now()</code>, som ger tiden i
      millisekunder, så att resultatet kan visas på sidan.{' '}
      <Link href='https://react.dev/reference/react/useMemo#how-to-tell-if-a-calculation-is-expensive'>react.dev</Link>, Reacts officiella
      dokumentation, ger en tumregel: tar beräkningen säg en millisekund eller mer kan det vara värt att memoisera. Under det finns sällan något att
      vinna.
    </Typography>

    <Typography>
      Tre saker gör mätningen svårare än den ser ut. Den första är att <strong>din dator inte är användarens</strong>. react.dev föreslår att man
      bromsar processorn på konstgjord väg för att komma närmare en långsammare enhet, och Chromes utvecklarverktyg har ett val för det. Den andra är
      att <strong>utvecklingsläget inte är ett bygge</strong>. Utvecklingsläget är appen som körs direkt från källkoden medan den skrivs, ett bygge är
      den optimerade version som användarna får. I utvecklingsläget kör StrictMode, ett hjälpmedel som bara finns där, varje komponent en extra gång
      för att hitta fel, och koden är inte optimerad, så talen blir för höga. Den tredje är <strong>bruset</strong>. Samma beräkning kan ta 0,8 ms en
      gång och 2,3 ms nästa, eftersom webbläsaren snabbar upp kod som körs ofta och då och då stannar för att städa bort minne som inte längre
      används. Ett enstaka mätvärde säger därför lite. Demon visar ett snitt över de senaste körningarna, högst tio.
    </Typography>

    <Typography>
      Sedan kommer det obekväma: <strong>memoisering är inte gratis, och den lönar sig mer sällan än man tror.</strong> Jämförelsen av beroendelistan
      görs vid varje ritning och kostar lite tid, koden blir längre och svårare att läsa, och vinsten uteblir helt om ett beroende ändras ändå.
      Skriver användaren i ett sökfält ändras söksträngen vid varje tangenttryck, och då betalar du jämförelsen och kör beräkningen ändå. Jämförelsen
      följer samma regel som i resten av React: tal och text jämförs på innehållet, men objekt på om det är samma objekt. Ett objekt som skrivs i
      komponentens funktion, som <code>{'{}'}</code>, är ett nytt objekt vid varje ritning. react.dev varnar för just det: ett enda värde som alltid
      är nytt räcker för att memoiseringen aldrig ska slå till.
    </Typography>

    <Typography>
      Ofta är det bättre att ta bort behovet än att optimera det. react.dev listar fem vanor som gör mycket memoisering onödig. Håll state så lokalt
      som möjligt, så att en ändring bara ritar om den del av trädet som behöver det. Låt en komponent som omsluter andra ta emot dem färdiga som{' '}
      <code>children</code>, så att de inte ritas om när omslutaren ändrar sitt eget state. Håll ritningen ren, alltså låt komponentens funktion bara
      räkna fram vad som ska synas, utan att ändra något utanför sig själv. De två sista handlar om effekter, kod som körs efter ritningen: undvik
      effekter som bara sätter state, och rensa onödiga beroenden ur dem. Ingen av vanorna är en optimering. De gör att det onödiga arbetet aldrig
      uppstår.
    </Typography>

    <Typography>
      <strong>En not om React Compiler.</strong> Det finns numera en kompilator, ett steg i bygget som går igenom koden innan den körs, som lägger in
      memoisering automatiskt. Den förutsätter att varje komponent är ren. Upptäcker den en komponent som bryter mot det hoppar den över den, men ett
      regelbrott den missar kan göra att komponenten kompileras ändå, och då kan uppdateringar utebli. Demon nedan bryter mot regeln med flit: den
      skriver sina mätvärden till en ref, ett värde som React sparar mellan ritningarna utan att rita om, mitt under ritningen. Därför är kompilatorn
      inte påslagen i den här appen, och därför är två av ESLints regler avstängda i demons källkod. Att kunna memoisera för hand behövs ändå:
      kompilatorn är inte påslagen i alla projekt, och den som ska förstå vad den gör behöver känna mekanismen.
    </Typography>

    <Typography>
      <strong>Regeln att ta med sig:</strong> optimera aldrig något du inte har mätt. En memoisering utan en siffra före och en efter är inte en
      förbättring utan en gissning som blivit kod, och till skillnad från en gissning måste koden underhållas. Mät först. Oftast visar det sig att
      problemet inte fanns.
    </Typography>
  </>
);

export const PerformancePage = () => (
  <ConceptTemplate
    title='Performance'
    theory={<Theory />}
    demo={<ExpensiveFilterDemo />}
    sources={[
      {
        fileName: 'src/modules/performance/components/expensiveFilterDemo.tsx',
        code: expensiveFilterSource,
        language: 'tsx',
        highlight: {
          fragments: ['const started = performance.now();', 'const items = useMemo', 'const alwaysNew'],
          why: 'Tidtagningen, listans egen useMemo som håller mätningen ärlig, och knepet som stänger av memoiseringen utan att ta bort hooken.',
        },
      },
    ]}
    quiz={performanceQuestions}
  />
);
