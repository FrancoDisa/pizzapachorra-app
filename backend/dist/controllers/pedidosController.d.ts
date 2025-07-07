/**
 * Controlador para endpoints de pedidos
 * Maneja la lógica de negocio completa para gestión de pedidos
 */
import { Request, Response } from 'express';
/**
 * Obtener todos los pedidos
 */
export declare const getAllPedidos: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener pedido por ID
 */
export declare const getPedidoById: (req: Request, res: Response) => Promise<void>;
/**
 * Crear nuevo pedido
 */
export declare const createPedido: (req: Request, res: Response) => Promise<void>;
/**
 * Actualizar pedido existente
 */
export declare const updatePedido: (req: Request, res: Response) => Promise<void>;
/**
 * Cancelar pedido
 */
export declare const cancelPedido: (req: Request, res: Response) => Promise<void>;
/**
 * Cambiar estado de pedido
 */
export declare const cambiarEstado: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener pedidos por estado
 */
export declare const getPedidosByEstado: (req: Request, res: Response) => Promise<void>;
/**
 * Obtener resumen del día
 */
export declare const getResumenHoy: (_req: Request, res: Response) => Promise<void>;
/**
 * Obtener pedidos activos para cocina
 */
export declare const getPedidosCocina: (_req: Request, res: Response) => Promise<void>;
/**
 * Obtener historial de estados
 */
export declare const getHistorialEstados: (req: Request, res: Response) => Promise<void>;
/**
 * Recalcular precios de pedido
 */
export declare const recalcularPedido: (req: Request, res: Response) => Promise<void>;
export declare const pedidosController: {
    getAllPedidos: (req: Request, res: Response) => Promise<void>;
    getPedidoById: (req: Request, res: Response) => Promise<void>;
    createPedido: (req: Request, res: Response) => Promise<void>;
    updatePedido: (req: Request, res: Response) => Promise<void>;
    cancelPedido: (req: Request, res: Response) => Promise<void>;
    cambiarEstado: (req: Request, res: Response) => Promise<void>;
    getPedidosByEstado: (req: Request, res: Response) => Promise<void>;
    getResumenHoy: (_req: Request, res: Response) => Promise<void>;
    getPedidosCocina: (_req: Request, res: Response) => Promise<void>;
    getHistorialEstados: (req: Request, res: Response) => Promise<void>;
    recalcularPedido: (req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=pedidosController.d.ts.map