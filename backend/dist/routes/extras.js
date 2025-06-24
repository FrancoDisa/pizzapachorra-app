"use strict";
/**
 * Router para endpoints de extras
 * Gestión de ingredientes adicionales
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extrasRouter = void 0;
const express_1 = require("express");
const extrasController_1 = require("@/controllers/extrasController");
const router = (0, express_1.Router)();
exports.extrasRouter = router;
/**
 * GET /api/extras
 * Obtener todos los extras activos
 */
router.get('/', extrasController_1.extrasController.getAllExtras);
/**
 * GET /api/extras/menu/activo
 * Obtener menú de extras activos agrupados por categoría
 */
router.get('/menu/activo', extrasController_1.extrasController.getActiveMenu);
/**
 * GET /api/extras/categoria/:categoria
 * Obtener extras por categoría
 */
router.get('/categoria/:categoria', extrasController_1.extrasController.getExtrasByCategory);
/**
 * GET /api/extras/:id
 * Obtener un extra específico por ID
 */
router.get('/:id', extrasController_1.extrasController.getExtraById);
/**
 * POST /api/extras
 * Crear un nuevo extra
 */
router.post('/', extrasController_1.extrasController.createExtra);
/**
 * PUT /api/extras/:id
 * Actualizar un extra existente
 */
router.put('/:id', extrasController_1.extrasController.updateExtra);
/**
 * DELETE /api/extras/:id
 * Desactivar un extra (soft delete)
 */
router.delete('/:id', extrasController_1.extrasController.deleteExtra);
//# sourceMappingURL=extras.js.map