import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för modulen om formulär.
//
// En fråga per demodel: vad ordet kontrollerad betyder, varför biblioteket
// slipper omrenderingarna, och när valideringen körs.
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
          'Nej. En okontrollerad input kan mycket väl ha en `onChange`. Du kan lyssna på vad någon skriver utan att styra vad som står där. Det omvända gäller däremot: har du satt `value` MÅSTE du ha `onChange`, annars går det inte att skriva i fältet.',
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
          'Rätt. React tvingar då fältet att alltid visa det värde du skickade. Utan `value` anger JSX bara ett startvärde, och DOM-elementet äger resten. En input kan inte vara både och, och inte heller byta sida under sin livstid.',
      },
    ],
  },
  {
    id: 'varfor-ritas-inte-om',
    question: 'Varför ritas komponenten inte om när du skriver i ett fält som registrerats med `register`?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'Biblioteket memoiserar formuläret',
        explanation:
          'Nej. Det finns ingen memoisering inblandad, och en `memo` hade inte hjälpt ändå: den hindrar omritning när propsen är oförändrade, inte när komponentens eget state ändras.',
      },
      {
        id: 'b',
        text: '`register` ger fältet en `ref` men inget `value`, så värdet bor i DOM-elementet',
        explanation:
          'Rätt. `register` returnerar `onChange`, `onBlur`, `ref` och `name`, men aldrig `value`. Fältet är därmed okontrollerat i Reacts mening, och det finns ingen state att uppdatera vid varje tangenttryck. Omrenderingarna uteblir som en följd av hur värdet läses, inte som en optimering ovanpå.',
      },
      {
        id: 'c',
        text: 'Biblioteket samlar ihop uppdateringarna och kör dem i klump',
        explanation:
          'Nej. Batchning finns i React och slår ihop flera state-ändringar till en omritning, men här sker ingen state-ändring alls medan du skriver. Det som inte händer behöver inte batchas.',
      },
    ],
  },
  {
    id: 'nar-kors-valideringen',
    question: 'När körs valideringen med bibliotekets standardinställning?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Vid inskickning, och därefter vid varje ändring av det fält som fallerade',
        explanation:
          'Rätt. Standardläget heter `onSubmit`, men andra halvan av meningen är den som brukar saknas: när ett fält väl har fallerat omvärderas det vid varje ändring. Det är därför felmeddelandet försvinner medan du rättar, trots att läget heter onSubmit.',
      },
      {
        id: 'b',
        text: 'Vid varje tangenttryck, från början',
        explanation:
          'Det är läget `onChange`, och det är inte standard. Det rättar dig medan du skriver: ett namn hinner vara ogiltigt efter första bokstaven, och felet står där tills du skrivit klart.',
      },
      {
        id: 'c',
        text: 'När fältet tappar fokus',
        explanation: 'Det är läget `onBlur`. Det är ofta en rimlig kompromiss, men du måste välja det. Det sker inte av sig självt.',
      },
    ],
  },
];
