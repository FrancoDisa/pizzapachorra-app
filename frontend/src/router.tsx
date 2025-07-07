import { createBrowserRouter } from 'react-router';
import Root from '../app/root';
import Dashboard from './pages/dashboard';
import PedidosNew from './pages/pedidos-new';
import Cocina from './pages/cocina';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "pedidos",
        Component: PedidosNew,
      },
      {
        path: "cocina",
        Component: Cocina,
      },
    ],
  },
]);