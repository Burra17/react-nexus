import { useSyncExternalStore } from 'react';
import { readRequestCount, subscribeToRequestCounts } from '../../services/mocks/handlers';

// Läser hur många anrop den mockade backenden har räknat för en demo, och ritar
// om komponenten i samma ögonblick som talet ändras.
//
// Räknaren ligger utanför React, i den mockade backenden. useSyncExternalStore
// är Reacts sätt att läsa ett sådant värde: den anmäler sig hos källan, läser
// värdet, och ritar om komponenten när källan säger att något ändrats. Samma
// mönster, och skälen till att det inte är useState plus useEffect, står i
// useRerenderOnCacheChange.ts.
export const useRequestCount = (demo: string) => useSyncExternalStore(subscribeToRequestCounts, () => readRequestCount(demo));
