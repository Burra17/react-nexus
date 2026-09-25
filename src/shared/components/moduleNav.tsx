import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link, useLocation } from 'react-router-dom';
import { appModules, isBuilt, type AppModule } from '../../modules';

type NeighbourProps = {
  module: AppModule;
  direction: 'previous' | 'next';
};

// En granne i roadmapen: föregående eller nästa koncept.
//
// Byggd blir ett kort man kan klicka på. Planerad blir ett kort som talar om att
// den finns men inte går att öppna än - aldrig en länk. Nio av elva moduler är
// planerade, så en naiv länk hade lett rakt in i 404-vyn från #49 i nästan alla
// fall.
const Neighbour = ({ module, direction }: NeighbourProps) => {
  const built = isBuilt(module);
  const isPrevious = direction === 'previous';

  const content = (
    <Stack direction='row' spacing={1.5} sx={{ p: 2, alignItems: 'center', justifyContent: isPrevious ? 'flex-start' : 'flex-end' }}>
      {isPrevious && <ArrowBackOutlined fontSize='small' sx={{ color: built ? 'primary.main' : 'text.disabled' }} />}

      <Box sx={{ textAlign: isPrevious ? 'left' : 'right' }}>
        <Typography variant='body2' color='textSecondary'>
          {isPrevious ? 'Förra' : 'Nästa'}
        </Typography>

        <Typography sx={{ fontWeight: 600, color: built ? 'text.primary' : 'text.secondary' }}>{module.label}</Typography>

        {/* Statusen står som text, inte bara som nedtonad färg och streckad
            kant. Samma regel som startsidans kort följer. */}
        {!built && (
          <Typography variant='body2' color='textSecondary'>
            Kommer snart
          </Typography>
        )}
      </Box>

      {!isPrevious && <ArrowForwardOutlined fontSize='small' sx={{ color: built ? 'primary.main' : 'text.disabled' }} />}
    </Stack>
  );

  if (!built) {
    // Inget Link, ingen tabIndex, ingen hover. Kortet ska inte kunna nås med
    // tangentbord heller - det finns ingenstans att ta vägen.
    return (
      <Paper variant='outlined' sx={{ flex: 1, borderStyle: 'dashed' }}>
        {content}
      </Paper>
    );
  }

  return (
    <Paper
      variant='outlined'
      component={Link}
      to={module.path}
      aria-label={`${isPrevious ? 'Förra' : 'Nästa'} koncept: ${module.label}`}
      sx={(theme) => ({
        flex: 1,
        display: 'block',
        textDecoration: 'none',
        transition: theme.transitions.create('border-color', { duration: 150 }),
        '&:hover': { borderColor: 'primary.main' },
      })}
    >
      {content}
    </Paper>
  );
};

// Vägen vidare, längst ner i en konceptvy.
//
// Utan den tar sidan bara slut efter quizen, och enda vägen vidare är att
// scrolla 4000 px upp eller gå via sidomenyn. En lärobok läses i ordning, och
// ordningen finns redan i modules.tsx - den användes bara aldrig för att ta
// läsaren framåt.
export const ModuleNav = () => {
  const { pathname } = useLocation();
  const index = appModules.findIndex((module) => module.path === pathname);

  // Adressen hör inte till någon modul. Kan inte hända i en konceptvy, men gör
  // komponenten harmlös om den hamnar någon annanstans.
  if (index === -1) {
    return null;
  }

  const previous = appModules[index - 1];
  const next = appModules[index + 1];

  if (previous === undefined && next === undefined) {
    return null;
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} component='nav' aria-label='Föregående och nästa koncept'>
      {/* Saknas en granne lämnas platsen tom i stället för att den andra
          sträcks ut. Då ligger "Nästa" kvar till höger på /state, där det
          inte finns någon föregående modul. */}
      {previous ? <Neighbour module={previous} direction='previous' /> : <Box sx={{ flex: 1 }} />}
      {next ? <Neighbour module={next} direction='next' /> : <Box sx={{ flex: 1 }} />}
    </Stack>
  );
};
