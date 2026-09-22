// Den enda vägen till localStorage i appen.
//
// Ligger i services/ och inte i shared/, eftersom det är infrastruktur och inte
// en komponent: delat av hela appen, ingen React, ägs inte av någon modul.
//
// Inget interface och ingen utbytbar implementation. Ett interface med exakt en
// implementation döljer mer än det abstraherar, och skulle en backend komma
// skrivs den ändå om från grunden när vi vet vad servern erbjuder. Förberedelsen
// ligger i att all åtkomst går genom den här filen - då finns det ett ställe att
// ändra på, vilket är vad ett utbytbart lager egentligen ska ge.

// Formen på det som ligger lagrat. Höjs när något lagrat byter form.
//
// Versionen är gemensam för alla nycklar. Det är trubbigt - en ändring i ett
// format kastar allt - men appen lagrar i dag under en enda nyckel, och en
// version per nyckel vore maskineri för ett problem som inte finns.
const STORAGE_VERSION = 1;

type Stored<T> = {
  version: number;
  data: T;
};

// Varför trasig eller för gammal data kastas i stället för att migreras:
//
// Det som lagras är vilka alternativ man klickat på i en quiz. Förlorar man det
// klickar man igenom tre frågor igen. Att skriva och underhålla migreringskod
// för data ingen skulle sakna kostar utan att ge något.
//
// Poängen med versionsfältet är att valet är ett val. Den som en dag lagrar
// något värdefullare ser att strategin ska omprövas då, i stället för att gammal
// data tyst läses in i fel form och ger buggar ingen kan spåra.
const discard = (key: string, reason: string) => {
  console.warn(`Lagrad data under "${key}" kastades: ${reason}. Standardvärdet används i stället.`);

  try {
    localStorage.removeItem(key);
  } catch {
    // Går inte ens borttagningen är lagringen otillgänglig, och då finns
    // ingenting att städa. Standardvärdet returneras ändå av läsningen.
  }
};

// Läser lagrad data, eller standardvärdet om något är fel.
//
// Returnerar alltid ett värde. En läsning som kastar hade tvingat varje
// anropare att omge sig med try/catch, och den som glömmer får en vy som
// kraschar av något så oviktigt som ett tomt localStorage.
export const readStored = <T>(key: string, fallback: T): T => {
  let raw: string | null;

  // getItem kastar när lagringen är avstängd, till exempel i Safaris privata
  // läge. Utan den här raden kraschar vyn i stället för att visa standardvärdet.
  try {
    raw = localStorage.getItem(key);
  } catch {
    return fallback;
  }

  if (raw === null) {
    return fallback;
  }

  let stored: Stored<T>;

  try {
    stored = JSON.parse(raw) as Stored<T>;
  } catch {
    discard(key, 'den gick inte att tolka som JSON');
    return fallback;
  }

  if (stored?.version !== STORAGE_VERSION) {
    discard(key, `den har version ${stored?.version} men appen förväntar ${STORAGE_VERSION}`);
    return fallback;
  }

  // Att versionen stämmer är hela kontrollen. Att data verkligen har formen T
  // kontrolleras inte - det skulle kräva ett schema per nyckel, och repot tar
  // inte in ett nytt bibliotek för det. Versionsfältet är kontraktet: ändrar
  // man formen höjer man versionen, och då kastas det gamla.
  return stored.data;
};

// Skriver data under en nyckel, tillsammans med den version formen har nu.
export const writeStored = <T>(key: string, data: T) => {
  const stored: Stored<T> = { version: STORAGE_VERSION, data };

  // setItem kastar när kvoten är full och i privat läge. En misslyckad
  // skrivning ska inte fälla vyn: det som går förlorat är ett quizsvar, och
  // alternativet vore en vit skärm.
  try {
    localStorage.setItem(key, JSON.stringify(stored));
  } catch {
    console.warn(`Kunde inte spara under "${key}". Lagringen är full eller avstängd.`);
  }
};

// Tar bort allt som ligger under en nyckel.
export const removeStored = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`Kunde inte rensa "${key}". Lagringen är avstängd.`);
  }
};
