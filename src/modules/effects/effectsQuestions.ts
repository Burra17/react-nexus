import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för modulen om effekter.
//
// Tre frågor som träffar varsin poäng: ordningen mellan städning och
// uppsättning när ett beroende ändras, vad en effekt kostar när den sätter ett
// värde som gick att räkna fram, och vad städningen faktiskt hindrar när ett
// gammalt svar kommer tillbaka.
//
// Kodfragment markeras med backticks, som i Markdown. Se stateQuestions.ts.
export const effectsQuestions: QuizQuestion[] = [
  {
    id: 'stadning-fore-ny-uppsattning',
    question:
      'En effekt ansluter till en kanal och returnerar en städfunktion. Beroendelistan är `[channel]`. Du byter kanal från "allmänt" till "teknik". Vad händer?',
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'Effekten körs om med "teknik". Städningen för "allmänt" väntar tills komponenten försvinner',
        explanation:
          'Då hade båda anslutningarna varit öppna samtidigt, och det är precis vad städningen finns till för att förhindra. Den sista körningen sker vid avmontering, men den är inte den enda.',
      },
      {
        id: 'b',
        text: 'Ingenting förrän komponenten monteras om',
        explanation: 'Det gäller en tom beroendelista. Står `channel` i listan körs effekten om så fort värdet ändras.',
      },
      {
        id: 'c',
        text: 'Städningen för "allmänt" körs först, sedan körs effekten med "teknik"',
        explanation:
          'React städar efter den gamla körningen innan den startar den nya. Städfunktionen ser värdena från sin egen körning, alltså "allmänt" - inte kanalen som just valts.',
      },
    ],
  },
  {
    id: 'harlett-varde-i-state',
    question:
      'En komponent får `firstName` och `lastName` som props, håller `fullName` i state och sätter det i en effekt. Vad kostar det jämfört med att räkna fram värdet under renderingen?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'En extra omritning varje gång namnet ändras',
        explanation:
          'Komponenten ritas om för de nya propsen, effekten körs efteråt och sätter state, och den uppdateringen kräver en omritning till. Räknas värdet fram under renderingen finns ingenting att synkronisera.',
      },
      {
        id: 'b',
        text: 'Ingenting - React slår ihop den uppdateringen med den som kom från propsen',
        explanation:
          'Batchning slår ihop uppdateringar som sker under samma händelse. Effekten körs först efter att renderingen är klar och skärmen uppdaterad, så det finns ingenting kvar att slå ihop den med.',
      },
      {
        id: 'c',
        text: 'Bara första gången, sedan känner React igen värdet och hoppar över',
        explanation:
          'React jämför inte vad du skickar till en setter mot vad du skulle ha räknat fram. Effekten körs om varje gång ett beroende ändras, och sätter state varje gång.',
      },
    ],
  },
  {
    id: 'ignore-flaggan-vid-kapplopning',
    question:
      'En effekt hämtar data och sätter `ignore = true` i sin städfunktion. Du byter användare medan den första hämtningen fortfarande pågår. Vad gör flaggan?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Den avbryter den första hämtningen, så att svaret aldrig kommer',
        explanation:
          'Ett anrop som redan lämnat klienten går inte att ta tillbaka med en variabel. Svaret kommer fram precis som vanligt - flaggan avgör bara vad som händer sedan. Vill man verkligen avbryta krävs `AbortController`.',
      },
      {
        id: 'b',
        text: 'Svaret kommer fram, men får inte skriva till state',
        explanation:
          'Städningen körde innan den nya hämtningen startade och satte den gamla körningens flagga. När det gamla svaret till slut dyker upp ser det flaggan och lämnar state orört.',
      },
      {
        id: 'c',
        text: 'Ingenting - React håller själv ordning på vilket svar som är det senaste',
        explanation:
          'React vet ingenting om dina löften. Utan flaggan skriver varje svar till state i den ordning det råkar komma fram, och ett långsamt svar vinner över ett snabbt bara för att det kom sist.',
      },
    ],
  },
];
