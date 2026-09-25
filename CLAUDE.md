# CLAUDE.md

React Nexus — en levande lärobok och ett interaktivt kodlabb där React, TypeScript, TanStack Query, Material UI och arkitektur både förklaras och demonstreras.

Varje vy ska förklara ett koncept och visa det i arbete: hur state uppdateras, hur en omrendering utlöses, hur TanStack Query cachar ett svar. Målet är att förstå mekanismen och varför den spelar roll, inte att leverera en produkt.

Kodreglerna följer Apptechs standard rakt av: KISS, DRY, Prettier och ESLint, camelCase på filer och PascalCase på komponenter, strikt TypeScript.

Arkitekturen har Apptechs produktionsprojekt som förlaga — feature-baserad modulindelning, servicelager på rotnivå, envägsdataflöde och query-nycklar i en fabrik. Förlagan är en källa, inte en auktoritet: det som är bra härmas, det som kan göras bättre görs bättre. Där det här repot avviker är det medvetet, och skälet står utskrivet vid avsteget. Utan skälet läses avvikelsen som okunskap nästa gång någon jämför de två, och då blir reflexen att rätta tillbaka.

## Pedagogiskt läge

Det här repot är ett inlärningsprojekt. Målet är att koden ska förstås, inte att den ska bli klar fort.

- Förklara varför före hur. Motivera arkitekturvalet innan du visar koden.
- Bygg en avgränsad sak i taget och lämna över. Leverera inte fem filer när ticketen handlar om en.
- Skriv kod som går att skriva själv nästa gång. Inga smarta one-liners, inga nya bibliotek utan att fråga först.
- Svara på svenska.
- Finns flera rimliga vägar: ge en rekommendation med ett kort skäl, inte en katalog över alternativ.

## Kommandon

Pakethanteraren är yarn. Kör aldrig npm install här: det skapar en package-lock.json bredvid yarn.lock, och två lockfiler betyder två olika sanningar om vilka versioner som gäller. Nästa person som klonar kan få andra paket än du har.

yarn build kör tsc -b före Vite-bygget och är den riktiga kvalitetsgrinden: TypeScript-reglerna nedan ger byggfel, inte varningar. Kör den innan varje PR. Att yarn dev startar utan att klaga betyder inte att koden kompilerar.

Tre kommandon granskar koden, och CI kör exakt samma tre på varje PR: `yarn format:check`, `yarn lint` och `yarn build`. Kör dem lokalt först — en röd check ska aldrig vara något du måste öppna en logg för att förstå.

yarn format och yarn format:check är inte samma sak. Den första skriver om filerna, den andra rapporterar bara. CI använder den andra, eftersom ett kommando som rättar tyst alltid rapporterar grönt och därmed inte kontrollerar någonting.

yarn lint kör med --max-warnings=0, så en varning stoppar bygget precis som ett fel. Det gäller särskilt react-hooks/exhaustive-deps, som annars bara viftar med handen åt en ofullständig beroendelista. Demonstrationskod som med flit bryter mot en regel märks med eslint-disable-next-line, på samma rad som den kommentar som ändå ska förklara att koden är avsiktligt felaktig.

## Arkitektur

```text
src/
  modules/<koncept>/     en demonstration, t.ex. rendering, queryCache, forms
    components/          komponenter som bara används i den här modulen
    hooks/               modulens hookar
      queries/           useQuery-hookar
      mutations/         useMutation-hookar
      <resurs>Keys.ts    query key-fabriken, en per resurs
    pages/               vyn som routern pekar på
  pages/                 appens egna sidor, t.ex. startsidan — hör inte till något koncept
  services/              infrastruktur för hela appen — HTTP, lagring, allt utanför React
    api/                 anropen mot API:et, och typerna för svaren
    axios/               konfigurerad Axios-instans
    mocks/               MSW: handlers och worker
    storage/             enda vägen till localStorage, och nyckelkatalogen
    queryClient.ts       appens QueryClient, med bibliotekets standardvärden orörda
  shared/
    components/          komponenter som används av flera moduler
    forms/               formulärkomponenter (React Hook Form)
    hooks/               hookar som används av flera moduler eller av en mall
  styles/                colors.tsx och theme.tsx för MUI-temat
  templates/             sidlayouter, t.ex. pageTemplate.tsx

  modules.tsx            katalogen över koncepten, med status och beskrivning
  lazyPages.ts           lazy-anropen, en rad per konceptvy
  navigation.tsx         det som går att navigera till: start plus byggda moduler
  router.tsx             routern, byggd ur navigation
```

