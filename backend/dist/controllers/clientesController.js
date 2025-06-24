/**
 * Controlador para endpoints de clientes
 * Maneja la lógica de negocio para gestión de clientes
 */
import { clientesModel } from '@/models/clientesModel';
import { ValidationError, BusinessError } from '@/middleware/errorHandler';
import { validateClienteSchema } from '@/types/validacion';
import { logger } from '@/utils/logger';
/**
 * Obtener todos los clientes
 */
export const getAllClientes = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
        const search = req.query.search;
        let clientes;
        if (search) {
            clientes = await clientesModel.search(search, limit);
        }
        else {
            clientes = await clientesModel.getAll(limit, offset);
        }
        logger.info(`Clientes obtenidos: ${clientes.length} items`);
        res.json({
            success: true,
            data: clientes,
            count: clientes.length,
            ...(search && { search_term: search })
        });
    }
    catch (error) {
        logger.error('Error al obtener clientes:', error);
        throw error;
    }
};
/**
 * Obtener cliente por ID
 */
export const getClienteById = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new ValidationError('ID de cliente requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new ValidationError('ID de cliente inválido');
        }
        const cliente = await clientesModel.getById(id);
        if (!cliente) {
            res.status(404).json({
                success: false,
                error: 'Cliente no encontrado',
                code: 'CLIENTE_NOT_FOUND'
            });
            return;
        }
        logger.debug(`Cliente obtenido: ${cliente.nombre || cliente.telefono}`);
        res.json({
            success: true,
            data: cliente
        });
    }
    catch (error) {
        logger.error('Error al obtener cliente por ID:', error);
        throw error;
    }
};
/**
 * Crear nuevo cliente
 */
export const createCliente = async (req, res) => {
    try {
        // Validar datos de entrada
        const { error, value } = validateClienteSchema.validate(req.body);
        if (error) {
            throw new ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const clienteData = value;
        // Verificar que no existe un cliente con el mismo teléfono
        const exists = await clientesModel.existsByTelefono(clienteData.telefono);
        if (exists) {
            throw new BusinessError('Ya existe un cliente con ese número de teléfono');
        }
        const newCliente = await clientesModel.create(clienteData);
        logger.info(`Cliente creado: ${newCliente.nombre || newCliente.telefono} (ID: ${newCliente.id})`);
        res.status(201).json({
            success: true,
            data: newCliente,
            message: 'Cliente creado exitosamente'
        });
    }
    catch (error) {
        logger.error('Error al crear cliente:', error);
        throw error;
    }
};
/**
 * Actualizar cliente existente
 */
export const updateCliente = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new ValidationError('ID de cliente inválido');
        }
        // Validar datos de entrada
        const { error, value } = validateClienteSchema.validate(req.body, { allowUnknown: false });
        if (error) {
            throw new ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const clienteData = value;
        // Verificar que el cliente existe
        const existingCliente = await clientesModel.getById(id);
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
            const telefonoExists = await clientesModel.existsByTelefono(clienteData.telefono, id);
            if (telefonoExists) {
                throw new BusinessError('Ya existe un cliente con ese número de teléfono');
            }
        }
        const updatedCliente = await clientesModel.update(id, clienteData);
        logger.info(`Cliente actualizado: ${updatedCliente?.nombre || updatedCliente?.telefono} (ID: ${id})`);
        res.json({
            success: true,
            data: updatedCliente,
            message: 'Cliente actualizado exitosamente'
        });
    }
    catch (error) {
        logger.error('Error al actualizar cliente:', error);
        throw error;
    }
};
/**
 * Eliminar cliente
 */
