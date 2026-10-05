import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för sidan om state.
//
// Egen fil och inte en del av sidfilen: det här är ren data utan JSX, alltså
// .ts och inte .tsx. Data och komponenter i samma fil är inte samma sorts sak.
//
// Kodfragment markeras med backticks, som i Markdown. Quiz-komponenten gör dem
// till code-element, så texten här förblir ren data utan JSX.
//
// En fråga per poäng ur teorin. Tre frågor om ögonblicksbilden hade varit en
// fråga ställd tre gånger.
export const stateQuestions: QuizQuestion[] = [
  {
    id: 'ogonblicksbilden',
    question: '`count` är 0. Du anropar `setCount(count + 1)` tre gånger i rad i samma klickhanterare. Vad är `count` när komponenten ritats om?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: '3, alla tre anropen räknas',
        explanation:
          'Den intuitiva gissningen, men den förutsätter att `count` ändras mellan anropen. Klickhanteraren hör till ritningen där `count` var 0, och där är värdet låst.',
      },
      {
        id: 'b',
        text: '1, alla tre anropen säger samma sak',
        explanation: '`count` är 0 i den här ögonblicksbilden, så alla tre beställer "sätt värdet till 0 + 1".',
      },
      {
        id: 'c',
        text: '3, men bara för att anropen ligger i en klickhanterare',
        explanation:
          'Blandar ihop batchning med ögonblicksbilden. Batchning betyder att React väntar tills klickhanteraren är klar och ritar om en gång för alla beställningar. Den avgör hur många ritningar det blir, inte vilket värde beställningarna räknar från.',
      },
    ],
  },
  {
    id: 'las-tillbaka-direkt',
    question: 'I en klickhanterare skriver du `setCount(count + 1)` och läser sedan `count` på nästa rad. Vad står där?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Det nya värdet',
        explanation: '`setCount` ändrar inte variabeln på stället. Den lägger en beställning om vad värdet ska vara nästa gång komponenten ritas.',
      },
      {
        id: 'b',
        text: 'Samma värde som innan',
        explanation:
          '`count` är en ögonblicksbild från ritningen som klickhanteraren hör till. Beställningen får effekt först i nästa ritning, och den har inte skett än när nästa rad körs.',
      },
      {
        id: 'c',
        text: '`undefined`, tills komponenten ritats om',
        explanation: '`count` är aldrig `undefined` mellan ritningarna. Den håller sitt värde tills nästa ritning ger en ny ögonblicksbild.',
      },
    ],
  },
  {
    id: 'nar-updater-spelar-roll',
    question: 'När gör `setCount((c) => c + 1)` faktisk skillnad jämfört med `setCount(count + 1)`?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Alltid, annars blir varje enskilt klick fel',
        explanation:
          'För ett klick med en enda beställning blir resultatet detsamma, eftersom React ritar om mellan två klick och nästa klick får en ny ögonblicksbild. Många skriver ändå alltid funktionen när värdet beror på det gamla, för att slippa hålla reda på när det spelar roll.',
      },
      {
        id: 'b',
        text: 'När flera beställningar görs innan nästa ritning',
        explanation:
          'React anropar funktionen med det senaste värdet i kön, alltså resultatet av beställningarna före den, i stället för att utgå från den låsta ögonblicksbilden.',
      },
      {
        id: 'c',
        text: 'Bara i kod som körs efter ett `await`',
        explanation:
          'Sedan React 18 batchas beställningar också efter ett `await`. Problemet sitter i att läsa ett låst värde ur ögonblicksbilden, inte i var koden körs.',
      },
    ],
  },
];