En modul är ett koncept, inte en produktfunktion. Den ska gå att förstå isolerad, utan att läsaren behöver känna till någon annan modul.

Appens egna sidor ligger därför i src/pages/, inte i modules/. Startsidan är kartan över koncepten och 404-vyn är ett felmeddelande — ingen av dem demonstrerar något. Läggs de bland modulerna stämmer det inte längre att varje mapp i modules/ är ett koncept, och regeln ovan tappar sin skärpa.

components, hooks och pages är stommen. En modul får lägga till egna segment när den behöver dem — types/ för modulinterna modeller, helpers/, mocks/. Lägg till dem när de fylls, inte i förväg.

Servicelagret ligger på rotnivå, inte i modulen. Så ser det ut i Apptechs produktionsprojekt, och det passar det här repot extra bra: de flesta moduler demonstrerar något som inte har med HTTP att göra — en vy om useState har inget att hämta. Ett gemensamt services/ slipper frågan helt, i stället för att varje modul får en tom mapp.

services/ är infrastruktur, inte bara HTTP. Där hör allt hemma som hela appen delar, som inte är React och som ingen enskild modul äger — anropen mot ett API, den konfigurerade Axios-instansen, lagring som ska överleva en sidladdning. HTTP är det vanligaste exemplet, inte villkoret.

Skapa varje del av services/ först när något faktiskt behöver den. Tomma mappar är ceremoni.

### Anropen är funktioner, inte klasser

Produktionsprojektet har en BaseAPI-klass som varje resurs ärver, och får Get, GetAll, Create, Update och Delete gratis. Det lönar sig över tjugosju resurser. Här blir det två eller tre mot en mockad backend, och då är arvet en inpackning som döljer vad anropet gör — tvärtemot regeln att demonstrationskod ska visa mekanismen.

Axios behålls däremot, trots att vi inte har någon auth och därför inte den vanligaste användningen för interceptors. Skälet är pedagogiskt och inte tekniskt: det är axios du möter i produktionskoden, och en lärobok som lär ut fetch förbereder dig sämre på den kod du faktiskt ska läsa.

En interceptor finns ändå, och den hör till läromedlet snarare än till bekvämligheten. Appen är en ensidesapp, så allt som inte matchar en riktig fil besvaras med index.html — också ett anrop under /api som mocken inte fångar. Utan en kontroll ser axios en webbsida med status 200 som en lyckad hämtning, Query lägger HTML-strängen i cachen som data, och vyn renderar tomma fält utan att något säger till. Svaret kontrolleras därför mot content-type på ett enda ställe, i axiosClient. Ett fel som ser ut som ett lyckat svar är värre än ett fel, eftersom det inte upptäcks.

### Typerna växer in i tre mappar, men skapas inte i förväg

Förlagan delar api/ i response/, request/ och options/: vad API:et svarar, vad du skickar, vad du frågar med. Uppdelningen är bra, och namnen står här så att ingen hittar på egna när det blir dags.

Men typerna ligger bredvid sitt anrop tills en resurs faktiskt har alla tre. Tre mappar med en fil i varje är precis den ceremoni regeln ovan förbjuder.

Förlagans models/ och helpers/ härmas inte. Den första överlappar response/ på ett sätt som inte går att förklara ens efter att ha läst båda, den andra är paginering vi inte har.

När data hämtas gäller ett envägsflöde:

```text
page → hook → service → axiosClient → API
```

- All HTTP går genom servicelagret, aldrig axios direkt i en komponent.
- Services innehåller ingen React — bara funktioner som returnerar typad data.
- Behöver en andra modul en komponent flyttas den till shared/components/. Flytta, kopiera inte.

### Så kopplas en modul in

