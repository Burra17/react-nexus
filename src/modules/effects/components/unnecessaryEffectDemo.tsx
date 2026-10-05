import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { RenderCounter } from '../../../shared/components/renderCounter';

type NameProps = {
  firstName: string;
  lastName: string;
};

type NameCardProps = {
  title: string;
  fullName: string;
};

// Kortet som båda varianterna visar sitt resultat i. Bara utseende, ingen logik.
// Det enda som skiljer varianterna åt ska vara hur fullName blir till.
const NameCard = ({ title, fullName }: NameCardProps) => (
  <Paper variant='outlined' sx={{ p: 2, flex: 1 }}>
    <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
    <Typography sx={{ mb: 1 }}>{fullName}</Typography>
    <RenderCounter />
  </Paper>
);

// Varianten som lägger ett härlett värde i state.
//
// Avsiktligt felaktig kod. Den står här för att visa vad den kostar, inte som
// ett mönster att kopiera. Se raden märkt FEL nedan.
const BadForm = ({ firstName, lastName }: NameProps) => {
  const [fullName, setFullName] = useState('');

  // FEL: fullName går att räkna fram ur props och behöver därför ingen effekt.
  // Komponenten ritas först om för de nya propsen, effekten sätter state
  // efteråt, och React måste rita om en gång till för att visa det.
  //
  // ESLint, verktyget som granskar koden efter vanliga fel, stoppar normalt
  // raden nedan, och det är värt att lägga märke till: regeln heter
  // set-state-in-effect och hänvisar själv till sidan på react.dev om att du
  // förmodligen inte behöver en effekt. Undantaget görs bara för att
  // felet är hela demonstrationen. Skriv aldrig så här i kod som ska göra
  // något på riktigt. Den rättade versionen står i GoodForm nedan.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- felet är poängen, se kommentaren ovan
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);

  return <NameCard title='Namnet ligger i state, satt av en effekt' fullName={fullName} />;
};

// Samma sak utan effekt och utan state.
const GoodForm = ({ firstName, lastName }: NameProps) => {
  // RÄTT: värdet räknas fram under ritningen. Raden körs om av sig själv när
  // propsen ändras, så det finns ingenting att hålla synkroniserat.
  const fullName = `${firstName} ${lastName}`;

  return <NameCard title='Namnet räknas fram under ritningen' fullName={fullName} />;
};

export const UnnecessaryEffectDemo = () => {
  const [firstName, setFirstName] = useState('Ada');
  const [lastName, setLastName] = useState('Lovelace');
  const [hasTyped, setHasTyped] = useState(false);

  // Förklaringen visas efter första bokstaven. Flaggan sätts här, i fältets
  // egen händelsehanterare, och inte i en effekt som reagerar på namnet.
  // Den batchas med namnet och kostar ingen extra ritning.
  const handleFirstName = (value: string) => {
    setFirstName(value);
    setHasTyped(true);
  };

  const handleLastName = (value: string) => {
    setLastName(value);
    setHasTyped(true);
  };

  return (
    <Stack spacing={2}>
      {/* Fälten ligger hos föräldern och namnen går ner som props, så att båda
          korten får sin uppdatering vid exakt samma tangenttryck. Med var sitt
          fält hade de kunnat skrivas olika mycket, och då hade jämförelsen
          mellan räknarna inte betytt någonting. */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField size='small' label='Förnamn' value={firstName} onChange={(event) => handleFirstName(event.target.value)} />
        <TextField size='small' label='Efternamn' value={lastName} onChange={(event) => handleLastName(event.target.value)} />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <BadForm firstName={firstName} lastName={lastName} />
        <GoodForm firstName={firstName} lastName={lastName} />
      </Stack>

      {hasTyped && (
        <Typography color='textSecondary'>
          Kortet med effekten ritas om två gånger per bokstav: en gång för de nya propsen, och en gång till när effekten satt namnet i state. Kortet
          som räknar fram namnet ritas om en gång. Därför låg kortet med effekten före redan vid laddningen: effekten satte namnet efter den första
          ritningen, och det kostade en ritning till. I utvecklingsläge, där StrictMode ritar varje komponent två gånger, är båda talen dubbelt så
          höga. Det är förhållandet mellan dem som är poängen.
        </Typography>
      )}
    </Stack>
  );
};
