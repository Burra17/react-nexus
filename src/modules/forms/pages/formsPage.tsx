import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ConceptTemplate } from '../../../templates/conceptTemplate';
import { ControlledVsUncontrolledDemo } from '../components/controlledVsUncontrolledDemo';
import controlledFormSource from '../components/controlledForm.tsx?raw';
import { HookFormDemo } from '../components/hookFormDemo';
import hookFormDemoSource from '../components/hookFormDemo.tsx?raw';
import uncontrolledFormSource from '../components/uncontrolledForm.tsx?raw';
import { ValidationDemo } from '../components/validationDemo';
import validationDemoSource from '../components/validationDemo.tsx?raw';
import profileTypesSource from '../types/profile.ts?raw';
import { formsQuestions } from '../formsQuestions';

const Theory = () => (
  <>
    <Typography>
      Ett formulär ställer en fråga som inget annat i React ställer lika skarpt: <strong>vem äger värdet du skriver?</strong> Antingen React, som då
      måste få veta om varje tangenttryck och <em>rita om</em> komponenten, alltså köra komponentfunktionen igen för att räkna fram vad som ska synas.
      Eller DOM-elementet, webbläsarens eget objekt för fältet på sidan, som håller värdet själv och låter React vara ovetande tills någon läser det
      därifrån. Det finns ingen tredje väg, och nästan allt som är förvirrande med formulär i React går tillbaka på vilken av de två man valt.
    </Typography>

    <Typography>
      Valet sitter i en enda prop.{' '}
      <strong>
        Skickar du in <code>value</code> är fältet kontrollerat
      </strong>
      , och React tvingar det att alltid visa det du skickade. Skickar du bara <code>defaultValue</code> anger du ett startvärde: efter första
      ritningen bestämmer DOM-elementet själv. Att värdet råkar ligga i ett <code>useState</code>, ett värde React minns och ritar om för när det
      ändras, spelar ingen roll om det aldrig når fältets <code>value</code>. Då är det en kopia bredvid, inte en styrning. Inte heller{' '}
      <code>onChange</code> gör ett fält kontrollerat: ett okontrollerat fält kan lyssna på vad du skriver utan att styra vad som står där. Men har du
      väl satt <code>value</code> är <code>onChange</code> obligatoriskt. Utan den står fältet stilla vid det du skickade in, och React varnar i
      webbläsarens konsol. Ett fält ska dessutom vara det ena eller det andra hela sin livstid. <code>value={'{undefined}'}</code> räknas som att
      inget värde skickas, så ett värde som börjar som <code>undefined</code> och sedan blir en sträng byter sida, och det varnar React också för.
    </Typography>

    <Typography>
      Kontrollerat kostar en ritning per tangenttryck, av komponenten som håller värdet och allt som ligger under den. Det är sällan ett problem, men
      det är inte gratis, och det är värt att veta vad man betalar för. Man betalar för att <em>kunna läsa värdet när som helst</em>: visa en
      teckenräknare, aktivera en knapp först när fältet är ifyllt, spegla vad någon skriver någon annanstans på sidan. Behöver du inget av det räcker
      okontrollerat, och värdet läses vid inskickning genom en <code>ref</code>: en hänvisning till DOM-elementet som React håller åt dig, och som
      inte ritar om något när den ändras. Men med tio fält blir det tio refar att hålla reda på, och ingen hjälp med validering.
    </Typography>

    <Typography>
      Det är luckan biblioteket <strong>React Hook Form</strong> fyller. Allt börjar med hooken <code>useForm</code>, som ger dig fyra saker:{' '}
      <code>register</code> som kopplar in ett fält, <code>handleSubmit</code> som tar hand om inskickningen, <code>control</code> för fält som
      behöver styras, och <code>formState</code> med formulärets tillstånd. <code>register</code> returnerar <code>onChange</code>,{' '}
      <code>onBlur</code>, <code>ref</code> och <code>name</code>, som du sprider ut på fältet, men inget <code>value</code>. Fälten är alltså
      okontrollerade, precis som med refar för hand. När du skriver sparar bibliotekets <code>onChange</code> värdet i ett eget lager utanför React,
      och därför ritas inget om. Det du vinner är att slippa refarna, att få valideringen på ett ställe, och att få <code>formState</code>, ett objekt
      med ett tiotal egenskaper som <code>errors</code> och <code>isDirty</code>. Biblioteket håller reda på vilka av dem komponenten läser, och ritar
      om den bara när någon av just de egenskaperna ändras. Undantaget är komponenter som inte lämnar ifrån sig ett vanligt input-element med värdet
      i. Sidan är byggd med komponentbiblioteket <strong>MUI</strong>, och dess <code>Autocomplete</code>, ett sökbart fält med en lista att välja ur,
      skickar det valda värdet som ett eget argument. Kopplas den in med <code>register</code> missar biblioteket valet utan att säga något. För
      sådana fält finns <code>Controller</code>, som gör just det fältet kontrollerat och lämnar resten av formuläret okontrollerat.
    </Typography>

    <Typography>
      Valideringen har en egen fråga, som handlar mer om användarupplevelse än om teknik: <strong>när ska felet dyka upp?</strong> Det väljs med
      inställningen <code>mode</code> till <code>useForm</code>. Namnen är desamma som fältens händelser, men här är de lägen och inte funktioner.
      Standarden är <code>onSubmit</code>: inget fel visas förrän du skickar. Efter den första inskickningen byter biblioteket till att validera vid
      varje ändring, och det gäller varje fält du ändrar, också de som var giltiga när du skickade. Därför ändras meddelandet medan du rättar.{' '}
      <code>onBlur</code> väntar tills du lämnar fältet, och <code>onChange</code> validerar vid varje ändring redan från början. Med regeln minst två
      tecken säger ett namnfält i läget <code>onChange</code> att namnet är för kort efter första bokstaven. Reglerna skickas som ett andra argument
      till <code>register</code>, där varje regel får sitt eget felmeddelande: <code>required</code>, <code>minLength</code> och <code>pattern</code>.
      Större projekt använder ofta ett schemabibliotek som zod, där samma beskrivning av datan används både i formuläret och på andra ställen. Det
      behovet har inte den här sidan.
    </Typography>
  </>
);

