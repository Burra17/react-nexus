import { createBrowserRouter } from 'react-router-dom';
import { navItems } from './navigation';
import { PageTemplate } from './templates/pageTemplate';

// En layoutrutt: pageTemplate renderar ramen, och barnens element hamnar i
// dess <Outlet />. Därför rivs inte sidomenyn ner vid navigering - bara
// innehållet i Outlet byts ut, resten av trädet står kvar.
export const router = createBrowserRouter([
  {
    element: <PageTemplate />,
    children: navItems.map(({ path, element }) => ({ path, element })),
  },
]);
