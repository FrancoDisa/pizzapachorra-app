/**
 * Controlador para endpoints de pedidos
 * Maneja la lógica de negocio completa para gestión de pedidos
 */

import { Request, Response } from 'express';
import { pedidosModel } from '@/models/pedidosModel';
import { clientesModel } from '@/models/clientesModel';
import { preciosService } from '@/services/preciosService';
import { ValidationError, BusinessError } from '@/middleware/errorHandler';
import { validatePedidoSchema } from '@/types/validacion';
import { EstadoPedido, ParametrosCalculoPizza } from '@/types';
import { logger } from '@/utils/logger';
import { Server as SocketIOServer } from 'socket.io';

/**
 * Obtener todos los pedidos
 */
export const getAllPedidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const estado = req.query.estado as EstadoPedido;
    const fechaInicio = req.query.fecha_inicio ? new Date(req.query.fecha_inicio as string) : undefined;
    const fechaFin = req.query.fecha_fin ? new Date(req.query.fecha_fin as string) : undefined;
    const clienteId = req.query.cliente_id ? parseInt(req.query.cliente_id as string) : undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const pedidos = await pedidosModel.getAll(estado, fechaInicio, fechaFin, clienteId, limit, offset);

    logger.info(`Pedidos obtenidos: ${pedidos.length} items`);

    res.json({
      success: true,
      data: pedidos,
      count: pedidos.length,
      filters: {
        estado,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        cliente_id: clienteId
      }
    });
  } catch (error) {
    logger.error('Error al obtener pedidos:', error);
    throw error;
  }
};

/**
 * Obtener pedido por ID
 */
export const getPedidoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      throw new ValidationError('ID de pedido requerido');
    }
    const id = parseInt(idParam);

    if (isNaN(id)) {
      throw new ValidationError('ID de pedido inválido');
    }

    const pedido = await pedidosModel.getById(id);

    if (!pedido) {
      res.status(404).json({
        success: false,
        error: 'Pedido no encontrado',
        code: 'PEDIDO_NOT_FOUND'
      });
      return;
    }

    logger.debug(`Pedido obtenido: ${pedido.numero_pedido}`);

    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    logger.error('Error al obtener pedido por ID:', error);
    throw error;
  }
};

/**
 * Crear nuevo pedido
 */
export const createPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar datos de entrada
    const { error, value } = validatePedidoSchema.validate(req.body);
    if (error) {
      throw new ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
    }

    const pedidoData = value;

    // Generar número de pedido único
    const numeroPedido = preciosService.generateNumeroPedido();

    // Gestionar cliente
    let clienteId = pedidoData.cliente_id;
    
    if (pedidoData.cliente_data && !clienteId) {
      // Buscar cliente existente por teléfono o crear nuevo
      const clienteExistente = await clientesModel.getByTelefono(pedidoData.cliente_data.telefono);
      
      if (clienteExistente) {
        clienteId = clienteExistente.id;
        
        // Actualizar datos del cliente si se proporcionaron
        if (pedidoData.cliente_data.nombre || pedidoData.cliente_data.direccion || pedidoData.cliente_data.referencias) {
          await clientesModel.update(clienteId, {
            nombre: pedidoData.cliente_data.nombre || clienteExistente.nombre,
            direccion: pedidoData.cliente_data.direccion || clienteExistente.direccion,
            referencias: pedidoData.cliente_data.referencias || clienteExistente.referencias
          });
        }
      } else {
        // Crear nuevo cliente
        const nuevoCliente = await clientesModel.create(pedidoData.cliente_data);
        clienteId = nuevoCliente.id;
      }
    }

    // Crear pedido básico
    const pedidoRequest = {
      ...pedidoData,
      cliente_id: clienteId
    };

    const nuevoPedido = await pedidosModel.create(pedidoRequest, numeroPedido);

    // Recalcular precios
    const pedidoRecalculado = await recalcularPreciosPedido(nuevoPedido.id);

    // Actualizar estadísticas del cliente si existe
    if (clienteId) {
      await clientesModel.updateEstadisticas(clienteId);
    }

    // Emitir evento WebSocket
    const io = (req as any).io as SocketIOServer;
    if (io) {
      io.to('cocina').emit('nuevo_pedido', pedidoRecalculado);
      io.to('admin').emit('nuevo_pedido', pedidoRecalculado);
    }

    logger.info(`Pedido creado: ${pedidoRecalculado?.numero_pedido} (ID: ${pedidoRecalculado?.id})`);

    res.status(201).json({
      success: true,
      data: pedidoRecalculado,
      message: 'Pedido creado exitosamente'
    });
  } catch (error) {
    logger.error('Error al crear pedido:', error);
    throw error;
  }
};

