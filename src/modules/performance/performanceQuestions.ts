import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för sidan om prestanda.
//
// De tre frågorna ligger på metoden, inte på syntaxen: varför en mätning i
// utvecklingsläge är missvisande, att useMemo inte sparar något när beroendet ändras
// ändå, och vad man gör innan man memoiserar.
//
// React Compiler testas inte. Den är ett faktum om ekosystemet, inte en mekanism att
// resonera kring, och en fråga om den hade testat om man läst noga snarare än om man
// förstått.
//
// Kodfragment markeras med backticks, som i Markdown. Quiz-komponenten gör dem
// till code-element, så texten här förblir ren data utan JSX.
export const performanceQuestions: QuizQuestion[] = [
  {
    id: 'mata-i-utvecklingslage',
    question: 'Du mäter en beräkning med appen i utvecklingsläge och får 6 ms. Vad är problemet med den siffran?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Ingenting, eftersom det är samma kod som användarna kör',
        explanation:
          'Det är samma kod du skrivit, men inte samma kod som körs. I utvecklingsläget körs kontroller som letar efter fel, bland annat StrictMode, och bygget optimerar koden på ett sätt som utvecklingsläget inte gör.',
      },
      {
        id: 'b',
        text: 'Den är för hög: utvecklingsläget gör mer än ett bygge, bland annat kör StrictMode varje komponent två gånger',
        explanation:
          'Enligt react.dev ger mätningar i utvecklingsläge inte tillförlitliga resultat, och StrictMode nämns särskilt. Mät i ett bygge, och helst på en dator som liknar användarens.',
      },
      {
        id: 'c',
        text: 'Den är för låg, eftersom utvecklingsläget hoppar över arbete',
        explanation: 'Tvärtom: utvecklingsläget gör mer arbete, inte mindre, så talet är för högt och inte för lågt. Det går ändå inte att lita på.',
      },
    ],
  },
  {
    id: 'beroendet-andras-anda',
    question:
      'En dyr beräkning ligger i `useMemo` med en söksträng som beroende. Användaren skriver i sökfältet, och strängen ändras vid varje tangenttryck. Vad ger memoiseringen?',
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'Full effekt: beräkningen körs bara en gång, när användaren skrivit klart',
        explanation:
          'Varje tangenttryck ger en ny söksträng, alltså ett nytt beroende. `useMemo` jämför, ser att det ändrats, och kör beräkningen igen.',
      },
      {
        id: 'b',
        text: 'Halv effekt, eftersom React hinner slå ihop några av tangenttrycken',
        explanation:
          'React slår ihop flera state-ändringar i samma händelse till en ritning, men två tangenttryck är två händelser. Varje tryck ger en egen ritning med en ny söksträng.',
      },
      {
        id: 'c',
        text: 'Nästan ingenting: söksträngen ändras vid varje tryck, så beräkningen körs ändå',
        explanation:
          'Memoisering hjälper bara när beroendena står still. Ändras de vid varje tangenttryck betalar du jämförelsen och kör ändå beräkningen. Vinsten kommer först när komponenten ritas om av något annat skäl än söksträngen.',
      },
    ],
  },
  {
    id: 'mat-innan-du-optimerar',
    question: 'En komponent känns långsam. Vad gör du först?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Mäter hur lång tid beräkningarna i den faktiskt tar',
        explanation:
          '`console.time` och `console.timeEnd` runt en beräkning tar tjugo sekunder att skriva och svarar på frågan. Tumregeln från react.dev är att det kan vara värt att memoisera först när beräkningen tar säg en millisekund eller mer.',
      },
      {
        id: 'b',
        text: 'Lägger till `useMemo` och ser om det känns bättre',
        explanation:
          'Det är den vanligaste vägen, och den ger inget svar. Utan en siffra före vet du inte om det blev bättre, om det var likadant, eller om problemet låg någon annanstans.',
      },
      {
        id: 'c',
        text: 'Packar in komponenterna den ritar ut i `React.memo` för säkerhets skull',
        explanation:
          'Memoisering utan ett uppmätt problem är kod som ska underhållas utan att göra nytta. Utan en mätning vet du inte ens om det är de komponenterna som tar tid.',
      },
    ],
  },
];
