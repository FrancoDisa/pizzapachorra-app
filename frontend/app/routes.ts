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
    index("./pages/pedidos/index.tsx"),
    route("nuevo", "./pages/pedidos/nuevo.tsx"),
    route(":id", "./pages/pedidos/detalle.tsx"),
    route(":id/edit", "./pages/pedidos/editar.tsx")
  ]),

  // Vista de cocina
  route("cocina", "./pages/cocina.tsx"),

  // Gestión de clientes
  route("clientes", "./pages/clientes.tsx", [
    index("./pages/clientes/index.tsx"),
    route("nuevo", "./pages/clientes/nuevo.tsx"),
    route(":id", "./pages/clientes/detalle.tsx"),
    route(":id/edit", "./pages/clientes/editar.tsx")
  ]),

  // Configuración del menú
  route("menu", "./pages/menu.tsx", [
    index("./pages/menu/index.tsx"),
    route("pizzas", "./pages/menu/pizzas.tsx"),
    route("extras", "./pages/menu/extras.tsx"),
    route("pizzas/:id/edit", "./pages/menu/pizzas/editar.tsx"),
    route("extras/:id/edit", "./pages/menu/extras/editar.tsx")
  ])
] satisfies RouteConfig;