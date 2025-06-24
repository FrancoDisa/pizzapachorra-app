"use strict";
/**
 * Router para endpoints de clientes
 * Gestión de clientes con búsqueda por teléfono
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientesRouter = void 0;
const express_1 = require("express");
const clientesController_1 = require("@/controllers/clientesController");
const router = (0, express_1.Router)();
exports.clientesRouter = router;
/**
 * GET /api/clientes
 * Obtener todos los clientes
 */
router.get('/', clientesController_1.clientesController.getAllClientes);
/**
 * GET /api/clientes/:id
 * Obtener un cliente específico por ID
 */
router.get('/:id', clientesController_1.clientesController.getClienteById);
/**
 * POST /api/clientes
 * Crear un nuevo cliente
 */
router.post('/', clientesController_1.clientesController.createCliente);
/**
 * PUT /api/clientes/:id
 * Actualizar un cliente existente
 */
router.put('/:id', clientesController_1.clientesController.updateCliente);
/**
 * DELETE /api/clientes/:id
 * Eliminar un cliente
 */
router.delete('/:id', clientesController_1.clientesController.deleteCliente);
/**
 * GET /api/clientes/buscar/telefono/:telefono
 * Buscar cliente por número de teléfono
 */
router.get('/buscar/telefono/:telefono', clientesController_1.clientesController.getClienteByTelefono);
/**
 * GET /api/clientes/autocompletar/telefono
 * Autocompletar teléfonos para búsqueda
 */
router.get('/autocompletar/telefono', clientesController_1.clientesController.autocompleteByTelefono);
/**
 * GET /api/clientes/:id/historial
 * Obtener historial de pedidos de un cliente
 */
router.get('/:id/historial', clientesController_1.clientesController.getClienteHistorial);
/**
 * GET /api/clientes/estadisticas/resumen
 * Obtener estadísticas generales de clientes
 */
router.get('/estadisticas/resumen', clientesController_1.clientesController.getClientesEstadisticas);
//# sourceMappingURL=clientes.js.map