En ny konceptmodul kräver två rader utanför sin egen mapp.

Först en rad i lazyPages.ts:

```ts
export const RenderingPage = lazy(() => import('./modules/rendering/pages/renderingPage').then((imported) => ({ default: imported.RenderingPage })));
```

Sedan ett element på modulens post i modules.tsx:

```tsx
element: <RenderingPage />,
```

Det är allt. En modul räknas som byggd så fort den har ett element, och då dyker den upp i sidomenyn samtidigt som kortet på startsidan blir klickbart. Ingen rutt, ingen menypost och ingen status behöver läggas till: navigation.tsx och router.tsx räknar fram allt det ur katalogen.

Importera aldrig en konceptvy direkt i modules.tsx. Då hamnar vyn, och allt den drar in, i startchunken — och en konceptvy drar in kodvisaren, som drar in Shikis grammatik och teman på ungefär hundra kilobyte gzip. Ingenting varnar: bygget går igenom, lintningen är grön och appen fungerar. Det enda som händer är att startsidan tyst blir tyngre för alla som aldrig öppnar modulen.

lazyPages.ts får bara innehålla komponenter. Blandas data in i samma fil slutar Fast Refresh fungera för den, så att varje ändring tvingar fram en full omladdning av sidan i stället för en uppdatering på plats. ESLint fångar det med react-refresh/only-export-components.

## Namngivning

- Filer: camelCase — renderCounter.tsx, useRenderCount.ts, cacheService.ts
- Komponenter, typer och interface: PascalCase — RenderCounter, CacheEntry
- Funktioner och variabler: camelCase — const resetCounter = () => {}
- Komponenter skrivs som arrow functions med namngiven export: export const RenderCounter = () => {}
- App.tsx och main.tsx är Vites egna filer och behåller sina namn.

## TypeScript-regler som biter

Tre inställningar i tsconfig.app.json gör att vanliga mönster inte kompilerar. Två av dem kommer från Vites react-ts-mall, inte från Apptechs kodregler — bra att veta skillnaden.

verbatimModuleSyntax — typer måste importeras med import type:

```ts
import type { CacheEntry } from '../types/cache'; // rätt
import { CacheEntry } from '../types/cache'; // byggfel
```

erasableSyntaxOnly — enum, namespace och parameter-properties är förbjudna. Använd union eller as const:

```ts
export const DEMO_STATES = ['idle', 'running', 'done'] as const;
export type DemoState = (typeof DEMO_STATES)[number];
```

noUnusedLocals / noUnusedParameters — en oanvänd variabel eller parameter stoppar bygget. Städa bort experimentkod före commit.

any är förbjudet (noImplicitAny), och null-kontrollerna är strikta. Båda följer av strict: true, som står utskriven i tsconfig.app.json trots att TypeScript 6 har den påslagen som standard. Raden ändrar ingenting i dag — poängen är att repots viktigaste kodregel ska stå i repot i stället för att ärvas tyst från en version som kan bytas.

Saknas en typ:

- Typ för ett API-svar → services/api/, bredvid anropet den hör till.
- Typ som bara rör en modul — ett unions-läge för en demo, en props-typ → i modulen, nära det som använder den.

## Kodstil

- KISS — kod som en kollega förstår vid första genomläsningen.
- DRY — upprepas något på ett tredje ställe, bryt ut det. Inte vid det första.
- Svenska kommentarer. Varje funktion får en rad om vad den gör, varje workaround en rad om varför den finns. Kommentaren förklarar avsikten, den upprepar inte kodraden.
- Prettier (.prettierrc) sköter formateringen: enkla citattecken, semikolon, 150 tecken per rad. Formatera on save. Formatering diskuteras aldrig i en PR.

## Varje konceptvy har fyra delar

React Nexus är en lärobok, inte en samling experiment. Varje konceptvy består därför av fyra delar, i den här ordningen:

- Teori. En pedagogisk förklaring på svenska av vad konceptet är och varför man använder det. En demo utan teori visar att något händer, utan att säga varför det spelar roll.
- Demo. Den interaktiva delen, där man klickar och testar.
- Kod. Källkoden som driver demon.
- Quiz. Några frågor som kontrollerar att konceptet fastnade. Att känna igen en förklaring känns som kunskap, men förutsäger inte att man kan återkalla den senare. Det gör bara ett test.

