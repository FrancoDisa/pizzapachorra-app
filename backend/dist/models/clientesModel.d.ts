/**
 * Modelo para operaciones CRUD de clientes
 * Gestiona la interacción con la tabla clientes
 */
import { Cliente } from '@/types';
export declare class ClientesModel {
    private pool;
    constructor();
    /**
     * Obtener todos los clientes
     */
    getAll(limit?: number, offset?: number): Promise<Cliente[]>;
    /**
     * Obtener cliente por ID
     */
    getById(id: number): Promise<Cliente | null>;
    /**
     * Obtener cliente por teléfono
     */
    getByTelefono(telefono: string): Promise<Cliente | null>;
    /**
     * Crear nuevo cliente
     */
    create(clienteData: Omit<Cliente, 'id' | 'total_pedidos' | 'total_gastado' | 'ultimo_pedido' | 'created_at' | 'updated_at'>): Promise<Cliente>;
    /**
     * Actualizar cliente existente
     */
    update(id: number, clienteData: Partial<Omit<Cliente, 'id' | 'total_pedidos' | 'total_gastado' | 'ultimo_pedido' | 'created_at' | 'updated_at'>>): Promise<Cliente | null>;
    /**
     * Eliminar cliente
     */
    delete(id: number): Promise<boolean>;
    /**
     * Autocompletar por teléfono
     */
    autocompleteByTelefono(query: string, limit?: number): Promise<Pick<Cliente, 'telefono' | 'nombre' | 'direccion'>[]>;
    /**
     * Buscar clientes por texto (nombre, teléfono, dirección)
     */
    search(searchTerm: string, limit?: number): Promise<Cliente[]>;
    /**
     * Actualizar estadísticas del cliente (llamado desde pedidos)
     */
    updateEstadisticas(clienteId: number): Promise<void>;
    /**
     * Obtener historial de pedidos de un cliente
     */
    getHistorialPedidos(clienteId: number, limit?: number): Promise<any[]>;
    /**
     * Obtener estadísticas generales de clientes
     */
    getEstadisticas(): Promise<any>;
    /**
     * Verificar si existe un cliente con el mismo teléfono
     */
    existsByTelefono(telefono: string, excludeId?: number): Promise<boolean>;
}
export declare const clientesModel: ClientesModel;
//# sourceMappingURL=clientesModel.d.ts.map