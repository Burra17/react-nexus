import type { QuizQuestion } from '../../shared/components/quiz';

// Kunskapskontrollen för arkitekturmodulen.
//
// Frågorna testar tillämpning och resonemang, aldrig placering. "Var ligger
// servicelagret" är en minneslek som mäter om man scrollat förbi en rubrik,
// och en arkitektur man bara kan rabbla är en arkitektur man inte kan använda.
export const architectureQuestions: QuizQuestion[] = [
  {
    id: 'var-hor-anropet-hemma',
    question: 'Du bygger en tolfte modul som behöver hämta data från API:et. Var lägger du själva anropet?',
    correct: 'b',
    options: [
      {
        id: 'a',
        text: 'I modulens egen `hooks/`-mapp, tillsammans med `useQuery`-hooken',
        explanation:
          'Hooken hör hemma där, men inte anropet. Hooken vet vilken nyckel som gäller; servicen vet hur man pratar med API:et. Blandas de går servicen inte att återanvända från en andra modul utan att dra med sig en hook som modulen inte behöver.',
      },
      {
        id: 'b',
        text: 'I `services/api/`, tillsammans med de andra anropen',
        explanation:
          'Rätt. Servicelagret ligger på rotnivå eftersom de flesta moduler inte hämtar någonting alls. En vy om `useState` har inget att hämta, och ett gemensamt `services/` slipper frågan i stället för att varje modul får en tom mapp. Servicen innehåller ingen React: den returnerar typad data, och hooken bestämmer vad som händer med den.',
      },
      {
        id: 'c',
        text: 'I komponenten där datan ska visas, så att allt som hör ihop står på ett ställe',
        explanation:
          'Då binder du datahämtningen till en komponent som råkade behöva den först. Nästa vy som vill ha samma data får antingen kopiera anropet eller importera en komponent den inte ska rendera. All HTTP går genom servicelagret, aldrig axios direkt i en komponent.',
      },
    ],
  },
  {
    id: 'varfor-ingen-basapi',
    question:
      'Förlagan har en `BaseAPI`-klass som varje resurs ärver och får `Get`, `Create` och `Update` gratis av. Varför har inte det här repot det?',
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
        explanation: 'TypeScript hanterar arv utmärkt, och generiska basklasser är ett vanligt och välfungerande mönster. Problemet är inte språket.',
      },
      {
        id: 'c',
        text: 'Arvet lönar sig först vid många resurser',
        explanation:
          'Rätt. Basklassen tjänar in sig över tjugosju resurser. Här finns två eller tre, och då blir den en inpackning som döljer vad anropet gör. Samma mönster kan alltså vara rätt i ett projekt och fel i ett annat: skillnaden är skala, inte smak.',
      },
    ],
  },
  {
    id: 'svar-som-inte-ar-json',
    question:
      'Mockservern har somnat, och ett anrop under `/api` får tillbaka `index.html` med status 200. Vad händer om `axiosClient` inte kontrollerar `content-type`?',
    correct: 'a',
    options: [
      {
        id: 'a',
        text: 'Query lägger HTML-strängen i cachen som data, vyn renderar tomma fält, och ingenting säger till',
        explanation:
          'Rätt, och det är modulens skarpaste poäng. Status 200 betyder för axios att allt gick bra, så felhanteringen slår aldrig till. Ett fel som ser ut som ett lyckat svar är värre än ett fel, eftersom det inte upptäcks. Kontrollen finns därför på ett enda ställe som varje anrop passerar.',
      },
      {
        id: 'b',
        text: 'Axios kastar ett fel, eftersom svaret inte går att tolka som JSON',
        explanation:
          'Axios försöker tolka svaret som JSON men ger tillbaka rå text när det misslyckas, utan att klaga. Det är därför kontrollen måste skrivas för hand.',
      },
      {
        id: 'c',
        text: 'Query försöker igen automatiskt tills den får ett riktigt svar',
        explanation:
          'Query gör omförsök vid fel, men det här räknas inte som ett fel, eftersom statuskoden är 200. Och även om den försökte igen skulle den få samma HTML-sida tillbaka.',
      },
    ],
  },
];
