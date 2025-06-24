/**
 * Configuración de logging con Winston
 */
import winston from 'winston';
declare const logger: winston.Logger;
export declare const logRequest: (req: any, res: any, responseTime?: number) => void;
export declare const logDbError: (error: Error, query?: string, params?: any[]) => void;
export declare const logBusinessOperation: (operation: string, details: Record<string, any>, level?: "info" | "warn" | "error") => void;
export declare const logPerformance: (operation: string, duration: number, details?: Record<string, any>) => void;
export { logger };
export default logger;
//# sourceMappingURL=logger.d.ts.map