CLAUDE.md
React Nexus — ett interaktivt kodlabb och en playground där React, TypeScript, TanStack Query, Material UI och arkitektur demonstreras visuellt i stället för att antecknas.

Varje vy ska visa ett koncept i arbete: hur state uppdateras, hur en omrendering utlöses, hur TanStack Query cachar ett svar. Målet är att förstå mekanismen, inte att leverera en produkt.

Arkitekturen är densamma som i systerprojektet Movie App (Övningsprojekt A). Mönstren är beprövade där och kan slås upp i dess docs/ARKITEKTUR.md.

Pedagogiskt läge
Det här repot är ett inlärningsprojekt. Målet är att koden ska förstås, inte att den ska bli klar fort.

Förklara varför före hur. Motivera arkitekturvalet innan du visar koden.
Bygg en avgränsad sak i taget och lämna över. Leverera inte fem filer när ticketen handlar om en.
Skriv kod som går att skriva själv nästa gång. Inga smarta one-liners, inga nya bibliotek utan att fråga först.
Svara på svenska.
Finns flera rimliga vägar: ge en rekommendation med ett kort skäl, inte en katalog över alternativ.
Kommandon
Pakethanteraren är yarn. Ett npm install skapar en package-lock.json som krockar med yarn.lock — det har redan hänt en gång i Movie App.

yarn build kör tsc -b före Vite-bygget och är den riktiga kvalitetsgrinden: TypeScript-reglerna nedan ger byggfel, inte varningar. Kör den innan varje PR. Att yarn dev startar utan att klaga betyder inte att koden kompilerar.

Arkitektur
src/
  modules/<koncept>/     en demonstration, t.ex. rendering, queryCache, forms
    components/          komponenter som bara används i den här modulen
    hooks/               egna hookar och TanStack Query-hookar
    pages/               vyn som routern pekar på
    services/            API-anrop — bara i moduler som faktiskt hämtar data
    types/               modeller för svaren
  shared/
    api/axiosClient.ts   skapas först när något behöver HTTP
    components/          komponenter som används av flera moduler
    forms/               formulärkomponenter (React Hook Form)
  styles/                colors.tsx och theme.tsx för MUI-temat
  templates/             sidlayouter, t.ex. pageTemplate.tsx
En modul är ett koncept, inte en produktfunktion. Den ska gå att förstå isolerad, utan att läsaren behöver känna till någon annan modul.

Skillnaden mot Movie App: där hade varje modul en service, eftersom allt kom från ett API. Här har de flesta moduler ingen HTTP alls — en vy som demonstrerar useState har inget att hämta. Regeln är därför:

All HTTP går genom en service, aldrig axios direkt i en komponent.
Men varje modul behöver ingen service. Skapa services/ först när modulen faktiskt anropar något. Tomma mappar är ceremoni.
När data hämtas gäller samma envägsflöde som i Movie App:

page → hook → service → axiosClient → API
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

any är förbjudet (noImplicitAny). Saknas en typ: skriv den i modulens types/-mapp.

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

queryKey beskriver anropet och alla dess parametrar.

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
