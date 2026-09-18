import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { appModules, isBuilt, type AppModule } from '../modules';
import { ReadableColumn } from '../shared/components/readableColumn';

// Kortets innehåll är detsamma vare sig modulen går att klicka på eller inte.
// Bara skalet runt omkring skiljer, så innehållet skrivs en gång.
const ModuleCardContent = ({ module }: { module: AppModule }) => {
  const built = isBuilt(module);

  return (
    <CardContent>
      {/* alignItems ligger i sx: MUI v9 tog bort systemprops från Stack, så
          formen <Stack alignItems="center"> från v5 kompilerar inte längre. */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 1, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', color: built ? 'primary.main' : 'text.secondary' }}>{module.icon}</Box>
        <Typography variant="h3" component="h2">
          {module.label}
        </Typography>
      </Stack>

      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {module.description}
      </Typography>

      {/* Statusen står som text och inte bara som färg - en markering som bara
          syns på färgen når inte den som inte ser skillnaden. */}
      <Chip size="small" label={built ? 'Klar' : 'Planerad'} color={built ? 'primary' : 'default'} variant={built ? 'filled' : 'outlined'} />
    </CardContent>
  );
};

// Kartan över appen: varje koncept som ett kort, byggda som planerade.
// Listan kommer ur modules.tsx, samma källa som sidomenyn och routern läser.
export const StartPage = () => (
  <Stack spacing={3}>
    <Box>
      <Typography variant="h1" gutterBottom>
        React Nexus
      </Typography>
      <ReadableColumn>
        <Typography color="text.secondary">
          En levande lärobok om React, TypeScript och TanStack Query. Varje koncept får tre delar: teorin bakom det, en demo att klicka på, och koden
          som driver demon. De planerade korten går ännu inte att öppna.
        </Typography>
      </ReadableColumn>
    </Box>

    <Grid container spacing={2}>
      {appModules.map((module) => (
        <Grid key={module.path} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              // Streckad kant på det som inte är byggt. En signal till som inte
              // är färg, för den som inte uppfattar skillnaden mellan chiparna.
              borderStyle: isBuilt(module) ? 'solid' : 'dashed',
            }}
          >
            {isBuilt(module) ? (
              <CardActionArea component={Link} to={module.path} sx={{ height: '100%' }}>
                <ModuleCardContent module={module} />
              </CardActionArea>
            ) : (
              <ModuleCardContent module={module} />
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  </Stack>
);
