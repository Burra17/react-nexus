import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för modulen om cachen.
//
// Frågorna ligger på konsekvenserna av att cachen delas: hur många anrop flera
// konsumenter ger, vad invalidering faktiskt gör, och vad ett prefix träffar.
//
// Kodfragment markeras med backticks, som i Markdown. Se stateQuestions.ts.
export const queryCacheQuestions: QuizQuestion[] = [
  {
    id: 'fyra-konsumenter-ett-anrop',
    question: 'Fyra komponenter monteras samtidigt och anropar alla samma hook med samma `queryKey`. Hur många HTTP-anrop går iväg?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Ett',
        explanation:
          'Rätt. Nyckeln pekar ut en post i appens cache, och den första hämtningen räcker för alla som väntar på den. Det kallas dedupering, och det är därför en lista kan visas på fem ställen utan att kosta fem anrop.',
      },
      {
        id: 'b',
        text: 'Fyra — varje komponent har sin egen query',
        explanation:
          'Det vore fallet om varje komponent skötte sin hämtning själv, till exempel med `useState` och en effekt. Poängen med en delad cache är just att komponenten inte äger datan.',
      },
      {
        id: 'c',
        text: 'Fyra första gången, sedan ett',
        explanation:
          'Det finns ingen uppvärmningsfas. Redan den allra första monteringen ger ett anrop, eftersom de tre andra hittar en hämtning som redan pågår och hakar på den.',
      },
    ],
  },
  {
    id: 'vad-invalidering-gor',
    question: 'Du kallar på `invalidateQueries` för en nyckel som ligger i cachen. Vad händer med datan?',
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'Den raderas ur cachen',
        explanation:
          'Nej — det är `gcTime` som styr när en post kastas bort, och det sker först när ingen tittar på den. En invaliderad post ligger kvar och visas medan den hämtas om.',
      },
      {
        id: 'b',
        text: 'Ingenting förrän någon monterar en ny komponent',
        explanation:
          'Nästan, men inte riktigt: poster som just nu har en konsument hämtas om direkt. Det är de inaktiva posterna som får vänta tills någon frågar efter dem igen.',
      },
      {
        id: 'c',
        text: 'Den märks som inaktuell, och de poster som någon tittar på hämtas om',
        explanation:
          'Rätt. Invalidering säger "det här gäller inte längre" och låter Query avgöra vem som behöver agera. Datan ligger kvar under tiden, så skärmen blir aldrig tom.',
      },
    ],
  },
  {
    id: 'prefix-i-nyckeln',
    question:
      'Fabriken ger `usersKeys.all` som `["queryCache", "users"]` och `usersKeys.lists()` som `["queryCache", "users", "list"]`. Du invaliderar `usersKeys.all`. Vad träffas?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Bara den post vars nyckel är exakt `["queryCache", "users"]`',
        explanation:
          'Invalidering matchar på prefix, inte på exakt likhet. En nyckel som börjar likadant räknas som träff, vilket är hela skälet till att nycklarna byggs ovanpå varandra.',
      },
      {
        id: 'b',
        text: 'Allt vars nyckel börjar med `["queryCache", "users"]` — både listorna och detaljerna',
        explanation:
          'Rätt. Ju kortare prefix, desto bredare träff. Det är därför fabriken lägger `all` överst: en rad invaliderar allt som hör till resursen, utan att du behöver minnas vilka nycklar som finns.',
      },
      {
        id: 'c',
        text: 'Ingenting, eftersom ingen query använder just den nyckeln',
        explanation:
          '`usersKeys.all` används sällan som nyckel för en hämtning. Den finns för att vara ett prefix — ett handtag att invalidera med, inte en adress att hämta från.',
      },
    ],
  },
];
