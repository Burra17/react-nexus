import { createBrowserRouter } from 'react-router-dom';
import { appRoutes } from './navigation';
import { PageTemplate } from './templates/pageTemplate';

// En layoutrutt: pageTemplate renderar ramen, och barnens element hamnar i
// dess <Outlet />. Därför rivs inte sidomenyn ner vid navigering - bara
// innehållet i Outlet byts ut, resten av trädet står kvar.
export const router = createBrowserRouter([
  {
    element: <PageTemplate />,
    children: appRoutes.map(({ path, element }) => ({ path, element })),
  },
]);
