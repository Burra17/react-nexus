CLAUDE.md
React Nexus — ett interaktivt kodlabb och en playground där React, TypeScript, TanStack Query, Material UI och arkitektur demonstreras visuellt i stället för att antecknas.

Varje vy ska visa ett koncept i arbete: hur state uppdateras, hur en omrendering utlöses, hur TanStack Query cachar ett svar. Målet är att förstå mekanismen, inte att leverera en produkt.

Arkitekturen och kodreglerna följer Apptechs produktionsstandard: feature-baserad modulindelning, servicelager på rotnivå, envägsdataflöde och query-nycklar i en fabrik.

Pedagogiskt läge
Det här repot är ett inlärningsprojekt. Målet är att koden ska förstås, inte att den ska bli klar fort.

Förklara varför före hur. Motivera arkitekturvalet innan du visar koden.
Bygg en avgränsad sak i taget och lämna över. Leverera inte fem filer när ticketen handlar om en.
Skriv kod som går att skriva själv nästa gång. Inga smarta one-liners, inga nya bibliotek utan att fråga först.
Svara på svenska.
Finns flera rimliga vägar: ge en rekommendation med ett kort skäl, inte en katalog över alternativ.
Kommandon
Pakethanteraren är yarn. Kör aldrig npm install här: det skapar en package-lock.json bredvid yarn.lock, och två lockfiler betyder två olika sanningar om vilka versioner som gäller. Nästa person som klonar kan få andra paket än du har.

yarn build kör tsc -b före Vite-bygget och är den riktiga kvalitetsgrinden: TypeScript-reglerna nedan ger byggfel, inte varningar. Kör den innan varje PR. Att yarn dev startar utan att klaga betyder inte att koden kompilerar.

Arkitektur
src/
  modules/<koncept>/     en demonstration, t.ex. rendering, queryCache, forms
    components/          komponenter som bara används i den här modulen
    hooks/               modulens hookar
      queries/           useQuery-hookar
      mutations/         useMutation-hookar
      <koncept>Keys.ts   query key-fabriken för modulen
    pages/               vyn som routern pekar på
  services/              gemensamt för hela appen — skapas först när något behöver HTTP
    api/                 anropen mot API:et, och typerna för svaren
    axios/               konfigurerad Axios-instans
  shared/
    components/          komponenter som används av flera moduler
    forms/               formulärkomponenter (React Hook Form)
  styles/                colors.tsx och theme.tsx för MUI-temat
  templates/             sidlayouter, t.ex. pageTemplate.tsx
En modul är ett koncept, inte en produktfunktion. Den ska gå att förstå isolerad, utan att läsaren behöver känna till någon annan modul.

components, hooks och pages är stommen. En modul får lägga till egna segment när den behöver dem — types/ för modulinterna modeller, helpers/, mocks/. Lägg till dem när de fylls, inte i förväg.

Servicelagret ligger på rotnivå, inte i modulen. Så ser det ut i Apptechs produktionsprojekt, och det passar det här repot extra bra: de flesta moduler demonstrerar något som inte har med HTTP att göra — en vy om useState har inget att hämta. Ett gemensamt services/ slipper frågan helt, i stället för att varje modul får en tom mapp.

Skapa services/ först när den första modulen faktiskt anropar något. Tomma mappar är ceremoni.

När data hämtas gäller ett envägsflöde:

page → hook → service → axiosClient → API
All HTTP går genom servicelagret, aldrig axios direkt i en komponent.
Services innehåller ingen React — bara funktioner som returnerar typad data.
Behöver en andra modul en komponent flyttas den till shared/components/. Flytta, kopiera inte.
Namngivning
Filer: camelCase — renderCounter.tsx, useRenderCount.ts, cacheService.ts
Komponenter, typer och interface: PascalCase — RenderCounter, CacheEntry
Funktioner och variabler: camelCase — const resetCounter = () => {}
Komponenter skrivs som arrow functions med namngiven export: export const RenderCounter = () => {}
App.tsx och main.tsx är Vites egna filer och behåller sina namn.
TypeScript-regler som biter
Tre inställningar i tsconfig.app.json gör att vanliga mönster inte kompilerar. Två av dem kommer från Vites react-ts-mall, inte från Apptechs kodregler — bra att veta skillnaden.

verbatimModuleSyntax — typer måste importeras med import type:

import type { CacheEntry } from '../types/cache'; // rätt
import { CacheEntry } from '../types/cache';      // byggfel
erasableSyntaxOnly — enum, namespace och parameter-properties är förbjudna. Använd union eller as const:

export const DEMO_STATES = ['idle', 'running', 'done'] as const;
export type DemoState = (typeof DEMO_STATES)[number];
noUnusedLocals / noUnusedParameters — en oanvänd variabel eller parameter stoppar bygget. Städa bort experimentkod före commit.

