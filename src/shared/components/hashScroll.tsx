import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Hoppar till ankaret när en adress med hash öppnas från grunden.
//
// Problemet den löser: konceptvyerna laddas lazy, en chunk per vy. Öppnar man
// /rendering#rubrik-kod från ett bokmärke eller en delad länk försöker
// webbläsaren utföra hopptillfället direkt vid sidladdningen - men då finns
// elementet med det id:t ännu inte i DOM:en, eftersom vyn fortfarande hämtas.
// När den sedan renderas är tillfället passerat, och ingen scrollar. Uppmätt
// på /rendering#rubrik-kod: scrollY 0 med rubriken 11 359 px ner. Se #74.
//
// Lösningen sitter i VAR komponenten står, inte i vad den gör.
//
// Den renderas inuti samma Suspense-gräns som <Outlet />, efter den. Ett barn
// under en gräns som suspenderar renderas inte alls förrän gränsen löst upp,
// så första gången den här komponentens effekt körs är efter att vyn hämtats
// och skrivits till DOM:en. Då finns rubriken att hitta.
//
// Därför behövs ingen MutationObserver som väntar på att elementet ska dyka
// upp. React vet redan när vyn är klar, och Suspense är det beskedet.
//
// Att vyn finns räcker dock inte - typsnitten måste också vara på plats.
//
// Inter och JetBrains Mono hämtas som filer och byts in när de är klara. Fram
// till dess ritas texten med ett reservtypsnitt av annan höjd, och sidan växer
// när bytet sker. Uppmätt på /effects#rubrik-quiz: sidan var 7391 px medan
// typsnitten laddades och 7441 px efteråt. Scrollade vi på det första måttet
// gled rubriken 50 px nedåt under läsaren, från 158 till 208.
//
// document.fonts.ready löser ut när inget typsnitt väntar. Är de redan hämtade
// löser den ut direkt, så inget väntande läggs på i normalfallet.
//
// scrollIntoView utan argument respekterar scroll-margin-top, som mallen sätter
// på varje sektionsrubrik. Rubriken hamnar alltså under den klibbiga
// sektionsraden från #67 och inte bakom den - samma mått som ett klick inifrån
// appen använder.
//
// Krockar inte med ScrollToTop: den avstår så fort adressen har en hash.
export const HashScroll = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      return;
    }

    // Samma ignore-flagga som Effects-modulen lär ut, och av samma skäl.
    // Hinner man navigera vidare medan typsnitten laddas ska det gamla ankaret
    // inte rycka undan sidan från den vy man just öppnat.
    let ignore = false;

    void document.fonts.ready.then(() => {
      if (ignore) {
        return;
      }

      // Ett varv till i händelsekön innan vi scrollar. fonts.ready säger att
      // filerna är hämtade, inte att sidan ritats om med dem. Scrollar vi
      // direkt på löftet mäter vi den gamla layouten: uppmätt landade rubriken
      // på 178 px i stället för 128, alltså 50 px fel - exakt så mycket som
      // sidan växte när typsnitten byttes in.
      //
      // setTimeout och inte requestAnimationFrame. rAF körs inte alls i en flik
      // som ligger i bakgrunden, och då uteblir hoppet helt för den som öppnar
      // en länk i en ny flik och byter dit efteråt. Uppmätt: scrollY 0 i stället
      // för 1664.
      window.setTimeout(() => {
        if (ignore) {
          return;
        }

        // slice(1) tar bort brädgården. getElementById vill ha id:t, inte
        // selektorn.
        document.getElementById(hash.slice(1))?.scrollIntoView();
      }, 0);
    });

    return () => {
      ignore = true;
    };
  }, [pathname, hash]);

  return null;
};
