import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för vyn Query: grunder.
//
// De fyra frågorna ligger på begreppen och inte på API:et: vad isPending säger
// något om, vad nyckeln identifierar, varför serverdata inte är state, och vad
// som händer med inaktuell data som ligger kvar i cachen.
//
// Kodfragment markeras med backticks, som i Markdown. Se stateQuestions.ts.
export const queryBasicsQuestions: QuizQuestion[] = [
  {
    id: 'vad-ispending-betyder',
    question: 'En query står med `isPending: true`. Vad vet du säkert?',
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'Att ett nätverksanrop pågår just nu',
        explanation:
          'Det är `fetchStatus` som svarar på om hämtningen kör. En query kan vara pending utan att hämta, till exempel när den är avstängd i väntan på ett id, eller när nätverket är borta och hämtningen står som `paused`.',
      },
      {
        id: 'b',
        text: 'Att hämtningen har misslyckats och försöker igen',
        explanation:
          'Ett misslyckande syns som `isError`. Medan biblioteket gör nya försök står queryn visserligen kvar som pending, men det är för att det inte finns någon data än. Pending säger inget om varför.',
      },
      {
        id: 'c',
        text: 'Att det ännu inte finns någon data att visa',
        explanation:
          "Rätt. `isPending` är samma sak som `status === 'pending'`, och pending betyder att det ännu inte finns någon data. Om hämtningen kör just nu är en annan fråga, och den besvaras av `fetchStatus`.",
      },
    ],
  },
  {
    id: 'vad-querykey-identifierar',
    question: 'Två komponenter på olika ställen i appen anropar samma hook med samma `queryKey`. Vad följer av det?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Ingenting, eftersom varje komponent får sin egen kopia av datan',
        explanation:
          'Det är så det fungerar med `useState` i varje komponent, och det är precis vad cachen gör onödigt. Nyckeln hör till datan, inte till komponenten som råkade be om den.',
      },
      {
        id: 'b',
        text: 'De tittar på samma query i cachen',
        explanation:
          'Rätt. Nyckeln identifierar datan. Var i trädet komponenten sitter spelar ingen roll: samma nyckel är samma query, och vem som helst som frågar efter den får den.',
      },
      {
        id: 'c',
        text: 'Den andra komponenten får vänta tills den första har renderat färdigt',
        explanation: 'Det finns ingen ordning mellan dem. Nyckeln är en adress i cachen, inte en kö.',
      },
    ],
  },
  {
    id: 'serverdata-ar-inte-state',
    question: 'Varför räcker det inte att lägga svaret från ett API i en vanlig `useState`?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'För att datan ägs av servern: din kopia kan bli inaktuell utan att något i komponenten märker det',
        explanation:
          'Rätt. State du äger ändras bara när du ändrar det. En kopia av serverdata kan bli fel medan den ligger stilla, och då behövs något som vet när den hämtades och när den ska hämtas om.',
      },
      {
        id: 'b',
        text: 'För att `useState` inte klarar objekt',
        explanation: '`useState` håller vilket värde som helst, objekt inkluderat. Problemet är inte formen på datan utan vem som äger den.',
      },
      {
        id: 'c',
        text: 'För att state försvinner vid omrendering',
        explanation:
          'State överlever omrenderingar. Det är hela poängen med det. Det försvinner när komponenten avmonteras, vilket är ett annat problem, och det är också ett cachen löser.',
      },
    ],
  },
  {
    id: 'tillbaka-efter-staletime',
    question: 'Du lämnar en vy och kommer tillbaka efter att `staleTime` gått ut, men innan `gcTime` hunnit ta bort posten. Vad ser du?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Laddningsläget igen, eftersom datan hunnit bli inaktuell',
        explanation:
          'Inaktuell är inte samma sak som borta. Posten ligger kvar tills `gcTime` städat den, och så länge den finns visas den. Ett tomt laddningsläge kommer först när posten faktiskt är borta.',
      },
      {
        id: 'b',
        text: 'Den gamla datan direkt, och ett nytt anrop som går i bakgrunden',
        explanation:
          'Rätt. Inaktuell data visas medan en ny hämtning körs, så du slipper stirra på en tom skärm. Det är därför både `status: success` och `fetchStatus: fetching` kan gälla samtidigt.',
      },
      {
        id: 'c',
        text: 'Den gamla datan, och inget anrop förrän `gcTime` gått ut',
        explanation:
          '`gcTime` styr inte när något hämtas om, bara när posten kastas bort. Det är `staleTime` som avgör om en ny hämtning startar, och den har redan gått ut här.',
      },
    ],
  },
];
