import {
  type RouteConfig,
  route,
  index
} from "@react-router/dev/routes";

export default [
  // Dashboard principal
  index("./pages/dashboard.tsx"),
  
  // Gestión de pedidos
  route("pedidos", "./pages/pedidos.tsx", [
    index("./pages/pedidos/index.tsx")
  ]),

  // Vista de cocina
  route("cocina", "./pages/cocina.tsx")
] satisfies RouteConfig;