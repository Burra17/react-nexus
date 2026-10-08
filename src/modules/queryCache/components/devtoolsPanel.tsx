import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useColorScheme } from '@mui/material/styles';
import { lazy, Suspense, useState } from 'react';

// Verktyget hämtas från /production och inte från paketets vanliga ingång.
//
// Den vanliga ingången renderar ingenting när appen är byggd, eftersom
// verktyget normalt bara används under utveckling. Här är den byggda appen
// läroboken, och läsaren ska kunna se det riktiga verktyget.
//
// lazy gör att verktyget hamnar i en egen fil som hämtas först när panelen
// visas. Det väger runt 63 kB komprimerat, och den som aldrig trycker på
// knappen ska inte behöva ladda ner det.
//
// Versionen är låst till exakt samma som @tanstack/react-query i package.json.
// Verktyget kräver en react-query som är minst lika ny som det själv, och
// en nyare version av verktyget hade alltså krävt en uppgradering av hela appen.
const ReactQueryDevtoolsPanel = lazy(() =>
  import('@tanstack/react-query-devtools/production').then((imported) => ({ default: imported.ReactQueryDevtoolsPanel })),
);

// Knappen som öppnar TanStacks eget verktyg för att inspektera cachen.
export const DevtoolsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mode, systemMode } = useColorScheme();

  // Panelen följer appens läge och inte operativsystemets. Annars blir den
  // mörk på en ljus sida för den som valt ljust läge i appen men har mörkt
  // läge i systemet. systemMode säger vad 'system' faktiskt landade i.
  const resolvedMode = mode === 'system' ? systemMode : mode;

  if (!isOpen) {
    return (
      <Box>
        <Button variant='outlined' onClick={() => setIsOpen(true)}>
          Öppna React Query Devtools
        </Button>
      </Box>
    );
  }

  // Panelen ligger i sidans flöde och vet inte själv hur hög den ska vara,
  // så höjden sätts på omslaget.
  //
  // Verktyget blir aldrig smalare än sitt innehåll, runt 485 pixlar. På en
  // smal skärm trycker det därför ut hela sidan i sidled. overflowX låter
  // panelen scrolla inom sin egen ruta i stället.
  return (
    <Box sx={{ height: 400, overflowX: 'auto' }}>
      <Suspense fallback={null}>
        <ReactQueryDevtoolsPanel theme={resolvedMode ?? 'system'} onClose={() => setIsOpen(false)} />
      </Suspense>
    </Box>
  );
};
