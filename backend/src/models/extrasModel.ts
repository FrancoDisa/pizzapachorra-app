/**
 * Modelo para operaciones CRUD de extras
 * Gestiona la interacción con la tabla extras
 */

import { Pool } from 'pg';
import { config } from '@/config/database';
import { Extra, CategoriaExtra } from '@/types';
import { DatabaseError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class ExtrasModel {
  private pool: Pool;

  constructor() {
    this.pool = config.getPool();
  }

  /**
   * Obtener todos los extras
   */
  async getAll(includeInactive = false): Promise<Extra[]> {
    try {
      const query = includeInactive
        ? 'SELECT * FROM extras ORDER BY categoria ASC, orden_categoria ASC, nombre ASC'
        : 'SELECT * FROM extras WHERE activo = true ORDER BY categoria ASC, orden_categoria ASC, nombre ASC';

      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error al obtener extras:', error);
      throw new DatabaseError('Error al obtener extras');
    }
  }

  /**
   * Obtener extra por ID
   */
  async getById(id: number): Promise<Extra | null> {
    try {
      const query = 'SELECT * FROM extras WHERE id = $1';
      const result = await this.pool.query(query, [id]);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('Error al obtener extra por ID:', error);
      throw new DatabaseError('Error al obtener extra');
    }
  }

  /**
   * Crear nuevo extra
   */
  async create(extraData: Omit<Extra, 'id' | 'created_at'>): Promise<Extra> {
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
    } catch (error) {
      logger.error('Error al crear extra:', error);
      throw new DatabaseError('Error al crear extra');
    }
  }

  /**
   * Actualizar extra existente
   */
  async update(id: number, extraData: Partial<Omit<Extra, 'id' | 'created_at'>>): Promise<Extra | null> {
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
    } catch (error) {
      logger.error('Error al actualizar extra:', error);
      throw new DatabaseError('Error al actualizar extra');
    }
  }

  /**
   * Eliminar extra (soft delete)
   */
  async delete(id: number): Promise<boolean> {
    try {
      const query = `
        UPDATE extras 
        SET activo = false
        WHERE id = $1
        RETURNING id
      `;

      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error al eliminar extra:', error);
      throw new DatabaseError('Error al eliminar extra');
    }
  }

  /**
   * Obtener extras por categoría
   */
  async getByCategory(categoria: CategoriaExtra, includeInactive = false): Promise<Extra[]> {
    try {
      const query = includeInactive
        ? 'SELECT * FROM extras WHERE categoria = $1 ORDER BY orden_categoria ASC, nombre ASC'
        : 'SELECT * FROM extras WHERE categoria = $1 AND activo = true ORDER BY orden_categoria ASC, nombre ASC';

      const result = await this.pool.query(query, [categoria]);
      return result.rows;
    } catch (error) {
      logger.error('Error al obtener extras por categoría:', error);
      throw new DatabaseError('Error al obtener extras por categoría');
    }
  }

  /**
   * Obtener menú activo agrupado por categorías
   */
  async getActiveMenu(): Promise<Record<CategoriaExtra, Extra[]>> {
    try {
      const query = `
        SELECT * FROM extras 
        WHERE activo = true 
        ORDER BY categoria ASC, orden_categoria ASC, nombre ASC
      `;

      const result = await this.pool.query(query);
      const extras = result.rows;

      // Agrupar por categoría
      const menuPorCategoria: Record<string, Extra[]> = {};
      
      extras.forEach((extra: Extra) => {
        if (!menuPorCategoria[extra.categoria]) {
          menuPorCategoria[extra.categoria] = [];
        }
        menuPorCategoria[extra.categoria]?.push(extra);
      });

      return menuPorCategoria as Record<CategoriaExtra, Extra[]>;
    } catch (error) {
      logger.error('Error al obtener menú activo de extras:', error);
      throw new DatabaseError('Error al obtener menú activo de extras');
    }
  }

  /**
   * Verificar si existe un extra por nombre en la misma categoría
   */
  async existsByNameAndCategory(nombre: string, categoria: CategoriaExtra, excludeId?: number): Promise<boolean> {
    try {
      let query = 'SELECT id FROM extras WHERE LOWER(nombre) = LOWER($1) AND categoria = $2';
      const values: any[] = [nombre, categoria];

      if (excludeId) {
        query += ' AND id != $3';
        values.push(excludeId);
      }

      const result = await this.pool.query(query, values);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error al verificar existencia de extra:', error);
      throw new DatabaseError('Error al verificar extra');
    }
  }

  /**
   * Obtener extras por IDs (útil para pedidos)
   */
  async getByIds(ids: number[]): Promise<Extra[]> {
    try {
      if (ids.length === 0) return [];

      const query = 'SELECT * FROM extras WHERE id = ANY($1) AND activo = true';
      const result = await this.pool.query(query, [ids]);
      
      return result.rows;
    } catch (error) {
      logger.error('Error al obtener extras por IDs:', error);
      throw new DatabaseError('Error al obtener extras');
    }
  }
}

export const extrasModel = new ExtrasModel();