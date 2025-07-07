/**
 * Controlador para endpoints de clientes
 * Maneja la lógica de negocio para gestión de clientes
 */
import { Request, Response } from 'express';
/**
 * Obtener todos los clientes
 */
export declare const getAllClientes: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener cliente por ID
 */
export declare const getClienteById: (req: Request, res: Response) => Promise<void>;
/**
 * Crear nuevo cliente
 */
export declare const createCliente: (req: Request, res: Response) => Promise<void>;
/**
 * Actualizar cliente existente
 */
export declare const updateCliente: (req: Request, res: Response) => Promise<void>;
/**
 * Eliminar cliente
 */
export declare const deleteCliente: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener cliente por teléfono
 */
export declare const getClienteByTelefono: (req: Request, res: Response) => Promise<void>;
/**
 * Autocompletar teléfonos
 */
export declare const autocompleteByTelefono: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener historial de pedidos del cliente
 */
export declare const getClienteHistorial: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener estadísticas de clientes
 */
export declare const getClientesEstadisticas: (_req: Request, res: Response) => Promise<void>;
export declare const clientesController: {
    getAllClientes: (req: Request, res: Response) => Promise<void>;
    getClienteById: (req: Request, res: Response) => Promise<void>;
    createCliente: (req: Request, res: Response) => Promise<void>;
    updateCliente: (req: Request, res: Response) => Promise<void>;
    deleteCliente: (req: Request, res: Response) => Promise<void>;
    getClienteByTelefono: (req: Request, res: Response) => Promise<void>;
    autocompleteByTelefono: (req: Request, res: Response) => Promise<void>;
    getClienteHistorial: (req: Request, res: Response) => Promise<void>;
    getClientesEstadisticas: (_req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=clientesController.d.ts.map