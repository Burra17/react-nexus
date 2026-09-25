import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { readUserRequestCount } from '../../../services/mocks/handlers';
import { RequestCounterPanel } from '../../../shared/components/requestCounterPanel';
import { sharedUsersKeys } from '../hooks/usersKeys';
import { useRerenderOnCacheChange } from '../hooks/useRerenderOnCacheChange';
import { UserListCard } from './userListCard';

// Fyra kort från början. Talet ska vara tydligt skilt från ett, men inte så
// stort att listan tar över sidan.
const INITIAL_CARDS = 4;

export const SharedCacheDemo = () => {
  const queryClient = useQueryClient();
  const [cardCount, setCardCount] = useState(INITIAL_CARDS);
  const [isMounted, setIsMounted] = useState(false);

  // Räknaren läses om varje gång något händer i cachen. Utan prenumerationen
  // skulle talet stå kvar på det som gällde vid senaste renderingen.
  useRerenderOnCacheChange();

  const requestCount = readUserRequestCount();

  return (
    <Stack spacing={3}>
      <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button variant={isMounted ? 'outlined' : 'contained'} onClick={() => setIsMounted((current) => !current)}>
          {isMounted ? 'Ta bort korten' : `Montera ${INITIAL_CARDS} kort`}
        </Button>

        <Button disabled={!isMounted} onClick={() => setCardCount((current) => current + 1)}>
          Lägg till ett kort till
        </Button>

        {/* Tar bort korten OCH cacheposten, så att demon går att köra om från
            noll. Utan removeQueries ligger listan kvar och är dessutom färsk i
            en halv minut - nästa montering skulle ge noll anrop, och det första
            påståendet gick inte att visa en andra gång. */}
        <Button
          onClick={() => {
            setCardCount(INITIAL_CARDS);
            setIsMounted(false);
            queryClient.removeQueries({ queryKey: sharedUsersKeys.all });
          }}
        >
          Börja om
        </Button>
      </Stack>

      <RequestCounterPanel
        total={requestCount}
        caption='Träffar i den mockade backenden, inte renderingar. Nollställ först och gör sedan en sak i taget — montera korten, lägg till ett till — så visar talet exakt vad just den saken kostade.'
      />

      {isMounted ? (
        <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
          {Array.from({ length: cardCount }, (_, index) => (
            <UserListCard key={index} title={`Kort ${index + 1}`} />
          ))}
        </Stack>
      ) : (
        <Typography color='textSecondary'>Inga kort är monterade. Ingen tittar på listan, och ingenting hämtas.</Typography>
      )}
    </Stack>
  );
};
