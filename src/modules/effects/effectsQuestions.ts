import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för sidan om effekter.
//
// Tre frågor som träffar varsin poäng: ordningen mellan städning och
// uppsättning när ett beroende ändras, vad en effekt kostar när den sätter ett
// värde som gick att räkna fram, och vad städningen faktiskt hindrar när ett
// gammalt svar kommer tillbaka.
//
// Kodfragment markeras med backticks, som i Markdown. Quiz-komponenten gör dem
// till code-element, så texten här förblir ren data utan JSX.
export const effectsQuestions: QuizQuestion[] = [
  {
    id: 'stadning-fore-ny-uppsattning',
    question:
      'En effekt ansluter till en kanal och returnerar en städfunktion. Beroendelistan är `[channel, onLog]`, där `onLog` är samma funktion vid varje ritning. Du byter kanal från "allmänt" till "teknik". Vad händer?',
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
        text: 'Efter den nya ritningen körs städningen för "allmänt", och sedan effekten med "teknik"',
        explanation:
          'Komponenten ritas först om med det nya värdet. Därefter städar React efter den gamla körningen och startar den nya. Städfunktionen ser värdena från sin egen körning, alltså "allmänt", inte kanalen som just valts.',
      },
    ],
  },
  {
    id: 'harlett-varde-i-state',
    question:
      'En komponent får `firstName` och `lastName` som props, håller `fullName` i state och sätter det i en effekt. Vad kostar det jämfört med att räkna fram värdet under ritningen?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'En extra ritning varje gång namnet ändras',
        explanation:
          'Komponenten ritas om för de nya propsen, effekten körs efteråt och sätter state, och den uppdateringen kräver en ritning till. Räknas värdet fram under ritningen finns ingenting att hålla i takt.',
      },
      {
        id: 'b',
        text: 'Ingenting, eftersom React slår ihop den uppdateringen med den som kom från propsen',
        explanation:
          'React slår ihop uppdateringar som görs i samma händelse till en enda ritning, det som kallas batchning. Effekten körs först när ritningen är klar, så dess uppdatering kommer för sent för att slås ihop och ger en ritning till.',
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
          'Ett anrop som redan skickats går inte att ta tillbaka med en variabel. Svaret kommer fram precis som vanligt, och flaggan avgör bara vad som händer sedan. Vill man verkligen avbryta anropet används webbläsarens `AbortController`.',
      },
      {
        id: 'b',
        text: 'Svaret kommer fram, men får inte skriva till state',
        explanation:
          'Städningen körde innan den nya hämtningen startade och satte den gamla körningens flagga. När det gamla svaret till slut dyker upp ser det flaggan och lämnar state orört.',
      },
      {
        id: 'c',
        text: 'Ingenting, eftersom React själv håller ordning på vilket svar som är det senaste',
        explanation:
          'React håller inte ordning på dina hämtningar. Utan flaggan skriver varje svar till state i den ordning det råkar komma fram, och ett långsamt svar vinner över ett snabbt bara för att det kom sist.',
      },
    ],
  },
];
