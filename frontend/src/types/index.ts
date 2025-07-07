// Tipos compartidos con el backend

export type EstadoPedido = 'nuevo' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';

export interface Pizza {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: string;
  ingredientes: string[];
  activa: boolean;
  orden_menu?: number;
  created_at: string;
  updated_at: string;
}

export interface Extra {
  id: number;
  nombre: string;
  precio: string;
  categoria: string;
  activo: boolean;
  orden_categoria?: number;
  created_at: string;
  updated_at?: string;
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

// Tipos específicos para funcionalidad de cocina
export interface KitchenOrderState {
  tiempoTranscurrido: number; // en minutos
  prioridad: 'normal' | 'urgente' | 'critico';
  enPreparacionDesde?: Date;
}

export interface OrderTimerState {
  orderId: number;
  startTime: Date;
  elapsed: number; // en minutos
  status: 'running' | 'paused' | 'completed';
}

export interface KitchenFilter {
  estado?: EstadoPedido[];
  busqueda?: string;
  prioridad?: 'normal' | 'urgente' | 'critico';
  ordenamiento: 'tiempo_asc' | 'tiempo_desc' | 'id_asc' | 'id_desc' | 'prioridad';
}

export interface KitchenSettings {
  notificacionesAudio: boolean;
  volumenAudio: number; // 0-100
  tiempoAlertaUrgente: number; // minutos para marcar como urgente
  tiempoAlertaCritico: number; // minutos para marcar como crítico
  modoFullscreen: boolean;
  actualizacionAutomatica: boolean;
}

// Tipos para pizzas con información completa para cocina
export interface PizzaWithDetails extends Pizza {
  extras_agregados?: Extra[];
  extras_removidos?: Extra[];
}

export interface PedidoItemWithDetails extends PedidoItem {
  pizza?: Pizza | undefined;
  pizza_mitad_1_data?: Pizza | undefined;
  pizza_mitad_2_data?: Pizza | undefined;
  extras_agregados_data?: Extra[] | undefined;
  extras_removidos_data?: Extra[] | undefined;
}

export interface PedidoWithDetails extends Pedido {
  items: PedidoItemWithDetails[];
  tiempoTranscurrido?: number;
  prioridad?: 'normal' | 'urgente' | 'critico';
}

// Tipos para notificaciones de audio
export interface AudioNotification {
  type: 'nuevo_pedido' | 'cambio_estado' | 'alerta_tiempo';
  audioFile: string;
  enabled: boolean;
}

export interface KitchenAudioSettings {
  nuevoPedido: AudioNotification;
  cambioEstado: AudioNotification;
  alertaTiempo: AudioNotification;
  volumenGeneral: number;
}

// Tipos para la orden actual en progreso
export interface CurrentOrderItem {
  id: string; // ID temporal para la orden actual
  pizza_id: number;
  cantidad: number;
  precio_unitario: number;
  es_mitad_y_mitad: boolean;
  pizza_mitad_1?: number;
  pizza_mitad_2?: number;
  // Extras para pizza entera (cuando NO es mitad y mitad)
  extras_agregados: number[];
  extras_removidos: number[];
  // Extras específicos por mitad (cuando ES mitad y mitad)
  mitad1_extras_agregados?: number[];
  mitad1_extras_removidos?: number[];
  mitad2_extras_agregados?: number[];
  mitad2_extras_removidos?: number[];
  // Extras que aplican a ambas mitades
  ambas_mitades_extras_agregados?: number[];
  ambas_mitades_extras_removidos?: number[];
  notas?: string;
  pizza?: Pizza; // Datos de la pizza para mostrar
  extras_agregados_data?: Extra[]; // Datos de extras agregados
  extras_removidos_data?: Extra[]; // Datos de extras removidos
  // Datos de extras por mitad para mostrar
  mitad1_extras_agregados_data?: Extra[];
  mitad1_extras_removidos_data?: Extra[];
  mitad2_extras_agregados_data?: Extra[];
  mitad2_extras_removidos_data?: Extra[];
  ambas_mitades_extras_agregados_data?: Extra[];
  ambas_mitades_extras_removidos_data?: Extra[];
}

export interface CurrentOrder {
  items: CurrentOrderItem[];
  cliente_id?: number;
  cliente?: Cliente;
  subtotal: number;
  total: number;
  notas?: string;
}