// Query-nycklarna för användarna i den här vyn.
//
// Varför en fabrik i stället för en handskriven array inne i hooken? Nycklarna
// byggs ovanpå varandra: details() börjar med all, och detail() börjar med
// details(). Bibliotekets funktioner som tar emot en nyckel, till exempel den
// som tar bort poster ur cachen, matchar på början av nyckeln. usersKeys.all
// träffar därför varje query i vyn på en gång, utan att du behöver minnas hur
// de underliggande nycklarna såg ut. Och en bortglömd parameter blir ett
// typfel här, i stället för en query som visar fel data i tysthet.
//
// Roten bär vyns namn och inte bara resursens, med flit. Det vanliga är att en
// nyckel bara namnger resursen, alltså ['users'], eftersom poängen med en
// cache är att samma data delas av alla som frågar efter den. Men cachen är
// gemensam för hela appen, och servicen som hämtar användarna används av
// flera vyer. Med en delad rot skulle en annan vys demo hitta data som den här
// vyn lagt i cachen, och bete sig olika beroende på vilka sidor du besökt i
// samma flik.
//
// shouldFail står i nyckeln men fördröjningen gör det inte. Regeln är att
// queryKey ska innehålla varje parameter som påverkar svaret: felflaggan ändrar
// VAD du får tillbaka, fördröjningen bara NÄR. Praktisk följd i demon: ett drag
// i latensreglaget utlöser ingen ny hämtning, för nyckeln är densamma.
//
// id får vara null. Demon börjar utan vald användare, och då finns nyckeln men
// hämtningen är avstängd. Nyckeln beskriver vilken data man skulle titta på, inte
// att någon hämtning pågår.
export const usersKeys = {
  all: ['queryBasics', 'users'] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string | null, shouldFail: boolean) => [...usersKeys.details(), id, { shouldFail }] as const,

  // Cacheklockornas demo har en egen gren, och det är inte kosmetika.
  //
  // Demon om lägena ligger kvar monterad på samma sida. Delade de två demona
  // nyckel skulle den första demons kort hålla queryn vid liv hela tiden.
  // Biblioteket kallar en komponent som tittar på en query för en observer, och
  // gcTime börjar först ticka när den sista observern är borta. Då vore det
  // omöjligt att visa vad som händer när posten städas bort, utan att något
  // förklarade varför.
  //
  // "En konsument, en nyckel" är alltså inte en stilregel här. Det är vad som
  // gör att cacheklockans utfall går att framkalla.
  clock: (id: string) => [...usersKeys.all, 'clock', id] as const,
};
