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

// Samma formulär igen, nu med React Hook Form och med rollen tillagd.
//
// Räknaren står still medan du skriver, precis som i det okontrollerade
// formuläret i förra delen. Det är ingen slump och ingen optimering i
// biblioteket: fälten ÄR okontrollerade, i Reacts mening av ordet.
//
// Det syns i vad register returnerar. Ur bibliotekets egna typer:
//
//   onChange, onBlur, ref, name
//
// plus valfria HTML-valideringsattribut. Inget value. Ett fält utan value är
// okontrollerat, och då finns ingenting att hålla synkroniserat med ett
// useState.
//
// Vad du vinner jämfört med refs för hand: du slipper hålla reda på en ref per
// fält, du får formState gratis, och valideringen har någonstans att bo. Det
// är det biblioteket egentligen säljer, inte omrenderingarna, som bara är
// följden av hur det läser värdena.
export const HookFormDemo = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, submitCount },
  } = useForm<ProfileFormValues>({
    // Utan defaultValues är fälten undefined tills någon skriver i dem, och
    // ett fält som går från undefined till en sträng byter från okontrollerat
    // till kontrollerat, precis det React säger att en input inte får göra.
    defaultValues: { name: '', email: '', role: ROLES[0] },
  });

  const [submitted, setSubmitted] = useState<ProfileFormValues | null>(null);

  return (
    <Paper variant='outlined' sx={{ p: 2, maxWidth: 420 }}>
      {/* handleSubmit gör tre saker: hindrar sidan från att laddas om, kör
          valideringen, och anropar din funktion med värdena först om allt gick
          igenom. Det är här ett anrop till en mutation från modul 9 skulle
          ligga. */}
      <Stack component='form' spacing={2} onSubmit={handleSubmit((values) => setSubmitted(values))}>
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          Med React Hook Form
        </Typography>

        {/* Spridningen är hela kopplingen. MUI:s TextField skickar vidare
            name, onChange, onBlur och ref till sitt input-element, så den
            fungerar okontrollerad utan vidare. */}
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

        {/* Två fält ur formState. isDirty blir sant så fort något skiljer sig
            från defaultValues, och submitCount räknar inskickningarna.
            Att läsa dem här kostar omrenderingar: formState är en proxy, och
            biblioteket ritar om just de komponenter som faktiskt läser ett
            fält ur den. Därför tickar räknaren när isDirty slår om från falskt
            till sant, men inte vid varje tangenttryck efter det. */}
        <Typography variant='caption' color='textSecondary'>
          isDirty: {String(isDirty)} · submitCount: {submitCount}
        </Typography>

        {submitted && (
          <Typography variant='body2'>
            Skickade: {submitted.name}, {submitted.email}, {submitted.role}
          </Typography>
        )}

        <RenderCounter showStrictModeNote />

        {/* Uppmätt, och värt att skriva ut: räknaren rör sig EN gång och
            sedan aldrig mer. Utan den här raden ser det ut som att
            påståendet ovan är fel. */}
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
