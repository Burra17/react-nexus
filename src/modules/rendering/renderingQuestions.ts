import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för modulen om rendering.
//
// De tre frågorna träffar varsin poäng: vad som utlöser en omrendering, varför
// memo tystnar på ett nyskapat objekt, och att en omrendering inte är samma sak
// som att skärmen ritas om.
//
// Kodfragment markeras med backticks, som i Markdown. Se stateQuestions.ts.
export const renderingQuestions: QuizQuestion[] = [
  {
    id: 'foralder-renderar-barn',
    question: 'En förälder renderas om. Barnet får exakt samma props som förra gången och ligger inte i `React.memo`. Vad händer med barnet?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Det hoppas över, eftersom inga props ändrats',
        explanation: 'Det är vad `React.memo` gör, men det är inte standardbeteendet. Utan `memo` följer barnet med föräldern.',
      },
      {
        id: 'b',
        text: 'Det renderas också om',
        explanation: 'Ett barn ritas om för att föräldern gjorde det. Att props ändrades står inte i listan över vad som utlöser en omrendering.',
      },
      {
        id: 'c',
        text: 'Bara om barnet läser en context',
        explanation: 'En context som komponenten läser utlöser också en omrendering, men den är inget villkor för att följa med föräldern.',
      },
    ],
  },
  {
    id: 'memo-och-referenser',
    question:
      'Ett barn ligger i `React.memo` och får propen `settings={{ id: 1 }}`, skapad inuti föräldern. Renderas barnet om när föräldern gör det?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Nej, innehållet är identiskt',
        explanation: '`memo` jämför referenser, inte innehåll. Två objekt som ser likadana ut är inte samma objekt.',
      },
      {
        id: 'b',
        text: 'Ja, referensen är ny vid varje render',
        explanation: 'Objektet skapas på nytt varje gång funktionen körs, så `memo` ser en ny prop och hoppar inte över någonting.',
      },
      {
        id: 'c',
        text: 'Nej, `memo` jämför innehållet djupt',
        explanation: 'Någon djup jämförelse finns inte. `{} === {}` är falskt, och det är precis den jämförelsen `memo` gör.',
      },
    ],
  },
  {
    id: 'omrendering-ror-inte-dom',
    question:
      'Du har skrivit i ett okontrollerat textfält och satt markören mitt i texten. Komponenten renderas om, utan att något runt fältet ändrats. Vad händer?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Både texten och markören står kvar',
        explanation: 'React jämför den nya beskrivningen med den förra och rör bara det som skiljer. Skiljer ingenting rörs inte elementet.',
      },
      {
        id: 'b',
        text: 'Texten nollställs',
        explanation: 'Det hade hänt om React bytt ut elementet. En omrendering är inte samma sak som att DOM:en byggs om.',
      },
      {
        id: 'c',
        text: 'Texten står kvar men markören hoppar till slutet',
        explanation: 'Markören tillhör DOM-elementet. Rörs inte elementet rörs inte markören heller.',
      },
    ],
  },
];
