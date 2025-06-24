/**
 * Router para endpoints de health check
 * Verifica el estado de los servicios del sistema
 */

import { Router } from 'express';
import { healthController } from '@/controllers/healthController';

const router = Router();

/**
 * GET /api/health
 * Estado general del sistema
 */
router.get('/', healthController.getOverallHealth);

/**
 * GET /api/health/database
 * Estado específico de la base de datos PostgreSQL
 */
router.get('/database', healthController.getDatabaseHealth);

/**
 * GET /api/health/services
 * Estado de todos los servicios (base de datos, memoria, etc.)
 */
router.get('/services', healthController.getAllServicesHealth);

export { router as healthRouter };