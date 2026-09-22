import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

// Så bred en textrad får vara.
//
// ch är bredden på siffran noll i det aktuella typsnittet, och den är bredare
// än genomsnittstecknet i svensk prosa - som är full av mellanslag, kommatecken
// och i:n. Ett ch-värde ger därför fler faktiska tecken än siffran antyder:
// 58ch mäter upp till 73-76 tecken per rad vid 1920 px, beroende på vilken vy
// som mäts.
//
// Siffran är räknad, inte uppskattad. Radbrytningarna lästes med Range över
// textnoden, ett tecken i taget: när getBoundingClientRect().top ändras har en
// ny rad börjat. Den förra metoden delade spaltens bredd med medelbredden på
// a-z, vilket överskattar teckenbredden och gav 83 där sanningen var 95. Se #41.
const MAX_LINE_LENGTH = '58ch';

// Begränsar textens radlängd, utan att röra bredden på det som står omkring.
//
// Utan den blir en textrad 157 tecken, eftersom sidans innehållsyta är 1200 px
// bred. Då tappar ögat raden på vägen från ett radslut till nästa radbörjan, och
// man läser om samma rad utan att märka det. 45-75 tecken är det vanliga
// spannet; shadcn/ui ligger på 66, uppmätt i #41 med metoden ovan.
//
// Spalten är vänsterställd i sidans behållare och centreras inte för sig.
// Centrerades den skulle dess vänsterkant hamna drygt 300 px in, medan
// kodblocken började vid behållarens kant - två olika vänsterkanter i samma vy.
export const ReadableColumn = ({ children }: { children: ReactNode }) => <Box sx={{ maxWidth: MAX_LINE_LENGTH }}>{children}</Box>;
