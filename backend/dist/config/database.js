"use strict";
/**
 * Configuración de la base de datos PostgreSQL
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.config = void 0;
const pg_1 = require("pg");
const logger_1 = require("@/utils/logger");
// Configuración de la conexión
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // máximo número de conexiones en el pool
    idleTimeoutMillis: 30000, // tiempo máximo que una conexión puede estar inactiva
    connectionTimeoutMillis: 2000, // tiempo máximo para establecer conexión
    statement_timeout: 30000, // timeout para statements SQL
    query_timeout: 30000, // timeout para queries
};
// Crear pool de conexiones
const pool = new pg_1.Pool(dbConfig);
exports.pool = pool;
// Eventos del pool
pool.on('connect', (client) => {
    logger_1.logger.debug('Nueva conexión a PostgreSQL establecida');
});
pool.on('acquire', (client) => {
    logger_1.logger.debug('Cliente adquirido del pool');
});
pool.on('error', (err, client) => {
    logger_1.logger.error('Error inesperado en cliente de PostgreSQL:', err);
});
pool.on('remove', (client) => {
    logger_1.logger.debug('Cliente removido del pool');
});
/**
 * Clase para manejar la configuración de la base de datos
 */
class DatabaseConfig {
    pool;
    constructor() {
        this.pool = pool;
    }
    /**
     * Obtener el pool de conexiones
     */
    getPool() {
        return this.pool;
    }
    /**
     * Probar la conexión a la base de datos
     */
    async testConnection() {
        try {
            const client = await this.pool.connect();
            const result = await client.query('SELECT NOW() as current_time, current_database() as database');
            logger_1.logger.info('Conexión a base de datos exitosa:', {
                database: result.rows[0]?.database,
                time: result.rows[0]?.current_time,
                totalConnections: this.pool.totalCount,
                idleConnections: this.pool.idleCount,
                waitingClients: this.pool.waitingCount
            });
            client.release();
        }
        catch (error) {
            logger_1.logger.error('Error al conectar con la base de datos:', error);
            throw error;
        }
    }
    /**
     * Ejecutar query con manejo de errores
     */
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            logger_1.logger.debug('Query ejecutada:', {
                text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                duration: `${duration}ms`,
                rows: result.rowCount
            });
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            logger_1.logger.error('Error en query:', {
                text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                params,
                duration: `${duration}ms`,
                error: error instanceof Error ? error.message : error
            });
            throw error;
        }
    }
    /**
     * Ejecutar transacción
     */
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            logger_1.logger.debug('Transacción completada exitosamente');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            logger_1.logger.error('Error en transacción, rollback ejecutado:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Cerrar todas las conexiones
     */
    async close() {
        try {
            await this.pool.end();
            logger_1.logger.info('Pool de conexiones cerrado');
        }
        catch (error) {
            logger_1.logger.error('Error al cerrar pool de conexiones:', error);
            throw error;
        }
    }
    /**
     * Obtener estadísticas del pool
     */
    getPoolStats() {
        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount
        };
    }
    /**
     * Verificar salud de la base de datos
     */
    async healthCheck() {
        try {
            const start = Date.now();
            const result = await this.pool.query('SELECT 1 as health_check');
            const responseTime = Date.now() - start;
            const stats = this.getPoolStats();
            return {
                status: 'healthy',
                details: {
                    responseTime: `${responseTime}ms`,
                    ...stats,
                    lastCheck: new Date().toISOString()
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    lastCheck: new Date().toISOString()
                }
            };
        }
    }
}
// Crear instancia singleton
exports.config = new DatabaseConfig();
//# sourceMappingURL=database.js.map