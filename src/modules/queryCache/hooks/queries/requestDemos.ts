// Märkningen som anropen bär till den mockade backenden, en per demo.
//
// Båda demonstrationerna på sidan hämtar användarlistan från samma sökväg, och
// invalideringsdemon gör det så fort sidan öppnas. Utan märkningen landade
// dess tre anrop i delningsdemons räknare, som då visade tre medan texten
// bredvid sa att ingenting hämtats.
//
// Värdena står som konstanter och inte som strängar på plats. Hooken skickar
// märkningen och demon läser av den, och en felstavning på ena sidan hade gett
// en räknare som tyst står på noll.
export const SHARING_DEMO = 'delning';
export const INVALIDATION_DEMO = 'invalidering';
