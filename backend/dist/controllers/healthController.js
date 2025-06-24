"use strict";
/**
 * Controlador para endpoints de health check
 * Maneja las verificaciones de estado del sistema
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = exports.getAllServicesHealth = exports.getDatabaseHealth = exports.getOverallHealth = void 0;
const database_1 = require("@/config/database");
const logger_1 = require("@/utils/logger");
/**
 * Obtener estado general del sistema
 */
const getOverallHealth = async (_req, res) => {
    try {
        const startTime = Date.now();
        // Verificar base de datos
        const dbHealth = await database_1.config.healthCheck();
        // Verificar memoria
        const memoryUsage = process.memoryUsage();
        const memoryStatus = {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
            external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
            rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
        };
        // Tiempo de respuesta total
        const responseTime = Date.now() - startTime;
        // Determinar estado general
        const isHealthy = dbHealth.status === 'healthy';
        const healthData = {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: `${responseTime}ms`,
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            services: {
                database: dbHealth.status,
                memory: 'healthy',
                server: 'healthy'
            },
            details: {
                database: dbHealth.details,
                memory: memoryStatus,
                node: {
                    version: process.version,
                    pid: process.pid
                }
            }
        };
        // Log del health check
        logger_1.logger.info('Health check realizado:', {
            status: healthData.status,
            responseTime: healthData.responseTime,
            dbStatus: dbHealth.status
        });
        // Respuesta con código apropiado
        const statusCode = isHealthy ? 200 : 503;
        res.status(statusCode).json({
            success: isHealthy,
            data: healthData
        });
    }
    catch (error) {
        logger_1.logger.error('Error en health check general:', error);
        res.status(503).json({
            success: false,
            error: 'Health check failed',
            details: {
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            }
        });
    }
};
exports.getOverallHealth = getOverallHealth;
/**
 * Obtener estado específico de la base de datos
 */
const getDatabaseHealth = async (_req, res) => {
    try {
        const dbHealth = await database_1.config.healthCheck();
        const poolStats = database_1.config.getPoolStats();
        const databaseData = {
            status: dbHealth.status,
            connection: dbHealth.details,
            pool: {
                totalConnections: poolStats.totalCount,
                idleConnections: poolStats.idleCount,
                waitingClients: poolStats.waitingCount
            },
            timestamp: new Date().toISOString()
        };
        logger_1.logger.debug('Database health check:', databaseData);
        const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json({
            success: dbHealth.status === 'healthy',
            data: databaseData
        });
    }
    catch (error) {
        logger_1.logger.error('Error en health check de base de datos:', error);
        res.status(503).json({
            success: false,
            error: 'Database health check failed',
            details: {
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            }
        });
    }
};
exports.getDatabaseHealth = getDatabaseHealth;
/**
 * Obtener estado de todos los servicios
 */
const getAllServicesHealth = async (_req, res) => {
    try {
        const startTime = Date.now();
        // Verificar base de datos
        const dbHealth = await database_1.config.healthCheck();
        // Verificar memoria
        const memoryUsage = process.memoryUsage();
        const memoryHealthy = memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9; // <90% uso
        // Verificar uptime (considerar unhealthy si es muy reciente - posible restart)
        const uptime = process.uptime();
        const uptimeHealthy = uptime > 10; // >10 segundos
        const services = {
            database: {
                status: dbHealth.status,
                details: dbHealth.details,
                healthy: dbHealth.status === 'healthy'
            },
            memory: {
                status: memoryHealthy ? 'healthy' : 'warning',
                details: {
                    used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
                    total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
                    usage: Math.round(memoryUsage.heapUsed / memoryUsage.heapTotal * 100),
                    external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100
                },
                healthy: memoryHealthy
            },
            server: {
                status: uptimeHealthy ? 'healthy' : 'starting',
                details: {
                    uptime: `${Math.round(uptime)}s`,
                    pid: process.pid,
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch
                },
                healthy: uptimeHealthy
            }
        };
        // Estado general
        const allHealthy = Object.values(services).every(service => service.healthy);
        const responseTime = Date.now() - startTime;
        const healthData = {
            status: allHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            services,
            summary: {
                total: Object.keys(services).length,
                healthy: Object.values(services).filter(s => s.healthy).length,
                unhealthy: Object.values(services).filter(s => !s.healthy).length
            }
        };
        logger_1.logger.info('Servicios health check:', {
            status: healthData.status,
            healthy: healthData.summary.healthy,
            total: healthData.summary.total
        });
        const statusCode = allHealthy ? 200 : 503;
        res.status(statusCode).json({
            success: allHealthy,
            data: healthData
        });
    }
    catch (error) {
        logger_1.logger.error('Error en health check de servicios:', error);
        res.status(503).json({
            success: false,
            error: 'Services health check failed',
            details: {
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            }
        });
    }
};
exports.getAllServicesHealth = getAllServicesHealth;
exports.healthController = {
    getOverallHealth: exports.getOverallHealth,
    getDatabaseHealth: exports.getDatabaseHealth,
    getAllServicesHealth: exports.getAllServicesHealth
};
//# sourceMappingURL=healthController.js.map