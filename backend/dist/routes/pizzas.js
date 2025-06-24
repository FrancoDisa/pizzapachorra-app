"use strict";
/**
 * Router para endpoints de pizzas
 * Gestión del menú de pizzas con precios base
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pizzasRouter = void 0;
const express_1 = require("express");
const pizzasController_1 = require("@/controllers/pizzasController");
const router = (0, express_1.Router)();
exports.pizzasRouter = router;
/**
 * GET /api/pizzas
 * Obtener todas las pizzas activas del menú
 */
router.get('/', pizzasController_1.pizzasController.getAllPizzas);
/**
 * GET /api/pizzas/menu/activo
 * Obtener menú de pizzas activas ordenado para mostrar
 */
router.get('/menu/activo', pizzasController_1.pizzasController.getActiveMenu);
/**
 * GET /api/pizzas/:id
 * Obtener una pizza específica por ID
 */
router.get('/:id', pizzasController_1.pizzasController.getPizzaById);
/**
 * POST /api/pizzas
 * Crear una nueva pizza
 */
router.post('/', pizzasController_1.pizzasController.createPizza);
/**
 * PUT /api/pizzas/:id
 * Actualizar una pizza existente
 */
router.put('/:id', pizzasController_1.pizzasController.updatePizza);
/**
 * DELETE /api/pizzas/:id
 * Desactivar una pizza (soft delete)
 */
router.delete('/:id', pizzasController_1.pizzasController.deletePizza);
//# sourceMappingURL=pizzas.js.map