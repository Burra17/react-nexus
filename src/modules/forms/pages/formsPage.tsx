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
      måste få veta om varje tangenttryck och rita om, eller DOM-elementet, som håller värdet själv och låter React vara ovetande tills någon frågar.
      Det finns ingen tredje väg, och nästan allt som är förvirrande med formulär i React går tillbaka på vilken av de två man valt, ofta utan att ha
      märkt att man valde.
    </Typography>

    <Typography>
      Valet sitter i en enda prop.{' '}
      <strong>
        Skickar du in <code>value</code> är fältet kontrollerat
      </strong>
      , och React tvingar det att alltid visa det du skickade. Skickar du bara <code>defaultValue</code> anger du ett startvärde och inget mer. JSX
      säger inte vad värdet ska vara just nu. Att värdet råkar ligga i ett <code>useState</code> spelar ingen roll om det aldrig når fältets{' '}
      <code>value</code>; då är det en kopia bredvid, inte en styrning. Och har du väl satt <code>value</code> är <code>onChange</code> obligatoriskt:
      utan den står fältet stilla vid det du skickade in, och det går bokstavligen inte att skriva i det. Reacts dokumentation är dessutom kategorisk
      om att en input varken kan vara båda samtidigt eller byta sida under sin livstid. Byter den får du en varning i konsolen och ett fält som beter
      sig oförutsägbart.
    </Typography>

    <Typography>
      Kontrollerat kostar en omrendering per tangenttryck, och det är sällan ett problem. Men det är inte gratis, och det är värt att veta vad man
      betalar för. Man betalar för att <em>kunna läsa värdet när som helst</em>: visa en teckenräknare, aktivera en knapp först när fältet är ifyllt,
      spegla vad någon skriver någon annanstans på sidan. Behöver du inget av det är kontrollerat arbete utan motprestation. Att hämta värdet ur en{' '}
      <code>ref</code> vid inskickning räcker då, men med tio fält blir det tio refar att hålla reda på, och ingen hjälp alls med validering.
    </Typography>

    <Typography>
      Det är luckan <strong>React Hook Form</strong> fyller. Biblioteket registrerar fälten åt dig, och <code>register()</code> returnerar exakt{' '}
      <code>onChange</code>, <code>onBlur</code>, <code>ref</code> och <code>name</code>, men <em>inget</em> <code>value</code>. Fälten är alltså
      okontrollerade i Reacts mening, och att komponenten slutar rita om vid varje tangenttryck är en följd av det och inte en optimering ovanpå. Det
      du faktiskt får är slippa refarna, en <code>formState</code> med femton fält som <code>errors</code>, <code>isDirty</code> och{' '}
      <code>isSubmitting</code>, och ett ställe för valideringen att bo. Undantaget är komponenter som inte kan vara okontrollerade: en{' '}
      <code>Select</code> har inget textfält att läsa ett värde ur. För dem finns <code>Controller</code>, som styr just det fältet och lämnar resten
      av formuläret i fred.
    </Typography>

    <Typography>
      Valideringen har en egen fråga som är mer UX än teknik: <strong>när ska felet dyka upp?</strong> Standarden är <code>onSubmit</code>, och den
      har en andra halva som sällan står utskriven: när ett fält väl har fallerat omvärderas det vid varje ändring, så meddelandet försvinner medan du
      rättar. <code>onBlur</code> väntar tills du lämnar fältet, <code>onChange</code> rättar dig medan du skriver. Skillnaden går inte att läsa sig
      till, bara att känna: ett namnfält i <code>onChange</code> säger att namnet är för kort efter första bokstaven. Reglerna i sig ligger som ett
      andra argument till <code>register</code> (<code>required</code>, <code>minLength</code>, <code>pattern</code>), och för större projekt finns
      schemabibliotek som beskriver datamodellen en gång och återanvänder den, vilket är ett annat problem än det här.
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
            Skriv i båda formulären och jämför räknarna längst ner i varje. Fälten är desamma; skillnaden är en enda prop.
          </Typography>
          <ControlledVsUncontrolledDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            2. Samma formulär med React Hook Form
          </Typography>
          <Typography color='textSecondary'>
            Samma fält som ovan, plus en roll. Ingen validering än. Den delen kommer härnäst, så att räknaren får visa en sak i taget.
          </Typography>
          <HookFormDemo />
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h3' component='h3'>
            3. Validering, och när felet dyker upp
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
        // value in, onChange ut, och all state i formulärkomponenten, vilket
        // är det som gör att båda fälten ritas om.
        highlight: ['const [name, setName] = useState', 'value={name} onChange='],
      },
      {
        fileName: 'src/modules/forms/components/uncontrolledForm.tsx',
        code: uncontrolledFormSource,
        language: 'tsx',
        // defaultValue i stället för value, och refen som bara används för att
        // läsa vid inskickning.
        highlight: ['const nameRef = useRef<HTMLInputElement>(null);', "defaultValue='' inputRef={nameRef}", 'nameRef.current?.value'],
      },
      {
        fileName: 'src/modules/forms/components/hookFormDemo.tsx',
        code: hookFormDemoSource,
        language: 'tsx',
        // Spridningen som kopplar in fältet, och Controller för det fält som
        // inte klarar sig utan.
        highlight: ["{...register('name')}", 'defaultValues: { name:', '<Controller'],
      },
      {
        fileName: 'src/modules/forms/components/validationDemo.tsx',
        code: validationDemoSource,
        language: 'tsx',
        // Reglerna som andra argument till register, och nyckeln som tvingar
        // fram ett nytt formulär när läget byts.
        highlight: ['mode,', "required: 'Namn måste fyllas i.',", '<ValidatedForm key={mode} mode={mode} />'],
      },
      {
        fileName: 'src/modules/forms/types/profile.ts',
        code: profileTypesSource,
        language: 'ts',
        // Rollerna som en as const-array i stället för en enum, och mönstret
        // för e-post.
        highlight: ['export const ROLES', 'export const EMAIL_PATTERN'],
      },
    ]}
    quiz={formsQuestions}
  />
);
