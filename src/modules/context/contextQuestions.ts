import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för modulen om Context.
//
// Alla tre frågorna ligger på mekaniken: varför en oberörd konsument ändå ritas om,
// att memo inte skyddar mot en context, och var gränsen för useMemo går.
//
// Turordningen props -> children -> context testas inte. Den är ett omdöme, och ett
// omdöme som pressas in i ett flervalsformat blir ett påstående att memorera i
// stället för något att förstå. Versionsnoten om .Provider testas inte heller - den
// är ett faktum, inte en förståelse.
//
// Kodfragment markeras med backticks, som i Markdown. Se stateQuestions.ts.
export const contextQuestions: QuizQuestion[] = [
  {
    id: 'ny-referens-pa-value',
    question:
      'En komponent läser bara `login` ur contexten och bryr sig inte om vem som är inloggad. Providern renderar om, men användaren är oförändrad. Vad händer med komponenten?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Den står still, eftersom det den läser inte har ändrats',
        explanation:
          'Nej. React jämför inte fälten du plockar ut, utan hela `value`. Skapas objektet på nytt vid varje render är det en ny referens, oavsett vad som ligger i det.',
      },
      {
        id: 'b',
        text: 'Den ritas om, eftersom `value` är ett nytt objekt',
        explanation:
          'Rätt. React jämför föregående och nästa `value` med `Object.is` och renderar om alla som läser contexten när de skiljer sig. Ett objektliteral är alltid en ny referens.',
      },
      {
        id: 'c',
        text: 'Den ritas om bara om `login` pekar på en ny funktion',
        explanation:
          'Nej, och det är en vanlig gissning. Prenumerationen gäller contexten som helhet — det finns inget sätt att prenumerera på ett enskilt fält i den.',
      },
    ],
  },
  {
    id: 'memo-skyddar-inte',
    question: 'Du packar in en konsument i `React.memo`. Contextvärdet ändras, men komponentens props är exakt desamma. Vad händer?',
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'Den hoppas över, eftersom `memo` ser att inga props ändrats',
        explanation:
          'Nej. `memo` jämför props, och den jämförelsen går bra här — men omrenderingen kommer inte via props. Den kommer från contexten komponenten själv läser.',
      },
      {
        id: 'b',
        text: 'Den hoppas över om även föräldern är memoiserad',
        explanation: 'Nej. Hur många `memo` som än ligger emellan spelar ingen roll: en context når konsumenten direkt, inte genom trädet ovanför.',
      },
      {
        id: 'c',
        text: 'Den ritas om ändå',
        explanation:
          'Rätt. React renderar om alla komponenter som använder contexten när värdet ändras, och `memo` står utanför den mekanismen. Det är den vanligaste felräkningen för den som just lärt sig `memo`.',
      },
    ],
  },
  {
    id: 'granser-for-usememo',
    question: 'Du lägger `value` i `useMemo` och funktionen i `useCallback`. Vad löser det, och vad löser det inte?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Det hindrar omrendering när providern renderar om av något annat skäl, men inte när värdet faktiskt ändras',
        explanation:
          'Rätt. Så länge beroendena är oförändrade får konsumenterna samma referens och står still. Byts användaren är värdet nytt på riktigt, och då ritas alla om — även de som bara ville åt funktionen.',
      },
      {
        id: 'b',
        text: 'Det hindrar alla onödiga omrenderingar hos konsumenterna',
        explanation:
          'Nej, och skillnaden är hela poängen. En konsument som bara läser funktionen ritas fortfarande om när det andra fältet ändras. Botemedlet mot det är att dela contexten i två.',
      },
      {
        id: 'c',
        text: 'Ingenting, eftersom en context alltid renderar om alla som läser den',
        explanation:
          'Nej. Alla ritas om när värdet ändras — men `useMemo` gör just att värdet inte räknas som ändrat när ingenting i det har ändrats.',
      },
    ],
  },
];
