"use strict";
/**
 * Configuración de logging con Winston
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.logPerformance = exports.logBusinessOperation = exports.logDbError = exports.logRequest = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Definir niveles de log personalizados
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Definir colores para cada nivel
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Aplicar colores
winston_1.default.addColors(colors);
// Formato personalizado para consola
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Formato para archivos
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Determinar nivel de log basado en entorno
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
// Configurar transports
const transports = [
    // Consola
    new winston_1.default.transports.Console({
        level: level(),
        format: consoleFormat,
    }),
];
// En producción, agregar archivos de log
if (process.env.NODE_ENV === 'production') {
    // Log general
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'app.log'),
        level: 'info',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
    // Log de errores
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
}
// Crear logger
const logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format: fileFormat,
    transports,
    // No salir en errores no manejados
    exitOnError: false,
});
exports.logger = logger;
// Stream para Morgan
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};
// Función helper para logging de requests
const logRequest = (req, res, responseTime) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: responseTime ? `${responseTime}ms` : undefined,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
    };
    if (res.statusCode >= 400) {
        logger.warn('HTTP Request', logData);
    }
    else {
        logger.http('HTTP Request', logData);
    }
};
exports.logRequest = logRequest;
// Función helper para logging de errores de DB
const logDbError = (error, query, params) => {
    logger.error('Database Error', {
        message: error.message,
        stack: error.stack,
        query: query?.substring(0, 200) + (query && query.length > 200 ? '...' : ''),
        params: params ? JSON.stringify(params).substring(0, 200) : undefined,
    });
};
exports.logDbError = logDbError;
// Función helper para logging de operaciones de negocio
const logBusinessOperation = (operation, details, level = 'info') => {
    logger[level](`Business Operation: ${operation}`, {
        operation,
        ...details,
        timestamp: new Date().toISOString(),
    });
};
exports.logBusinessOperation = logBusinessOperation;
// Función helper para logging de performance
const logPerformance = (operation, duration, details) => {
    const logLevel = duration > 1000 ? 'warn' : 'debug';
    logger[logLevel](`Performance: ${operation}`, {
        operation,
        duration: `${duration}ms`,
        ...details,
    });
};
exports.logPerformance = logPerformance;
exports.default = logger;
//# sourceMappingURL=logger.js.map