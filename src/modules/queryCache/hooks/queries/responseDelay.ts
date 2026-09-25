// Svarstiden som modulens hämtningar körs med.
//
// Den behövs bara för att laddningsläget ska hinna synas - modulen handlar om
// vem som delar ett svar, inte om hur lång tid svaret tar. Värdet står här och
// inte i varje hook: det förekom i tre hookar, och CLAUDE.md bryter ut vid den
// tredje förekomsten.
export const RESPONSE_DELAY_MS = 700;
