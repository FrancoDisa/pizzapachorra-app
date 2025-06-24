"use strict";
/**
 * Modelo para operaciones CRUD de clientes
 * Gestiona la interacción con la tabla clientes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientesModel = exports.ClientesModel = void 0;
const database_1 = require("@/config/database");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
class ClientesModel {
    pool;
    constructor() {
        this.pool = database_1.config.getPool();
    }
    /**
     * Obtener todos los clientes
     */
    async getAll(limit, offset) {
        try {
            let query = 'SELECT * FROM clientes ORDER BY ultimo_pedido DESC NULLS LAST, total_pedidos DESC, nombre ASC';
            const values = [];
            if (limit) {
                query += ` LIMIT $${values.length + 1}`;
                values.push(limit);
            }
            if (offset) {
                query += ` OFFSET $${values.length + 1}`;
                values.push(offset);
            }
            const result = await this.pool.query(query, values);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error al obtener clientes:', error);
            throw new errorHandler_1.DatabaseError('Error al obtener clientes');
        }
    }
    /**
     * Obtener cliente por ID
     */
    async getById(id) {
        try {
            const query = 'SELECT * FROM clientes WHERE id = $1';
            const result = await this.pool.query(query, [id]);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            logger_1.logger.error('Error al obtener cliente por ID:', error);
            throw new errorHandler_1.DatabaseError('Error al obtener cliente');
        }
    }
    /**
     * Obtener cliente por teléfono
     */
    async getByTelefono(telefono) {
        try {
            const query = 'SELECT * FROM clientes WHERE telefono = $1';
            const result = await this.pool.query(query, [telefono]);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            logger_1.logger.error('Error al obtener cliente por teléfono:', error);
            throw new errorHandler_1.DatabaseError('Error al obtener cliente por teléfono');
        }
    }
    /**
     * Crear nuevo cliente
     */
    async create(clienteData) {
        try {
            const query = `
        INSERT INTO clientes 
        (telefono, nombre, direccion, referencias, notas)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
            const values = [
                clienteData.telefono,
                clienteData.nombre || null,
                clienteData.direccion || null,
                clienteData.referencias || null,
                clienteData.notas || null
            ];
            const result = await this.pool.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            logger_1.logger.error('Error al crear cliente:', error);
            throw new errorHandler_1.DatabaseError('Error al crear cliente');
        }
    }
    /**
     * Actualizar cliente existente
     */
    async update(id, clienteData) {
        try {
            const updateFields = [];
            const values = [];
            let parameterIndex = 1;
            if (clienteData.telefono !== undefined) {
                updateFields.push(`telefono = $${parameterIndex++}`);
                values.push(clienteData.telefono);
            }
            if (clienteData.nombre !== undefined) {
                updateFields.push(`nombre = $${parameterIndex++}`);
                values.push(clienteData.nombre);
            }
            if (clienteData.direccion !== undefined) {
                updateFields.push(`direccion = $${parameterIndex++}`);
                values.push(clienteData.direccion);
            }
            if (clienteData.referencias !== undefined) {
                updateFields.push(`referencias = $${parameterIndex++}`);
                values.push(clienteData.referencias);
            }
            if (clienteData.notas !== undefined) {
                updateFields.push(`notas = $${parameterIndex++}`);
                values.push(clienteData.notas);
            }
            if (updateFields.length === 0) {
                return await this.getById(id);
            }
            updateFields.push(`updated_at = NOW()`);
            values.push(id);
            const query = `
        UPDATE clientes 
        SET ${updateFields.join(', ')}
        WHERE id = $${parameterIndex}
        RETURNING *
      `;
            const result = await this.pool.query(query, values);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            logger_1.logger.error('Error al actualizar cliente:', error);
            throw new errorHandler_1.DatabaseError('Error al actualizar cliente');
        }
    }
    /**
     * Eliminar cliente
     */
    async delete(id) {
        try {
            const query = 'DELETE FROM clientes WHERE id = $1 RETURNING id';
            const result = await this.pool.query(query, [id]);
            return result.rows.length > 0;
        }
        catch (error) {
            logger_1.logger.error('Error al eliminar cliente:', error);
            throw new errorHandler_1.DatabaseError('Error al eliminar cliente');
        }
    }
    /**
     * Autocompletar por teléfono
     */
    async autocompleteByTelefono(query, limit = 10) {
        try {
            const searchQuery = `
        SELECT telefono, nombre, direccion
        FROM clientes 
        WHERE telefono LIKE $1 
        ORDER BY 
          CASE WHEN telefono = $2 THEN 1 ELSE 2 END,
          ultimo_pedido DESC NULLS LAST,
          total_pedidos DESC
        LIMIT $3
      `;
            const result = await this.pool.query(searchQuery, [`${query}%`, query, limit]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error en autocompletado de teléfono:', error);
            throw new errorHandler_1.DatabaseError('Error en autocompletado');
        }
    }
    /**
     * Buscar clientes por texto (nombre, teléfono, dirección)
     */
    async search(searchTerm, limit = 20) {
        try {
            const query = `
        SELECT * FROM clientes 
        WHERE 
          telefono ILIKE $1 OR
          nombre ILIKE $1 OR
          direccion ILIKE $1
        ORDER BY 
          CASE 
            WHEN telefono = $2 THEN 1
            WHEN telefono ILIKE $3 THEN 2
            WHEN nombre ILIKE $3 THEN 3
            ELSE 4
          END,
          ultimo_pedido DESC NULLS LAST,
          total_pedidos DESC
        LIMIT $4
      `;
            const searchPattern = `%${searchTerm}%`;
            const result = await this.pool.query(query, [searchPattern, searchTerm, `${searchTerm}%`, limit]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error al buscar clientes:', error);
            throw new errorHandler_1.DatabaseError('Error al buscar clientes');
        }
    }
    /**
     * Actualizar estadísticas del cliente (llamado desde pedidos)
     */
    async updateEstadisticas(clienteId) {
        try {
            const query = `
        UPDATE clientes 
        SET 
          total_pedidos = (
            SELECT COUNT(*) 
            FROM pedidos 
            WHERE cliente_id = $1 AND estado != 'cancelado'
          ),
          total_gastado = COALESCE((
            SELECT SUM(total) 
            FROM pedidos 
            WHERE cliente_id = $1 AND estado = 'entregado'
          ), 0),
          ultimo_pedido = (
            SELECT MAX(fecha_pedido) 
            FROM pedidos 
            WHERE cliente_id = $1
          ),
          updated_at = NOW()
        WHERE id = $1
      `;
            await this.pool.query(query, [clienteId]);
        }
        catch (error) {
            logger_1.logger.error('Error al actualizar estadísticas del cliente:', error);
            throw new errorHandler_1.DatabaseError('Error al actualizar estadísticas del cliente');
        }
    }
    /**
     * Obtener historial de pedidos de un cliente
     */
    async getHistorialPedidos(clienteId, limit = 50) {
        try {
            const query = `
        SELECT 
          p.id,
          p.numero_pedido,
          p.estado,
          p.total,
          p.fecha_pedido,
          p.fecha_entrega,
          p.notas,
          COUNT(pi.id) as total_items
        FROM pedidos p
        LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
        WHERE p.cliente_id = $1
        GROUP BY p.id, p.numero_pedido, p.estado, p.total, p.fecha_pedido, p.fecha_entrega, p.notas
        ORDER BY p.fecha_pedido DESC
        LIMIT $2
      `;
            const result = await this.pool.query(query, [clienteId, limit]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error al obtener historial de pedidos:', error);
            throw new errorHandler_1.DatabaseError('Error al obtener historial de pedidos');
        }
    }
    /**
     * Obtener estadísticas generales de clientes
     */
    async getEstadisticas() {
        try {
            const query = `
        SELECT 
          COUNT(*) as total_clientes,
          COUNT(CASE WHEN ultimo_pedido >= NOW() - INTERVAL '30 days' THEN 1 END) as clientes_activos_mes,
          COUNT(CASE WHEN ultimo_pedido >= NOW() - INTERVAL '7 days' THEN 1 END) as clientes_activos_semana,
          COALESCE(AVG(total_pedidos), 0)::DECIMAL(10,2) as promedio_pedidos_por_cliente,
          COALESCE(AVG(total_gastado), 0)::DECIMAL(10,2) as promedio_gastado_por_cliente,
          MAX(total_pedidos) as max_pedidos_cliente,
          MAX(total_gastado) as max_gastado_cliente
        FROM clientes
      `;
            const result = await this.pool.query(query);
            return result.rows[0];
        }
        catch (error) {
            logger_1.logger.error('Error al obtener estadísticas de clientes:', error);
            throw new errorHandler_1.DatabaseError('Error al obtener estadísticas');
        }
    }
    /**
     * Verificar si existe un cliente con el mismo teléfono
     */
    async existsByTelefono(telefono, excludeId) {
        try {
            let query = 'SELECT id FROM clientes WHERE telefono = $1';
            const values = [telefono];
            if (excludeId) {
                query += ' AND id != $2';
                values.push(excludeId);
            }
            const result = await this.pool.query(query, values);
            return result.rows.length > 0;
        }
        catch (error) {
            logger_1.logger.error('Error al verificar existencia de cliente:', error);
            throw new errorHandler_1.DatabaseError('Error al verificar cliente');
        }
    }
}
exports.ClientesModel = ClientesModel;
exports.clientesModel = new ClientesModel();
//# sourceMappingURL=clientesModel.js.map