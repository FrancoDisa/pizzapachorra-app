/**
 * Middleware de manejo centralizado de errores
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Interface para errores personalizados
 */
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string;
    details?: any;
}
/**
 * Clase para errores de aplicación
 */
export declare class ApplicationError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;
    code?: string;
    details?: any;
    constructor(message: string, statusCode?: number, isOperational?: boolean, code?: string, details?: any);
}
/**
 * Errores específicos de validación
 */
export declare class ValidationError extends ApplicationError {
    constructor(message: string, details?: any);
}
/**
 * Errores de base de datos
 */
export declare class DatabaseError extends ApplicationError {
    constructor(message: string, originalError?: Error);
}
/**
 * Errores de negocio
 */
export declare class BusinessError extends ApplicationError {
    constructor(message: string, statusCode?: number, details?: any);
}
/**
 * Errores de autenticación
 */
export declare class AuthenticationError extends ApplicationError {
    constructor(message?: string);
}
/**
 * Errores de autorización
 */
export declare class AuthorizationError extends ApplicationError {
    constructor(message?: string);
}
/**
 * Errores de recurso no encontrado
 */
export declare class NotFoundError extends ApplicationError {
    constructor(resource?: string);
}
/**
 * Middleware principal de manejo de errores
 */
export declare function errorHandler(error: Error | AppError, req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware para capturar errores asíncronos
 */
export declare function asyncHandler<T extends Request, U extends Response>(fn: (req: T, res: U, next: NextFunction) => Promise<any>): (req: T, res: U, next: NextFunction) => void;
/**
 * Crear error de validación desde esquema Joi
 */
export declare function createValidationError(joiError: any): ValidationError;
//# sourceMappingURL=errorHandler.d.ts.map