/**
 * Actualizar pedido existente
 */
export const updatePedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      throw new ValidationError('ID de pedido requerido');
    }
    const id = parseInt(idParam);

    if (isNaN(id)) {
      throw new ValidationError('ID de pedido inválido');
    }

    // Verificar que el pedido existe
    const existingPedido = await pedidosModel.getById(id);
    if (!existingPedido) {
      res.status(404).json({
        success: false,
        error: 'Pedido no encontrado',
        code: 'PEDIDO_NOT_FOUND'
      });
      return;
    }

    // Solo permitir actualizar ciertos campos
    const allowedUpdates = ['metodo_pago', 'notas', 'tiempo_estimado', 'descuento'];
    const updateData: any = {};
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No hay campos válidos para actualizar');
    }

    const updatedPedido = await pedidosModel.update(id, updateData);

    // Recalcular precios si se cambió el descuento
    let finalPedido = updatedPedido;
    if (updateData.descuento !== undefined) {
      finalPedido = await recalcularPreciosPedido(id);
    }

    // Emitir evento WebSocket
    const io = (req as any).io as SocketIOServer;
    if (io) {
      io.to('cocina').emit('pedido_actualizado', finalPedido);
      io.to('admin').emit('pedido_actualizado', finalPedido);
    }

    logger.info(`Pedido actualizado: ${finalPedido?.numero_pedido} (ID: ${id})`);

    res.json({
      success: true,
      data: finalPedido,
      message: 'Pedido actualizado exitosamente'
    });
  } catch (error) {
    logger.error('Error al actualizar pedido:', error);
    throw error;
  }
};

/**
 * Cancelar pedido
 */
export const cancelPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      throw new ValidationError('ID de pedido requerido');
    }
    const id = parseInt(idParam);
    const motivo = req.body.motivo || 'Cancelado por usuario';

    if (isNaN(id)) {
      throw new ValidationError('ID de pedido inválido');
    }

    // Verificar que el pedido existe y se puede cancelar
    const existingPedido = await pedidosModel.getById(id);
    if (!existingPedido) {
      res.status(404).json({
        success: false,
        error: 'Pedido no encontrado',
        code: 'PEDIDO_NOT_FOUND'
      });
      return;
    }

    if (existingPedido.estado === 'entregado') {
      throw new BusinessError('No se puede cancelar un pedido ya entregado');
    }

    if (existingPedido.estado === 'cancelado') {
      throw new BusinessError('El pedido ya está cancelado');
    }

    const pedidoCancelado = await pedidosModel.cambiarEstado(id, 'cancelado', motivo, 'usuario');

    // Actualizar estadísticas del cliente
    if (existingPedido.cliente_id) {
      await clientesModel.updateEstadisticas(existingPedido.cliente_id);
    }

    // Emitir evento WebSocket
    const io = (req as any).io as SocketIOServer;
    if (io) {
      io.to('cocina').emit('cambio_estado', {
        pedido_id: id,
        estado_anterior: existingPedido.estado,
        estado_nuevo: 'cancelado',
        motivo
      });
      io.to('admin').emit('cambio_estado', {
        pedido_id: id,
        estado_anterior: existingPedido.estado,
        estado_nuevo: 'cancelado',
        motivo
      });
    }

    logger.info(`Pedido cancelado: ${existingPedido.numero_pedido} (ID: ${id}) - Motivo: ${motivo}`);

    res.json({
      success: true,
      data: pedidoCancelado,
      message: 'Pedido cancelado exitosamente'
    });
  } catch (error) {
    logger.error('Error al cancelar pedido:', error);
    throw error;
  }
};

