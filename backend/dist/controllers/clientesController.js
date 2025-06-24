"use strict";
/**
 * Controlador para endpoints de clientes
 * Maneja la lógica de negocio para gestión de clientes
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientesController = exports.getClientesEstadisticas = exports.getClienteHistorial = exports.autocompleteByTelefono = exports.getClienteByTelefono = exports.deleteCliente = exports.updateCliente = exports.createCliente = exports.getClienteById = exports.getAllClientes = void 0;
const clientesModel_1 = require("@/models/clientesModel");
const errorHandler_1 = require("@/middleware/errorHandler");
const validacion_1 = require("@/types/validacion");
const logger_1 = require("@/utils/logger");
/**
 * Obtener todos los clientes
 */
const getAllClientes = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
        const search = req.query.search;
        let clientes;
        if (search) {
            clientes = await clientesModel_1.clientesModel.search(search, limit);
        }
        else {
            clientes = await clientesModel_1.clientesModel.getAll(limit, offset);
        }
        logger_1.logger.info(`Clientes obtenidos: ${clientes.length} items`);
        res.json({
            success: true,
            data: clientes,
            count: clientes.length,
            ...(search && { search_term: search })
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener clientes:', error);
        throw error;
    }
};
exports.getAllClientes = getAllClientes;
/**
 * Obtener cliente por ID
 */
const getClienteById = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('ID de cliente requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de cliente inválido');
        }
        const cliente = await clientesModel_1.clientesModel.getById(id);
        if (!cliente) {
            res.status(404).json({
                success: false,
                error: 'Cliente no encontrado',
                code: 'CLIENTE_NOT_FOUND'
            });
            return;
        }
        logger_1.logger.debug(`Cliente obtenido: ${cliente.nombre || cliente.telefono}`);
        res.json({
            success: true,
            data: cliente
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener cliente por ID:', error);
        throw error;
    }
};
exports.getClienteById = getClienteById;
/**
 * Crear nuevo cliente
 */
const createCliente = async (req, res) => {
    try {
        // Validar datos de entrada
        const { error, value } = validacion_1.validateClienteSchema.validate(req.body);
        if (error) {
            throw new errorHandler_1.ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const clienteData = value;
        // Verificar que no existe un cliente con el mismo teléfono
        const exists = await clientesModel_1.clientesModel.existsByTelefono(clienteData.telefono);
        if (exists) {
            throw new errorHandler_1.BusinessError('Ya existe un cliente con ese número de teléfono');
        }
        const newCliente = await clientesModel_1.clientesModel.create(clienteData);
        logger_1.logger.info(`Cliente creado: ${newCliente.nombre || newCliente.telefono} (ID: ${newCliente.id})`);
        res.status(201).json({
            success: true,
            data: newCliente,
            message: 'Cliente creado exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al crear cliente:', error);
        throw error;
    }
};
exports.createCliente = createCliente;
/**
 * Actualizar cliente existente
 */
const updateCliente = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de cliente inválido');
        }
        // Validar datos de entrada
        const { error, value } = validacion_1.validateClienteSchema.validate(req.body, { allowUnknown: false });
        if (error) {
            throw new errorHandler_1.ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const clienteData = value;
        // Verificar que el cliente existe
        const existingCliente = await clientesModel_1.clientesModel.getById(id);
        if (!existingCliente) {
            res.status(404).json({
                success: false,
                error: 'Cliente no encontrado',
                code: 'CLIENTE_NOT_FOUND'
            });
            return;
        }
        // Verificar teléfono único si se está cambiando
        if (clienteData.telefono && clienteData.telefono !== existingCliente.telefono) {
            const telefonoExists = await clientesModel_1.clientesModel.existsByTelefono(clienteData.telefono, id);
            if (telefonoExists) {
                throw new errorHandler_1.BusinessError('Ya existe un cliente con ese número de teléfono');
            }
        }
        const updatedCliente = await clientesModel_1.clientesModel.update(id, clienteData);
        logger_1.logger.info(`Cliente actualizado: ${updatedCliente?.nombre || updatedCliente?.telefono} (ID: ${id})`);
        res.json({
            success: true,
            data: updatedCliente,
            message: 'Cliente actualizado exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al actualizar cliente:', error);
        throw error;
    }
};
exports.updateCliente = updateCliente;
/**
 * Eliminar cliente
 */
const deleteCliente = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de cliente inválido');
        }
        // Verificar que el cliente existe
        const existingCliente = await clientesModel_1.clientesModel.getById(id);
        if (!existingCliente) {
            res.status(404).json({
                success: false,
                error: 'Cliente no encontrado',
                code: 'CLIENTE_NOT_FOUND'
            });
            return;
        }
        // Verificar que no tenga pedidos activos antes de eliminar
        const { pedidosModel } = await Promise.resolve().then(() => __importStar(require('@/models/pedidosModel')));
        const pedidosActivos = await pedidosModel.getAll('nuevo', undefined, undefined, id, 1, 0);
        const pedidosEnPreparacion = await pedidosModel.getAll('en_preparacion', undefined, undefined, id, 1, 0);
        const pedidosListos = await pedidosModel.getAll('listo', undefined, undefined, id, 1, 0);
        if (pedidosActivos.length > 0 || pedidosEnPreparacion.length > 0 || pedidosListos.length > 0) {
            throw new errorHandler_1.BusinessError('No se puede eliminar el cliente porque tiene pedidos activos');
        }
        const deleted = await clientesModel_1.clientesModel.delete(id);
        if (!deleted) {
            throw new errorHandler_1.BusinessError('No se pudo eliminar el cliente');
        }
        logger_1.logger.info(`Cliente eliminado: ${existingCliente.nombre || existingCliente.telefono} (ID: ${id})`);
        res.json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al eliminar cliente:', error);
        throw error;
    }
};
exports.deleteCliente = deleteCliente;
/**
 * Obtener cliente por teléfono
 */
