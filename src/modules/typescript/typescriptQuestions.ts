import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för sidan om TypeScript.
//
// De tre frågorna träffar varsin poäng: att as inte kontrollerar någonting vid
// körning, varför enum är förbjudet men en union tillåten, och vad diskriminanten
// gör för narrowing.
//
// import type och generics testas inte. Den första är en regel man följer snarare
// än förstår, den andra är förklarad i teorin men aldrig demonstrerad. En fråga om
// något läsaren bara läst testar minne, inte förståelse.
//
// Kodfragment markeras med backticks, som i Markdown. Quiz-komponenten gör dem
// till code-element, så texten här förblir ren data utan JSX.
export const typescriptQuestions: QuizQuestion[] = [
  {
    id: 'as-kontrollerar-inget',
    question:
      "`response` har typen `unknown` och är ett svar med `status: 'done'` som saknar fältet `data`. Du skriver `const result = response as Result`, kontrollerar `status` och använder sedan `result.data.length`. Vad händer?",
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'Raden med `as` kastar ett fel vid körning, eftersom svaret inte matchar typen',
        explanation:
          '`as` är struket när koden kör. Det finns ingenting kvar som kan jämföra svaret med typen, så raden kastar inget fel och ger inget annat värde.',
      },
      {
        id: 'b',
        text: 'Bygget stoppas, eftersom kompilatorn ser att fältet saknas',
        explanation:
          '`as` är just sättet att säga åt kompilatorn att lita på dig. Från `unknown` godtar den vilket påstående som helst. Den vägrar bara påståenden som är uppenbart omöjliga, som att en text skulle vara ett tal.',
      },
      {
        id: 'c',
        text: 'Ingenting förrän `.length` läses på `.data`, och då kraschar det',
        explanation:
          'Påståendet kontrolleras aldrig, varken i bygget eller vid körning. Att läsa `.data` ger bara `undefined`. Felet kommer först när värdet används, långt från raden som påstod något som inte stämde.',
      },
    ],
  },
  {
    id: 'enum-mot-union',
    question: "Appen förbjuder `enum` men tillåter `type Status = 'idle' | 'klar'`. Vad är skillnaden som avgör?",
    correct: 'b',
    options: [
      {
        id: 'a',
        text: '`enum` är äldre syntax som ersatts av union-typer',
        explanation: '`enum` är varken borttagen eller på väg bort. Skälet här handlar inte om ålder utan om vad som blir kvar i den körda koden.',
      },
      {
        id: 'b',
        text: 'En `enum` blir kod som finns kvar när programmet kör, en union stryks helt',
        explanation:
          '`erasableSyntaxOnly` kräver att all TypeScript-syntax går att stryka och lämna giltig JavaScript kvar. En `enum` blir ett riktigt objekt vid körning och kan därför inte strykas.',
      },
      {
        id: 'c',
        text: 'Union-typer är snabbare, eftersom de inte behöver slås upp',
        explanation:
          'Det finns ingen hastighetsskillnad att tala om, och framför allt är det inte skälet. Regeln handlar om vad som går att stryka, inte om prestanda.',
      },
    ],
  },
  {
    id: 'diskriminanten',
    question:
      "Ett svar är antingen `{ status: 'error'; message: string }` eller `{ status: 'done'; data: string[] }`. Vad gör att kompilatorn vet vilka fält du får läsa efter en kontroll av `status`?",
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Att `status` finns i båda varianterna och har ett eget fast värde i var och en',
        explanation:
          'Det är definitionen av en diskriminerad union. Kontrollen utesluter alla varianter vars `status` inte kan ha det värdet, och kvar står bara en.',
      },
      {
        id: 'b',
        text: 'Att varianterna har olika fält, så kompilatorn ser vilken det är',
        explanation:
          'Olika fält räcker inte i sig. Det som låter kompilatorn utesluta varianter är ett gemensamt fält med ett eget fast värde i varje variant, alltså diskriminanten.',
      },
      {
        id: 'c',
        text: 'Att jämförelsen körs när koden kör, så värdet redan är känt då',
        explanation:
          'Jämförelsen körs mycket riktigt när koden kör, och det är den som väljer gren. Men att du får läsa `message` eller `data` i grenen avgör kompilatorn redan när du skriver, genom att läsa samma jämförelse.',
      },
    ],
  },
];
