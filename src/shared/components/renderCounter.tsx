import Typography from '@mui/material/Typography';
import { useRef } from 'react';

type RenderCounterProps = {
  // Visar noten om utvecklingsläge och StrictMode under siffran. Den är av som
  // standard, eftersom en demo med flera räknare bara behöver förklara det en
  // gång. Samma långa text under varje räknare blir text som läsaren slutar
  // läsa.
  showStrictModeNote?: boolean;
};

// Visar hur många gånger komponenten har ritats, den första ritningen
// medräknad. Räknaren läggs i den komponent den ska mäta, så den ritas varje
// gång den komponenten ritas. Koden är med så att det går att se hur siffran
// räknas, och därmed vad den går att lita på.
//
// Siffran ligger i en ref. En ref är ett värde som React sparar åt
// komponenten mellan ritningarna, precis som state, men att ändra den ritar
// inte om något. Hade siffran legat i state hade varje uppräkning utlöst en ny
// ritning, som räknat upp igen, i all oändlighet.
//
// ESLint, verktyget som granskar koden efter vanliga fel, stoppar normalt
// raderna nedan, och har rätt i vanlig kod. En komponent ska bara räkna fram
// vad som ska synas, och att ändra en ref under ritningen är något annat.
// React kan dessutom rita en komponent mer än en gång innan resultatet visas,
// till exempel i StrictMode, och då räknas varje sådan ritning. Här är just
// det poängen, så undantaget görs medvetet. I kod som ska göra något på
// riktigt hör en ändring av en ref hemma i en klickhanterare, inte i själva
// ritningen.
export const RenderCounter = ({ showStrictModeNote = false }: RenderCounterProps) => {
  /* eslint-disable react-hooks/refs -- siffran är själva demonstrationen */
  const renders = useRef(0);
  renders.current += 1;
  const renderCount = renders.current;
  /* eslint-enable react-hooks/refs */

  return (
    <Typography variant='body2' color='textSecondary'>
      Ritningar: <strong>{renderCount}</strong>.
      {/* Noten finns i två versioner, eftersom StrictMode bara ritar varje
          komponent en extra gång i utvecklingsläge. import.meta.env.DEV är
          sant just då: Vite, verktyget som bygger appen, sätter det när appen
          körs direkt från källkoden.

          Versionerna skiljer sig i vilken mening som står först, så att
          läsaren alltid möts av det som händer på skärmen framför sig. Står
          fel mening först är det texten läsaren slutar lita på, inte sin egen
          räkning, och då är noten värre än ingen not alls. Båda meningarna
          står kvar i båda versionerna, eftersom att lägena skiljer sig är en
          lärdom i sig. */}
      {showStrictModeNote &&
        (import.meta.env.DEV ? (
          <>
            {' '}
            Appen körs i utvecklingsläge, direkt från källkoden, och då ökar varje räknare på sidan med två för varje ritning, mot ett i den
            publicerade appen. Reacts StrictMode, som bara finns i utvecklingsläget, ritar varje komponent en extra gång för att hitta komponenter som
            ändrar något utanför sig själva medan de ritas, och räknaren räknar båda gångerna.
          </>
        ) : (
          <>
            {' '}
            Varje ritning ökar räknaren med ett. I utvecklingsläget, när appen körs direkt från källkoden, ökar varje räknare på sidan med två i
            stället, eftersom Reacts StrictMode där ritar varje komponent en extra gång för att hitta komponenter som ändrar något utanför sig själva
            medan de ritas.
          </>
        ))}
    </Typography>
  );
};