/**
 * Cambiar estado de pedido
 */
export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      throw new ValidationError('ID de pedido requerido');
    }
    const id = parseInt(idParam);
    const { estado, motivo } = req.body;

    if (isNaN(id)) {
      throw new ValidationError('ID de pedido inválido');
    }

    if (!estado) {
      throw new ValidationError('Estado requerido');
    }

    // Validar estado
    const estadosValidos: EstadoPedido[] = ['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      throw new ValidationError('Estado inválido');
    }

    // Verificar que el pedido existe
    const existingPedido = await pedidosModel.getById(id);
    if (!existingPedido) {
      res.status(404).json({
        success: false,
        error: 'Pedido no encontrado',
        code: 'PEDIDO_NOT_FOUND'
      });
      return;
    }

    // Validar transición de estado
    if (!esTransicionValida(existingPedido.estado, estado)) {
      throw new BusinessError(`Transición de estado inválida: ${existingPedido.estado} -> ${estado}`);
    }

    const pedidoActualizado = await pedidosModel.cambiarEstado(id, estado, motivo, 'usuario');

    // Actualizar estadísticas del cliente si se entregó
    if (estado === 'entregado' && existingPedido.cliente_id) {
      await clientesModel.updateEstadisticas(existingPedido.cliente_id);
    }

    // Emitir evento WebSocket
    const io = (req as any).io as SocketIOServer;
    if (io) {
      io.to('cocina').emit('cambio_estado', {
        pedido_id: id,
        estado_anterior: existingPedido.estado,
        estado_nuevo: estado,
        motivo,
        pedido: pedidoActualizado
      });
      io.to('admin').emit('cambio_estado', {
        pedido_id: id,
        estado_anterior: existingPedido.estado,
        estado_nuevo: estado,
        motivo,
        pedido: pedidoActualizado
      });
    }

    logger.info(`Estado cambiado: ${existingPedido.numero_pedido} ${existingPedido.estado} -> ${estado}`);

    res.json({
      success: true,
      data: pedidoActualizado,
      message: 'Estado actualizado exitosamente'
    });
  } catch (error) {
    logger.error('Error al cambiar estado:', error);
    throw error;
  }
};

/**
 * Obtener pedidos por estado
 */
export const getPedidosByEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const estado = req.params.estado as EstadoPedido;
    const limit = parseInt(req.query.limit as string) || 50;

    // Validar estado
    const estadosValidos: EstadoPedido[] = ['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      throw new ValidationError('Estado inválido');
    }

    const pedidos = await pedidosModel.getByEstado(estado, limit);

    logger.debug(`Pedidos por estado ${estado}: ${pedidos.length} items`);

    res.json({
      success: true,
      data: pedidos,
      count: pedidos.length,
      estado
    });
  } catch (error) {
    logger.error('Error al obtener pedidos por estado:', error);
    throw error;
  }
};

/**
 * Obtener resumen del día
 */
