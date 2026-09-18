import Typography from '@mui/material/Typography';
import { useRef } from 'react';

// Räknar hur många gånger den har ritats om.
//
// En ref kommer ihåg ett värde mellan ritningarna utan att be om en ny ritning.
// Hade siffran legat i state hade komponenten ritat om sig själv i all
// oändlighet: rita om, räkna upp, rita om igen.
//
// ESLint stoppar normalt det som står nedan, och har rätt i vanlig kod: rör man
// en ref mitt under ritningen kan värdet bli fel när React avbryter och börjar
// om. Här är siffran hela poängen, så undantaget görs medvetet. Skriv inte så
// här i kod som ska göra något på riktigt.
export const RenderCounter = () => {
  /* eslint-disable react-hooks/refs -- siffran är själva demonstrationen */
  const renders = useRef(0);
  renders.current += 1;
  const renderCount = renders.current;
  /* eslint-enable react-hooks/refs */

  return (
    <Typography variant="body2" color="textSecondary">
      Ritad om <strong>{renderCount}</strong> gånger. Siffran ökar med två per klick, inte med ett: StrictMode ritar varje komponent en extra gång i
      utvecklingsläge, för att avslöja renderingskod som inte är ren. I ett byggt projekt ökar den med ett.
    </Typography>
  );
};
