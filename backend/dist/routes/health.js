"use strict";
/**
 * Router para endpoints de health check
 * Verifica el estado de los servicios del sistema
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const healthController_1 = require("@/controllers/healthController");
const router = (0, express_1.Router)();
exports.healthRouter = router;
/**
 * GET /api/health
 * Estado general del sistema
 */
router.get('/', healthController_1.healthController.getOverallHealth);
/**
 * GET /api/health/database
 * Estado específico de la base de datos PostgreSQL
 */
router.get('/database', healthController_1.healthController.getDatabaseHealth);
/**
 * GET /api/health/services
 * Estado de todos los servicios (base de datos, memoria, etc.)
 */
router.get('/services', healthController_1.healthController.getAllServicesHealth);
//# sourceMappingURL=health.js.map