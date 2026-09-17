import HomeOutlined from '@mui/icons-material/HomeOutlined';
import type { ReactNode } from 'react';
import { appModules, isBuilt } from './modules';
import { StartPage } from './pages/startPage';

export type NavItem = {
  path: string;
  label: string;
  icon: ReactNode;
  element: ReactNode;
};

// Det som går att navigera till: startsidan plus de moduler som är byggda.
//
// En planerad modul får ingen rutt alls. Därför kan ingen länk leda till en
// tom sida - adressen finns helt enkelt inte förrän vyn gör det.
//
// Routern och sidomenyn läser båda härifrån. Skrivs de var för sig driver de
// isär så fort en adress ändras, och inget byggfel varnar - en felstavad
// sträng är fortfarande en giltig sträng.
//
// Listan ligger i en egen fil och inte hos routern. Låg den där skulle routern
// importera pageTemplate och pageTemplate routern, en cirkel där båda filerna
// beror på att den andra är färdigladdad.
export const navItems: NavItem[] = [
  { path: '/', label: 'Start', icon: <HomeOutlined />, element: <StartPage /> },
  ...appModules.filter(isBuilt).map(({ path, label, icon, element }) => ({ path, label, icon, element })),
];
