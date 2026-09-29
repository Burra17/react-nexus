// Svarstiden som den här vyns hämtningar körs med.
//
// Den behövs bara för att laddningsläget ska hinna synas. Vyn handlar om vem
// som delar ett svar, inte om hur lång tid svaret tar. Värdet står i en egen
// fil och inte i varje hook: det förekom på tre ställen, och då bryts det ut.
export const RESPONSE_DELAY_MS = 700;
