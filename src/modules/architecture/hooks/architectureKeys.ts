// Query-nycklarna för arkitekturmodulens spårning.
//
// Nyckelfabriken: objektet som bygger alla nycklar för modulen på ett ställe.
//
// Roten bär modulens namn, precis som i modulerna queryBasics, queryCache och
// mutations. Det är just det avsteget som det fjärde kortet i demon tar upp.
// Fabriken är alltså både verktyg och exempel.
//
// Demon behöver en egen nyckel för att dess post i cachen inte ska blandas ihop
// med en annan vys. Med samma nyckel hade demon visat ett svar som en annan vy
// redan hämtat, innan läsaren tryckt på något.
export const architectureKeys = {
  all: ['architecture'] as const,

  trace: () => [...architectureKeys.all, 'trace'] as const,
};
