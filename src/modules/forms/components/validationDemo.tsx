import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EMAIL_PATTERN, type ProfileFormValues } from '../types/profile';

// Namnets minsta längd. Två tecken räcker för att regeln ska gå att utlösa
// utan att någon med ett kort namn blir avvisad på riktigt.
const MIN_NAME_LENGTH = 2;

// De tre lägen demon låter läsaren välja mellan.
//
// RHF har fler (onTouched och all), men tre val räcker för att känna
// skillnaden, och fem knappar i rad blir en inställningspanel i stället för
// en demonstration.
const MODES = [
  { value: 'onSubmit', label: 'onSubmit', hint: 'Standard. Felen dyker upp först när du skickar.' },
  { value: 'onBlur', label: 'onBlur', hint: 'Felet dyker upp när du lämnar fältet.' },
  { value: 'onChange', label: 'onChange', hint: 'Felet dyker upp medan du skriver, i det fält du skriver i.' },
] as const;

type ValidationMode = (typeof MODES)[number]['value'];

type ValidatedFormProps = {
  mode: ValidationMode;
};

// Formuläret som valideras. Tar mode som prop.
//
// Reglerna ligger i register, som ett andra argument. Det är bibliotekets egna
// regler och inget schemabibliotek: zod och liknande löser ett annat problem:
// att beskriva en datamodell en gång och återanvända den. Det problemet har
// inte den här modulen.
const ValidatedForm = ({ mode }: ValidatedFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    mode,
    defaultValues: { name: '', email: '', role: '' },
  });

  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Stack component='form' spacing={2} onSubmit={handleSubmit((values) => setSubmitted(`${values.name}, ${values.email}`))}>
      {/* error och helperText kopplar MUI:s utseende till RHF:s tillstånd.
          Felet står som text och inte bara som röd ram. En röd kant utan ord
          säger att något är fel men inte vad. */}
      <TextField
        label='Namn'
        size='small'
        error={Boolean(errors.name)}
        helperText={errors.name?.message ?? ' '}
        {...register('name', {
          required: 'Namn måste fyllas i.',
          minLength: { value: MIN_NAME_LENGTH, message: `Namnet behöver minst ${MIN_NAME_LENGTH} tecken.` },
        })}
      />

      <TextField
        label='E-post'
        size='small'
        error={Boolean(errors.email)}
        helperText={errors.email?.message ?? ' '}
        {...register('email', {
          required: 'E-post måste fyllas i.',
          pattern: { value: EMAIL_PATTERN, message: 'Adressen ser inte ut som en e-postadress.' },
        })}
      />

      <Button type='submit' variant='outlined'>
        Skicka
      </Button>

      {submitted && <Typography variant='body2'>Skickade: {submitted}</Typography>}
    </Stack>
  );
};

export const ValidationDemo = () => {
  const [mode, setMode] = useState<ValidationMode>('onSubmit');

  const activeHint = MODES.find((option) => option.value === mode)?.hint ?? '';

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography id='mode-etikett' variant='body2' color='textSecondary'>
          Läge, alltså inställningen mode till useForm: när valideringen körs
        </Typography>

        <ToggleButtonGroup
          aria-labelledby='mode-etikett'
          exclusive
          size='small'
          value={mode}
          onChange={(_event, next: ValidationMode | null) => {
            // null kommer när man klickar på den redan valda knappen. Utan
            // kontrollen skulle läget nollställas och formuläret tappa sitt
            // mode.
            if (next !== null) {
              setMode(next);
            }
          }}
          sx={{ flexWrap: 'wrap' }}
        >
          {MODES.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Typography variant='caption' color='textSecondary'>
          {activeHint}
        </Typography>
      </Stack>

      <Paper variant='outlined' sx={{ p: 2, maxWidth: 420 }}>
        {/* key tvingar fram en ny komponent när läget byts, och det är inte
            en genväg utan en nödvändighet: useForm läser mode när formuläret
            skapas och bryr sig inte om att propen ändras efteråt. Utan key
            skulle knapparna se ut att göra något utan att göra det.

            Att formuläret samtidigt töms är en bieffekt, och en välkommen
            sådan: varje läge provas från ett rent utgångsläge. */}
        <ValidatedForm key={mode} mode={mode} />
      </Paper>

      <Alert severity='info'>
        <strong>I läget onSubmit dyker felen upp först när du skickar</strong>, och markören flyttas till det första fältet med fel. Skriv sedan i
        namnfältet och titta på meddelandet. Vid första bokstaven byts det mot regeln om minst två tecken, och vid den andra försvinner det, trots att
        läget heter onSubmit. Efter den första inskickningen validerar biblioteket varje fält du ändrar vid varje ändring, också fält som var giltiga
        när du skickade. Utan det skulle felet stå kvar tills du skickade igen.
      </Alert>
    </Stack>
  );
};
