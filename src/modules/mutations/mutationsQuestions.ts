import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för modulen om mutationer.
//
// Frågorna ligger på de tre delarnas egna poänger: att en lyckad skrivning inte
// säger något till cachen, var invalideringen hör hemma när uppdateringen är
// optimistisk, och att en mutation inte delas som en query gör.
//
// Vad invalidateQueries gör med en post frågas INTE här. Modul 8 har redan den
// frågan, och en lärobok som ställer samma fråga två gånger mäter inte något
// nytt - den mäter om man kommer ihåg förra kapitlet.
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
          'Nej — svaret innehåller det nya värdet, och det går att se i mutationens `data`. Problemet ligger inte i vad servern skickade tillbaka utan i vad som gjordes med det.',
      },
      {
        id: 'b',
        text: 'Cachen är en kopia, och ingenting har talat om för den att kopian inte längre stämmer',
        explanation:
          'Rätt. Listan i vyn kommer från en cachepost som hämtades tidigare. En mutation skriver på servern; den rör inte den kopian. Antingen säger du till att kopian är inaktuell med `invalidateQueries`, eller så skriver du det nya värdet i den själv med `setQueryData`.',
      },
      {
        id: 'c',
        text: 'Komponenten har inte renderats om',
        explanation:
          'Den har renderats om flera gånger — mutationen gick från pending till success, och det är ett tillståndsbyte som ritar om. En omrendering hjälper bara om det finns något nytt att rita, och cachen innehåller fortfarande det gamla värdet.',
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
        text: 'I `onSuccess` — det är bara vid en lyckad sparning som servern faktiskt har ny data',
        explanation:
          'Det stämmer för en mutation som inte rör cachen själv, och det är precis vad andra demon gör. Men här har klienten skrivit i cachen på egen hand. Går anropet fel står cachen på ett värde som rullats tillbaka av kod och aldrig kontrollerats mot servern — och det är just det fallet `onSuccess` hoppar över.',
      },
      {
        id: 'b',
        text: 'I `onMutate`, direkt efter `setQueryData`',
        explanation:
          'Då skulle invalideringen hämta om listan medan skrivningen fortfarande är på väg, och svaret skulle skriva över den optimistiska uppdateringen med det gamla värdet. Det är samma kapplöpning som `cancelQueries` finns till för att undvika.',
      },
      {
        id: 'c',
        text: 'I `onSettled`, som kör oavsett hur det gick',
        explanation:
          'Rätt. Efter en optimistisk uppdatering är cachen i ett läge klienten hittat på, oavsett utfall. `onSettled` hämtar sanningen från servern i båda fallen, och är det enda stället som täcker även det misslyckade.',
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
        text: 'Ingenting — den har sitt eget tillstånd',
        explanation:
          'Rätt. En `useQuery` identifieras av sin `queryKey` och delas av alla som frågar efter samma. En `useMutation` har ingen nyckel: varje anrop av hooken ger en egen instans med eget `isPending`, `data` och `error`.',
      },
      {
        id: 'b',
        text: 'Den blir också `isPending`, eftersom de delar mutation',
        explanation:
          'Det är query-tänket applicerat på mutationer, och det är den vanligaste förväxlingen mellan de två. Mutationer identifieras inte av något som kan delas.',
      },
      {
        id: 'c',
        text: 'Den blir `isPending` om båda fått samma `mutationKey`',
        explanation:
          '`mutationKey` finns, men den delar inte tillstånd mellan hook-instanser. Den är till för `setMutationDefaults`, och för att kunna hitta mutationen med `useMutationState` eller `isMutating`.',
      },
    ],
  },
];
