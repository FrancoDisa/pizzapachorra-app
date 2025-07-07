/**
 * Modelo para operaciones CRUD de pedidos
 * Gestiona la interacción con las tablas pedidos, pedido_items y historial_estados
 */
import { Pedido, PedidoCompleto, HistorialEstado, EstadoPedido, CrearPedidoRequest } from '@/types';
export declare class PedidosModel {
    private pool;
    constructor();
    /**
     * Obtener todos los pedidos con filtros
     */
    getAll(estado?: EstadoPedido, fechaInicio?: Date, fechaFin?: Date, clienteId?: number, limit?: number, offset?: number): Promise<PedidoCompleto[]>;
    /**
     * Obtener pedido por ID
     */
    getById(id: number): Promise<PedidoCompleto | null>;
    /**
     * Crear nuevo pedido
     */
    create(pedidoData: CrearPedidoRequest, numeroPedido: string): Promise<PedidoCompleto>;
    /**
     * Actualizar pedido
     */
    update(id: number, updateData: Partial<Pedido>): Promise<PedidoCompleto | null>;
    /**
     * Cambiar estado de pedido
     */
    cambiarEstado(id: number, nuevoEstado: EstadoPedido, motivo?: string, usuario?: string): Promise<PedidoCompleto | null>;
    /**
     * Obtener pedidos por estado
     */
    getByEstado(estado: EstadoPedido, limit?: number): Promise<PedidoCompleto[]>;
    /**
     * Obtener pedidos activos para cocina
     */
    getPedidosCocina(): Promise<PedidoCompleto[]>;
    /**
     * Obtener resumen del día
     */
    getResumenHoy(): Promise<any>;
    /**
     * Obtener historial de estados de un pedido
     */
    getHistorialEstados(pedidoId: number): Promise<HistorialEstado[]>;
    /**
     * Construir pedido completo con items y cliente
     */
    private buildPedidoCompleto;
    /**
     * Construir item completo con pizzas y extras
     */
    private buildPedidoItemCompleto;
    /**
     * Obtener extras por IDs
     */
    private getExtrasByIds;
    /**
     * Crear registro en historial de estados
     */
    private createHistorialEstado;
    /**
     * Verificar si existe un pedido
     */
    exists(id: number): Promise<boolean>;
}
export declare const pedidosModel: PedidosModel;
//# sourceMappingURL=pedidosModel.d.ts.map