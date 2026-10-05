import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import { RenderCounter } from '../../../shared/components/renderCounter';

// Samma två fält, men DOM-elementet äger värdet.
//
// defaultValue i stället för value: JSX säger vad fältet ska börja på, och
// efter första ritningen bestämmer DOM-elementet själv.
//
// Utan value finns inget att hålla synkroniserat, alltså behövs inget
// onChange, alltså inget setState per tangenttryck, och därmed ingen
// ritning. Räknaren nedan står still medan du skriver.
//
// Priset står i texten under fälten: React vet ingenting om vad som står i
// dem förrän någon frågar DOM:en. Ska något annat på sidan reagera på det du
// skriver är det här fel verktyg.
export const UncontrolledForm = () => {
  // Refen är vägen till DOM-elementet. Den finns för att kunna LÄSA värdet vid
  // inskickning, inte för att styra det.
  //
  // En ref kommer ihåg något mellan ritningarna, men att den ändras ritar inte
  // om något. Det är hela skillnaden mot state.
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Paper variant='outlined' sx={{ p: 2, flex: 1, minWidth: 280 }}>
      <Stack
        component='form'
        spacing={2}
        onSubmit={(event) => {
          event.preventDefault();

          // Först här läses värdena, direkt ur DOM-elementen. Det är också
          // först här komponenten ritas om, eftersom setSubmitted är den enda
          // state-ändringen i hela formuläret.
          setSubmitted(`${nameRef.current?.value ?? ''}, ${emailRef.current?.value ?? ''}`);
        }}
      >
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          Okontrollerat
        </Typography>

        {/* inputRef pekar på det underliggande input-elementet. En vanlig ref
            på TextField hamnar på MUI:s omslutande div, och där finns inget
            value att läsa. */}
        <TextField label='Namn' defaultValue='' inputRef={nameRef} size='small' />
        <TextField label='E-post' defaultValue='' inputRef={emailRef} size='small' />

        <Button type='submit' variant='outlined'>
          Skicka
        </Button>

        <Typography variant='caption' color='textSecondary'>
          React vet just nu: ingenting, värdet finns bara i DOM:en
        </Typography>

        {submitted && <Typography variant='body2'>Skickade: {submitted}</Typography>}

        <RenderCounter showStrictModeNote />
      </Stack>
    </Paper>
  );
};
