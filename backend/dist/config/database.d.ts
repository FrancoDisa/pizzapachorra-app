/**
 * Configuración de la base de datos PostgreSQL
 */
import { Pool } from 'pg';
declare const pool: Pool;
/**
 * Clase para manejar la configuración de la base de datos
 */
declare class DatabaseConfig {
    private pool;
    constructor();
    /**
     * Obtener el pool de conexiones
     */
    getPool(): Pool;
    /**
     * Probar la conexión a la base de datos
     */
    testConnection(): Promise<void>;
    /**
     * Ejecutar query con manejo de errores
     */
    query(text: string, params?: any[]): Promise<any>;
    /**
     * Ejecutar transacción
     */
    transaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
    /**
     * Cerrar todas las conexiones
     */
    close(): Promise<void>;
    /**
     * Obtener estadísticas del pool
     */
    getPoolStats(): {
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    };
    /**
     * Verificar salud de la base de datos
     */
    healthCheck(): Promise<{
        status: string;
        details: any;
    }>;
}
export declare const config: DatabaseConfig;
export { pool };
export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
    oid: number;
    fields: any[];
}
export interface DbClient {
    query: (text: string, params?: any[]) => Promise<QueryResult>;
    release: () => void;
}
//# sourceMappingURL=database.d.ts.map