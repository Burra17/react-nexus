import { QueryClient } from '@tanstack/react-query';

// Appens QueryClient, med bibliotekets standardvärden orörda.
//
// Det är ett medvetet val och inte något vi glömt. Sätts staleTime eller retry
// globalt här blir de osynlig magi: läsaren som kopierar en hook härifrån till
// ett annat projekt får ett annat beteende än hon såg på sidan, utan att något
// i hooken avslöjar varför.
//
// Allt som är en del av en lektion sätts därför per query, där det syns i
// Kod-delen bredvid det som påverkas.
export const queryClient = new QueryClient();
