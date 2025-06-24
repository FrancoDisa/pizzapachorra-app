/**
 * Configuración de logging con Winston
 */

import winston from 'winston';
import path from 'path';

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
winston.addColors(colors);

// Formato personalizado para consola
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Formato para archivos
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Determinar nivel de log basado en entorno
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Configurar transports
const transports = [
  // Consola
  new winston.transports.Console({
    level: level(),
    format: consoleFormat,
  }),
];

// En producción, agregar archivos de log
if (process.env.NODE_ENV === 'production') {
  // Log general
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'app.log'),
      level: 'info',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Log de errores
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Crear logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  // No salir en errores no manejados
  exitOnError: false,
});

// Stream para Morgan
logger.stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Función helper para logging de requests
export const logRequest = (req: any, res: any, responseTime?: number) => {
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
  } else {
    logger.http('HTTP Request', logData);
  }
};

// Función helper para logging de errores de DB
export const logDbError = (error: Error, query?: string, params?: any[]) => {
  logger.error('Database Error', {
    message: error.message,
    stack: error.stack,
    query: query?.substring(0, 200) + (query && query.length > 200 ? '...' : ''),
    params: params ? JSON.stringify(params).substring(0, 200) : undefined,
  });
};

// Función helper para logging de operaciones de negocio
export const logBusinessOperation = (
  operation: string,
  details: Record<string, any>,
  level: 'info' | 'warn' | 'error' = 'info'
) => {
  logger[level](`Business Operation: ${operation}`, {
    operation,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

// Función helper para logging de performance
export const logPerformance = (
  operation: string,
  duration: number,
  details?: Record<string, any>
) => {
  const logLevel = duration > 1000 ? 'warn' : 'debug';
  
  logger[logLevel](`Performance: ${operation}`, {
    operation,
    duration: `${duration}ms`,
    ...details,
  });
};

export { logger };
export default logger;