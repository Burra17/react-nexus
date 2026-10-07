import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för sidan om arkitektur.
//
// De tre frågorna träffar varsin poäng: var ett anrop hör hemma i strukturen,
// varför samma mönster kan vara rätt i ett projekt och fel i ett annat, och
// varför ett svar som ser lyckat ut kan vara det farligaste felet.
//
// Kodfragment markeras med backticks, som i Markdown. Quiz-komponenten gör dem
// till code-element, så texten här förblir ren data utan JSX.
export const architectureQuestions: QuizQuestion[] = [
  {
    id: 'var-hor-anropet-hemma',
    question: 'Du bygger en ny modul som behöver hämta data från API:et. Var lägger du funktionen som gör själva anropet?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'I modulens egen `hooks/`-mapp, tillsammans med `useQuery`-hooken',
        explanation:
          'Hooken hör hemma där, men inte anropet. Hooken vet vilken nyckel som gäller, servicen vet hur man pratar med API:et. Ligger anropet i en moduls `hooks/` och en andra modul behöver det, måste det flyttas ändå. `services/` på rotnivå är den platsen från början, eftersom flera moduler hämtar samma data.',
      },
      {
        id: 'b',
        text: 'I `services/api/`, tillsammans med de andra anropen',
        explanation:
          'Servicelagret ligger i `services/` på rotnivå, bredvid modulerna, eftersom flera moduler hämtar samma data och de flesta inte hämtar något alls. Servicen innehåller ingen React: den returnerar data, och hooken bestämmer vad som händer med den.',
      },
      {
        id: 'c',
        text: 'I komponenten där datan ska visas, så att allt som hör ihop står på ett ställe',
        explanation:
          'Då binder du hämtningen till en komponent som råkade behöva den först. Nästa vy som vill ha samma data får antingen kopiera anropet eller importera en komponent den inte ska visa. Därför går all HTTP genom servicelagret och aldrig genom axios direkt i en komponent.',
      },
    ],
  },
  {
    id: 'varfor-ingen-basapi',
    question:
      'Förlagan har en `BaseAPI`-klass som varje resurs ärver och får `Get`, `Create` och `Update` gratis av. Varför har inte den här appen det?',
    correct: 'c',
    options: [
      {
        id: 'a',
        text: 'Klasser hör inte hemma i modern React-kod',
        explanation:
          'Servicelagret innehåller ingen React alls. Det är vanliga funktioner mot ett API, och en klass där hade varit fullt möjlig. Att komponenter numera skrivs som funktioner säger ingenting om hur man pratar med ett API.',
      },
      {
        id: 'b',
        text: 'TypeScript hanterar arv dåligt',
        explanation: 'TypeScript hanterar arv utmärkt, och basklasser är ett vanligt och välfungerande mönster. Problemet är inte språket.',
      },
      {
        id: 'c',
        text: 'Arvet lönar sig först vid många resurser',
        explanation:
          'Basklassen lönar sig i förlagan, som har tjugosju resurser. Här finns en enda, användare, och då blir den en inpackning som döljer vad anropet gör. Samma mönster kan alltså vara rätt i ett projekt och fel i ett annat: skillnaden är storlek, inte smak.',
      },
    ],
  },
  {
    id: 'svar-som-inte-ar-json',
    question:
      'MSW svarar inte, till exempel för att webbläsaren har stoppat den efter en stunds inaktivitet. Ett anrop under `/api` får då tillbaka appens `index.html` med status 200. Vad händer om axiosClient inte kontrollerar att svaret är JSON?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Query lägger HTML-texten i cachen som data, och ingenting säger till',
        explanation:
          'Status 200 betyder för axios att allt gick bra, så inget fel kastas och ingen felhantering slår till. Ett fel som ser ut som ett lyckat svar är värre än ett fel, eftersom det inte upptäcks. Kontrollen finns därför på ett enda ställe som varje anrop passerar.',
      },
      {
        id: 'b',
        text: 'Axios kastar ett fel, eftersom svaret inte går att tolka som JSON',
        explanation:
          'Axios försöker tolka svaret som JSON, men misslyckas det lämnar axios texten som den är, utan att kasta något fel. Det är bibliotekets standard. Därför måste kontrollen skrivas för hand.',
      },
      {
        id: 'c',
        text: 'Query försöker igen automatiskt tills den får ett riktigt svar',
        explanation:
          'Query försöker igen när en hämtning misslyckas, tre gånger som standard, men det här räknas inte som ett misslyckande, eftersom statuskoden är 200. Och även om den försökte igen skulle den få samma HTML-sida tillbaka.',
      },
    ],
  },
];
