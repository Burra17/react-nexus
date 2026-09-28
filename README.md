# React Nexus

[![CI](https://github.com/Burra17/react-nexus/actions/workflows/ci.yml/badge.svg)](https://github.com/Burra17/react-nexus/actions/workflows/ci.yml)

En levande lärobok och ett interaktivt kodlabb om React, TypeScript, TanStack Query och Material UI.

Varje vy förklarar ett koncept och visar det i arbete: hur state uppdateras, vad som utlöser en omrendering, hur TanStack Query cachar ett svar. Målet är att förstå mekanismen och varför den spelar roll, inte att leverera en produkt.

**Live:** [react-nexus.vercel.app](https://react-nexus.vercel.app)

## Innehåll

- [Modulerna](#modulerna)
- [Tech stack](#tech-stack)
- [Kom igång](#kom-igång)
- [Kommandon](#kommandon)
- [Struktur](#struktur)
- [Bidra](#bidra)

## Modulerna

Elva koncept, i den ordning de är tänkta att läsas. Varje modul står ändå på egna ben och går att läsa för sig.

| #   | Modul          | Handlar om                                                                   |
| --- | -------------- | ---------------------------------------------------------------------------- |
| 1   | State          | `useState`, batchning och funktionell uppdatering, state som ögonblicksbild  |
| 2   | Rendering      | Vad som utlöser en omrendering, renderräknare och referenslikhet             |
| 3   | Effects        | `useEffect`, beroendelistan, cleanup och StrictModes dubbelkörning           |
| 4   | TypeScript     | `import type`, union i stället för enum, narrowing                           |
| 5   | Context        | Context och varför den renderar om mer än man tror                           |
| 6   | Performance    | Mät innan du optimerar: när `useMemo` och `React.memo` hjälper, och när inte |
| 7   | Query: grunder | `useQuery`, laddning och fel, `queryKey`, `staleTime` mot `gcTime`           |
| 8   | Query: cache   | Dedupering av anrop, invalidering och refetch                                |
| 9   | Mutations      | `useMutation`, invalidering av nycklar och optimistisk uppdatering           |
| 10  | Forms          | React Hook Form, kontrollerade mot okontrollerade fält, validering           |
| 11  | Arkitektur     | Repots egen struktur och flödet från vy till API                             |

### Varje modul har fyra delar

Alla konceptvyer är byggda på samma mall, i samma ordning:

1. **Teori.** Vad konceptet är och varför man använder det.
2. **Demo.** Den interaktiva delen, där man klickar och ser mekanismen hända.
3. **Kod.** Källkoden som driver demon. Den läses ur den riktiga filen med Vites `?raw`, så det som visas är samma kod som körs.
4. **Quiz.** Några frågor som kontrollerar att konceptet fastnade. Svaret låses när det väljs, och facit förklarar varje alternativ.

Ordningen är fast, så att läsaren vet var teorin står utan att leta.

## Tech stack

| Område         | Verktyg                 |
| -------------- | ----------------------- |
| Ramverk        | React 19, TypeScript 6  |
| Bygge          | Vite 8                  |
| Serverdata     | TanStack Query 5, Axios |
| Gränssnitt     | Material UI 9           |
| Formulär       | React Hook Form 7       |
| Routing        | React Router 7          |
| Mockat API     | MSW 2                   |
| Kodvisning     | Shiki 4                 |
| Kodkvalitet    | ESLint 10, Prettier 3   |
| CI och hosting | GitHub Actions, Vercel  |

## Kom igång

### Förutsättningar

- **Node 20.** Exakt version står i `.nvmrc`. Med nvm räcker `nvm use`.
- **Yarn 1.** Projektet använder yarn och har en `yarn.lock`. Kör inte `npm install`: då skapas en `package-lock.json` bredvid, och två lockfiler kan ge olika versioner av samma paket.

### Installera och starta

```bash
git clone https://github.com/Burra17/react-nexus.git
cd react-nexus
yarn install
yarn dev
```

Öppna adressen Vite skriver ut, normalt [localhost:5173](http://localhost:5173).

### Inget API behövs

Datan i modulerna kommer från [MSW](https://mswjs.io), som fångar anropen i webbläsaren med en service worker och svarar med mockad data. Mocken startas i alla lägen, även i produktionsbygget, eftersom den är appens datakälla och inte en ersättning för en backend under utveckling. Det finns alltså ingen server att starta och inga miljövariabler att sätta.

## Kommandon

| Kommando            | Vad det gör                                                    |
| ------------------- | -------------------------------------------------------------- |
| `yarn dev`          | Startar utvecklingsservern                                     |
| `yarn build`        | Typkontrollerar med `tsc -b` och bygger för produktion         |
| `yarn preview`      | Serverar produktionsbygget lokalt                              |
| `yarn lint`         | Kör ESLint. En varning räknas som ett fel (`--max-warnings=0`) |
| `yarn format`       | Formaterar om alla filer med Prettier                          |
| `yarn format:check` | Kontrollerar formateringen utan att ändra något                |

CI kör `yarn format:check`, `yarn lint` och `yarn build` på varje pull request. Kör dem lokalt innan du pushar. Att `yarn dev` startar betyder inte att koden kompilerar: typfelen syns först i `yarn build`.

## Struktur

```text
src/
  modules/<koncept>/   en modul per koncept: components, hooks, pages
  pages/               appens egna sidor: startsidan och 404
  services/            infrastruktur: API-anrop, Axios, mockar och lagring
  shared/              komponenter och hookar som flera moduler använder
  styles/              färger och MUI-tema
  templates/           sidlayouten och mallen för en konceptvy

  modules.tsx          katalogen över modulerna
  lazyPages.ts         lazy-laddningen av varje konceptvy
  navigation.tsx       det som går att navigera till
  router.tsx           routern, byggd ur navigation
```

Varje mapp i `modules/` är ett koncept, inte en produktfunktion, och ska gå att förstå utan att läsaren känner till någon annan modul.

När en vy hämtar data går anropet alltid samma väg:

```text
page → hook → service → axiosClient → API
```

Varför strukturen ser ut så, och var den avviker från sina egna regler, är vad [Modul 11: Arkitektur](https://react-nexus.vercel.app/architecture) handlar om. Den läser de riktiga källfilerna, så förklaringen kan inte hamna i otakt med koden.

## Bidra

Arbetet styrs av [GitHub-issues](https://github.com/Burra17/react-nexus/issues). `main` är skyddad och allt går via pull request.

1. Skapa en branch från `main`: `feature/<ticketnummer>`
2. Skriv commits på svenska
3. Öppna en PR med `Closes #<ticketnummer>` i beskrivningen
4. CI-checken måste vara grön innan PR:en kan mergas

En PR håller sig till en ticket. Dyker något annat upp på vägen blir det en ny ticket.

Kodreglerna, namngivningen och TypeScript-inställningarna som ger byggfel står i [CLAUDE.md](CLAUDE.md).
