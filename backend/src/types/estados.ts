import { EstadoPedido } from './index';

export const ESTADOS_PEDIDO: Record<EstadoPedido, string> = {
  nuevo: 'Nuevo',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

export const TRANSICIONES_VALIDAS: Record<EstadoPedido, EstadoPedido[]> = {
  nuevo: ['en_preparacion', 'cancelado'],
  en_preparacion: ['listo', 'cancelado'],
  listo: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: []
};

export function esTransicionValida(estadoActual: EstadoPedido, nuevoEstado: EstadoPedido): boolean {
  return TRANSICIONES_VALIDAS[estadoActual].includes(nuevoEstado);
}

export function obtenerSiguientesEstados(estadoActual: EstadoPedido): EstadoPedido[] {
  return TRANSICIONES_VALIDAS[estadoActual];
}

export interface CambioEstado {
  pedido_id: number;
  estado_anterior: EstadoPedido;
  estado_nuevo: EstadoPedido;
  motivo?: string;
  usuario?: string;
}

export interface ValidacionCambioEstado {
  valido: boolean;
  error?: string;
  siguientes_estados?: EstadoPedido[];
}