import { createBrowserRouter } from 'react-router';
import Root from '../app/root';
import Dashboard from './pages/dashboard';
import PedidosLayout from './pages/pedidos';
import PedidosIndex from './pages/pedidos/index';
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
        Component: PedidosLayout,
        children: [
          {
            index: true,
            Component: PedidosIndex,
          },
          // Más rutas de pedidos después
        ],
      },
      {
        path: "cocina",
        Component: Cocina,
      },
      // Más rutas después
    ],
  },
]);