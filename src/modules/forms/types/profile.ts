// Formulärets värden.
//
// Typen ligger i modulen och inte i services/api/: det här är inte formen på
// ett API-svar utan på ett formulär, och ingenting skickas någonstans. Den
// liknar User från modul 7 med flit, så att läsaren känner igen sig, men den
// är en egen typ, eftersom ett formulär och ett svar sällan har samma fält
// särskilt länge.
export type ProfileFormValues = {
  name: string;
  email: string;
  role: string;
};

// Rollerna att välja mellan.
//
// as const och inte enum: enum är förbjudet i repot, eftersom
// erasableSyntaxOnly är påslaget i tsconfig.app.json. Mönstret är detsamma som
// i modul 4.
export const ROLES = ['Analytiker', 'Systemarkitekt', 'Frontendutvecklare'] as const;

// Ett mönster för e-post, och det är med flit inte det "riktiga".
//
// Den fullständiga grammatiken för en e-postadress är ökänd. RFC 5322 tillåter
// citattecken, kommentarer och mycket annat som inget formulär vill hantera.
// Ett mönster som kräver ett tecken, ett @, ett tecken, en punkt och ett tecken
// fångar de fel som verkligen görs, och avvisar ingen som har en giltig adress.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
