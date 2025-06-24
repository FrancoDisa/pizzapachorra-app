"use strict";
/**
 * Router para endpoints de pedidos
 * Gestión completa de pedidos con estados y tiempo real
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedidosRouter = void 0;
const express_1 = require("express");
const pedidosController_1 = require("@/controllers/pedidosController");
const router = (0, express_1.Router)();
exports.pedidosRouter = router;
/**
 * GET /api/pedidos
 * Obtener todos los pedidos con filtros opcionales
 */
router.get('/', pedidosController_1.pedidosController.getAllPedidos);
/**
 * GET /api/pedidos/:id
 * Obtener un pedido específico por ID
 */
router.get('/:id', pedidosController_1.pedidosController.getPedidoById);
/**
 * POST /api/pedidos
 * Crear un nuevo pedido
 */
router.post('/', pedidosController_1.pedidosController.createPedido);
/**
 * PUT /api/pedidos/:id
 * Actualizar un pedido existente
 */
router.put('/:id', pedidosController_1.pedidosController.updatePedido);
/**
 * DELETE /api/pedidos/:id
 * Cancelar un pedido
 */
router.delete('/:id', pedidosController_1.pedidosController.cancelPedido);
/**
 * PUT /api/pedidos/:id/estado
 * Cambiar estado de un pedido
 */
router.put('/:id/estado', pedidosController_1.pedidosController.cambiarEstado);
/**
 * GET /api/pedidos/estado/:estado
 * Obtener pedidos por estado
 */
router.get('/estado/:estado', pedidosController_1.pedidosController.getPedidosByEstado);
/**
 * GET /api/pedidos/hoy/resumen
 * Resumen de pedidos del día actual
 */
router.get('/hoy/resumen', pedidosController_1.pedidosController.getResumenHoy);
/**
 * GET /api/pedidos/cocina/activos
 * Pedidos activos para pantalla de cocina
 */
router.get('/cocina/activos', pedidosController_1.pedidosController.getPedidosCocina);
/**
 * GET /api/pedidos/:id/historial
 * Historial de cambios de estado de un pedido
 */
router.get('/:id/historial', pedidosController_1.pedidosController.getHistorialEstados);
/**
 * POST /api/pedidos/:id/calcular
 * Recalcular precios de un pedido
 */
router.post('/:id/calcular', pedidosController_1.pedidosController.recalcularPedido);
//# sourceMappingURL=pedidos.js.map