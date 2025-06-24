/**
 * Controlador para endpoints de pizzas
 * Maneja la lógica de negocio para el menú de pizzas
 */
import { Request, Response } from 'express';
/**
 * Obtener todas las pizzas
 */
export declare const getAllPizzas: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener pizza por ID
 */
export declare const getPizzaById: (req: Request, res: Response) => Promise<void>;
/**
 * Crear nueva pizza
 */
export declare const createPizza: (req: Request, res: Response) => Promise<void>;
/**
 * Actualizar pizza existente
 */
export declare const updatePizza: (req: Request, res: Response) => Promise<void>;
/**
 * Eliminar pizza (soft delete)
 */
export declare const deletePizza: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener menú activo
 */
export declare const getActiveMenu: (_req: Request, res: Response) => Promise<void>;
export declare const pizzasController: {
    getAllPizzas: (req: Request, res: Response) => Promise<void>;
    getPizzaById: (req: Request, res: Response) => Promise<void>;
    createPizza: (req: Request, res: Response) => Promise<void>;
    updatePizza: (req: Request, res: Response) => Promise<void>;
    deletePizza: (req: Request, res: Response) => Promise<void>;
    getActiveMenu: (_req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=pizzasController.d.ts.map