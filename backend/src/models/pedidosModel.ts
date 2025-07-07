/**
 * Modelo para operaciones CRUD de pedidos
 * Gestiona la interacción con las tablas pedidos, pedido_items y historial_estados
 */

import { Pool } from 'pg';
import { config } from '@/config/database';
import { 
  Pedido, 
  PedidoCompleto, 
  PedidoItem, 
  PedidoItemCompleto, 
  HistorialEstado, 
  EstadoPedido, 
  CrearPedidoRequest
} from '@/types';
import { DatabaseError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class PedidosModel {
  private pool: Pool;

  constructor() {
    this.pool = config.getPool();
  }

  /**
   * Obtener todos los pedidos con filtros
   */
  async getAll(
    estado?: EstadoPedido,
    fechaInicio?: Date,
    fechaFin?: Date,
    clienteId?: number,
    limit = 50,
    offset = 0
  ): Promise<PedidoCompleto[]> {
    try {
      let query = `
        SELECT 
          p.*,
          c.telefono as cliente_telefono,
          c.nombre as cliente_nombre,
          c.direccion as cliente_direccion
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
        WHERE 1=1
      `;
      
      const values: any[] = [];
      let paramIndex = 1;

      if (estado) {
        query += ` AND p.estado = $${paramIndex++}`;
        values.push(estado);
      }

      if (fechaInicio) {
        query += ` AND p.fecha_pedido >= $${paramIndex++}`;
        values.push(fechaInicio);
      }

      if (fechaFin) {
        query += ` AND p.fecha_pedido <= $${paramIndex++}`;
        values.push(fechaFin);
      }

      if (clienteId) {
        query += ` AND p.cliente_id = $${paramIndex++}`;
        values.push(clienteId);
      }

      query += ` ORDER BY p.fecha_pedido DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      values.push(limit, offset);

      const result = await this.pool.query(query, values);
      
      // Cargar items para cada pedido
      const pedidos: PedidoCompleto[] = [];
      for (const row of result.rows) {
        const pedido = await this.buildPedidoCompleto(row);
        pedidos.push(pedido);
      }

      return pedidos;
    } catch (error) {
      logger.error('Error al obtener pedidos:', error);
      throw new DatabaseError('Error al obtener pedidos');
    }
  }

  /**
   * Obtener pedido por ID
   */
  async getById(id: number): Promise<PedidoCompleto | null> {
    try {
      const query = `
        SELECT 
          p.*,
          c.telefono as cliente_telefono,
          c.nombre as cliente_nombre,
          c.direccion as cliente_direccion,
          c.referencias as cliente_referencias
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
        WHERE p.id = $1
      `;

      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return await this.buildPedidoCompleto(result.rows[0]);
    } catch (error) {
      logger.error('Error al obtener pedido por ID:', error);
      throw new DatabaseError('Error al obtener pedido');
    }
  }

  /**
   * Crear nuevo pedido
   */
  async create(pedidoData: CrearPedidoRequest, numeroPedido: string): Promise<PedidoCompleto> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Crear el pedido principal
      const pedidoQuery = `
        INSERT INTO pedidos 
        (numero_pedido, cliente_id, estado, subtotal, descuento, total, metodo_pago, notas, tiempo_estimado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const pedidoValues = [
        numeroPedido,
        pedidoData.cliente_id || null,
        'nuevo' as EstadoPedido,
        0, // Se calculará después
        pedidoData.descuento || 0,
        0, // Se calculará después
        pedidoData.metodo_pago || 'efectivo',
        pedidoData.notas || null,
        pedidoData.tiempo_estimado || null
      ];

      const pedidoResult = await client.query(pedidoQuery, pedidoValues);
      const nuevoPedido = pedidoResult.rows[0];

      // Crear los items del pedido
      const items: PedidoItem[] = [];
      for (const itemData of pedidoData.items) {
        const itemQuery = `
          INSERT INTO pedido_items 
          (pedido_id, pizza_id, cantidad, es_mitad_y_mitad, extras_principales, 
           ingredientes_removidos, pizza_id_mitad2, extras_mitad2, 
           ingredientes_removidos_mitad2, precio_base, precio_extras, precio_total, notas)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *
        `;

        const itemValues = [
          nuevoPedido.id,
          itemData.pizza_id,
          itemData.cantidad,
          itemData.es_mitad_y_mitad || false,
          JSON.stringify(itemData.extras_principales || []),
          JSON.stringify(itemData.ingredientes_removidos || []),
          itemData.pizza_id_mitad2 || null,
          JSON.stringify(itemData.extras_mitad2 || []),
          JSON.stringify(itemData.ingredientes_removidos_mitad2 || []),
          0, // Se calculará en el servicio
          0, // Se calculará en el servicio
          0, // Se calculará en el servicio
          itemData.notas || null
        ];

        const itemResult = await client.query(itemQuery, itemValues);
        items.push(itemResult.rows[0]);
      }

      // Crear registro en historial de estados
      await this.createHistorialEstado(
        client,
        nuevoPedido.id,
        undefined,
        'nuevo',
        'Pedido creado',
        'sistema'
      );

      await client.query('COMMIT');

      // Retornar pedido completo
      return await this.getById(nuevoPedido.id) as PedidoCompleto;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error al crear pedido:', error);
      throw new DatabaseError('Error al crear pedido');
    } finally {
      client.release();
    }
  }

  /**
   * Actualizar pedido
   */
  async update(id: number, updateData: Partial<Pedido>): Promise<PedidoCompleto | null> {
    try {
      const updateFields = [];
      const values = [];
      let parameterIndex = 1;

      // Campos que se pueden actualizar
      const updatableFields = [
        'cliente_id', 'subtotal', 'descuento', 'total', 'metodo_pago', 
        'notas', 'tiempo_estimado'
      ];

      for (const field of updatableFields) {
        if (updateData[field as keyof Pedido] !== undefined) {
          updateFields.push(`${field} = $${parameterIndex++}`);
          values.push(updateData[field as keyof Pedido]);
        }
      }

      if (updateFields.length === 0) {
        return await this.getById(id);
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(id as any);

      const query = `
        UPDATE pedidos 
        SET ${updateFields.join(', ')}
        WHERE id = $${parameterIndex}
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      return await this.getById(id);
    } catch (error) {
      logger.error('Error al actualizar pedido:', error);
      throw new DatabaseError('Error al actualizar pedido');
    }
  }

  /**
   * Cambiar estado de pedido
   */
  async cambiarEstado(
    id: number, 
    nuevoEstado: EstadoPedido, 
    motivo?: string, 
    usuario = 'sistema'
  ): Promise<PedidoCompleto | null> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Obtener estado actual
      const pedidoActual = await this.getById(id);
      if (!pedidoActual) {
        return null;
      }

      const estadoAnterior = pedidoActual.estado;

      // Actualizar estado y timestamp correspondiente
      const updateFields = ['estado = $1', 'updated_at = NOW()'];
      const values = [nuevoEstado];
      let paramIndex = 2;

      // Actualizar timestamps según el estado
      switch (nuevoEstado) {
        case 'en_preparacion':
          updateFields.push(`fecha_preparacion = NOW()`);
          break;
        case 'listo':
          updateFields.push(`fecha_listo = NOW()`);
          break;
        case 'entregado':
          updateFields.push(`fecha_entrega = NOW()`);
          break;
        case 'cancelado':
          updateFields.push(`fecha_cancelacion = NOW()`);
          break;
      }

      values.push(id as any);

      const updateQuery = `
        UPDATE pedidos 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      await client.query(updateQuery, values);

      // Crear registro en historial
      await this.createHistorialEstado(
        client,
        id,
        estadoAnterior,
        nuevoEstado,
        motivo,
        usuario
      );

      await client.query('COMMIT');

      return await this.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error al cambiar estado de pedido:', error);
      throw new DatabaseError('Error al cambiar estado de pedido');
    } finally {
      client.release();
    }
  }

  /**
   * Obtener pedidos por estado
   */
  async getByEstado(estado: EstadoPedido, limit = 50): Promise<PedidoCompleto[]> {
    return await this.getAll(estado, undefined, undefined, undefined, limit);
  }

  /**
   * Obtener pedidos activos para cocina
   */
  async getPedidosCocina(): Promise<PedidoCompleto[]> {
    try {
      const query = `
        SELECT 
          p.*,
          c.telefono as cliente_telefono,
          c.nombre as cliente_nombre
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
        WHERE p.estado IN ('nuevo', 'en_preparacion')
        ORDER BY 
          CASE p.estado 
            WHEN 'nuevo' THEN 1 
            WHEN 'en_preparacion' THEN 2 
          END,
          p.fecha_pedido ASC
      `;

      const result = await this.pool.query(query);
      
      const pedidos: PedidoCompleto[] = [];
      for (const row of result.rows) {
        const pedido = await this.buildPedidoCompleto(row);
        pedidos.push(pedido);
      }

      return pedidos;
    } catch (error) {
      logger.error('Error al obtener pedidos de cocina:', error);
      throw new DatabaseError('Error al obtener pedidos de cocina');
    }
  }

  /**
   * Obtener resumen del día
   */
  async getResumenHoy(): Promise<any> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_pedidos,
          COUNT(CASE WHEN estado = 'nuevo' THEN 1 END) as pedidos_nuevos,
          COUNT(CASE WHEN estado = 'en_preparacion' THEN 1 END) as pedidos_en_preparacion,
          COUNT(CASE WHEN estado = 'listo' THEN 1 END) as pedidos_listos,
          COUNT(CASE WHEN estado = 'entregado' THEN 1 END) as pedidos_entregados,
          COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as pedidos_cancelados,
          COALESCE(SUM(CASE WHEN estado = 'entregado' THEN total ELSE 0 END), 0) as ingresos_entregados,
          COALESCE(SUM(CASE WHEN estado != 'cancelado' THEN total ELSE 0 END), 0) as ingresos_potenciales,
          COALESCE(AVG(CASE WHEN estado = 'entregado' AND fecha_entrega IS NOT NULL AND fecha_pedido IS NOT NULL 
                       THEN EXTRACT(EPOCH FROM (fecha_entrega - fecha_pedido))/60 END), 0) as tiempo_promedio_entrega
        FROM pedidos 
        WHERE DATE(fecha_pedido) = CURRENT_DATE
      `;

      const result = await this.pool.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Error al obtener resumen del día:', error);
      throw new DatabaseError('Error al obtener resumen del día');
    }
  }

  /**
   * Obtener historial de estados de un pedido
   */
  async getHistorialEstados(pedidoId: number): Promise<HistorialEstado[]> {
    try {
      const query = `
        SELECT * FROM historial_estados 
        WHERE pedido_id = $1 
        ORDER BY timestamp ASC
      `;

      const result = await this.pool.query(query, [pedidoId]);
      return result.rows;
    } catch (error) {
      logger.error('Error al obtener historial de estados:', error);
      throw new DatabaseError('Error al obtener historial de estados');
    }
  }

  /**
   * Construir pedido completo con items y cliente
   */
  private async buildPedidoCompleto(pedidoRow: any): Promise<PedidoCompleto> {
    // Obtener items del pedido
    const itemsQuery = `
      SELECT 
        pi.*,
        p.nombre as pizza_nombre,
        p.precio_base as pizza_precio_base,
        p.ingredientes as pizza_ingredientes,
        p2.nombre as pizza_mitad2_nombre,
        p2.precio_base as pizza_mitad2_precio_base,
        p2.ingredientes as pizza_mitad2_ingredientes
      FROM pedido_items pi
      JOIN pizzas p ON pi.pizza_id = p.id
      LEFT JOIN pizzas p2 ON pi.pizza_id_mitad2 = p2.id
      WHERE pi.pedido_id = $1
      ORDER BY pi.id
    `;

    const itemsResult = await this.pool.query(itemsQuery, [pedidoRow.id]);
    
    const items: PedidoItemCompleto[] = [];
    for (const itemRow of itemsResult.rows) {
      const item = await this.buildPedidoItemCompleto(itemRow);
      items.push(item);
    }

    // Construir cliente si existe
    const cliente = pedidoRow.cliente_telefono ? {
      id: pedidoRow.cliente_id,
      telefono: pedidoRow.cliente_telefono,
      nombre: pedidoRow.cliente_nombre,
      direccion: pedidoRow.cliente_direccion,
      referencias: pedidoRow.cliente_referencias
    } : undefined;

    return {
      ...pedidoRow,
      cliente,
      items
    };
  }

  /**
   * Construir item completo con pizzas y extras
   */
  private async buildPedidoItemCompleto(itemRow: any): Promise<PedidoItemCompleto> {
    // Construir pizza principal
    const pizza = {
      id: itemRow.pizza_id,
      nombre: itemRow.pizza_nombre,
      precio_base: itemRow.pizza_precio_base,
      ingredientes: itemRow.pizza_ingredientes
    };

    // Construir pizza mitad 2 si existe
    const pizza_mitad2 = itemRow.pizza_id_mitad2 ? {
      id: itemRow.pizza_id_mitad2,
      nombre: itemRow.pizza_mitad2_nombre,
      precio_base: itemRow.pizza_mitad2_precio_base,
      ingredientes: itemRow.pizza_mitad2_ingredientes
    } : undefined;

    // Obtener extras principales
    const extrasIds = JSON.parse(itemRow.extras_principales || '[]');
    const extras = extrasIds.length > 0 ? await this.getExtrasByIds(extrasIds) : [];

    // Obtener extras mitad 2
    const extrasMitad2Ids = JSON.parse(itemRow.extras_mitad2 || '[]');
    const extras_mitad2_data = extrasMitad2Ids.length > 0 ? await this.getExtrasByIds(extrasMitad2Ids) : [];

    return {
      ...itemRow,
      extras_principales: JSON.parse(itemRow.extras_principales || '[]'),
      ingredientes_removidos: JSON.parse(itemRow.ingredientes_removidos || '[]'),
      extras_mitad2: JSON.parse(itemRow.extras_mitad2 || '[]'),
      ingredientes_removidos_mitad2: JSON.parse(itemRow.ingredientes_removidos_mitad2 || '[]'),
      pizza,
      extras,
      pizza_mitad2,
      extras_mitad2_data
    };
  }

  /**
   * Obtener extras por IDs
   */
  private async getExtrasByIds(ids: number[]): Promise<any[]> {
    if (ids.length === 0) return [];

    const query = 'SELECT * FROM extras WHERE id = ANY($1)';
    const result = await this.pool.query(query, [ids]);
    return result.rows;
  }

  /**
   * Crear registro en historial de estados
   */
  private async createHistorialEstado(
    client: any,
    pedidoId: number,
    estadoAnterior: EstadoPedido | null | undefined,
    estadoNuevo: EstadoPedido,
    motivo?: string,
    usuario = 'sistema'
  ): Promise<void> {
    const query = `
      INSERT INTO historial_estados 
      (pedido_id, estado_anterior, estado_nuevo, motivo, usuario)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await client.query(query, [pedidoId, estadoAnterior, estadoNuevo, motivo, usuario]);
  }

  /**
   * Verificar si existe un pedido
   */
  async exists(id: number): Promise<boolean> {
    try {
      const query = 'SELECT id FROM pedidos WHERE id = $1';
      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error al verificar existencia de pedido:', error);
      throw new DatabaseError('Error al verificar pedido');
    }
  }
}

export const pedidosModel = new PedidosModel();