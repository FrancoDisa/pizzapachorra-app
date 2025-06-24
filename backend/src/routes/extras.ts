/**
 * Router para endpoints de extras
 * Gestión de ingredientes adicionales
 */

import { Router } from 'express';
import { extrasController } from '@/controllers/extrasController';

const router = Router();

/**
 * GET /api/extras
 * Obtener todos los extras activos
 */
router.get('/', extrasController.getAllExtras);

/**
 * GET /api/extras/menu/activo
 * Obtener menú de extras activos agrupados por categoría
 */
router.get('/menu/activo', extrasController.getActiveMenu);

/**
 * GET /api/extras/categoria/:categoria
 * Obtener extras por categoría
 */
router.get('/categoria/:categoria', extrasController.getExtrasByCategory);

/**
 * GET /api/extras/:id
 * Obtener un extra específico por ID
 */
router.get('/:id', extrasController.getExtraById);

/**
 * POST /api/extras
 * Crear un nuevo extra
 */
router.post('/', extrasController.createExtra);

/**
 * PUT /api/extras/:id
 * Actualizar un extra existente
 */
router.put('/:id', extrasController.updateExtra);

/**
 * DELETE /api/extras/:id
 * Desactivar un extra (soft delete)
 */
router.delete('/:id', extrasController.deleteExtra);

export { router as extrasRouter };