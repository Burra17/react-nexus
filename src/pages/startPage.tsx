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
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';

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

      <Typography color="textSecondary" sx={{ mb: 2 }}>
        {module.description}
      </Typography>

      {/* Statusen står som text i båda fallen, inte bara som färg eller form -
          en markering som bara syns på stilen når inte den som inte ser den.
          Det som skiljer är tyngden: byggda får en ifylld chip, planerade bara
          ett ord. Kontrasten mellan korten kommer alltså av att de planerade
          tonas ned, inte av att de byggda förstärks med ännu en färg. */}
      {built ? (
        <Chip size="small" label="Klar" color="primary" />
      ) : (
        <Typography variant="body2" color="textSecondary">
          Planerad
        </Typography>
      )}
    </CardContent>
  );
};

// Kartan över appen: varje koncept som ett kort, byggda som planerade.
// Listan kommer ur modules.tsx, samma källa som sidomenyn och routern läser.
export const StartPage = () => {
  // Utan argument sätts grundtiteln. Startsidan måste sätta den aktivt, inte
  // förlita sig på den som står i index.html: document.title är global, och
  // kommer man hit från en modul står modulens titel kvar annars.
  useDocumentTitle();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h1" gutterBottom>
          React Nexus
        </Typography>
        <ReadableColumn>
          <Typography color="textSecondary">
            En levande lärobok om React, TypeScript och TanStack Query. Varje koncept får fyra delar: teorin bakom det, en demo att klicka på, koden
            som driver demon, och några frågor som kontrollerar att det fastnade. De planerade korten går ännu inte att öppna.
          </Typography>
        </ReadableColumn>
      </Box>

      <Grid container spacing={2}>
        {appModules.map((module) => (
          <Grid key={module.path} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              variant="outlined"
              sx={(theme) => ({
                height: '100%',
                // Streckad kant på det som inte är byggt. En signal till som inte
                // är färg, för den som inte uppfattar skillnaden mellan chiparna.
                borderStyle: isBuilt(module) ? 'solid' : 'dashed',

                // Bara byggda kort svarar på pekaren. Ett planerat kort som rörde
                // sig skulle lova något det inte kan hålla.
                ...(isBuilt(module) && {
                  transition: theme.transitions.create(['border-color', 'transform'], { duration: 150 }),
                  '&:hover': { borderColor: 'primary.main', transform: 'translateY(-1px)' },

                  // Den som bett operativsystemet om mindre rörelse får kantfärgen
                  // men inget lyft. Signalen finns kvar, rörelsen försvinner.
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: theme.transitions.create('border-color', { duration: 150 }),
                    '&:hover': { transform: 'none' },
                  },
                }),
              })}
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
};
