"use strict";
/**
 * Modelo para operaciones CRUD de extras
 * Gestiona la interacción con la tabla extras
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extrasModel = exports.ExtrasModel = void 0;
const database_1 = require("@/config/database");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
class ExtrasModel {
    pool;
    constructor() {
        this.pool = database_1.config.getPool();
    }
    /**
     * Obtener todos los extras
     */
    async getAll(includeInactive = false) {
        try {
            const query = includeInactive
                ? 'SELECT * FROM extras ORDER BY categoria ASC, orden_categoria ASC, nombre ASC'
                : 'SELECT * FROM extras WHERE activo = true ORDER BY categoria ASC, orden_categoria ASC, nombre ASC';
            const result = await this.pool.query(query);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error al obtener extras:', error);
            throw new errorHandler_1.DatabaseError('Error al obtener extras');
        }
    }
    /**
     * Obtener extra por ID
     */
    async getById(id) {
        try {
            const query = 'SELECT * FROM extras WHERE id = $1';
            const result = await this.pool.query(query, [id]);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            logger_1.logger.error('Error al obtener extra por ID:', error);
            throw new errorHandler_1.DatabaseError('Error al obtener extra');
        }
    }
    /**
     * Crear nuevo extra
     */
    async create(extraData) {
        try {
            const query = `
        INSERT INTO extras 
        (nombre, precio, categoria, activo, orden_categoria)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
            const values = [
                extraData.nombre,
                extraData.precio,
                extraData.categoria,
                extraData.activo,
                extraData.orden_categoria
            ];
            const result = await this.pool.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            logger_1.logger.error('Error al crear extra:', error);
            throw new errorHandler_1.DatabaseError('Error al crear extra');
        }
    }
    /**
     * Actualizar extra existente
     */
    async update(id, extraData) {
        try {
            const updateFields = [];
            const values = [];
            let parameterIndex = 1;
            if (extraData.nombre !== undefined) {
                updateFields.push(`nombre = $${parameterIndex++}`);
                values.push(extraData.nombre);
            }
            if (extraData.precio !== undefined) {
                updateFields.push(`precio = $${parameterIndex++}`);
                values.push(extraData.precio);
            }
            if (extraData.categoria !== undefined) {
                updateFields.push(`categoria = $${parameterIndex++}`);
                values.push(extraData.categoria);
            }
            if (extraData.activo !== undefined) {
                updateFields.push(`activo = $${parameterIndex++}`);
                values.push(extraData.activo);
            }
            if (extraData.orden_categoria !== undefined) {
                updateFields.push(`orden_categoria = $${parameterIndex++}`);
                values.push(extraData.orden_categoria);
            }
            if (updateFields.length === 0) {
                return await this.getById(id);
            }
            values.push(id);
            const query = `
        UPDATE extras 
        SET ${updateFields.join(', ')}
        WHERE id = $${parameterIndex}
        RETURNING *
      `;
            const result = await this.pool.query(query, values);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            logger_1.logger.error('Error al actualizar extra:', error);
            throw new errorHandler_1.DatabaseError('Error al actualizar extra');
        }
    }
    /**
     * Eliminar extra (soft delete)
     */
    async delete(id) {
        try {
            const query = `
        UPDATE extras 
        SET activo = false
        WHERE id = $1
        RETURNING id
      `;
            const result = await this.pool.query(query, [id]);
            return result.rows.length > 0;
        }
        catch (error) {
            logger_1.logger.error('Error al eliminar extra:', error);
            throw new errorHandler_1.DatabaseError('Error al eliminar extra');
        }
    }
    /**
     * Obtener extras por categoría
     */
    async getByCategory(categoria, includeInactive = false) {
        try {
            const query = includeInactive
                ? 'SELECT * FROM extras WHERE categoria = $1 ORDER BY orden_categoria ASC, nombre ASC'
                : 'SELECT * FROM extras WHERE categoria = $1 AND activo = true ORDER BY orden_categoria ASC, nombre ASC';
            const result = await this.pool.query(query, [categoria]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error al obtener extras por categoría:', error);
            throw new errorHandler_1.DatabaseError('Error al obtener extras por categoría');
        }
    }
    /**
     * Obtener menú activo agrupado por categorías
     */
    async getActiveMenu() {
        try {
            const query = `
        SELECT * FROM extras 
        WHERE activo = true 
        ORDER BY categoria ASC, orden_categoria ASC, nombre ASC
      `;
            const result = await this.pool.query(query);
            const extras = result.rows;
            // Agrupar por categoría
            const menuPorCategoria = {};
            extras.forEach((extra) => {
                if (!menuPorCategoria[extra.categoria]) {
                    menuPorCategoria[extra.categoria] = [];
                }
                menuPorCategoria[extra.categoria]?.push(extra);
            });
            return menuPorCategoria;
        }
        catch (error) {
            logger_1.logger.error('Error al obtener menú activo de extras:', error);
            throw new errorHandler_1.DatabaseError('Error al obtener menú activo de extras');
        }
    }
    /**
     * Verificar si existe un extra por nombre en la misma categoría
     */
    async existsByNameAndCategory(nombre, categoria, excludeId) {
        try {
            let query = 'SELECT id FROM extras WHERE LOWER(nombre) = LOWER($1) AND categoria = $2';
            const values = [nombre, categoria];
            if (excludeId) {
                query += ' AND id != $3';
                values.push(excludeId);
            }
            const result = await this.pool.query(query, values);
            return result.rows.length > 0;
        }
        catch (error) {
            logger_1.logger.error('Error al verificar existencia de extra:', error);
            throw new errorHandler_1.DatabaseError('Error al verificar extra');
        }
    }
    /**
     * Obtener extras por IDs (útil para pedidos)
     */
    async getByIds(ids) {
        try {
            if (ids.length === 0)
                return [];
            const query = 'SELECT * FROM extras WHERE id = ANY($1) AND activo = true';
            const result = await this.pool.query(query, [ids]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error al obtener extras por IDs:', error);
            throw new errorHandler_1.DatabaseError('Error al obtener extras');
        }
    }
}
exports.ExtrasModel = ExtrasModel;
exports.extrasModel = new ExtrasModel();
//# sourceMappingURL=extrasModel.js.map