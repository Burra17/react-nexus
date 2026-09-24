import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för modulen om TypeScript.
//
// De tre frågorna träffar varsin poäng: att as inte kontrollerar någonting vid
// körning, varför enum är förbjudet men en union tillåten, och vad diskriminanten
// gör för narrowing.
//
// import type och generics testas inte. Den första är en regel man följer snarare
// än förstår, den andra är visad i teorin men aldrig demonstrerad - och en fråga om
// något läsaren bara läst testar minne, inte förståelse.
//
// Kodfragment markeras med backticks, som i Markdown. Se stateQuestions.ts.
export const typescriptQuestions: QuizQuestion[] = [
  {
    id: 'as-kontrollerar-inget',
    question: 'Du skriver `const result = response as Result` på ett svar som saknar fältet `data`. Vad händer?',
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'TypeScript kastar ett fel vid körning, eftersom svaret inte matchar typen',
        explanation:
          'Nej. `as` är borta när koden kör — det finns ingenting kvar som kan jämföra svaret med typen. Handboken är uttrycklig: det blir varken ett undantag eller `null` om påståendet är fel.',
      },
      {
        id: 'b',
        text: 'Bygget stoppas, eftersom kompilatorn ser att fältet saknas',
        explanation:
          'Nej. `as` är just sättet att säga åt kompilatorn att sluta kontrollera. Den tar ditt påstående på ordet så länge typerna inte är helt orelaterade.',
      },
      {
        id: 'c',
        text: 'Ingenting — förrän någon läser `.data`, och då kraschar det',
        explanation:
          'Rätt. Påståendet kontrolleras aldrig, varken vid bygget eller vid körning. Felet dyker upp först där värdet används, långt från raden som ljög.',
      },
    ],
  },
  {
    id: 'enum-mot-union',
    question: "Repot förbjuder `enum` men tillåter `type Status = 'idle' | 'klar'`. Vad är skillnaden som avgör?",
    correct: 'b',
    options: [
      {
        id: 'a',
        text: '`enum` är äldre syntax som ersatts av union-typer',
        explanation: '`enum` är varken borttagen eller på väg bort. Skälet här handlar inte om ålder utan om vad som blir kvar i den körda koden.',
      },
      {
        id: 'b',
        text: 'En `enum` lämnar kod efter sig vid kompileringen, en union försvinner helt',
        explanation:
          'Rätt. `erasableSyntaxOnly` kräver att all TypeScript-syntax går att stryka och lämna giltig JavaScript kvar. En `enum` blir ett riktigt objekt vid körning och kan därför inte strykas.',
      },
      {
        id: 'c',
        text: 'Union-typer är snabbare, eftersom de inte behöver slås upp',
        explanation:
          'Det finns ingen hastighetsskillnad att tala om, och framför allt är det inte skälet. Regeln handlar om radering, inte prestanda.',
      },
    ],
  },
  {
    id: 'diskriminanten',
    question:
      "Ett svar är antingen `{ status: 'error'; message: string }` eller `{ status: 'done'; data: string[] }`. Vad gör att TypeScript vet vilka fält du får läsa efter en kontroll av `status`?",
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Att `status` finns i båda varianterna och har ett eget fast värde i var och en',
        explanation:
          'Rätt. Det är definitionen av en diskriminerad union. Kontrollen utesluter alla varianter vars `status` inte kan vara det värdet, och kvar står bara en.',
      },
      {
        id: 'b',
        text: 'Att varianterna har olika fält, så TypeScript ser vilken det är',
        explanation:
          'Olika fält räcker inte i sig. Det går att smalna av på förekomsten av ett fält med `in`, men det är en annan mekanism — diskriminanten är det gemensamma fältet med fasta värden.',
      },
      {
        id: 'c',
        text: 'Att kontrollen körs vid körning, så värdet redan är känt då',
        explanation:
          'Kontrollen körs mycket riktigt, men narrowing sker i kompilatorn medan den läser koden. Den vet vad `status` måste vara i varje gren utan att något behöver köras.',
      },
    ],
  },
];
