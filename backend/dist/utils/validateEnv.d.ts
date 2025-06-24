/**
 * Validación de variables de entorno requeridas
 */
interface EnvConfig {
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    JWT_SECRET?: string;
    CORS_ORIGIN?: string;
}
/**
 * Validar que todas las variables de entorno requeridas estén presentes
 */
export declare function validateEnv(): EnvConfig;
/**
 * Obtener configuración de entorno tipada
 */
export declare function getEnvConfig(): EnvConfig;
/**
 * Verificar si estamos en entorno de desarrollo
 */
export declare function isDevelopment(): boolean;
/**
 * Verificar si estamos en entorno de producción
 */
export declare function isProduction(): boolean;
/**
 * Verificar si estamos en entorno de test
 */
export declare function isTest(): boolean;
export {};
//# sourceMappingURL=validateEnv.d.ts.map