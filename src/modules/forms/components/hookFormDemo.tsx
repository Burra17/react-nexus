import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RenderCounter } from '../../../shared/components/renderCounter';
import { ROLES, type ProfileFormValues } from '../types/profile';

// Samma formulär igen, nu med React Hook Form och med en roll tillagd.
//
// Räknaren står nästan still medan du skriver, precis som i det okontrollerade
// formuläret ovanför på sidan. Undantagen är de gånger isDirty slår om, och
// dem förklarar texten under räknaren. Att den står still är ingen
// optimering i biblioteket: fälten är okontrollerade, eftersom register
// aldrig ger dem något value.
//
// Det syns i vad register returnerar: onChange, onBlur, ref och name. Typen,
// UseFormRegisterReturn, har dessutom plats för valideringsregler som
// required och minLength, men de fylls bara i med inställningen progressive,
// som lägger reglerna på fältet som vanliga HTML-attribut. Den används inte
// här. Inget value alltså, och ett fält utan value är okontrollerat.
//
// Vad du vinner jämfört med refar för hand: du slipper hålla reda på en ref
// per fält, du får formState med formulärets tillstånd, och valideringen har
// någonstans att bo. Det är det biblioteket egentligen erbjuder. Att inget
// ritas om är bara en följd av hur det läser värdena.
export const HookFormDemo = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, submitCount },
  } = useForm<ProfileFormValues>({
    // defaultValues är startvärdena. De sätts i fälten när formuläret skapas,
    // och isDirty jämför mot dem. Rollfältet, som Controller styr med value,
    // behöver dem av ett skäl till: utan startvärde vore value undefined tills
    // någon väljer, och ett fält som går från undefined till ett värde byter
    // från okontrollerat till kontrollerat, vilket React varnar för.
    defaultValues: { name: '', email: '', role: ROLES[0] },
  });

  const [submitted, setSubmitted] = useState<ProfileFormValues | null>(null);

  return (
    <Paper variant='outlined' sx={{ p: 2, maxWidth: 420 }}>
      {/* handleSubmit gör tre saker. Den hindrar webbläsaren från att ladda
          om sidan, vilket den annars gör när ett formulär skickas. Den kör
          valideringen. Och den anropar din funktion med värdena, men bara om
          allt gick igenom. Ska värdena sparas på en server är det i den
          funktionen anropet hamnar. */}
      <Stack component='form' spacing={2} onSubmit={handleSubmit((values) => setSubmitted(values))}>
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          Med React Hook Form
        </Typography>

        {/* {...register('name')} lägger ut onChange, onBlur, ref och name som
            props på fältet, och mer koppling än så behövs inte. MUI:s
            TextField skickar name, onChange och onBlur vidare till sitt
            input-element. Refen hamnar på TextFields yttre element, men
            register letar själv upp input-elementet inuti det. */}
        <TextField label='Namn' size='small' {...register('name')} />
        <TextField label='E-post' size='small' {...register('email')} />

        {/* Autocomplete går inte samma väg. Den skickar det valda värdet som
            andra argument till onChange, inte i event.target där register
            läser. Kopplad med register visar fältet ditt val medan formuläret
            behåller startvärdet, utan någon varning.

            Controller är bryggan. Den ger dig value och onChange att koppla
            in, och gör just det här fältet kontrollerat medan resten av
            formuläret förblir okontrollerat. */}
        <Controller
          control={control}
          name='role'
          render={({ field }) => (
            <Autocomplete
              options={ROLES}
              value={field.value}
              onChange={(_event, role) => field.onChange(role)}
              onBlur={field.onBlur}
              disableClearable
              renderInput={(params) => <TextField {...params} label='Roll' size='small' inputRef={field.ref} />}
            />
          )}
        />

        <Button type='submit' variant='outlined'>
          Skicka
        </Button>

        {/* Två egenskaper ur formState. isDirty blir sant så fort något
            skiljer sig från defaultValues, och submitCount räknar
            inskickningarna. Att läsa dem här har ett pris: biblioteket håller
            reda på vilka egenskaper komponenten läser, och ritar om den när
            någon av just de ändras. Därför tickar räknaren när isDirty slår
            om, men inte vid varje tangenttryck. */}
        <Typography variant='caption' color='textSecondary'>
          isDirty: {String(isDirty)} · submitCount: {submitCount}
        </Typography>

        {submitted && (
          <Typography variant='body2'>
            Skickade: {submitted.name}, {submitted.email}, {submitted.role}
          </Typography>
        )}

        <RenderCounter showStrictModeNote />

        {/* Förklaringen står på skärmen och inte bara här. Utan den ser
            räknaren ut att säga emot att fälten är okontrollerade, eftersom
            den rör sig vid första tecknet. */}
        <Typography variant='caption' color='textSecondary'>
          <code>isDirty</code> säger om något fält skiljer sig från startvärdena, och <code>submitCount</code> räknar inskickningarna. Formuläret
          läser båda ur <code>formState</code>, och biblioteket ritar om det bara när någon av dem ändras. Därför ökar räknaren vid första tecknet,
          när <code>isDirty</code> slår om till <code>true</code>, och igen om du raderar namnet så att inget längre skiljer sig från startvärdena,
          men inte för tecknen däremellan. Rollfältet är kopplat med <code>Controller</code>, som ritar om sitt eget fält när du väljer. Formuläret
          ritas om bara om valet ändrar <code>isDirty</code>.
        </Typography>
      </Stack>
    </Paper>
  );
};
