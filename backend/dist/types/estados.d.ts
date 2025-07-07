import { EstadoPedido } from './index';
export declare const ESTADOS_PEDIDO: Record<EstadoPedido, string>;
export declare const TRANSICIONES_VALIDAS: Record<EstadoPedido, EstadoPedido[]>;
export declare function esTransicionValida(estadoActual: EstadoPedido, nuevoEstado: EstadoPedido): boolean;
export declare function obtenerSiguientesEstados(estadoActual: EstadoPedido): EstadoPedido[];
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
//# sourceMappingURL=estados.d.ts.map