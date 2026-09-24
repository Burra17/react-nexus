import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för modulen om prestanda.
//
// De tre frågorna ligger på metoden, inte på syntaxen: varför en mätning i
// utvecklingsläge är missvisande, att useMemo inte sparar något när beroendet ändras
// ändå, och vad man gör innan man memoiserar.
//
// React Compiler testas inte. Den är ett faktum om ekosystemet, inte en mekanism att
// resonera kring, och en fråga om den hade testat om man läst noga snarare än om man
// förstått.
//
// Kodfragment markeras med backticks, som i Markdown. Se stateQuestions.ts.
export const performanceQuestions: QuizQuestion[] = [
  {
    id: 'mata-i-utvecklingslage',
    question: 'Du mäter en beräkning med utvecklingsservern igång och får 6 ms. Vad är problemet med den siffran?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Ingenting — det är samma kod som användarna kör',
        explanation:
          'Det är samma kod du skrivit, men inte samma kod som körs. Utvecklingsläget kör extra kontroller, och bygget optimerar på ett sätt som dev-servern inte gör.',
      },
      {
        id: 'b',
        text: 'Utvecklingsläget kör mer än produktionsbygget — bland annat renderar StrictMode varje komponent två gånger',
        explanation:
          'Rätt. react.dev säger uttryckligen att mätningar i utvecklingsläge inte ger tillförlitliga resultat, och pekar särskilt på StrictMode. Mät i ett bygge, och helst på en maskin som liknar användarens.',
      },
      {
        id: 'c',
        text: 'Siffran är för låg, eftersom utvecklingsläget hoppar över arbete',
        explanation:
          'Tvärtom — utvecklingsläget gör mer arbete, inte mindre. Felet går åt andra hållet, men det är fortfarande fel att lita på talet.',
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
        text: 'Full effekt — beräkningen körs bara en gång per sökning',
        explanation:
          'Nej. Varje tangenttryck ger en ny söksträng, alltså ett nytt beroende. `useMemo` jämför, ser att det ändrats, och kör beräkningen om.',
      },
      {
        id: 'b',
        text: 'Halv effekt, eftersom React hinner slå ihop några av tangenttrycken',
        explanation:
          'Batchning slår ihop state-uppdateringar i samma händelse, men två tangenttryck är två händelser. Varje tryck ger sin egen render med sitt eget beroende.',
      },
      {
        id: 'c',
        text: 'Ingenting — beroendet ändras vid varje render ändå',
        explanation:
          'Rätt. Memoisering hjälper bara när beroendena står still. Ändras de vid varje interaktion betalar du jämförelsen och kör ändå beräkningen. Vinsten kommer först när något annat än söksträngen orsakar renderingen.',
      },
    ],
  },
  {
    id: 'mat-innan-du-optimerar',
    question: 'En komponent känns möjligen långsam. Vad gör du först?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Mäter hur lång tid beräkningen faktiskt tar',
        explanation:
          'Rätt. `console.time` runt beräkningen tar tjugo sekunder att skriva och svarar på frågan. react.dev nämner ungefär en millisekund som riktmärke för när det kan vara värt att memoisera.',
      },
      {
        id: 'b',
        text: 'Lägger till `useMemo` och ser om det känns bättre',
        explanation:
          'Det är den vanligaste vägen, och den ger inget svar. Utan en siffra före vet du inte om det blev bättre, om det var likadant, eller om problemet låg någon annanstans.',
      },
      {
        id: 'c',
        text: 'Packar in barnen i `React.memo` för säkerhets skull',
        explanation:
          'Memoisering utan ett uppmätt problem är kod som ska underhållas utan att göra nytta. react.dev är tydlig: om det inte finns någon märkbar fördröjning behövs den inte.',
      },
    ],
  },
];
