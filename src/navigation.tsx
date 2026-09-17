import HomeOutlined from '@mui/icons-material/HomeOutlined';
import ScienceOutlined from '@mui/icons-material/ScienceOutlined';
import type { ReactNode } from 'react';
import { PlaceholderPage } from './shared/components/placeholderPage';

export type AppRoute = {
  path: string;
  label: string;
  icon: ReactNode;
  element: ReactNode;
};

// Routern och sidomenyn läser båda ur den här listan.
//
// Skrivs de var för sig driver de isär så fort en rutt byter adress: menyn
// pekar på den gamla, länken leder ingenstans, och inget byggfel varnar -
// en felstavad sträng är fortfarande en giltig sträng.
//
// Listan ligger i en egen fil och inte bredvid routern, eftersom pageTemplate
// behöver den. Låg den hos routern skulle routern importera mallen och mallen
// routern - en cirkel där båda filerna beror på att den andra är färdigladdad.
export const appRoutes: AppRoute[] = [
  {
    path: '/',
    label: 'Start',
    icon: <HomeOutlined />,
    element: <PlaceholderPage title="React Nexus" description="Startsidan med översikt över alla koncept byggs i #4." />,
  },
  {
    path: '/state',
    label: 'State',
    icon: <ScienceOutlined />,
    element: <PlaceholderPage title="State" description="Första konceptmodulen. Se roadmapen i #6 för ordningen." />,
  },
];
