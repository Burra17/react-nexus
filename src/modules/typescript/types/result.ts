// Ett svar som kan vara i tre lägen, med olika fält i varje läge: bara error har
// message, bara done har data.
//
// Formen kallas diskriminerad union. Diskriminanten är status - fältet som finns i
// alla tre varianterna och har ett eget fast värde i var och en. Det är det fältet
// TypeScript läser för att avgöra vilken variant du håller i just nu.
export type Result = { status: 'loading' } | { status: 'error'; message: string } | { status: 'done'; data: string[] };
