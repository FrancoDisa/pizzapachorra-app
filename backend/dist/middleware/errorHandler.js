"use strict";
/**
 * Middleware de manejo centralizado de errores
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.BusinessError = exports.DatabaseError = exports.ValidationError = exports.ApplicationError = void 0;
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
exports.createValidationError = createValidationError;
const logger_1 = require("@/utils/logger");
const validateEnv_1 = require("@/utils/validateEnv");
/**
 * Clase para errores de aplicación
 */
class ApplicationError extends Error {
    statusCode;
    isOperational;
    code;
    details;
    constructor(message, statusCode = 500, isOperational = true, code, details) {
        super(message);
        this.name = 'ApplicationError';
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationError = ApplicationError;
/**
 * Errores específicos de validación
 */
class ValidationError extends ApplicationError {
    constructor(message, details) {
        super(message, 400, true, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
/**
 * Errores de base de datos
 */
class DatabaseError extends ApplicationError {
    constructor(message, originalError) {
        super(message, 500, true, 'DATABASE_ERROR', { originalError: originalError?.message });
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
/**
 * Errores de negocio
 */
class BusinessError extends ApplicationError {
    constructor(message, statusCode = 422, details) {
        super(message, statusCode, true, 'BUSINESS_ERROR', details);
        this.name = 'BusinessError';
    }
}
exports.BusinessError = BusinessError;
/**
 * Errores de autenticación
 */
class AuthenticationError extends ApplicationError {
    constructor(message = 'No autorizado') {
        super(message, 401, true, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Errores de autorización
 */
class AuthorizationError extends ApplicationError {
    constructor(message = 'Acceso denegado') {
        super(message, 403, true, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Errores de recurso no encontrado
 */
class NotFoundError extends ApplicationError {
    constructor(resource = 'Recurso') {
        super(`${resource} no encontrado`, 404, true, 'NOT_FOUND_ERROR');
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Convertir errores de PostgreSQL a errores de aplicación
 */
function handleDatabaseError(error) {
    logger_1.logger.error('Error de base de datos:', error);
    switch (error.code) {
        case '23505': // unique_violation
            return new ValidationError('El registro ya existe', {
                constraint: error.constraint,
                detail: error.detail
            });
        case '23503': // foreign_key_violation
            return new ValidationError('Referencia inválida', {
                constraint: error.constraint,
                detail: error.detail
            });
        case '23514': // check_violation
            return new ValidationError('Datos inválidos', {
                constraint: error.constraint,
                detail: error.detail
            });
        case '23502': // not_null_violation
            return new ValidationError('Campo requerido faltante', {
                column: error.column,
                table: error.table
            });
        case '42P01': // undefined_table
            return new DatabaseError('Tabla no encontrada');
        case '42703': // undefined_column
            return new DatabaseError('Columna no encontrada');
        case '08006': // connection_failure
        case '08001': // unable_to_connect
            return new DatabaseError('Error de conexión a base de datos');
        case '57P01': // admin_shutdown
            return new DatabaseError('Base de datos no disponible');
        default:
            return new DatabaseError('Error interno de base de datos');
    }
}
/**
 * Middleware principal de manejo de errores
 */
function errorHandler(error, req, res, next) {
    let appError;
    // Convertir errores específicos
    if (error.name === 'ValidationError' && 'details' in error) {
        // Error de Joi
        const details = error.details?.map((detail) => ({
            field: detail.path?.join('.'),
            message: detail.message,
            value: detail.context?.value
        }));
        appError = new ValidationError('Datos de entrada inválidos', details);
    }
    else if ('code' in error && typeof error.code === 'string') {
        // Error de PostgreSQL
        appError = handleDatabaseError(error);
    }
    else if ('statusCode' in error) {
        // Error de aplicación existente
        appError = error;
    }
    else {
        // Error genérico
        appError = new ApplicationError(error.message || 'Error interno del servidor', 500, false);
    }
    // Log del error
    const logLevel = appError.statusCode && appError.statusCode < 500 ? 'warn' : 'error';
    logger_1.logger[logLevel]('Error en aplicación:', {
        name: appError.name,
        message: appError.message,
        statusCode: appError.statusCode,
        code: appError.code,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        stack: (0, validateEnv_1.isProduction)() ? undefined : appError.stack,
        details: appError.details
    });
    // Preparar respuesta
    const response = {
        error: true,
        message: appError.message,
        code: appError.code,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };
    // Agregar detalles en desarrollo o si es error operacional
    if (!(0, validateEnv_1.isProduction)() || appError.isOperational) {
        if (appError.details) {
            response.details = appError.details;
        }
        if (!(0, validateEnv_1.isProduction)()) {
            response.stack = appError.stack;
        }
    }
    // En producción, no revelar detalles de errores internos
    if ((0, validateEnv_1.isProduction)() && (!appError.isOperational || appError.statusCode === 500)) {
        response.message = 'Error interno del servidor';
        delete response.details;
        delete response.stack;
    }
    // Enviar respuesta
    res.status(appError.statusCode || 500).json(response);
}
/**
 * Middleware para capturar errores asíncronos
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
/**
 * Crear error de validación desde esquema Joi
 */
function createValidationError(joiError) {
    const details = joiError.details?.map((detail) => ({
        field: detail.path?.join('.'),
        message: detail.message,
        value: detail.context?.value
    }));
    return new ValidationError('Datos de entrada inválidos', details);
}
//# sourceMappingURL=errorHandler.js.map