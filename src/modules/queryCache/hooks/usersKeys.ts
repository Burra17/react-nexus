// Query-nycklarna för användarresursen i den här modulen.
//
// Fabriken har fyra nivåer, och det är först här de gör nytta. Nycklarna byggs
// ovanpå varandra, så usersKeys.all är ett prefix som träffar allt under
// resursen medan usersKeys.lists() bara träffar listorna. Invalidering arbetar
// med just prefix, vilket betyder att den här filen avgör vad som går att
// invalidera var för sig, och det är modulens huvudnummer.
//
// En handskriven array i varje hook hade fungerat lika bra tills den dagen någon
// stavade fel. Då blir det en cachepost som tyst visar fel data i stället för ett
// typfel här.
//
// Roten bär vyns namn och inte bara resursens. Det vanliga är att en nyckelrot
// bara namnger resursen, alltså ['users'], eftersom poängen med en cache är att
// samma data delas av alla som frågar efter den. Här görs tvärtom, med flit.
//
// Servicen som hämtar användare delas mellan vyerna, men nycklarna gör det inte:
// med en delad rot skulle den här vyns demo hitta data som en annan vy lagt in,
// och sidan skulle bete sig olika beroende på i vilken ordning kapitlen lästs.
// Samma val är gjort i vyn Query: grunder.
//
// Att modulernas poster ändå syns bredvid varandra i inspektorn nedan är inte
// en motsägelse. Det är hela poängen. De delar cache, men inte nycklar.
export const usersKeys = {
  all: ['queryCache', 'users'] as const,

  lists: () => [...usersKeys.all, 'list'] as const,

  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

// Mönstret har ofta ett steg till: list(page) under lists(), för att en resurs
// vanligen hämtas med filter eller sidnummer. Den nivån finns inte här,
// eftersom listan varken filtreras eller pagineras, och ett steg som alltid
// ser likadant ut är en nivå som låtsas vara en nyckel.

// Delningsdemons egen fabrik, medvetet UTANFÖR usersKeys.all.
//
// Att det blev en fabrik och inte en naken array är ingen slump: query-nycklar
// skrivs i en fabrik och inte på plats, och en vy med två uppsättningar nycklar
// får två fabriker. Den här har bara två nivåer, eftersom demon bara hämtar en
// sak.
//
// Demonstrationen om invalidering längre ner hämtar listan så fort sidan
// öppnas. Delade de två nyckel skulle posten redan ligga i cachen när man
// monterar de fyra korten, och räknaren skulle stå stilla på noll i stället för
// att gå upp med ett. Påståendet "fyra konsumenter, ett anrop" vore omöjligt
// att visa.
//
// Att den ligger utanför roten är lika viktigt: annars hade knappen som
// invaliderar allt under resursen även hämtat om korten, och då mäter man två
// saker samtidigt.
export const sharedUsersKeys = {
  all: ['queryCache', 'delning'] as const,

  list: () => [...sharedUsersKeys.all, 'users'] as const,
};