export const getResumenHoy = async (_req: Request, res: Response): Promise<void> => {
  try {
    const resumen = await pedidosModel.getResumenHoy();

    logger.debug('Resumen del día obtenido');

    res.json({
      success: true,
      data: resumen,
      fecha: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    logger.error('Error al obtener resumen del día:', error);
    throw error;
  }
};

/**
 * Obtener pedidos activos para cocina
 */
export const getPedidosCocina = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pedidos = await pedidosModel.getPedidosCocina();

    logger.debug(`Pedidos de cocina obtenidos: ${pedidos.length} items`);

    res.json({
      success: true,
      data: pedidos,
      count: pedidos.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error al obtener pedidos de cocina:', error);
    throw error;
  }
};

/**
 * Obtener historial de estados
 */
export const getHistorialEstados = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      throw new ValidationError('id requerido');
    }
    const id = parseInt(idParam);

    if (isNaN(id)) {
      throw new ValidationError('ID de pedido inválido');
    }

    // Verificar que el pedido existe
    const pedido = await pedidosModel.getById(id);
    if (!pedido) {
      res.status(404).json({
        success: false,
        error: 'Pedido no encontrado',
        code: 'PEDIDO_NOT_FOUND'
      });
      return;
    }

    const historial = await pedidosModel.getHistorialEstados(id);

    logger.debug(`Historial de estados obtenido para pedido ${id}: ${historial.length} registros`);

    res.json({
      success: true,
      data: {
        pedido: {
          id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          estado_actual: pedido.estado
        },
        historial
      },
      count: historial.length
    });
  } catch (error) {
    logger.error('Error al obtener historial de estados:', error);
    throw error;
  }
};

/**
 * Recalcular precios de pedido
 */
export const recalcularPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      throw new ValidationError('id requerido');
    }
    const id = parseInt(idParam);

    if (isNaN(id)) {
      throw new ValidationError('ID de pedido inválido');
    }

    const pedidoRecalculado = await recalcularPreciosPedido(id);

    if (!pedidoRecalculado) {
      res.status(404).json({
        success: false,
        error: 'Pedido no encontrado',
        code: 'PEDIDO_NOT_FOUND'
      });
      return;
    }

    logger.info(`Pedido recalculado: ${pedidoRecalculado.numero_pedido} - Total: $${pedidoRecalculado.total}`);

    res.json({
      success: true,
      data: pedidoRecalculado,
      message: 'Precios recalculados exitosamente'
    });
  } catch (error) {
    logger.error('Error al recalcular pedido:', error);
    throw error;
  }
};

/**
 * Función auxiliar para recalcular precios de un pedido
 */
async function recalcularPreciosPedido(pedidoId: number) {
  const pedido = await pedidosModel.getById(pedidoId);
  if (!pedido) return null;

  // Construir parámetros para el cálculo
  const parametrosItems: ParametrosCalculoPizza[] = pedido.items.map(item => ({
    pizza_principal: item.pizza,
    extras_principales: item.extras_principales,
    ingredientes_removidos: item.ingredientes_removidos,
    pizza_mitad2: item.pizza_mitad2,
    extras_mitad2: item.extras_mitad2,
    ingredientes_removidos_mitad2: item.ingredientes_removidos_mitad2,
    cantidad: item.cantidad
  }));

  // Calcular resumen
  const resumen = await preciosService.calcularResumenPedido(parametrosItems, pedido.descuento);

  // Actualizar pedido con nuevos precios
  const pedidoActualizado = await pedidosModel.update(pedidoId, {
    subtotal: resumen.subtotal,
    total: resumen.total
  });

  return pedidoActualizado;
}

/**
 * Validar transición de estado
 */
function esTransicionValida(estadoActual: EstadoPedido, nuevoEstado: EstadoPedido): boolean {
  const transicionesValidas: Record<EstadoPedido, EstadoPedido[]> = {
    'nuevo': ['en_preparacion', 'cancelado'],
    'en_preparacion': ['listo', 'cancelado'],
    'listo': ['entregado', 'cancelado'],
    'entregado': [], // Estado final
    'cancelado': [] // Estado final
  };

  return transicionesValidas[estadoActual].includes(nuevoEstado);
}

export const pedidosController = {
  getAllPedidos,
  getPedidoById,
  createPedido,
  updatePedido,
  cancelPedido,
  cambiarEstado,
  getPedidosByEstado,
  getResumenHoy,
  getPedidosCocina,
  getHistorialEstados,
  recalcularPedido
};