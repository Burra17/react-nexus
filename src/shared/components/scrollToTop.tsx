import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Börjar en ny vy högst upp.
//
// Utan den följer scrollpositionen med mellan vyer: läser man halvvägs ner i en
// modul och klickar på nästa i menyn hamnar man mitt i den, utan sammanhang.
//
// Varför inte react-router-doms ScrollRestoration, som gör mer av samma sak:
// den tar över hela scrollhanteringen, inklusive två fall som redan fungerar -
// och gick sönder av att den tog över. Uppmätt i #71:
//
//   - Bakåt och framåt sköter webbläsaren själv. history.scrollRestoration är
//     'auto', och den återställde positionen exakt (2200 respektive 600 px).
//   - En direktlänk med hash, /state#rubrik-quiz, landade rätt vid full
//     sidladdning utan ScrollRestoration men på toppen med den. Komponenten
//     nollställde scrollen innan den lazy-laddade vyn hunnit rendera, och sedan
//     var det ingen som hoppade till ankaret.
//
// Den här komponenten gör därför bara det som faktiskt saknades.
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // POP är bakåt och framåt. Webbläsaren har redan återställt positionen när
    // vi kommer hit - skriver vi över den blir bakåtknappen värdelös i en vy
    // som är fem skärmar lång.
    if (navigationType === 'POP') {
      return;
    }

    // Finns en hash är det ankaret som bestämmer vart man ska, inte vi.
    // Sektionsraden i #67 bygger helt på det.
    if (hash) {
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
};
