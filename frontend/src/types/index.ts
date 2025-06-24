// Tipos compartidos con el backend

export type EstadoPedido = 'nuevo' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';

export interface Pizza {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  ingredientes_incluidos: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Extra {
  id: number;
  nombre: string;
  precio: number;
  categoria: 'base' | 'premium' | 'especial';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: number;
  telefono: string;
  nombre?: string;
  direccion?: string;
  created_at: string;
  updated_at: string;
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  pizza_id: number;
  cantidad: number;
  precio_unitario: number;
  es_mitad_y_mitad: boolean;
  pizza_mitad_1?: number;
  pizza_mitad_2?: number;
  extras_agregados: number[];
  extras_removidos: number[];
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface Pedido {
  id: number;
  cliente_id: number;
  estado: EstadoPedido;
  total: number;
  notas?: string;
  created_at: string;
  updated_at: string;
  items: PedidoItem[];
  cliente: Cliente;
}

// Tipos para formularios
export interface CrearPedidoForm {
  cliente_id: number;
  items: Omit<PedidoItem, 'id' | 'pedido_id' | 'created_at' | 'updated_at'>[];
  notas?: string;
}

export interface CrearClienteForm {
  telefono: string;
  nombre?: string;
  direccion?: string;
}

// Tipos para el estado de la aplicación
export interface MenuData {
  pizzas: Pizza[];
  extras: Extra[];
}

export interface AppState {
  menu: MenuData;
  pedidos: Pedido[];
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
}

// Tipos para WebSocket
export interface WebSocketMessage {
  type: 'nuevo_pedido' | 'cambio_estado' | 'pedido_actualizado' | 'cliente_actualizado';
  data: Pedido | Cliente | Record<string, unknown>;
}

// Tipos para configuración
export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
}