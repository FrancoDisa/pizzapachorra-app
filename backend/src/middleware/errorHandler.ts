/**
 * Middleware de manejo centralizado de errores
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { isProduction } from '@/utils/validateEnv';

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
export class ApplicationError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores específicos de validación
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Errores de base de datos
 */
export class DatabaseError extends ApplicationError {
  constructor(message: string, originalError?: Error) {
    super(message, 500, true, 'DATABASE_ERROR', { originalError: originalError?.message });
    this.name = 'DatabaseError';
  }
}

/**
 * Errores de negocio
 */
export class BusinessError extends ApplicationError {
  constructor(message: string, statusCode: number = 422, details?: any) {
    super(message, statusCode, true, 'BUSINESS_ERROR', details);
    this.name = 'BusinessError';
  }
}

/**
 * Errores de autenticación
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Errores de autorización
 */
export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Errores de recurso no encontrado
 */
export class NotFoundError extends ApplicationError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, true, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

/**
 * Convertir errores de PostgreSQL a errores de aplicación
 */
function handleDatabaseError(error: any): AppError {
  logger.error('Error de base de datos:', error);

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
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let appError: AppError;

  // Convertir errores específicos
  if (error.name === 'ValidationError' && 'details' in error) {
    // Error de Joi
    const details = (error as any).details?.map((detail: any) => ({
      field: detail.path?.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    appError = new ValidationError('Datos de entrada inválidos', details);
  } else if ('code' in error && typeof error.code === 'string') {
    // Error de PostgreSQL
    appError = handleDatabaseError(error);
  } else if ('statusCode' in error) {
    // Error de aplicación existente
    appError = error as AppError;
  } else {
    // Error genérico
    appError = new ApplicationError(
      error.message || 'Error interno del servidor',
      500,
      false
    );
  }

  // Log del error
  const logLevel = appError.statusCode && appError.statusCode < 500 ? 'warn' : 'error';
  
  logger[logLevel]('Error en aplicación:', {
    name: appError.name,
    message: appError.message,
    statusCode: appError.statusCode,
    code: appError.code,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: isProduction() ? undefined : appError.stack,
    details: appError.details
  });

  // Preparar respuesta
  const response: any = {
    error: true,
    message: appError.message,
    code: appError.code,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Agregar detalles en desarrollo o si es error operacional
  if (!isProduction() || appError.isOperational) {
    if (appError.details) {
      response.details = appError.details;
    }
    
    if (!isProduction()) {
      response.stack = appError.stack;
    }
  }

  // En producción, no revelar detalles de errores internos
  if (isProduction() && (!appError.isOperational || appError.statusCode === 500)) {
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
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Crear error de validación desde esquema Joi
 */
export function createValidationError(joiError: any): ValidationError {
  const details = joiError.details?.map((detail: any) => ({
    field: detail.path?.join('.'),
    message: detail.message,
    value: detail.context?.value
  }));

  return new ValidationError('Datos de entrada inválidos', details);
}