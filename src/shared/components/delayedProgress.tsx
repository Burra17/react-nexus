import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useState } from 'react';

// Hur länge vi väntar innan vi visar att något laddas.
const DELAY_MS = 200;

// Visar ingenting de första 200 millisekunderna, sedan en tunn laddningsrad.
//
// En chunk hämtas oftast på under hundra millisekunder. En indikator som visas
// direkt hinner därför bara blinka förbi, och ett gränssnitt som blinkar känns
// trasigt. Tar hämtningen längre tid är det däremot värre att inte visa något
// alls - då tror man att länken inte fungerade.
//
// useEffect här är en timer, inte datahämtning. Regeln i CLAUDE.md om att
// aldrig hämta med useEffect gäller serverdata.
export const DelayedProgress = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), DELAY_MS);

    // Städas bort om vyn hinner bli klar först, så att raden aldrig dyker upp
    // efter att innehållet redan står på skärmen.
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return <LinearProgress aria-label="Hämtar vyn" />;
};
