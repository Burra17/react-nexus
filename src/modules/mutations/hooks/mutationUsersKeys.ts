// Query-nycklarna för mutationsmodulens användare.
//
// AVSTEG FRÅN CLAUDE.md, ett arv från modul 7 och 8: roten bär modulens namn
// och inte bara resursens. Servicen som hämtar användarna delas mellan
// modulerna, men nycklarna gör det inte - med en delad rot skulle den här
// modulens demo hitta data en tidigare modul lagt in, och sidan skulle bete sig
// olika beroende på i vilken ordning kapitlen lästs.

// Vilken av sidans tre demonstrationer en cachepost tillhör.
//
// Unionen ligger här och inte i en types-mapp: den finns bara för att bygga
// nycklar, och en mapp med en fil i är ceremoni.
export type MutationDemo = 'utanInvalidering' | 'medInvalidering' | 'optimistisk';

// ANDRA AVSTEGET, och det viktigare: nyckeln bär demonstrationens namn trots
// att det inte påverkar svaret.
//
// CLAUDE.md säger att queryKey ska innehålla varje parameter som påverkar
// svaret. Här står något i nyckeln som INTE gör det - alla tre demonstrationer
// hämtar samma lista från samma sökväg.
//
// Skälet är att de annars skulle dela cachepost, och då faller sidans första
// påstående. Del 1 visar en mutation utan invalidering: servern sparar, vyn
// står still. Låg den på samma nyckel som del 2 skulle del 2:s invalidering
// hämta om även del 1:s lista, och den frusna vyn skulle tina medan läsaren
// tittade på den.
//
// Samma resonemang som sharedUsersKeys i modul 8. En nyckel får bära det som
// håller två mätningar isär, så länge skälet står utskrivet.
export const mutationUsersKeys = {
  all: ['mutations', 'users'] as const,

  lists: () => [...mutationUsersKeys.all, 'list'] as const,
  list: (demo: MutationDemo) => [...mutationUsersKeys.lists(), demo] as const,
};
