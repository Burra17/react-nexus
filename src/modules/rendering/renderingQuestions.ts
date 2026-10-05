import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för sidan om rendering.
//
// De tre frågorna träffar varsin poäng: vad som ritar om ett barn, varför memo
// inte hjälper mot ett objekt som skapas på nytt, och att en ritning inte
// bygger om det som redan finns i DOM:en.
//
// Kodfragment markeras med backticks, som i Markdown. Quiz-komponenten gör dem
// till code-element, så texten här förblir ren data utan JSX.
export const renderingQuestions: QuizQuestion[] = [
  {
    id: 'foralder-renderar-barn',
    question: 'En förälder ritas om. Barnet får exakt samma props som förra gången och ligger inte i `memo`. Vad händer med barnet?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Det hoppas över, eftersom inga props ändrats',
        explanation: 'Det är vad `memo` gör, men det är inte standardbeteendet. Utan `memo` ritas barnet om när föräldern gör det.',
      },
      {
        id: 'b',
        text: 'Det ritas också om',
        explanation:
          'Ett barn ritas om för att föräldern gjorde det, oavsett om props ändrats. Props kan bara ändras när föräldern ritas om, så ändrade props är aldrig orsaken i sig.',
      },
      {
        id: 'c',
        text: 'Bara om barnet läser en context',
        explanation:
          'När en context får ett nytt värde ritas de komponenter om som läser den. Det är ett eget skäl till en ritning och inget villkor för att följa med föräldern.',
      },
    ],
  },
  {
    id: 'memo-och-referenser',
    question: 'Ett barn ligger i `memo` och får propen `settings={{ id: 1 }}`, skapad inuti föräldern. Ritas barnet om när föräldern gör det?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Nej, innehållet är identiskt',
        explanation: '`memo` jämför objekt på referens, inte på innehåll. Två objekt som ser likadana ut är inte samma objekt.',
      },
      {
        id: 'b',
        text: 'Ja, referensen är ny vid varje ritning',
        explanation:
          'Objektet skapas på nytt varje gång föräldern ritas. `memo` jämför varje prop med `===`, ser en ny referens och ritar om barnet.',
      },
      {
        id: 'c',
        text: 'Nej, `memo` jämför innehållet djupt',
        explanation:
          '`memo` gör själv ingen djup jämförelse. Den jämför varje prop för sig med `===`, och `{ id: 1 } === { id: 1 }` är falskt, eftersom det är två olika objekt.',
      },
    ],
  },
  {
    id: 'omrendering-ror-inte-dom',
    question:
      'Du har skrivit i ett okontrollerat textfält, alltså ett fält utan `value`, där webbläsaren håller texten. Komponenten som innehåller fältet ritas om, och fältet ser likadant ut i den nya beskrivningen. Vad händer med texten?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Den står kvar',
        explanation:
          'React jämför den nya beskrivningen med den förra och ändrar bara det som skiljer i DOM:en. Fältet är likadant, så React behåller samma element och texten står kvar.',
      },
      {
        id: 'b',
        text: 'Den försvinner, eftersom React inte vet vad som står i fältet',
        explanation:
          'Det hade hänt om React byggt ett nytt element. React behöver inte veta vad som står i fältet, eftersom det behåller elementet som det är.',
      },
      {
        id: 'c',
        text: 'Den står kvar, men bara om komponenten ligger i `memo`',
        explanation:
          '`memo` avgör om en komponent ritas om, inte vad som händer i DOM:en efteråt. Texten står kvar även när komponenten ritas om, eftersom React bara ändrar det som skiljer.',
      },
    ],
  },
];
