/**
 * Modelo para operaciones CRUD de pizzas
 * Gestiona la interacción con la tabla pizzas
 */

import { Pool } from 'pg';
import { config } from '@/config/database';
import { Pizza } from '@/types';
import { DatabaseError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class PizzasModel {
  private pool: Pool;

  constructor() {
    this.pool = config.getPool();
  }

  /**
   * Obtener todas las pizzas
   */
  async getAll(includeInactive = false): Promise<Pizza[]> {
    try {
      const query = includeInactive
        ? 'SELECT * FROM pizzas ORDER BY orden_menu ASC, nombre ASC'
        : 'SELECT * FROM pizzas WHERE activa = true ORDER BY orden_menu ASC, nombre ASC';

      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error al obtener pizzas:', error);
      throw new DatabaseError('Error al obtener pizzas');
    }
  }

  /**
   * Obtener pizza por ID
   */
  async getById(id: number): Promise<Pizza | null> {
    try {
      const query = 'SELECT * FROM pizzas WHERE id = $1';
      const result = await this.pool.query(query, [id]);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('Error al obtener pizza por ID:', error);
      throw new DatabaseError('Error al obtener pizza');
    }
  }

  /**
   * Crear nueva pizza
   */
  async create(pizzaData: Omit<Pizza, 'id' | 'created_at' | 'updated_at'>): Promise<Pizza> {
    try {
      const query = `
        INSERT INTO pizzas 
        (nombre, precio_base, ingredientes, descripcion, activa, orden_menu)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [
        pizzaData.nombre,
        pizzaData.precio_base,
        JSON.stringify(pizzaData.ingredientes),
        pizzaData.descripcion || null,
        pizzaData.activa,
        pizzaData.orden_menu
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error al crear pizza:', error);
      throw new DatabaseError('Error al crear pizza');
    }
  }

  /**
   * Actualizar pizza existente
   */
  async update(id: number, pizzaData: Partial<Omit<Pizza, 'id' | 'created_at' | 'updated_at'>>): Promise<Pizza | null> {
    try {
      const updateFields = [];
      const values = [];
      let parameterIndex = 1;

      if (pizzaData.nombre !== undefined) {
        updateFields.push(`nombre = $${parameterIndex++}`);
        values.push(pizzaData.nombre);
      }

      if (pizzaData.precio_base !== undefined) {
        updateFields.push(`precio_base = $${parameterIndex++}`);
        values.push(pizzaData.precio_base);
      }

      if (pizzaData.ingredientes !== undefined) {
        updateFields.push(`ingredientes = $${parameterIndex++}`);
        values.push(JSON.stringify(pizzaData.ingredientes));
      }

      if (pizzaData.descripcion !== undefined) {
        updateFields.push(`descripcion = $${parameterIndex++}`);
        values.push(pizzaData.descripcion);
      }

      if (pizzaData.activa !== undefined) {
        updateFields.push(`activa = $${parameterIndex++}`);
        values.push(pizzaData.activa);
      }

      if (pizzaData.orden_menu !== undefined) {
        updateFields.push(`orden_menu = $${parameterIndex++}`);
        values.push(pizzaData.orden_menu);
      }

      if (updateFields.length === 0) {
        return await this.getById(id);
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE pizzas 
        SET ${updateFields.join(', ')}
        WHERE id = $${parameterIndex}
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('Error al actualizar pizza:', error);
      throw new DatabaseError('Error al actualizar pizza');
    }
  }

  /**
   * Eliminar pizza (soft delete)
   */
  async delete(id: number): Promise<boolean> {
    try {
      const query = `
        UPDATE pizzas 
        SET activa = false, updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `;

      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error al eliminar pizza:', error);
      throw new DatabaseError('Error al eliminar pizza');
    }
  }

  /**
   * Obtener menú activo ordenado
   */
  async getActiveMenu(): Promise<Pizza[]> {
    try {
      const query = `
        SELECT * FROM pizzas 
        WHERE activa = true 
        ORDER BY orden_menu ASC, nombre ASC
      `;

      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error al obtener menú activo:', error);
      throw new DatabaseError('Error al obtener menú activo');
    }
  }

  /**
   * Verificar si existe una pizza por nombre
   */
  async existsByName(nombre: string, excludeId?: number): Promise<boolean> {
    try {
      let query = 'SELECT id FROM pizzas WHERE LOWER(nombre) = LOWER($1)';
      const values: any[] = [nombre];

      if (excludeId) {
        query += ' AND id != $2';
        values.push(excludeId);
      }

      const result = await this.pool.query(query, values);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error al verificar existencia de pizza:', error);
      throw new DatabaseError('Error al verificar pizza');
    }
  }
}

export const pizzasModel = new PizzasModel();