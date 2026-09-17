import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// App gör numera en enda sak: kopplar in routern. Allt innehåll bestäms av
// vilken rutt som matchar, och ramen runt det ligger i pageTemplate.
export const App = () => <RouterProvider router={router} />;
