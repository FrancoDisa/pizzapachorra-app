/**
 * Router para endpoints de pizzas
 * Gestión del menú de pizzas con precios base
 */

import { Router } from 'express';
import { pizzasController } from '@/controllers/pizzasController';

const router = Router();

/**
 * GET /api/pizzas
 * Obtener todas las pizzas activas del menú
 */
router.get('/', pizzasController.getAllPizzas);

/**
 * GET /api/pizzas/menu/activo
 * Obtener menú de pizzas activas ordenado para mostrar
 */
router.get('/menu/activo', pizzasController.getActiveMenu);

/**
 * GET /api/pizzas/:id
 * Obtener una pizza específica por ID
 */
router.get('/:id', pizzasController.getPizzaById);

/**
 * POST /api/pizzas
 * Crear una nueva pizza
 */
router.post('/', pizzasController.createPizza);

/**
 * PUT /api/pizzas/:id
 * Actualizar una pizza existente
 */
router.put('/:id', pizzasController.updatePizza);

/**
 * DELETE /api/pizzas/:id
 * Desactivar una pizza (soft delete)
 */
router.delete('/:id', pizzasController.deletePizza);

export { router as pizzasRouter };