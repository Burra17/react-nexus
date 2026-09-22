// Alla nycklar appen lagrar under, på ett ställe.
//
// Skrivs en nyckel som sträng där den används hamnar samma sträng förr eller
// senare i två filer. Då räcker det att en av dem stavas om för att data ska
// försvinna utan att något varnar - läsningen hittar inget och returnerar
// standardvärdet, precis som om användaren aldrig hade sparat något.
//
// Prefixet finns för att localStorage delas av allt som ligger på samma origin.
// Under utveckling är det localhost, där andra projekt kan ha lagrat sitt eget.
export const storageKeys = {
  quiz: 'nexus.quiz',
} as const;
