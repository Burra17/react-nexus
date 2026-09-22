import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för modulen om state.
//
// Egen fil och inte en del av pages-filen: det här är ren data utan JSX, alltså
// .ts och inte .tsx. Samma gräns som CLAUDE.md drar för lazyPages.ts, fast åt
// andra hållet - data och komponenter i samma fil är inte samma sorts sak.
//
// Kodfragment markeras med backticks, som i Markdown. Quiz-komponenten gör dem
// till code-element, så texten här förblir ren data utan JSX.
//
// En fråga per poäng ur teorin. Tre frågor om ögonblicksbilden hade varit en
// fråga ställd tre gånger.
export const stateQuestions: QuizQuestion[] = [
  {
    id: 'ogonblicksbilden',
    question: '`count` är 0. Du anropar `setCount(count + 1)` tre gånger i rad i samma klickhanterare. Vad är `count` efter omrenderingen?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: '3, alla tre anropen räknas',
        explanation: 'Den intuitiva gissningen, men den förutsätter att `count` ändras mellan anropen. Värdet är låst för hela rendret.',
      },
      {
        id: 'b',
        text: '1, alla tre anropen säger samma sak',
        explanation: '`count` är 0 i den här ögonblicksbilden, så alla tre säger "sätt nästa värde till 0 + 1".',
      },
      {
        id: 'c',
        text: '3, men bara för att anropen ligger i en klickhanterare',
        explanation:
          'Blandar ihop batchning med ögonblicksbilden. Var anropen ligger avgör hur många omrenderingar som sker, inte vilket värde de räknar från.',
      },
    ],
  },
  {
    id: 'las-tillbaka-direkt',
    question: 'Du skriver `setCount(count + 1)` och läser sedan `count` på nästa rad i samma funktion. Vad står där?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Det nya värdet',
        explanation: '`setCount` ändrar inte variabeln på stället. Den lägger en beställning om vad värdet ska vara nästa gång vyn ritas.',
      },
      {
        id: 'b',
        text: 'Samma värde som innan',
        explanation: '`count` är en ögonblicksbild, låst för det här rendret. Raden ovanför påverkar nästa render, inte den pågående.',
      },
      {
        id: 'c',
        text: '`undefined`, tills omrenderingen är klar',
        explanation: '`count` är aldrig `undefined` mellan renders. Den håller sitt värde tills en ny ögonblicksbild tas.',
      },
    ],
  },
  {
    id: 'nar-updater-spelar-roll',
    question: 'När gör `setCount(c => c + 1)` faktisk skillnad jämfört med `setCount(count + 1)`?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Alltid, annars blir varje enskilt klick fel',
        explanation:
          'För ett enstaka klick blir resultatet detsamma, eftersom värdet hunnit uppdateras innan nästa klick. Många skriver ändå alltid funktionsformen för att slippa hålla reda på när det spelar roll.',
      },
      {
        id: 'b',
        text: 'När flera uppdateringar görs i samma händelse',
        explanation: 'Funktionen utgår från det senaste värdet i kön i stället för från den frysta ögonblicksbilden.',
      },
      {
        id: 'c',
        text: 'Bara i kod som körs efter ett `await`',
        explanation:
          'Sedan React 18 samlas uppdateringar ihop oavsett var de görs. Problemet sitter i att läsa ett låst värde, inte i var koden körs.',
      },
    ],
  },
];
