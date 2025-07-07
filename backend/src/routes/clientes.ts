/**
 * Router para endpoints de clientes
 * Gestión de clientes con búsqueda por teléfono
 */

import { Router } from 'express';
import { clientesController } from '@/controllers/clientesController';

const router = Router();

/**
 * GET /api/clientes
 * Obtener todos los clientes
 */
router.get('/', clientesController.getAllClientes);

/**
 * GET /api/clientes/:id
 * Obtener un cliente específico por ID
 */
router.get('/:id', clientesController.getClienteById);

/**
 * POST /api/clientes
 * Crear un nuevo cliente
 */
router.post('/', clientesController.createCliente);

/**
 * PUT /api/clientes/:id
 * Actualizar un cliente existente
 */
router.put('/:id', clientesController.updateCliente);

/**
 * DELETE /api/clientes/:id
 * Eliminar un cliente
 */
router.delete('/:id', clientesController.deleteCliente);

/**
 * GET /api/clientes/buscar/telefono/:telefono
 * Buscar cliente por número de teléfono
 */
router.get('/buscar/telefono/:telefono', clientesController.getClienteByTelefono);

/**
 * GET /api/clientes/autocompletar/telefono
 * Autocompletar teléfonos para búsqueda
 */
router.get('/autocompletar/telefono', clientesController.autocompleteByTelefono);

/**
 * GET /api/clientes/:id/historial
 * Obtener historial de pedidos de un cliente
 */
router.get('/:id/historial', clientesController.getClienteHistorial);

/**
 * GET /api/clientes/estadisticas/resumen
 * Obtener estadísticas generales de clientes
 */
router.get('/estadisticas/resumen', clientesController.getClientesEstadisticas);

export { router as clientesRouter };