Ordningen är inte valfri. Bestäms den i varje modul kommer den elfte vyn inte se ut som den första, och i en lärobok är igenkänning halva poängen — läsaren ska veta var teorin står utan att leta. Den delade mallen i templates/ bestämmer ordningen och rubrikerna en gång.

Quizen står sist, efter Kod. I det här repot är källkoden en del av läromedlet och inte ett uppslagsverk vid sidan om — testar man före den testar man på halva materialet.

Kod-delen läser den riktiga källfilen, aldrig en kopierad sträng. Vite kan importera en fil som text:

```ts
import demoSource from '../components/counterDemo.tsx?raw';
```

En kopia driver isär från demon första gången demon ändras, och då lär läroboken ut något som inte längre är sant. Läses filen med ?raw är det som visas samma fil som körs, och de kan inte hamna i otakt.

### Quizens regler

- Tre frågor som riktmärke, spann två till fyra. Varje fråga träffar en egen poäng ur teorin — tre frågor om samma sak är en fråga ställd tre gånger.
- Tre svarsalternativ, märkta A, B och C.
- De två felaktiga alternativen ska vara missuppfattningar läsaren faktiskt kan ha. Ett alternativ ingen skulle välja lär inte ut något.
- Facit förklarar varje alternativ, även det rätta. Annars går den som gissade rätt vidare i tron att hen kunde det.
- Svaret låses när det väljs. Kan man klicka runt tills rutan blir grön är det en gissningsövning och inte en kunskapskontroll. En knapp gör om hela modulens quiz.
- Inga poäng, inga streaks, inga märken. Syftet är att avslöja var förståelsen inte sitter, inte att belöna.

## Demonstrationskod ska visa mekanismen, inte dölja den

Det här repot har ett syfte som skiljer sig från en vanlig app: koden är poängen, inte bara medlet. En abstraktion som gör en vy kortare men gömmer det som ska demonstreras är fel väg här, även om den vore rätt i en produkt.

## Datahämtning

TanStack Query hanterar all serverdata. Hämta aldrig med useEffect + useState.

Ett undantag, unikt för det här repot: en vy vars syfte är att visa vad useEffect-hämtning gör fel — dubbelanrop i StrictMode, kapplöpningar, saknad avbrytning — får använda mönstret. Sådan kod märks med en kommentar om att den är avsiktligt felaktig och vad den demonstrerar, så att den inte kopieras i god tro.

### Backenden är MSW, och den körs även i bygget

Mock Service Worker fångar riktiga HTTP-anrop i webbläsaren. Anropen syns i Network-fliken, och latens och felsvar går att styra — utan det går det inte att demonstrera att ett dedupererat anrop aldrig lämnar klienten.

MSW:s egen dokumentation startar workern bara i utvecklingsläge, och den vägen ska inte följas här. Den publicerade sidan är läroboken; en modul som bara fungerar på utvecklarens maskin är inte byggd. Här är mocken inte en ställföreträdare för en riktig backend under utveckling — den är datakällan. Avvikelsen kommenteras där workern startas, eftersom varje guide säger motsatsen.

Filerna ligger i services/mocks/, inte i src/mocks/ som MSW föreslår. En mockad backend är infrastruktur som hela appen delar och som ingen modul äger, och då gäller regeln ovan. Undantaget är mockServiceWorker.js, som verktyget genererar och som måste ligga i public/.

### Query-nycklar skrivs i en fabrik, inte på plats

Varje resurs som hämtas får en <resurs>Keys.ts bredvid modulens hookar:

```ts
export const cacheDemoKeys = {
  all: ['cacheDemo'] as const,
  lists: () => [...cacheDemoKeys.all, 'list'] as const,
  list: (page: number) => [...cacheDemoKeys.lists(), page] as const,
  byId: (id: string) => [...cacheDemoKeys.all, id] as const,
};
```

Mönstret kommer från Apptechs produktionsprojekt och från tkdodo-bloggen som deras kodregler länkar till.

