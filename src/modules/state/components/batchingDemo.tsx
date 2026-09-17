import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { RenderCounter } from './renderCounter';

// Samma tre anrop, skrivna på två sätt. Resultatet skiljer sig.
export const BatchingDemo = () => {
  const [count, setCount] = useState(0);

  // Alla tre anropen läser samma foto, där count är 0.
  // Alla tre säger därför samma sak: "sätt nästa värde till 0 + 1".
  const handleDirect = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  // Den här formen läser inte fotot. Den ber React om det senaste värdet,
  // så varje anrop bygger vidare på det föregående.
  const handleFunctional = () => {
    setCount((current) => current + 1);
    setCount((current) => current + 1);
    setCount((current) => current + 1);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h3" component="p">
        {count}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="contained" onClick={handleDirect}>
          setCount(count + 1) — tre gånger
        </Button>
        <Button variant="outlined" onClick={handleFunctional}>
          setCount(c =&gt; c + 1) — tre gånger
        </Button>
        <Button onClick={() => setCount(0)}>Nollställ</Button>
      </Stack>

      <Typography color="text.secondary">
        Båda knapparna anropar setCount tre gånger. Den vänstra ökar med ett, den högra med tre — och båda ritar om vyn bara en gång.
      </Typography>

      <RenderCounter />
    </Stack>
  );
};
