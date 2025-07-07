/**
 * Router para endpoints de pedidos
 * Gestión completa de pedidos con estados y tiempo real
 */

import { Router } from 'express';
import { pedidosController } from '@/controllers/pedidosController';

const router = Router();

/**
 * GET /api/pedidos
 * Obtener todos los pedidos con filtros opcionales
 */
router.get('/', pedidosController.getAllPedidos);

/**
 * GET /api/pedidos/:id
 * Obtener un pedido específico por ID
 */
router.get('/:id', pedidosController.getPedidoById);

/**
 * POST /api/pedidos
 * Crear un nuevo pedido
 */
router.post('/', pedidosController.createPedido);

/**
 * PUT /api/pedidos/:id
 * Actualizar un pedido existente
 */
router.put('/:id', pedidosController.updatePedido);

/**
 * DELETE /api/pedidos/:id
 * Cancelar un pedido
 */
router.delete('/:id', pedidosController.cancelPedido);

/**
 * PUT /api/pedidos/:id/estado
 * Cambiar estado de un pedido
 */
router.put('/:id/estado', pedidosController.cambiarEstado);

/**
 * GET /api/pedidos/estado/:estado
 * Obtener pedidos por estado
 */
router.get('/estado/:estado', pedidosController.getPedidosByEstado);

/**
 * GET /api/pedidos/hoy/resumen
 * Resumen de pedidos del día actual
 */
router.get('/hoy/resumen', pedidosController.getResumenHoy);

/**
 * GET /api/pedidos/cocina/activos
 * Pedidos activos para pantalla de cocina
 */
router.get('/cocina/activos', pedidosController.getPedidosCocina);

/**
 * GET /api/pedidos/:id/historial
 * Historial de cambios de estado de un pedido
 */
router.get('/:id/historial', pedidosController.getHistorialEstados);

/**
 * POST /api/pedidos/:id/calcular
 * Recalcular precios de un pedido
 */
router.post('/:id/calcular', pedidosController.recalcularPedido);

export { router as pedidosRouter };