Varför en fabrik i stället för ['cacheDemo', 'list', page] i hooken?

- Nycklarna byggs ovanpå varandra, så cacheDemoKeys.all invaliderar allt modulrelaterat på en gång — utan att du behöver minnas hur de underliggande nycklarna såg ut.
- En felstavad eller bortglömd parameter blir ett typfel i stället för en cache-bugg som visar fel data i tysthet.
- Alla nycklar för en modul står på ett ställe och går att läsa som en lista.

queryKey ska fortfarande innehålla varje parameter som påverkar svaret — fabriken gör bara att du inte kan glömma det.

Fabriken hör till resursen, inte till modulen, och heter därför <resurs>Keys.ts. En modul med två resurser får två fabriker. Oftast har en modul bara en, men regeln avgör vad som händer när den andra dyker upp — och alternativet, att klämma in båda i samma fabrik för att filnamnet säger modulens namn, ger nycklar som inte går att invalidera var för sig.

### Hookarna delas i queries/ och mutations/

Läsning och skrivning skiljer sig åt: en useQuery cachar, en useMutation invaliderar. Uppdelningen gör det synligt vilken sorts hook du har framför dig.

Skapa mutations/ först när den första mutationen finns.

Queries heter useFetch<Resurs>, mutationer usePost, useUpdate eller useDelete<Resurs>. Hookfiler utan JSX är .ts, inte .tsx — där avviker vi från förlagan, som skriver .tsx genomgående trots att filerna inte innehåller JSX.

Hooken anropar servicen direkt i queryFn. Behöver svaret bearbetas sker det i servicen. Förlagan lägger ofta en funktion i hook-filen mellan de två, men i de flesta fall vidarebefordrar den bara — och ett lager som inte gör något ser ut som arkitektur utan att vara det.

## Design och MUI

- MUI:s komponenter före egen HTML och CSS. Skapa inga nya .css-filer.
- Färger i src/styles/colors.tsx, temat i src/styles/theme.tsx. Hårdkoda aldrig en hex-kod i en komponent.
- Styling sker via sx-propen eller styled().
- Tillgänglighet (WCAG): alt-texter på bilder, riktiga <button>-element för klick, länkar för navigering, kontrast som kommer från temat.

## Miljövariabler

Aktuellt först när något behöver en riktig nyckel — alltså inte i Query-modulerna. MSW fångar anropen i webbläsaren, så axiosClient har en hårdkodad relativ bas och det finns ingen adress att konfigurera. En variabel som aldrig varierar är samma sorts ceremoni som en tom mapp.

- .env.local (git-ignorerad via *.local) håller nycklar och basadresser.
- Vite exponerar bara variabler som börjar med VITE_ för webbläsarkoden. En variabel utan prefix blir tyst undefined i klienten.
- Variabler läses på ett enda ställe: axiosClient. En nyckel skrivs aldrig i en .ts-fil och .env.local följer aldrig med en commit.

## Git-arbetsflöde

main är skyddad — allt går via Pull Request.

```bash
git checkout main && git pull
git checkout -b feature/<ticketnummer>
```

- Commits på svenska, alla inom samma ticket
- PR med Closes #<ticketnummer> i beskrivningen så att ticketen stängs vid merge
- CI-checken kontroller måste vara grön — en röd PR går inte att merga
- Merga och dra ticketen till Done

Grinden gäller alla, även den som äger repot. Går checken sönder av något annat än koden går ingenting att merga förrän det är löst, och det är avsiktligt: en grind man kan kliva över är ingen grind.

En PR håller sig till en ticket. Dyker något annat upp på vägen blir det en ny ticket, inte en extra fil i den här PR:en.

## Dokumentation

README.md och docs/ARKITEKTUR.md skrivs när strukturen satt sig — inte innan, eftersom ett dokument om en arkitektur som ännu ändras blir inaktuellt direkt.

När de finns gäller: dokumentationen uppdateras i samma PR som ändringen, inte efteråt. Ett dokument som beskriver en arkitektur projektet vuxit ifrån är sämre än inget dokument, eftersom det läses som sanning.
