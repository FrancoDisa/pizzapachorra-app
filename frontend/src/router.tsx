import { createBrowserRouter } from 'react-router';
import Root from '../app/root';
import Dashboard from './pages/dashboard';
import PedidosLayout from './pages/pedidos';
import PedidosIndex from './pages/pedidos/index';
import PedidosNew from './pages/pedidos-new';
import Cocina from './pages/cocina';
import PedidosPropuesta1 from './pages/pedidos-propuesta1';
import PedidosPropuesta2 from './pages/pedidos-propuesta2';
import PedidosPropuesta3 from './pages/pedidos-propuesta3';
import PedidosPropuesta4 from './pages/pedidos-propuesta4';
import PedidosPropuesta5 from './pages/pedidos-propuesta5';
import PropuestasNavegacion from './pages/propuestas-navegacion';

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
        path: "pedidos-new",
        Component: PedidosNew,
      },
      {
        path: "cocina",
        Component: Cocina,
      },
      // Navegación de propuestas
      {
        path: "propuestas",
        Component: PropuestasNavegacion,
      },
      // Propuestas de diseño para evaluación
      {
        path: "propuesta1",
        Component: PedidosPropuesta1,
      },
      {
        path: "propuesta2", 
        Component: PedidosPropuesta2,
      },
      {
        path: "propuesta3",
        Component: PedidosPropuesta3,
      },
      {
        path: "propuesta4",
        Component: PedidosPropuesta4,
      },
      {
        path: "propuesta5",
        Component: PedidosPropuesta5,
      },
      // Más rutas después
    ],
  },
]);