const getClienteByTelefono = async (req, res) => {
    try {
        const telefonoParam = req.params.telefono;
        if (!telefonoParam) {
            throw new errorHandler_1.ValidationError('Teléfono requerido');
        }
        const telefono = telefonoParam.trim();
        if (!telefono) {
            throw new errorHandler_1.ValidationError('Teléfono requerido');
        }
        const cliente = await clientesModel_1.clientesModel.getByTelefono(telefono);
        if (!cliente) {
            res.status(404).json({
                success: false,
                error: 'Cliente no encontrado con ese teléfono',
                code: 'CLIENTE_NOT_FOUND',
                telefono
            });
            return;
        }
        logger_1.logger.debug(`Cliente encontrado por teléfono: ${cliente.nombre || cliente.telefono}`);
        res.json({
            success: true,
            data: cliente
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener cliente por teléfono:', error);
        throw error;
    }
};
exports.getClienteByTelefono = getClienteByTelefono;
/**
 * Autocompletar teléfonos
 */
const autocompleteByTelefono = async (req, res) => {
    try {
        const query = req.query.q;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        if (!query || query.length < 2) {
            res.json({
                success: true,
                data: [],
                message: 'Consulta muy corta para autocompletar'
            });
            return;
        }
        const suggestions = await clientesModel_1.clientesModel.autocompleteByTelefono(query, limit);
        logger_1.logger.debug(`Autocompletado de teléfono '${query}': ${suggestions.length} sugerencias`);
        res.json({
            success: true,
            data: suggestions,
            count: suggestions.length,
            query
        });
    }
    catch (error) {
        logger_1.logger.error('Error en autocompletado de teléfono:', error);
        throw error;
    }
};
exports.autocompleteByTelefono = autocompleteByTelefono;
/**
 * Obtener historial de pedidos del cliente
 */
const getClienteHistorial = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de cliente inválido');
        }
        // Verificar que el cliente existe
        const cliente = await clientesModel_1.clientesModel.getById(id);
        if (!cliente) {
            res.status(404).json({
                success: false,
                error: 'Cliente no encontrado',
                code: 'CLIENTE_NOT_FOUND'
            });
            return;
        }
        const historial = await clientesModel_1.clientesModel.getHistorialPedidos(id, limit);
        logger_1.logger.debug(`Historial obtenido para cliente ${id}: ${historial.length} pedidos`);
        res.json({
            success: true,
            data: {
                cliente: {
                    id: cliente.id,
                    telefono: cliente.telefono,
                    nombre: cliente.nombre,
                    total_pedidos: cliente.total_pedidos,
                    total_gastado: cliente.total_gastado
                },
                historial
            },
            count: historial.length
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener historial del cliente:', error);
        throw error;
    }
};
exports.getClienteHistorial = getClienteHistorial;
/**
 * Obtener estadísticas de clientes
 */
const getClientesEstadisticas = async (_req, res) => {
    try {
        const estadisticas = await clientesModel_1.clientesModel.getEstadisticas();
        logger_1.logger.debug('Estadísticas de clientes obtenidas');
        res.json({
            success: true,
            data: estadisticas,
            generated_at: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener estadísticas de clientes:', error);
        throw error;
    }
};
exports.getClientesEstadisticas = getClientesEstadisticas;
exports.clientesController = {
    getAllClientes: exports.getAllClientes,
    getClienteById: exports.getClienteById,
    createCliente: exports.createCliente,
    updateCliente: exports.updateCliente,
    deleteCliente: exports.deleteCliente,
    getClienteByTelefono: exports.getClienteByTelefono,
    autocompleteByTelefono: exports.autocompleteByTelefono,
    getClienteHistorial: exports.getClienteHistorial,
    getClientesEstadisticas: exports.getClientesEstadisticas
};
//# sourceMappingURL=clientesController.js.map