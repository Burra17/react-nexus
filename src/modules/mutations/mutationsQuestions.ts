import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för vyn Mutations.
//
// Frågorna ligger på de tre delarnas egna poänger: att en lyckad skrivning inte
// säger något till cachen, var invalideringen hör hemma när uppdateringen är
// optimistisk, och att en mutation inte delas som en query gör.
//
// Vad invalidateQueries gör med en query frågas INTE här. Den frågan hör hemma
// i vyn Query: cache, och en kontroll som ställer den här mäter inget som den
// här sidan lär ut.
export const mutationsQuestions: QuizQuestion[] = [
  {
    id: 'servern-sparade-vyn-star-still',
    question:
      'Din `useMutation` går till success, och servern har sparat det nya värdet. Listan på skärmen visar fortfarande det gamla. Vad är förklaringen?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Servern svarade med gammal data',
        explanation:
          'Svaret innehåller det nya värdet, och det går att se i mutationens `data`. Problemet ligger inte i vad servern skickade tillbaka utan i vad som gjordes med det.',
      },
      {
        id: 'b',
        text: 'Cachen är en kopia, och ingenting har talat om för den att kopian inte längre stämmer',
        explanation:
          'Listan i vyn kommer från en query som hämtades tidigare. En mutation skriver på servern; den rör inte den kopian. Antingen säger du till att kopian är inaktuell med `invalidateQueries`, eller så skriver du det nya värdet i den själv med `setQueryData`.',
      },
      {
        id: 'c',
        text: 'Komponenten har inte renderats om',
        explanation:
          'En omrendering hade inte hjälpt. Listan visar det som står i cachen, och där ligger fortfarande det gamla värdet. Hur många gånger den än ritas om visar den samma sak tills cachen ändras.',
      },
    ],
  },
  {
    id: 'onsettled-eller-onsuccess',
    question:
      'Du gör en optimistisk uppdatering: `onMutate` skriver det nya värdet i cachen och `onError` rullar tillbaka. Var hör invalideringen hemma?',
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'I `onSuccess`, eftersom det är bara vid en lyckad sparning som servern faktiskt har ny data',
        explanation:
          'Det stämmer för en mutation som inte rör cachen själv, och det är precis vad den andra demon gör. Men här har klienten skrivit i cachen på egen hand. Går anropet fel rullas cachen tillbaka till ögonblicksbilden, och den kan vara äldre än det servern har: `onMutate` kan ha avbrutit en hämtning som var på väg med nyare data. Det är just det fallet `onSuccess` hoppar över.',
      },
      {
        id: 'b',
        text: 'I `onMutate`, direkt efter `setQueryData`',
        explanation:
          'Då skulle invalideringen hämta om listan medan skrivningen fortfarande är på väg, och svaret skulle skriva över den optimistiska uppdateringen med det gamla värdet. Det är samma fel som `cancelQueries` i `onMutate` finns till för att undvika: ett svar som var på väg landar efter den optimistiska skrivningen.',
      },
      {
        id: 'c',
        text: 'I `onSettled`, som kör oavsett hur det gick',
        explanation:
          'Efter en optimistisk uppdatering står det i cachen något klienten skrivit och inte servern, oavsett utfall: gissningen eller ögonblicksbilden. `onSettled` invaliderar listan i båda fallen, och är det enda stället som täcker även det misslyckade.',
      },
    ],
  },
  {
    id: 'mutation-saknar-nyckel',
    question: 'Två komponenter anropar var för sig samma mutationshook. Du klickar på knappen i den ena. Vad händer med den andra?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Ingenting, den har sitt eget tillstånd',
        explanation:
          'En `useQuery` identifieras av sin `queryKey` och delas av alla som frågar efter samma. En `useMutation` har ingen nyckel: varje anrop av hooken ger en egen mutation med eget `isPending`, `data` och `error`.',
      },
      {
        id: 'b',
        text: 'Den blir också `isPending`, eftersom de delar mutation',
        explanation:
          'Det är query-tänket applicerat på mutationer, och det är den vanligaste förväxlingen mellan de två. Mutationer identifieras inte av något som kan delas. Två knappar delar bara mutation när de använder ett och samma anrop av hooken, som i den andra demon.',
      },
      {
        id: 'c',
        text: 'Den blir `isPending` om båda fått samma `mutationKey`',
        explanation:
          '`mutationKey` finns, men den delar inte tillstånd mellan två anrop av hooken. Den är till för gemensamma standardinställningar med `setMutationDefaults`, och för att kunna hitta pågående mutationer med `useMutationState` eller `isMutating`.',
      },
    ],
  },
];
