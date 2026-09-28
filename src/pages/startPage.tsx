import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { appModules, type AppModule } from '../modules';
import { ReadableColumn } from '../shared/components/readableColumn';
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';

// Ett koncept som ett klickbart kort, med ikon, namn och en rad om vad det visar.
const ModuleCard = ({ module }: { module: AppModule }) => (
  <Card
    variant='outlined'
    sx={(theme) => ({
      height: '100%',
      transition: theme.transitions.create(['border-color', 'transform'], { duration: 150 }),
      '&:hover': { borderColor: 'primary.main', transform: 'translateY(-1px)' },

      // Den som bett operativsystemet om mindre rörelse får kantfärgen
      // men inget lyft. Signalen finns kvar, rörelsen försvinner.
      '@media (prefers-reduced-motion: reduce)': {
        transition: theme.transitions.create('border-color', { duration: 150 }),
        '&:hover': { transform: 'none' },
      },
    })}
  >
    <CardActionArea component={Link} to={module.path} sx={{ height: '100%' }}>
      <CardContent>
        {/* alignItems ligger i sx: MUI v9 tog bort systemprops från Stack, så
            formen <Stack alignItems="center"> från v5 kompilerar inte längre. */}
        <Stack direction='row' spacing={1.5} sx={{ mb: 1, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', color: 'primary.main' }}>{module.icon}</Box>
          <Typography variant='h3' component='h2'>
            {module.label}
          </Typography>
        </Stack>

        <Typography color='textSecondary'>{module.description}</Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

// Kartan över appen: varje koncept som ett kort.
// Listan kommer ur modules.tsx, samma källa som sidomenyn och routern läser.
export const StartPage = () => {
  // Utan argument sätts grundtiteln. Startsidan måste sätta den aktivt, inte
  // förlita sig på den som står i index.html: document.title är global, och
  // kommer man hit från en modul står modulens titel kvar annars.
  useDocumentTitle();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant='h1' gutterBottom>
          React Nexus
        </Typography>
        <ReadableColumn>
          <Typography color='textSecondary'>
            En levande lärobok om React, TypeScript och TanStack Query. Varje koncept får fyra delar: teorin bakom det, en demo att klicka på, koden
            som driver demon, och några frågor som kontrollerar att det fastnade.
          </Typography>
        </ReadableColumn>
      </Box>

      <Grid container spacing={2}>
        {appModules.map((module) => (
          <Grid key={module.path} size={{ xs: 12, sm: 6, md: 4 }}>
            <ModuleCard module={module} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};
