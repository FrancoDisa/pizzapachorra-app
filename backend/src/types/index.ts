export interface Pizza {
  id: number;
  nombre: string;
  precio_base: number;
  ingredientes: string[];
  descripcion?: string;
  activa: boolean;
  orden_menu: number;
  created_at: Date;
  updated_at: Date;
}

export interface Extra {
  id: number;
  nombre: string;
  precio: number;
  categoria: CategoriaExtra;
  activo: boolean;
  orden_categoria: number;
  created_at: Date;
}

export interface Cliente {
  id: number;
  telefono: string;
  nombre?: string;
  direccion?: string;
  referencias?: string;
  notas?: string;
  total_pedidos: number;
  total_gastado: number;
  ultimo_pedido?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Pedido {
  id: number;
  numero_pedido: string;
  cliente_id?: number;
  estado: EstadoPedido;
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago: MetodoPago;
  notas?: string;
  tiempo_estimado?: number;
  fecha_pedido: Date;
  fecha_preparacion?: Date;
  fecha_listo?: Date;
  fecha_entrega?: Date;
  fecha_cancelacion?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  pizza_id: number;
  cantidad: number;
  es_mitad_y_mitad: boolean;
  extras_principales: number[];
  ingredientes_removidos: string[];
  pizza_id_mitad2?: number;
  extras_mitad2: number[];
  ingredientes_removidos_mitad2: string[];
  precio_base: number;
  precio_extras: number;
  precio_total: number;
  notas?: string;
  created_at: Date;
}

export interface HistorialEstado {
  id: number;
  pedido_id: number;
  estado_anterior?: EstadoPedido;
  estado_nuevo: EstadoPedido;
  motivo?: string;
  usuario: string;
  timestamp: Date;
}

export interface PedidoCompleto extends Pedido {
  cliente?: Cliente;
  items: PedidoItemCompleto[];
  historial?: HistorialEstado[];
}

export interface PedidoItemCompleto extends PedidoItem {
  pizza: Pizza;
  extras: Extra[];
  pizza_mitad2?: Pizza;
  extras_mitad2_data?: Extra[];
}

export interface CrearPedidoRequest {
  cliente_id?: number;
  cliente_data?: {
    telefono: string;
    nombre?: string;
    direccion?: string;
    referencias?: string;
  };
  items: CrearPedidoItemRequest[];
  descuento?: number;
  metodo_pago?: MetodoPago;
  notas?: string;
  tiempo_estimado?: number;
}

export interface CrearPedidoItemRequest {
  pizza_id: number;
  cantidad: number;
  es_mitad_y_mitad?: boolean;
  extras_principales?: number[];
  ingredientes_removidos?: string[];
  pizza_id_mitad2?: number;
  extras_mitad2?: number[];
  ingredientes_removidos_mitad2?: string[];
  notas?: string;
}

export type EstadoPedido = 'nuevo' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

export type CategoriaExtra = 'condimentos' | 'vegetales' | 'proteinas' | 'carnes' | 'quesos' | 'especiales' | 'general';

export * from './estados';
export * from './precios';
export * from './validacion';