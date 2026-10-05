import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för sidan om formulär.
//
// En fråga per demodel: vad ordet kontrollerad betyder, varför biblioteket
// slipper ritningarna, och när valideringen körs.
//
// Controller får ingen egen fråga. Den är med i demon och i teorin, men tre
// frågor om tre olika saker är bättre än fyra där den fjärde rör ett
// specialfall.
export const formsQuestions: QuizQuestion[] = [
  {
    id: 'vad-gor-en-input-kontrollerad',
    question: 'Vad är det som gör en input kontrollerad?',
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'Att den har en `onChange`',
        explanation:
          'Nej. En okontrollerad input kan mycket väl ha en `onChange`. Du kan lyssna på vad någon skriver utan att styra vad som står där. Det omvända gäller däremot: har du satt `value` behöver du också `onChange`, annars står fältet stilla vid det du skickade in och React varnar i konsolen.',
      },
      {
        id: 'b',
        text: 'Att värdet ligger i ett `useState`',
        explanation:
          'Nej, och det här är den vanligaste förväxlingen. Ett `useState` som aldrig når inputens `value` styr ingenting. Fältet är fortfarande okontrollerat, och state är bara en kopia som råkar ligga bredvid.',
      },
      {
        id: 'c',
        text: 'Att `value` skickas in',
        explanation:
          'Rätt. React tvingar då fältet att alltid visa det värde du skickade. Utan `value` anger JSX bara ett startvärde, och DOM-elementet äger resten. En input ska vara det ena eller det andra hela sin livstid, och React varnar om den byter sida.',
      },
    ],
  },
  {
    id: 'varfor-ritas-inte-om',
    question: 'Varför ritas komponenten inte om för varje tecken du skriver i ett fält som kopplats in med `register`?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Biblioteket memoiserar formuläret',
        explanation:
          'Nej. Att memoisera en komponent, med `memo`, betyder att React hoppar över en ritning när komponentens props är oförändrade. Det finns ingen sådan inblandad här, och den hade inte hjälpt ändå: `memo` hindrar inte en ritning som komponentens eget state orsakar.',
      },
      {
        id: 'b',
        text: '`register` ger fältet inget `value`, så fältet är okontrollerat och värdet hålls utanför Reacts state',
        explanation:
          'Rätt. `register` returnerar `onChange`, `onBlur`, `ref` och `name`, men aldrig `value`. När du skriver sparar bibliotekets `onChange` värdet i ett eget lager utanför React, så det finns ingen state att uppdatera för varje tecken. Att inget ritas om är en följd av hur värdet läses, inte en optimering ovanpå.',
      },
      {
        id: 'c',
        text: 'Biblioteket samlar ihop uppdateringarna och kör dem i klump',
        explanation:
          'Nej. Att samla ihop uppdateringar kallas batchning, och det gör React själv: flera state-ändringar i samma händelse blir en enda ritning. Men för de vanliga tecknen sker ingen state-ändring alls. Det som ritar om formuläret är när en egenskap det läser ur `formState` ändras, som `isDirty` vid första tecknet.',
      },
    ],
  },
  {
    id: 'nar-kors-valideringen',
    question: 'När körs valideringen i React Hook Form om du inte väljer något `mode`?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Vid inskickning, och efter det vid varje ändring av ett fält',
        explanation:
          'Rätt. Standardläget heter `onSubmit`, men andra halvan av meningen är den som brukar saknas: efter den första inskickningen valideras varje fält du ändrar vid varje ändring, också fält som var giltiga när du skickade. Det är därför felmeddelandet försvinner medan du rättar, trots att läget heter onSubmit.',
      },
      {
        id: 'b',
        text: 'Vid varje tangenttryck, från början',
        explanation:
          'Det är läget `onChange`, och det är inte standard. Det rättar dig medan du skriver: med regeln minst två tecken är ett namn ogiltigt efter första bokstaven, och felet står kvar tills regeln är uppfylld.',
      },
      {
        id: 'c',
        text: 'När fältet tappar fokus',
        explanation: 'Det är läget `onBlur`, som väntar tills du lämnar fältet. Det är inte standard utan måste väljas.',
      },
    ],
  },
];