export const FormsPage = () => (
  <ConceptTemplate
    title='Forms'
    theory={<Theory />}
    demo={
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            1. Vem äger värdet
          </Typography>
          <Typography color='textSecondary'>
            Skriv samma namn i båda formulären, en bokstav i taget, och titta på räknaren längst ner i varje. I det kontrollerade ökar den för varje
            tangenttryck. I det okontrollerade står den still. Raden ”React vet just nu” visar vad komponenten vet om fälten utan att läsa i DOM:en.
            Tryck sedan Skicka i det okontrollerade: först då läses värdet ur fältet, och räknaren ökar en gång. Skillnaden mellan formulären är var
            värdet bor, med <code>value</code> och <code>onChange</code> i det ena och <code>defaultValue</code> och en ref i det andra.
          </Typography>
          <ControlledVsUncontrolledDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            2. Samma formulär med React Hook Form
          </Typography>
          <Typography color='textSecondary'>
            Samma fält som ovan, nu med React Hook Form, plus en roll. Ingen validering än: den kommer i del 3, så att räknaren får visa en sak i
            taget. Räknaren har redan en ritning mer än formulären ovan när sidan laddats, eftersom biblioteket ritar om formuläret en gång direkt
            efter starten, när det markerar formuläret som klart. Skriv ett namn och titta på räknaren. Välj sedan en roll och tryck Skicka: rollen du
            valde syns i raden ”Skickade”. Hade rollfältet kopplats in med <code>register</code> hade fältet visat ditt val men skickat startvärdet.
          </Typography>
          <HookFormDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            3. Validering, och när felet dyker upp
          </Typography>
          <Typography color='textSecondary'>
            Välj ett läge och prova formuläret. Namnet kräver minst två tecken, och e-posten ett @ och en punkt. Ett lägesbyte tömmer formuläret, så
            att varje läge provas från början. Börja i läget onSubmit: skicka formuläret tomt, och skriv sedan ett namn en bokstav i taget.
          </Typography>
          <ValidationDemo />
        </Stack>
      </Stack>
    }
    // Ordningen följer sidan: de två formulären ur del 1, sedan bibliotekets
    // variant, sedan valideringen. Typerna sist, eftersom de delas av alla.
    sources={[
      {
        fileName: 'src/modules/forms/components/controlledForm.tsx',
        code: controlledFormSource,
        language: 'tsx',
        highlight: {
          fragments: ['const [name, setName] = useState', 'value={name} onChange='],
          why: 'value in, onChange ut, och all state i formulärkomponenten, vilket är det som gör att båda fälten ritas om.',
        },
      },
      {
        fileName: 'src/modules/forms/components/uncontrolledForm.tsx',
        code: uncontrolledFormSource,
        language: 'tsx',
        highlight: {
          fragments: ['const nameRef = useRef<HTMLInputElement>(null);', "defaultValue='' inputRef={nameRef}", 'nameRef.current?.value'],
          why: 'defaultValue i stället för value, och refen som bara används för att läsa vid inskickning.',
        },
      },
      {
        fileName: 'src/modules/forms/components/hookFormDemo.tsx',
        code: hookFormDemoSource,
        language: 'tsx',
        highlight: {
          fragments: ["{...register('name')}", 'defaultValues: { name:', '<Controller'],
          why: 'Spridningen som kopplar in fältet, och Controller för det fält som inte klarar sig utan.',
        },
      },
      {
        fileName: 'src/modules/forms/components/validationDemo.tsx',
        code: validationDemoSource,
        language: 'tsx',
        highlight: {
          fragments: ['mode,', "required: 'Namn måste fyllas i.',", '<ValidatedForm key={mode} mode={mode} />'],
          why: 'Reglerna som andra argument till register, och nyckeln som tvingar fram ett nytt formulär när läget byts.',
        },
      },
      {
        fileName: 'src/modules/forms/types/profile.ts',
        code: profileTypesSource,
        language: 'ts',
        highlight: {
          fragments: ['export const ROLES', 'export const EMAIL_PATTERN'],
          why: 'Rollerna som en as const-array i stället för en enum, och mönstret för e-post.',
        },
      },
    ]}
    quiz={formsQuestions}
  />
);
