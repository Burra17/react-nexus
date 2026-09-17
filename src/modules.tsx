import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import CloudDownloadOutlined from '@mui/icons-material/CloudDownloadOutlined';
import CodeOutlined from '@mui/icons-material/CodeOutlined';
import EditNoteOutlined from '@mui/icons-material/EditNoteOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import SchemaOutlined from '@mui/icons-material/SchemaOutlined';
import SpeedOutlined from '@mui/icons-material/SpeedOutlined';
import StorageOutlined from '@mui/icons-material/StorageOutlined';
import ToggleOnOutlined from '@mui/icons-material/ToggleOnOutlined';
import type { ReactNode } from 'react';
import { StatePage } from './modules/state/pages/statePage';

export type AppModule = {
  path: string;
  label: string;
  description: string;
  icon: ReactNode;
  // Saknas tills modulen är byggd. Det är element som avgör om modulen finns,
  // inte ett fält som någon kommer ihåg att uppdatera.
  element?: ReactNode;
};

// Status räknas fram ur om modulen har en vy.
//
// Alternativet vore ett status-fält vid sidan av element. Då kan de säga emot
// varandra: 'klar' på en modul utan sida, eller tvärtom. Ett värde som räknas
// fram ur sanningen kan inte hamna i otakt med den.
export const isBuilt = (module: AppModule) => module.element !== undefined;

// Katalogen över konceptmodulerna, i den ordning de byggs. Se roadmapen i #6.
// Startsidan läser hela listan, sidomenyn bara de byggda.
export const appModules: AppModule[] = [
  {
    path: '/state',
    label: 'State',
    description: 'useState, batchning och funktionell uppdatering: varför state är en ögonblicksbild och inte en variabel.',
    icon: <ToggleOnOutlined />,
    element: <StatePage />,
  },
  {
    path: '/rendering',
    label: 'Rendering',
    description: 'Vad som faktiskt utlöser en omrendering, med renderräknare per komponent och referenslikhet.',
    icon: <RefreshOutlined />,
  },
  {
    path: '/effects',
    label: 'Effects',
    description: 'useEffect, beroendelistan, cleanup och varför StrictMode kör den två gånger.',
    icon: <BoltOutlined />,
  },
  {
    path: '/typescript',
    label: 'TypeScript',
    description: 'import type, union i stället för enum, generics och narrowing.',
    icon: <CodeOutlined />,
  },
  {
    path: '/context',
    label: 'Context',
    description: 'Context och varför den renderar om mer än du tror.',
    icon: <AccountTreeOutlined />,
  },
  {
    path: '/performance',
    label: 'Performance',
    description: 'useMemo, useCallback och React.memo: när de hjälper och när de bara kostar.',
    icon: <SpeedOutlined />,
  },
  {
    path: '/query-basics',
    label: 'Query: grunder',
    description: 'useQuery, laddning och fel, queryKey samt skillnaden mellan staleTime och gcTime.',
    icon: <CloudDownloadOutlined />,
  },
  {
    path: '/query-cache',
    label: 'Query: cache',
    description: 'Cacheinspektor, dedupering av anrop, invalidering och refetch.',
    icon: <StorageOutlined />,
  },
  {
    path: '/mutations',
    label: 'Mutations',
    description: 'useMutation, invalidering av nycklar och optimistisk uppdatering.',
    icon: <EditNoteOutlined />,
  },
  {
    path: '/forms',
    label: 'Forms',
    description: 'React Hook Form, kontrollerad mot okontrollerad och validering.',
    icon: <ListAltOutlined />,
  },
  {
    path: '/architecture',
    label: 'Arkitektur',
    description: 'Repots egen struktur och flödet page → hook → service → axiosClient → API.',
    icon: <SchemaOutlined />,
  },
];
