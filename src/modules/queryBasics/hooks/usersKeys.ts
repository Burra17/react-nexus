// Query-nycklarna för användarresursen.
//
// Varför en fabrik i stället för en handskriven array inne i hooken? Nycklarna
// byggs ovanpå varandra, så usersKeys.all träffar allt som hör till resursen på
// en gång - utan att du behöver minnas hur de underliggande nycklarna såg ut.
// Och en bortglömd parameter blir ett typfel här, i stället för en cache-bugg
// som visar fel data i tysthet.
//
// AVSTEG FRÅN CLAUDE.md: roten bär modulens namn, inte bara resursens.
//
// Användarresursen delas av modul 7, 8 och 9, och servicen som hämtar den är
// gemensam. Nyckeln är det däremot inte. Med en delad rot skulle den ena
// modulens demo lägga data i cachen som den andra modulens demo sedan hittar,
// och cachedemon där skulle bete sig olika beroende på om du besökt den här
// sidan först i samma flik. En lärobok där sidan svarar olika beroende på i
// vilken ordning du läst kapitlen är trasig.
//
// shouldFail står i nyckeln men fördröjningen gör det inte. Regeln är att
// queryKey ska innehålla varje parameter som påverkar svaret: felflaggan ändrar
// VAD du får tillbaka, fördröjningen bara NÄR. Praktisk följd i demon nedan: ett
// drag i latensreglaget utlöser ingen ny hämtning, för nyckeln är densamma.
// id får vara null. Demon börjar utan vald användare, och då finns nyckeln men
// hämtningen är pausad - nyckeln beskriver vilken data man skulle titta på, inte
// att någon hämtning pågår.
export const usersKeys = {
  all: ['queryBasics', 'users'] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string | null, shouldFail: boolean) => [...usersKeys.details(), id, { shouldFail }] as const,

  // Cacheklockornas demo har en egen gren, och det är inte kosmetika.
  //
  // Demon om lägena ligger kvar monterad på samma sida. Delade de två nyckel
  // skulle den förstas observer hålla cacheposten aktiv hela tiden - och gcTime
  // börjar först ticka när ingen längre tittar. Då vore det omöjligt att visa
  // vad som händer när posten städas bort, utan att något förklarade varför.
  //
  // "En konsument, en nyckel" är alltså inte en stilregel här. Det är vad som
  // gör att demon nedan går att framkalla.
  clock: (id: string) => [...usersKeys.all, 'clock', id] as const,
};
