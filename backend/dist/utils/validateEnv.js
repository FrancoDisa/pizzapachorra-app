"use strict";
/**
 * Validación de variables de entorno requeridas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
exports.getEnvConfig = getEnvConfig;
exports.isDevelopment = isDevelopment;
exports.isProduction = isProduction;
exports.isTest = isTest;
const logger_1 = require("./logger");
/**
 * Variables de entorno requeridas
 */
const requiredEnvVars = [
    'DATABASE_URL',
];
/**
 * Variables de entorno opcionales con valores por defecto
 */
const defaultEnvVars = {
    NODE_ENV: 'development',
    PORT: '3001',
    JWT_SECRET: 'pizzapachorra_default_secret_change_in_production',
    CORS_ORIGIN: 'http://localhost:3000',
};
/**
 * Validar que todas las variables de entorno requeridas estén presentes
 */
function validateEnv() {
    const errors = [];
    const warnings = [];
    // Verificar variables requeridas
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            errors.push(`Variable de entorno requerida faltante: ${envVar}`);
        }
    }
    // Verificar variables con valores por defecto
    for (const [key, defaultValue] of Object.entries(defaultEnvVars)) {
        if (!process.env[key]) {
            process.env[key] = defaultValue;
            if (key === 'JWT_SECRET' && process.env.NODE_ENV === 'production') {
                warnings.push(`Usando JWT_SECRET por defecto en producción. ¡Cambiar inmediatamente!`);
            }
            else {
                warnings.push(`Usando valor por defecto para ${key}: ${defaultValue}`);
            }
        }
    }
    // Validaciones específicas
    const port = parseInt(process.env.PORT || '3001', 10);
    if (isNaN(port) || port < 1 || port > 65535) {
        errors.push('PORT debe ser un número válido entre 1 y 65535');
    }
    // Validar NODE_ENV
    const validNodeEnvs = ['development', 'production', 'test'];
    if (!validNodeEnvs.includes(process.env.NODE_ENV || '')) {
        warnings.push(`NODE_ENV inválido: ${process.env.NODE_ENV}. Usando 'development'`);
        process.env.NODE_ENV = 'development';
    }
    // Validar formato de DATABASE_URL
    if (process.env.DATABASE_URL && !isValidDatabaseUrl(process.env.DATABASE_URL)) {
        errors.push('DATABASE_URL tiene formato inválido. Debe ser: postgresql://usuario:password@host:puerto/database');
    }
    // Validar CORS_ORIGIN en producción
    if (process.env.NODE_ENV === 'production' && process.env.CORS_ORIGIN === 'http://localhost:3000') {
        warnings.push('CORS_ORIGIN usando localhost en producción. Verificar configuración.');
    }
    // Mostrar warnings
    if (warnings.length > 0) {
        logger_1.logger.warn('Advertencias de configuración:', warnings);
    }
    // Si hay errores, fallar
    if (errors.length > 0) {
        logger_1.logger.error('Errores de configuración:', errors);
        throw new Error(`Configuración inválida:\n${errors.join('\n')}`);
    }
    // Log de configuración exitosa
    logger_1.logger.info('Validación de entorno completada:', {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: maskDatabaseUrl(process.env.DATABASE_URL || ''),
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        JWT_SECRET_SET: !!process.env.JWT_SECRET,
    });
    return {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET || defaultEnvVars.JWT_SECRET,
        CORS_ORIGIN: process.env.CORS_ORIGIN || defaultEnvVars.CORS_ORIGIN,
    };
}
/**
 * Validar formato de URL de base de datos
 */
function isValidDatabaseUrl(url) {
    try {
        const parsed = new URL(url);
        return (parsed.protocol === 'postgresql:' &&
            !!parsed.hostname &&
            !!parsed.pathname &&
            parsed.pathname !== '/');
    }
    catch {
        return false;
    }
}
/**
 * Enmascarar información sensible de la URL de DB para logging
 */
function maskDatabaseUrl(url) {
    try {
        const parsed = new URL(url);
        const masked = `${parsed.protocol}//${parsed.username}:****@${parsed.hostname}:${parsed.port}${parsed.pathname}`;
        return masked;
    }
    catch {
        return '[URL_INVÁLIDA]';
    }
}
/**
 * Obtener configuración de entorno tipada
 */
function getEnvConfig() {
    return {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET || defaultEnvVars.JWT_SECRET,
        CORS_ORIGIN: process.env.CORS_ORIGIN || defaultEnvVars.CORS_ORIGIN,
    };
}
/**
 * Verificar si estamos en entorno de desarrollo
 */
function isDevelopment() {
    return process.env.NODE_ENV === 'development';
}
/**
 * Verificar si estamos en entorno de producción
 */
function isProduction() {
    return process.env.NODE_ENV === 'production';
}
/**
 * Verificar si estamos en entorno de test
 */
function isTest() {
    return process.env.NODE_ENV === 'test';
}
//# sourceMappingURL=validateEnv.js.map