export const deleteCliente = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new ValidationError('ID de cliente inválido');
        }
        // Verificar que el cliente existe
        const existingCliente = await clientesModel.getById(id);
        if (!existingCliente) {
            res.status(404).json({
                success: false,
                error: 'Cliente no encontrado',
                code: 'CLIENTE_NOT_FOUND'
            });
            return;
        }
        // Verificar que no tenga pedidos activos antes de eliminar
        const { pedidosModel } = await import('@/models/pedidosModel');
        const pedidosActivos = await pedidosModel.getAll('nuevo', undefined, undefined, id, 1, 0);
        const pedidosEnPreparacion = await pedidosModel.getAll('en_preparacion', undefined, undefined, id, 1, 0);
        const pedidosListos = await pedidosModel.getAll('listo', undefined, undefined, id, 1, 0);
        if (pedidosActivos.length > 0 || pedidosEnPreparacion.length > 0 || pedidosListos.length > 0) {
            throw new BusinessError('No se puede eliminar el cliente porque tiene pedidos activos');
        }
        const deleted = await clientesModel.delete(id);
        if (!deleted) {
            throw new BusinessError('No se pudo eliminar el cliente');
        }
        logger.info(`Cliente eliminado: ${existingCliente.nombre || existingCliente.telefono} (ID: ${id})`);
        res.json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        });
    }
    catch (error) {
        logger.error('Error al eliminar cliente:', error);
        throw error;
    }
};
/**
 * Obtener cliente por teléfono
 */
export const getClienteByTelefono = async (req, res) => {
    try {
        const telefonoParam = req.params.telefono;
        if (!telefonoParam) {
            throw new ValidationError('Teléfono requerido');
        }
        const telefono = telefonoParam.trim();
        if (!telefono) {
            throw new ValidationError('Teléfono requerido');
        }
        const cliente = await clientesModel.getByTelefono(telefono);
        if (!cliente) {
            res.status(404).json({
                success: false,
                error: 'Cliente no encontrado con ese teléfono',
                code: 'CLIENTE_NOT_FOUND',
                telefono
            });
            return;
        }
        logger.debug(`Cliente encontrado por teléfono: ${cliente.nombre || cliente.telefono}`);
        res.json({
            success: true,
            data: cliente
        });
    }
    catch (error) {
        logger.error('Error al obtener cliente por teléfono:', error);
        throw error;
    }
};
/**
 * Autocompletar teléfonos
 */
export const autocompleteByTelefono = async (req, res) => {
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
        const suggestions = await clientesModel.autocompleteByTelefono(query, limit);
        logger.debug(`Autocompletado de teléfono '${query}': ${suggestions.length} sugerencias`);
        res.json({
            success: true,
            data: suggestions,
            count: suggestions.length,
            query
        });
    }
    catch (error) {
        logger.error('Error en autocompletado de teléfono:', error);
        throw error;
    }
};
/**
 * Obtener historial de pedidos del cliente
 */
export const getClienteHistorial = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        if (isNaN(id)) {
            throw new ValidationError('ID de cliente inválido');
        }
        // Verificar que el cliente existe
        const cliente = await clientesModel.getById(id);
        if (!cliente) {
            res.status(404).json({
                success: false,
                error: 'Cliente no encontrado',
                code: 'CLIENTE_NOT_FOUND'
            });
            return;
        }
        const historial = await clientesModel.getHistorialPedidos(id, limit);
        logger.debug(`Historial obtenido para cliente ${id}: ${historial.length} pedidos`);
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
        logger.error('Error al obtener historial del cliente:', error);
        throw error;
    }
};
/**
 * Obtener estadísticas de clientes
 */
export const getClientesEstadisticas = async (_req, res) => {
    try {
        const estadisticas = await clientesModel.getEstadisticas();
        logger.debug('Estadísticas de clientes obtenidas');
        res.json({
            success: true,
            data: estadisticas,
            generated_at: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('Error al obtener estadísticas de clientes:', error);
        throw error;
    }
};
export const clientesController = {
    getAllClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteByTelefono,
    autocompleteByTelefono,
    getClienteHistorial,
    getClientesEstadisticas
};
//# sourceMappingURL=clientesController.js.map