// Formulärets värden.
//
// Typen ligger bredvid formulären och inte bland anropen mot ett API: det här
// är formen på ett formulär och inte på ett svar från en server, och
// ingenting skickas någonstans.
export type ProfileFormValues = {
  name: string;
  email: string;
  role: string;
};

// Rollerna att välja mellan.
//
// En lista med as const i stället för en enum. Projektet kompilerar med
// TypeScript-inställningen erasableSyntaxOnly, som bara tillåter syntax som
// kan strykas bort när koden körs. En enum blir ett objekt i den körbara
// koden, medan as const ger samma fasta lista utan att lämna något efter sig.
export const ROLES = ['Analytiker', 'Systemarkitekt', 'Frontendutvecklare'] as const;

// Ett enkelt mönster för e-post, inte den fullständiga standarden.
//
// Standarden för e-postadresser, RFC 5322, tillåter citattecken, kommentarer
// och mycket annat som inget formulär vill hantera. Mönstret kräver minst ett
// tecken, ett @, minst ett tecken, en punkt och minst ett tecken, utan
// mellanslag. Det fångar de vanliga felen, som ett glömt @, men avvisar också
// en del ovanliga adresser som faktiskt är giltiga, till exempel en utan punkt
// efter @.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
