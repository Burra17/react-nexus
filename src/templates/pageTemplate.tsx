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
import { useColorScheme } from '@mui/material/styles';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { appRoutes } from '../navigation';

const openWidth = 240;
const closedWidth = 64;

// Sidlayouten som varje vy delar: rubrikrad, ihopfällbar sidomeny och en yta
// där rutten renderas. Ligger i templates och inte i en modul, eftersom den
// inte hör till något enskilt koncept.
export const PageTemplate = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { mode, systemMode, setMode } = useColorScheme();
  const { pathname } = useLocation();

  const width = isOpen ? openWidth : closedWidth;

  // mode är 'system' tills användaren väljer själv, och undefined första
  // rendret. systemMode säger vad 'system' faktiskt landade i - utan den
  // visar knappen fel ikon för den som kör mörkt operativsystem.
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const isDark = resolvedMode === 'dark';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={(theme) => ({ borderBottom: 1, borderColor: 'divider', zIndex: theme.zIndex.drawer + 1 })}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Fäll ihop sidomenyn' : 'Fäll ut sidomenyn'}>
            <MenuOutlined />
          </IconButton>

          <Typography variant="h3" component="h1" sx={{ flexGrow: 1, ml: 2 }}>
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
        variant="permanent"
        sx={(theme) => ({
          width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width,
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
          {appRoutes.map((route) => {
            const isActive = pathname === route.path;

            return (
              // Tooltipen är inte dekoration - hopfälld meny visar bara ikoner,
              // och då är den enda kvarvarande ledtråden till vad länken gör.
              <Tooltip key={route.path} title={isOpen ? '' : route.label} placement="right">
                <ListItemButton
                  component={Link}
                  to={route.path}
                  selected={isActive}
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
                  <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 2 : 'auto', justifyContent: 'center' }}>{route.icon}</ListItemIcon>
                  {isOpen && <ListItemText primary={route.label} />}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
