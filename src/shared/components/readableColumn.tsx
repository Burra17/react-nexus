import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

// Så bred en textrad får vara.
//
// ch är bredden på siffran noll i det aktuella typsnittet, vilket landar strax
// över medelteckenbredden. 70ch ger därför ungefär 75-80 faktiska tecken.
const MAX_LINE_LENGTH = '70ch';

// Begränsar textens radlängd, utan att röra bredden på det som står omkring.
//
// Före den här komponenten var en textrad 187 tecken vid en skärm på 1920 px.
// Vid den bredden tappar ögat raden på vägen från ett radslut till nästa
// radbörjan, och man läser om samma rad utan att märka det. 45-75 tecken är
// det vanliga spannet; shadcn och TanStack ligger båda på 82.
//
// Spalten är vänsterställd i sidans behållare och centreras inte för sig.
// Centrerades den skulle dess vänsterkant hamna 275 px in, medan kodblocken
// började vid behållarens kant - två olika vänsterkanter i samma vy.
export const ReadableColumn = ({ children }: { children: ReactNode }) => <Box sx={{ maxWidth: MAX_LINE_LENGTH }}>{children}</Box>;
