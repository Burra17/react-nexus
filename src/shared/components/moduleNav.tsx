import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link, useLocation } from 'react-router-dom';
import { appModules, type AppModule } from '../../modules';

type NeighbourProps = {
  module: AppModule;
  direction: 'previous' | 'next';
};

// En granne i roadmapen: föregående eller nästa koncept, som en länk dit.
const Neighbour = ({ module, direction }: NeighbourProps) => {
  const isPrevious = direction === 'previous';

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
      <Stack direction='row' spacing={1.5} sx={{ p: 2, alignItems: 'center', justifyContent: isPrevious ? 'flex-start' : 'flex-end' }}>
        {isPrevious && <ArrowBackOutlined fontSize='small' sx={{ color: 'primary.main' }} />}

        <Box sx={{ textAlign: isPrevious ? 'left' : 'right' }}>
          <Typography variant='body2' color='textSecondary'>
            {isPrevious ? 'Förra' : 'Nästa'}
          </Typography>
          <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{module.label}</Typography>
        </Box>

        {!isPrevious && <ArrowForwardOutlined fontSize='small' sx={{ color: 'primary.main' }} />}
      </Stack>
    </Paper>
  );
};

// Vägen vidare, längst ner i en konceptvy.
//
// Utan den tar sidan bara slut efter quizen, och enda vägen vidare är att
// scrolla 4000 px upp eller gå via sidomenyn. Ordningen finns redan i
// modules.tsx. Den användes bara aldrig för att ta läsaren framåt.
//
// Etiketterna "Förra" och "Nästa" är relativa markörer, och sådana är förbjudna
// i vyernas text enligt regeln om att varje vy står på egna ben. Undantaget här
// är avsiktligt: regeln gäller förklaringen, inte vägvisningen. En läsordning är
// ett förslag, ett beroende är ett krav, och komponenten kräver ingenting av
// läsaren. Skälet står utskrivet för att knapparna annars städas bort av nästa
// person som läser regeln och ser dem som en miss.
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
