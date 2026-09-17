import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

// Ruttmål för det som ännu inte är byggt. Ligger i shared eftersom varje
// obyggd modul pekar hit tills den fått sin egen vy.
export const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => (
  <Stack spacing={2}>
    <Typography variant="h1">{title}</Typography>
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography color="text.secondary">{description}</Typography>
    </Paper>
  </Stack>
);
