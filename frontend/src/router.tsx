import { createBrowserRouter } from 'react-router';
import Root from '../app/root';
import Dashboard from './pages/dashboard';
import PedidosLayout from './pages/pedidos';
import PedidosIndex from './pages/pedidos/index';
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
        Component: PedidosLayout,
        children: [
          {
            index: true,
            Component: PedidosIndex,
          },
        ],
      },
      {
        path: "pedidos-new",
        Component: PedidosNew,
      },
      {
        path: "cocina",
        Component: Cocina,
      },
    ],
  },
]);