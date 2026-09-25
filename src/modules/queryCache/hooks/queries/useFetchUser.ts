import { useQuery } from '@tanstack/react-query';
import { getUser } from '../../../../services/api/users';
import { usersKeys } from '../usersKeys';
import { RESPONSE_DELAY_MS } from './responseDelay';

// Hämtar en enskild användare.
//
// Finns här för att demon ska ha poster under BÅDA grenarna av nyckelfabriken.
// Utan detaljposter går det inte att visa skillnaden mellan att invalidera hela
// resursen och att invalidera bara listorna - och den skillnaden är hela skälet
// till att nycklarna byggs ovanpå varandra.
export const useFetchUser = (id: string) =>
  useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => getUser(id, { delayMs: RESPONSE_DELAY_MS }),
    retry: false,
  });
