import { useEffect } from 'react';

// Appens fulla titel, den som står i webbläsarfliken på startsidan.
//
// Samma sträng står också i index.html, och det är avsiktligt. Crawlers kör
// inte JavaScript - Slack, Discord, LinkedIn och Google läser bara den HTML
// servern skickar - så titeln måste finnas där utan att React har startat.
// Den här kopian är för människor som redan har appen igång. Dupliceringen är
// alltså inte ett misstag utan priset för att både maskiner och besökare ska
// få rätt titel.
export const SITE_TITLE = 'React Nexus – Interaktiv lärobok om React & TypeScript';

// Suffixet som varje undersida får. Står här och inte hos de tre anroparna, så
// att en namnändring är en rad och inte tre.
const TITLE_SUFFIX = 'React Nexus';

// Sätter webbläsarflikens titel för den vy som anropar.
//
// Utan vyNamn sätts grundtiteln, vilket startsidan vill ha. Med vyNamn blir det
// "Effects – React Nexus".
//
// Varför varje vy måste anropa den, inte bara konceptvyerna: document.title är
// global och står kvar tills någon ändrar den. Satte bara konceptvyerna sin
// titel skulle fliken fortfarande säga "Effects" efter att man klickat sig till
// startsidan - ett nytt fel infört av lösningen på det gamla.
export const useDocumentTitle = (vyNamn?: string) => {
  useEffect(() => {
    document.title = vyNamn ? `${vyNamn} – ${TITLE_SUFFIX}` : SITE_TITLE;
  }, [vyNamn]);
};
