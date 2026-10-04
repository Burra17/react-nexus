// Query-nycklarna för användarna i den här vyn.
//
// Nycklarna byggs ovanpå varandra: lists() börjar med all, och list(demo)
// börjar med lists(). Bibliotekets funktioner som tar emot en nyckel, till
// exempel invalidateQueries, matchar på början av nyckeln. lists() träffar
// därför alla tre demonstrationernas listor på en gång, och all allt i vyn.
// Sidan använder bara list(demo), men nivåerna ovanför är vad som gör att en
// bredare invalidering går att skriva utan att räkna upp varje nyckel.
//
// Roten bär vyns namn och inte bara resursens. Det vanliga är att en nyckel
// bara namnger resursen, alltså ['users'], eftersom poängen med en cache är att
// samma data delas av alla som frågar efter den. Men cachen är gemensam för
// hela appen, och andra vyer hämtar också användare. Med en delad rot skulle
// den här vyns demo kunna hitta data en annan vy lagt i cachen, och bete sig
// olika beroende på vilka sidor du besökt i samma flik.

// Vilken av sidans tre demonstrationer en query tillhör.
//
// Unionen ligger här och inte i en types-mapp: den finns bara för att bygga
// nycklar, och en mapp med en fil i är ceremoni.
export type MutationDemo = 'utanInvalidering' | 'medInvalidering' | 'optimistisk';

// Nyckeln bär demonstrationens namn trots att det inte påverkar svaret.
//
// Grundregeln är att en queryKey ska innehålla varje parameter som påverkar
// svaret, så att två olika svar aldrig hamnar under samma nyckel. Här står
// något i nyckeln som INTE gör det: alla tre demonstrationer hämtar samma lista
// från samma sökväg.
//
// Skälet är att de annars skulle dela query, och då faller sidans första
// påstående. Den första demon visar en mutation utan invalidering: servern
// sparar, vyn står still. Låg den på samma nyckel som den andra demon skulle
// den andras invalidering hämta om även den förstas lista, och den frusna vyn
// skulle tina medan läsaren tittade på den.
//
// En nyckel får bära det som håller två mätningar isär, så länge skälet står
// utskrivet.
export const mutationUsersKeys = {
  all: ['mutations', 'users'] as const,

  lists: () => [...mutationUsersKeys.all, 'list'] as const,
  list: (demo: MutationDemo) => [...mutationUsersKeys.lists(), demo] as const,
};
