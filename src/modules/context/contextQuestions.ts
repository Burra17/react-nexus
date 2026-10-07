import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för sidan om Context.
//
// De tre frågorna träffar varsin poäng: varför en konsument ritas om fast det den
// läser inte ändrats, att memo inte stoppar en ritning som kommer från contexten,
// och var gränsen för useMemo går.
//
// Ordningen props, children, context testas inte. Den är ett omdöme, och ett
// omdöme som pressas in i ett flervalsformat blir ett påstående att memorera i
// stället för något att förstå. Versionsnoten om .Provider testas inte heller. Den
// är ett faktum, inte en förståelse.
//
// Kodfragment markeras med backticks, som i Markdown. Quiz-komponenten gör dem
// till code-element, så texten här förblir ren data utan JSX.
export const contextQuestions: QuizQuestion[] = [
  {
    id: 'ny-referens-pa-value',
    question:
      'En komponent läser bara `login` ur contexten och bryr sig inte om vem som är inloggad. Komponenten som håller providern skriver `value` som ett objekt direkt i sin funktion, utan `useMemo`. Den ritas om, men användaren är densamma. Vad händer med komponenten som läser `login`?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Den står still, eftersom det den läser inte har ändrats',
        explanation:
          'React jämför inte fälten du plockar ut, utan hela `value`. Ett objekt som skapas på nytt vid varje ritning är en ny referens, oavsett vad som ligger i det.',
      },
      {
        id: 'b',
        text: 'Den ritas om, eftersom `value` är ett nytt objekt',
        explanation:
          'React jämför förra och nästa `value` med `Object.is` och ritar om alla som läser contexten när de skiljer sig. Ett objekt som skrivs direkt i funktionen skapas på nytt vid varje ritning och är därför en ny referens.',
      },
      {
        id: 'c',
        text: 'Den ritas om bara om `login` pekar på en ny funktion',
        explanation:
          'En vanlig gissning, men en konsument får alltid hela `value` och aldrig ett enskilt fält. Det går inte att läsa bara en del av en context. Vill man hålla isär användaren och funktionen får de ligga i två olika contexts.',
      },
    ],
  },
  {
    id: 'memo-skyddar-inte',
    question:
      'Du packar in en konsument i `React.memo`. Contextens `value` blir ett nytt objekt, men komponentens props är exakt desamma. Vad händer?',
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'Den hoppas över, eftersom `memo` ser att inga props ändrats',
        explanation:
          '`memo` jämför props, och den jämförelsen går bra här: inga props har ändrats. Men ritningen kommer inte genom props, utan från contexten som komponenten själv läser.',
      },
      {
        id: 'b',
        text: 'Den hoppas över om även föräldern är memoiserad',
        explanation: 'Hur många `memo` som än ligger emellan spelar ingen roll. En context når konsumenten direkt, inte genom trädet ovanför.',
      },
      {
        id: 'c',
        text: 'Den ritas om ändå',
        explanation:
          'React ritar om varje komponent som läser contexten när värdet är nytt, och `memo` står utanför den vägen. Det är lätt att missa för den som vet att `memo` stoppar ritningar som kommer från föräldern.',
      },
    ],
  },
  {
    id: 'granser-for-usememo',
    question: 'Du skapar objektet i `value` med `useMemo` och funktionen i det med `useCallback`. Vad löser det, och vad löser det inte?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Det hindrar ritningar när komponenten som håller providern ritas om av andra skäl, men inte när innehållet i värdet faktiskt ändras',
        explanation:
          'Så länge inget i beroendelistan har ändrats får konsumenterna samma objekt och står still. Byts användaren är objektet nytt på riktigt, och då ritas alla om, även de som bara läser funktionen.',
      },
      {
        id: 'b',
        text: 'Det hindrar alla onödiga ritningar hos konsumenterna',
        explanation:
          'Skillnaden är hela poängen. En konsument som bara läser funktionen ritas fortfarande om när användaren byts. Det som hjälper mot det är att dela upp contexten i två.',
      },
      {
        id: 'c',
        text: 'Ingenting, eftersom en context alltid ritar om alla som läser den',
        explanation:
          'Alla ritas om när värdet är nytt, men `useMemo` gör att värdet inte blir ett nytt objekt så länge ingenting i beroendelistan har ändrats.',
      },
    ],
  },
];
