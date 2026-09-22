import { readStored, removeStored, writeStored } from './localStorage';
import { storageKeys } from './storageKeys';

// Ett quizsvar: vilket alternativ som valdes, och när.
//
// Om svaret var rätt lagras aldrig. Det räknas fram ur frågedefinitionen vid
// läsning, av samma skäl som isBuilt räknas ur element i modules.tsx: två
// värden som kan säga emot varandra kommer förr eller senare att göra det.
// Lagrat "rätt: true" ljuger den dag ett facit rättas, och ingen märker det.
//
// besvaradAt ser överflödig ut i dag och är det enda fältet jag ändå tar med.
// Utan en tidpunkt går det inte att bygga repetition - "de här svarade du fel
// på för två veckor sedan" - utan att först migrera lagrad data.
export type AnswerChoice = 'a' | 'b' | 'c';

export type QuizAnswer = {
  choice: AnswerChoice;
  answeredAt: string;
};

// Svaren för en modul, med frågans id som nyckel.
export type ModuleAnswers = Record<string, QuizAnswer>;

// Alla moduler, med modulens path som nyckel.
//
// Allt ligger under en enda localStorage-nyckel i stället för en per modul
// eller en per fråga. Då blir en nollställning ett skriv i stället för en
// loop över nycklar man först måste leta rätt på, och versionshanteringen har
// ett ställe att gälla. Mängden är trivial: elva moduler med tre frågor var.
type QuizStorage = Record<string, ModuleAnswers>;

const readAll = (): QuizStorage => readStored<QuizStorage>(storageKeys.quiz, {});

// Alla svar för en modul. Tom om inget är besvarat.
//
// Returnerar bara svaren, aldrig hur många som var rätt. Den här filen känner
// inte till frågorna och kan därför inte rätta dem - beräkningen hör hemma där
// frågedefinitionerna finns. Det är också vad som gör funktionen användbar för
// en framtida dashboard: den läser samma svar och rättar dem själv.
export const readModuleAnswers = (modulePath: string): ModuleAnswers => readAll()[modulePath] ?? {};

// Sparar ett svar. Ett tidigare svar på samma fråga skrivs över.
//
// Att svaret går att skriva över igen är inte samma sak som att det går att
// ändra i vyn. Där låses valet så fort det gjorts, så att man inte kan klicka
// runt tills rutan blir grön. Det här är vad "Gör om quizen" bygger på.
export const saveAnswer = (modulePath: string, questionId: string, choice: AnswerChoice) => {
  const all = readAll();

  writeStored<QuizStorage>(storageKeys.quiz, {
    ...all,
    [modulePath]: {
      ...(all[modulePath] ?? {}),
      [questionId]: { choice, answeredAt: new Date().toISOString() },
    },
  });
};

// Nollställer en modul och lämnar de andra orörda.
export const resetModule = (modulePath: string) => {
  const all = readAll();

  // Modulen plockas bort ur objektet i stället för att sättas till {}. En tom
  // post och en saknad post betyder samma sak för läsningen, och då ska bara
  // den ena finnas - annars växer lagringen med poster som inte säger något.
  const remaining = { ...all };
  delete remaining[modulePath];

  // Sista modulen nollställd: ta bort nyckeln helt i stället för att lagra ett
  // tomt objekt, så att appen inte lämnar skräp efter sig i webbläsaren.
  if (Object.keys(remaining).length === 0) {
    removeStored(storageKeys.quiz);
    return;
  }

  writeStored<QuizStorage>(storageKeys.quiz, remaining);
};
