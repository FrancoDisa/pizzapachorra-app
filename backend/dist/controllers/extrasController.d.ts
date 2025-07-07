/**
 * Controlador para endpoints de extras
 * Maneja la lógica de negocio para ingredientes adicionales
 */
import { Request, Response } from 'express';
/**
 * Obtener todos los extras
 */
export declare const getAllExtras: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener extra por ID
 */
export declare const getExtraById: (req: Request, res: Response) => Promise<void>;
/**
 * Crear nuevo extra
 */
export declare const createExtra: (req: Request, res: Response) => Promise<void>;
/**
 * Actualizar extra existente
 */
export declare const updateExtra: (req: Request, res: Response) => Promise<void>;
/**
 * Eliminar extra (soft delete)
 */
export declare const deleteExtra: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener extras por categoría
 */
export declare const getExtrasByCategory: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener menú activo agrupado por categorías
 */
export declare const getActiveMenu: (_req: Request, res: Response) => Promise<void>;
export declare const extrasController: {
    getAllExtras: (req: Request, res: Response) => Promise<void>;
    getExtraById: (req: Request, res: Response) => Promise<void>;
    createExtra: (req: Request, res: Response) => Promise<void>;
    updateExtra: (req: Request, res: Response) => Promise<void>;
    deleteExtra: (req: Request, res: Response) => Promise<void>;
    getExtrasByCategory: (req: Request, res: Response) => Promise<void>;
    getActiveMenu: (_req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=extrasController.d.ts.map