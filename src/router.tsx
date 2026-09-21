import { createBrowserRouter } from 'react-router-dom';
import { navItems } from './navigation';
import { NotFoundPage } from './pages/notFoundPage';
import { PageTemplate } from './templates/pageTemplate';

// En layoutrutt: pageTemplate renderar ramen, och barnens element hamnar i
// dess <Outlet />. Därför rivs inte sidomenyn ner vid navigering - bara
// innehållet i Outlet byts ut, resten av trädet står kvar.
export const router = createBrowserRouter([
  {
    element: <PageTemplate />,
    children: [
      ...navItems.map(({ path, element }) => ({ path, element })),

      // Catch-all sist: matchas ingen av rutterna ovan hamnar adressen här.
      //
      // Rutten står i routern och inte i navigation.tsx, trots att alla andra
      // rutter kommer därifrån. navItems är listan över det som går att
      // navigera *till*, och en 404 är motsatsen - den träffas när inget
      // matchar. Läggs den där dyker den dessutom upp i sidomenyn.
      //
      // Som barn till layoutrutten ärver vyn ramen, så rubrikraden och menyn
      // står kvar och besökaren kan klicka sig vidare.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
