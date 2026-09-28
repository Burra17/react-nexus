// Query-nycklarna för arkitekturmodulens spårning.
//
// Roten bär modulens namn, precis som i modul 7, 8 och 9. Det är just det
// avsteget den här modulen tar upp som sitt fjärde exempel. Fabriken är alltså
// både verktyg och lektionsmaterial.
//
// Egen gren behövs av ett handfast skäl: demon ska kunna visa ett anrop som
// vandrar genom fyra lager. Delade den nyckel med en tidigare modul skulle
// posten redan ligga i cachen, svaret komma direkt, och de fyra stegen aldrig
// inträffa.
export const architectureKeys = {
  all: ['architecture'] as const,

  trace: () => [...architectureKeys.all, 'trace'] as const,
};
