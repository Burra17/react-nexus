import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import MenuOutlined from '@mui/icons-material/MenuOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useColorScheme } from '@mui/material/styles';
import { Suspense, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { navItems } from '../navigation';
import { DelayedProgress } from '../shared/components/delayedProgress';
import { HashScroll } from '../shared/components/hashScroll';
import { ScrollToTop } from '../shared/components/scrollToTop';

const openWidth = 240;
const closedWidth = 64;

// Så bred innehållsytan får bli, oavsett hur bred skärmen är.
//
// Utan taket sträckte sig både text och kortrutnät över hela skärmen - 1601 px
// text vid en skärm på 1920. Kodblocken och demona får använda hela den här
// bredden; texten begränsas ytterligare av ReadableColumn.
const PAGE_WIDTH = 1200;

// Sidlayouten som varje vy delar: rubrikrad, ihopfällbar sidomeny och en yta
// där rutten renderas. Ligger i templates och inte i en modul, eftersom den
// inte hör till något enskilt koncept.
export const PageTemplate = () => {
  // På en liten skärm finns inte plats för en meny bredvid innehållet. 240 px av
  // en telefon på 375 lämnade 71 px åt vyn, vilket gav åtta tecken per textrad.
  //
  // noSsr säger åt MUI att läsa av skärmbredden direkt i stället för att anta
  // stor skärm i första rendret. Utan den skymtar den permanenta menyn förbi
  // på mobil innan den byts ut.
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'), { noSsr: true });

  // Två tillstånd, för att ordet "öppen" betyder olika saker i de två lägena.
  // På stor skärm är menyn alltid synlig och frågan är hur bred den är. På
  // liten skärm ligger den över innehållet, och frågan är om den syns alls.
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { mode, systemMode, setMode } = useColorScheme();
  const { pathname } = useLocation();

  const width = isExpanded ? openWidth : closedWidth;

  // Etiketterna göms bara när menyn är hopfälld på stor skärm. Den tillfälliga
  // menyn har alltid full bredd, så där finns ingen anledning att dölja dem.
  const showLabels = isSmallScreen || isExpanded;

  const handleMenuClick = () => {
    if (isSmallScreen) {
      setIsMobileOpen(!isMobileOpen);
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const menuLabel = isSmallScreen ? (isMobileOpen ? 'Stäng sidomenyn' : 'Öppna sidomenyn') : isExpanded ? 'Fäll ihop sidomenyn' : 'Fäll ut sidomenyn';

  // mode är 'system' tills användaren väljer själv, och undefined första
  // rendret. systemMode säger vad 'system' faktiskt landade i - utan den
  // visar knappen fel ikon för den som kör mörkt operativsystem.
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const isDark = resolvedMode === 'dark';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Utan den här följer scrollpositionen med mellan vyer: läser man halvvägs
          ner i en modul och klickar på nästa hamnar man mitt i den, utan
          sammanhang. React Router scrollar inte till toppen av sig själv.

          Den gör bara det, ingenting mer. Bakåt, framåt och ankarlänkar lämnas
          orörda - de fungerar redan, och skälen står i komponenten. Se #71. */}
      <ScrollToTop />

      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={(theme) => ({ borderBottom: 1, borderColor: 'divider', zIndex: theme.zIndex.drawer + 1 })}
      >
        <Toolbar>
          <IconButton edge="start" onClick={handleMenuClick} aria-label={menuLabel}>
            <MenuOutlined />
          </IconButton>

          {/* Appnamnet är inte sidans rubrik utan ramens. Renderas det som h1
              får varje vy två toppnivårubriker, och rubrikstrukturen slutar
              berätta vad sidan handlar om. Varje vy sätter sin egen h1. */}
          <Typography variant="h3" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            React Nexus
          </Typography>

          <Tooltip title={isDark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}>
            <IconButton onClick={() => setMode(isDark ? 'light' : 'dark')} aria-label={isDark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}>
              {isDark ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        // Tillfällig meny på liten skärm: den ligger över innehållet i stället
        // för bredvid, och tar därför ingen bredd från vyn.
        variant={isSmallScreen ? 'temporary' : 'permanent'}
        open={isSmallScreen ? isMobileOpen : true}
        onClose={() => setIsMobileOpen(false)}
        sx={(theme) => ({
          // Bara den permanenta menyn tar plats i layouten. Sätts bredden även
          // på den tillfälliga krymper innehållsytan fast menyn är stängd.
          ...(isSmallScreen ? {} : { width, flexShrink: 0 }),
          '& .MuiDrawer-paper': {
            width: isSmallScreen ? openWidth : width,
            overflowX: 'hidden',
            // Bredden animeras i stället för att hoppa. Tiderna kommer ur temat
            // så att alla övergångar i appen rör sig likadant.
            transition: theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
          },
        })}
      >
        {/* Tom Toolbar som distans: AppBar ligger fixed och täcker annars översta raden. */}
        <Toolbar />

        <List component="nav">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              // Tooltipen är inte dekoration - hopfälld meny visar bara ikoner,
              // och då är den enda kvarvarande ledtråden till vad länken gör.
              <Tooltip key={item.path} title={showLabels ? '' : item.label} placement="right">
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive}
                  // Den tillfälliga menyn täcker innehållet, så den måste stängas
                  // när man valt något. Annars ser man aldrig vad man klickade på.
                  onClick={() => setIsMobileOpen(false)}
                  // aria-current är hur en skärmläsare får veta vilken sida som
                  // är den aktuella. MUI:s selected ger bara en bakgrundsfärg.
                  aria-current={isActive ? 'page' : undefined}
                  sx={{
                    minHeight: 48,
                    // MUI:s egen markering är accentfärgen på 12 procent, cirka
                    // 1.15:1 mot vitt - en nyans, inte en markering. Kanten och
                    // den färgade ikonen ger något som syns även hopfällt.
                    borderLeft: 3,
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    '&.Mui-selected .MuiListItemIcon-root': { color: 'primary.main' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: showLabels ? 2 : 'auto', justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                  {showLabels && <ListItemText primary={item.label} />}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Drawer>

      {/* minWidth: 0 är inte kosmetik. Ett flex-barn har min-width: auto, vilket
          betyder att det vägrar bli smalare än sitt innehåll. Utan raden växer
          main förbi fönstret så fort en vy innehåller ett brett kodstycke, i
          stället för att låta kodstycket scrolla inuti sig självt. */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Toolbar />

        {/* Sidans bredd bestäms här och ingen annanstans, så att innehållets
            vänsterkant står stilla när man byter vy. Enskilda vyer bestämmer
            bara hur brett deras eget innehåll får bli inuti den här ytan. */}
        <Box sx={{ maxWidth: PAGE_WIDTH, mx: 'auto' }}>
          {/* En Suspense för hela innehållsytan, inte en per vy. Ramen står kvar
              medan vyn hämtas: sidomenyn och rubrikraden ska inte blinka bara
              för att innehållet byts ut. */}
          <Suspense fallback={<DelayedProgress />}>
            <Outlet />

            {/* Innanför gränsen, och det är hela poängen. HashScroll renderas
                först när vyn ovanför laddats klart, så dess effekt hittar den
                rubrik ett ankarhopp ska landa på. Utanför gränsen hade den
                körts medan vyn fortfarande hämtades och inte hittat något.
                Se #74. */}
            <HashScroll />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};