any är förbjudet (noImplicitAny). Saknas en typ:

Typ för ett API-svar → services/api/, bredvid anropet den hör till.
Typ som bara rör en modul — ett unions-läge för en demo, en props-typ → i modulen, nära det som använder den.
Kodstil
KISS — kod som en kollega förstår vid första genomläsningen.
DRY — upprepas något på ett tredje ställe, bryt ut det. Inte vid det första.
Svenska kommentarer. Varje funktion får en rad om vad den gör, varje workaround en rad om varför den finns. Kommentaren förklarar avsikten, den upprepar inte kodraden.
Prettier (.prettierrc) sköter formateringen: enkla citattecken, semikolon, 150 tecken per rad. Formatera on save. Formatering diskuteras aldrig i en PR.
Demonstrationskod ska visa mekanismen, inte dölja den
Det här repot har ett syfte som skiljer sig från en vanlig app: koden är poängen, inte bara medlet. En abstraktion som gör en vy kortare men gömmer det som ska demonstreras är fel väg här, även om den vore rätt i en produkt.

Datahämtning
TanStack Query hanterar all serverdata. Hämta aldrig med useEffect + useState.

Ett undantag, unikt för det här repot: en vy vars syfte är att visa vad useEffect-hämtning gör fel — dubbelanrop i StrictMode, kapplöpningar, saknad avbrytning — får använda mönstret. Sådan kod märks med en kommentar om att den är avsiktligt felaktig och vad den demonstrerar, så att den inte kopieras i god tro.

Query-nycklar skrivs i en fabrik, inte på plats
Varje modul som hämtar data får en <koncept>Keys.ts bredvid sina hookar:

export const cacheDemoKeys = {
  all: ['cacheDemo'] as const,
  lists: () => [...cacheDemoKeys.all, 'list'] as const,
  list: (page: number) => [...cacheDemoKeys.lists(), page] as const,
  byId: (id: string) => [...cacheDemoKeys.all, id] as const,
};
Mönstret kommer från Apptechs produktionsprojekt och från tkdodo-bloggen som deras kodregler länkar till.

Varför en fabrik i stället för ['cacheDemo', 'list', page] i hooken?

Nycklarna byggs ovanpå varandra, så cacheDemoKeys.all invaliderar allt modulrelaterat på en gång — utan att du behöver minnas hur de underliggande nycklarna såg ut.
En felstavad eller bortglömd parameter blir ett typfel i stället för en cache-bugg som visar fel data i tysthet.
Alla nycklar för en modul står på ett ställe och går att läsa som en lista.
queryKey ska fortfarande innehålla varje parameter som påverkar svaret — fabriken gör bara att du inte kan glömma det.

Hookarna delas i queries/ och mutations/
Läsning och skrivning skiljer sig åt: en useQuery cachar, en useMutation invaliderar. Uppdelningen gör det synligt vilken sorts hook du har framför dig.

Skapa mutations/ först när den första mutationen finns.

Design och MUI
MUI:s komponenter före egen HTML och CSS. Skapa inga nya .css-filer.
Färger i src/styles/colors.tsx, temat i src/styles/theme.tsx. Hårdkoda aldrig en hex-kod i en komponent.
Styling sker via sx-propen eller styled().
Tillgänglighet (WCAG): alt-texter på bilder, riktiga <button>-element för klick, länkar för navigering, kontrast som kommer från temat.
Miljövariabler
Aktuellt först när en modul behöver ett API.

.env.local (git-ignorerad via *.local) håller nycklar och basadresser.
Vite exponerar bara variabler som börjar med VITE_ för webbläsarkoden. En variabel utan prefix blir tyst undefined i klienten.
Variabler läses på ett enda ställe: axiosClient. En nyckel skrivs aldrig i en .ts-fil och .env.local följer aldrig med en commit.
Git-arbetsflöde
main är skyddad — allt går via Pull Request.

git checkout main && git pull
git checkout -b feature/<ticketnummer>
Commits på svenska, alla inom samma ticket
PR med Closes #<ticketnummer> i beskrivningen så att ticketen stängs vid merge
Merga och dra ticketen till Done
En PR håller sig till en ticket. Dyker något annat upp på vägen blir det en ny ticket, inte en extra fil i den här PR:en.

Dokumentation
README.md och docs/ARKITEKTUR.md skrivs när strukturen satt sig — inte innan, eftersom ett dokument om en arkitektur som ännu ändras blir inaktuellt direkt.

När de finns gäller: dokumentationen uppdateras i samma PR som ändringen, inte efteråt. Ett dokument som beskriver en arkitektur projektet vuxit ifrån är sämre än inget dokument, eftersom det läses som sanning.
