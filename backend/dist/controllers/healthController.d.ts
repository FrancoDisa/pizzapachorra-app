/**
 * Controlador para endpoints de health check
 * Maneja las verificaciones de estado del sistema
 */
import { Request, Response } from 'express';
/**
 * Obtener estado general del sistema
 */
export declare const getOverallHealth: (_req: Request, res: Response) => Promise<void>;
/**
 * Obtener estado específico de la base de datos
 */
export declare const getDatabaseHealth: (_req: Request, res: Response) => Promise<void>;
/**
 * Obtener estado de todos los servicios
 */
export declare const getAllServicesHealth: (_req: Request, res: Response) => Promise<void>;
export declare const healthController: {
    getOverallHealth: (_req: Request, res: Response) => Promise<void>;
    getDatabaseHealth: (_req: Request, res: Response) => Promise<void>;
    getAllServicesHealth: (_req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=healthController.d.ts.map