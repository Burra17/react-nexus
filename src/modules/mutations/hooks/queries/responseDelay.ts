// Svarstiden som modulens anrop körs med.
//
// Längre än i modul 7 och 8, och det är avsiktligt. Den tredje demon visar en
// optimistisk uppdatering: det nya värdet ska stå på skärmen en stund INNAN
// servern svarat, annars finns inget fönster där man kan se skillnaden mellan
// att hoppa i förväg och att vänta. Med 700 ms hann hoppet knappt synas.
export const RESPONSE_DELAY_MS = 1200;
