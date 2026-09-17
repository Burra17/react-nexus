import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';

// Lägena skrivs som en as const-array i stället för en enum: erasableSyntaxOnly
// i tsconfig förbjuder enum, eftersom en enum lämnar kvar körbar kod i bygget.
const modes = [
  { value: 'light', label: 'Ljust' },
  { value: 'dark', label: 'Mörkt' },
  { value: 'system', label: 'Följ systemet' },
] as const;

// Tillfällig vy som visar att temat är på plats. Den ersätts av routern i #3
// och startsidan i #4 - ingenting här är tänkt att överleva.
export const App = () => {
  const { mode, setMode } = useColorScheme();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h1">React Nexus</Typography>

        <Typography color="text.secondary">
          Temat är på plats: Inter för text, JetBrains Mono för <code>kod</code>, och två färglägen ur ett och samma tema.
        </Typography>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h3" gutterBottom>
            Färgläge
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {/* mode är undefined första rendret, innan MUI hunnit läsa av klassen på <html>. */}
            Valt läge: {mode ?? 'läses in'}
          </Typography>

          <Stack direction="row" spacing={1}>
            {modes.map((option) => (
              <Button key={option.value} variant={mode === option.value ? 'contained' : 'outlined'} onClick={() => setMode(option.value)}>
                {option.label}
              </Button>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
