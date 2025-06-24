"use strict";
/**
 * Controlador para endpoints de pedidos
 * Maneja la lógica de negocio completa para gestión de pedidos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedidosController = exports.recalcularPedido = exports.getHistorialEstados = exports.getPedidosCocina = exports.getResumenHoy = exports.getPedidosByEstado = exports.cambiarEstado = exports.cancelPedido = exports.updatePedido = exports.createPedido = exports.getPedidoById = exports.getAllPedidos = void 0;
const pedidosModel_1 = require("@/models/pedidosModel");
const clientesModel_1 = require("@/models/clientesModel");
const preciosService_1 = require("@/services/preciosService");
const errorHandler_1 = require("@/middleware/errorHandler");
const validacion_1 = require("@/types/validacion");
const logger_1 = require("@/utils/logger");
/**
 * Obtener todos los pedidos
 */
const getAllPedidos = async (req, res) => {
    try {
        const estado = req.query.estado;
        const fechaInicio = req.query.fecha_inicio ? new Date(req.query.fecha_inicio) : undefined;
        const fechaFin = req.query.fecha_fin ? new Date(req.query.fecha_fin) : undefined;
        const clienteId = req.query.cliente_id ? parseInt(req.query.cliente_id) : undefined;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const pedidos = await pedidosModel_1.pedidosModel.getAll(estado, fechaInicio, fechaFin, clienteId, limit, offset);
        logger_1.logger.info(`Pedidos obtenidos: ${pedidos.length} items`);
        res.json({
            success: true,
            data: pedidos,
            count: pedidos.length,
            filters: {
                estado,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                cliente_id: clienteId
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener pedidos:', error);
        throw error;
    }
};
exports.getAllPedidos = getAllPedidos;
/**
 * Obtener pedido por ID
 */
const getPedidoById = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('ID de pedido requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de pedido inválido');
        }
        const pedido = await pedidosModel_1.pedidosModel.getById(id);
        if (!pedido) {
            res.status(404).json({
                success: false,
                error: 'Pedido no encontrado',
                code: 'PEDIDO_NOT_FOUND'
            });
            return;
        }
        logger_1.logger.debug(`Pedido obtenido: ${pedido.numero_pedido}`);
        res.json({
            success: true,
            data: pedido
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener pedido por ID:', error);
        throw error;
    }
};
exports.getPedidoById = getPedidoById;
/**
 * Crear nuevo pedido
 */
const createPedido = async (req, res) => {
    try {
        // Validar datos de entrada
        const { error, value } = validacion_1.validatePedidoSchema.validate(req.body);
        if (error) {
            throw new errorHandler_1.ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const pedidoData = value;
        // Generar número de pedido único
        const numeroPedido = preciosService_1.preciosService.generateNumeroPedido();
        // Gestionar cliente
        let clienteId = pedidoData.cliente_id;
        if (pedidoData.cliente_data && !clienteId) {
            // Buscar cliente existente por teléfono o crear nuevo
            const clienteExistente = await clientesModel_1.clientesModel.getByTelefono(pedidoData.cliente_data.telefono);
            if (clienteExistente) {
                clienteId = clienteExistente.id;
                // Actualizar datos del cliente si se proporcionaron
                if (pedidoData.cliente_data.nombre || pedidoData.cliente_data.direccion || pedidoData.cliente_data.referencias) {
                    await clientesModel_1.clientesModel.update(clienteId, {
                        nombre: pedidoData.cliente_data.nombre || clienteExistente.nombre,
                        direccion: pedidoData.cliente_data.direccion || clienteExistente.direccion,
                        referencias: pedidoData.cliente_data.referencias || clienteExistente.referencias
                    });
                }
            }
            else {
                // Crear nuevo cliente
                const nuevoCliente = await clientesModel_1.clientesModel.create(pedidoData.cliente_data);
                clienteId = nuevoCliente.id;
            }
        }
        // Crear pedido básico
        const pedidoRequest = {
            ...pedidoData,
            cliente_id: clienteId
        };
        const nuevoPedido = await pedidosModel_1.pedidosModel.create(pedidoRequest, numeroPedido);
        // Recalcular precios
        const pedidoRecalculado = await recalcularPreciosPedido(nuevoPedido.id);
        // Actualizar estadísticas del cliente si existe
        if (clienteId) {
            await clientesModel_1.clientesModel.updateEstadisticas(clienteId);
        }
        // Emitir evento WebSocket
        const io = req.io;
        if (io) {
            io.to('cocina').emit('nuevo_pedido', pedidoRecalculado);
            io.to('admin').emit('nuevo_pedido', pedidoRecalculado);
        }
        logger_1.logger.info(`Pedido creado: ${pedidoRecalculado?.numero_pedido} (ID: ${pedidoRecalculado?.id})`);
        res.status(201).json({
            success: true,
            data: pedidoRecalculado,
            message: 'Pedido creado exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al crear pedido:', error);
        throw error;
    }
};
exports.createPedido = createPedido;
/**
 * Actualizar pedido existente
 */
const updatePedido = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('ID de pedido requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de pedido inválido');
        }
        // Verificar que el pedido existe
        const existingPedido = await pedidosModel_1.pedidosModel.getById(id);
        if (!existingPedido) {
            res.status(404).json({
                success: false,
                error: 'Pedido no encontrado',
                code: 'PEDIDO_NOT_FOUND'
            });
            return;
        }
        // Solo permitir actualizar ciertos campos
        const allowedUpdates = ['metodo_pago', 'notas', 'tiempo_estimado', 'descuento'];
        const updateData = {};
        for (const field of allowedUpdates) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }
        if (Object.keys(updateData).length === 0) {
            throw new errorHandler_1.ValidationError('No hay campos válidos para actualizar');
        }
        const updatedPedido = await pedidosModel_1.pedidosModel.update(id, updateData);
        // Recalcular precios si se cambió el descuento
        let finalPedido = updatedPedido;
        if (updateData.descuento !== undefined) {
            finalPedido = await recalcularPreciosPedido(id);
        }
        // Emitir evento WebSocket
        const io = req.io;
        if (io) {
            io.to('cocina').emit('pedido_actualizado', finalPedido);
            io.to('admin').emit('pedido_actualizado', finalPedido);
        }
        logger_1.logger.info(`Pedido actualizado: ${finalPedido?.numero_pedido} (ID: ${id})`);
        res.json({
            success: true,
            data: finalPedido,
            message: 'Pedido actualizado exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al actualizar pedido:', error);
        throw error;
    }
};
exports.updatePedido = updatePedido;
/**
 * Cancelar pedido
 */
const cancelPedido = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('ID de pedido requerido');
        }
        const id = parseInt(idParam);
        const motivo = req.body.motivo || 'Cancelado por usuario';
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de pedido inválido');
        }
        // Verificar que el pedido existe y se puede cancelar
        const existingPedido = await pedidosModel_1.pedidosModel.getById(id);
        if (!existingPedido) {
            res.status(404).json({
                success: false,
                error: 'Pedido no encontrado',
                code: 'PEDIDO_NOT_FOUND'
            });
            return;
        }
        if (existingPedido.estado === 'entregado') {
            throw new errorHandler_1.BusinessError('No se puede cancelar un pedido ya entregado');
        }
        if (existingPedido.estado === 'cancelado') {
            throw new errorHandler_1.BusinessError('El pedido ya está cancelado');
        }
        const pedidoCancelado = await pedidosModel_1.pedidosModel.cambiarEstado(id, 'cancelado', motivo, 'usuario');
        // Actualizar estadísticas del cliente
        if (existingPedido.cliente_id) {
            await clientesModel_1.clientesModel.updateEstadisticas(existingPedido.cliente_id);
        }
        // Emitir evento WebSocket
        const io = req.io;
        if (io) {
            io.to('cocina').emit('cambio_estado', {
                pedido_id: id,
                estado_anterior: existingPedido.estado,
                estado_nuevo: 'cancelado',
                motivo
            });
            io.to('admin').emit('cambio_estado', {
                pedido_id: id,
                estado_anterior: existingPedido.estado,
                estado_nuevo: 'cancelado',
                motivo
            });
        }
        logger_1.logger.info(`Pedido cancelado: ${existingPedido.numero_pedido} (ID: ${id}) - Motivo: ${motivo}`);
        res.json({
            success: true,
            data: pedidoCancelado,
            message: 'Pedido cancelado exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al cancelar pedido:', error);
        throw error;
    }
};
exports.cancelPedido = cancelPedido;
/**
 * Cambiar estado de pedido
 */
const cambiarEstado = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('ID de pedido requerido');
        }
        const id = parseInt(idParam);
        const { estado, motivo } = req.body;
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de pedido inválido');
        }
        if (!estado) {
            throw new errorHandler_1.ValidationError('Estado requerido');
        }
        // Validar estado
        const estadosValidos = ['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            throw new errorHandler_1.ValidationError('Estado inválido');
        }
        // Verificar que el pedido existe
        const existingPedido = await pedidosModel_1.pedidosModel.getById(id);
        if (!existingPedido) {
            res.status(404).json({
                success: false,
                error: 'Pedido no encontrado',
                code: 'PEDIDO_NOT_FOUND'
            });
            return;
        }
        // Validar transición de estado
        if (!esTransicionValida(existingPedido.estado, estado)) {
            throw new errorHandler_1.BusinessError(`Transición de estado inválida: ${existingPedido.estado} -> ${estado}`);
        }
        const pedidoActualizado = await pedidosModel_1.pedidosModel.cambiarEstado(id, estado, motivo, 'usuario');
        // Actualizar estadísticas del cliente si se entregó
        if (estado === 'entregado' && existingPedido.cliente_id) {
            await clientesModel_1.clientesModel.updateEstadisticas(existingPedido.cliente_id);
        }
        // Emitir evento WebSocket
        const io = req.io;
        if (io) {
            io.to('cocina').emit('cambio_estado', {
                pedido_id: id,
                estado_anterior: existingPedido.estado,
                estado_nuevo: estado,
                motivo,
                pedido: pedidoActualizado
            });
            io.to('admin').emit('cambio_estado', {
                pedido_id: id,
                estado_anterior: existingPedido.estado,
                estado_nuevo: estado,
                motivo,
                pedido: pedidoActualizado
            });
        }
        logger_1.logger.info(`Estado cambiado: ${existingPedido.numero_pedido} ${existingPedido.estado} -> ${estado}`);
        res.json({
            success: true,
            data: pedidoActualizado,
            message: 'Estado actualizado exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al cambiar estado:', error);
        throw error;
    }
};
exports.cambiarEstado = cambiarEstado;
/**
 * Obtener pedidos por estado
 */
const getPedidosByEstado = async (req, res) => {
    try {
        const estado = req.params.estado;
        const limit = parseInt(req.query.limit) || 50;
        // Validar estado
        const estadosValidos = ['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            throw new errorHandler_1.ValidationError('Estado inválido');
        }
        const pedidos = await pedidosModel_1.pedidosModel.getByEstado(estado, limit);
        logger_1.logger.debug(`Pedidos por estado ${estado}: ${pedidos.length} items`);
        res.json({
            success: true,
            data: pedidos,
            count: pedidos.length,
            estado
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener pedidos por estado:', error);
        throw error;
    }
};
exports.getPedidosByEstado = getPedidosByEstado;
/**
 * Obtener resumen del día
 */
const getResumenHoy = async (_req, res) => {
    try {
        const resumen = await pedidosModel_1.pedidosModel.getResumenHoy();
        logger_1.logger.debug('Resumen del día obtenido');
        res.json({
            success: true,
            data: resumen,
            fecha: new Date().toISOString().split('T')[0]
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener resumen del día:', error);
        throw error;
    }
};
exports.getResumenHoy = getResumenHoy;
/**
 * Obtener pedidos activos para cocina
 */
const getPedidosCocina = async (_req, res) => {
    try {
        const pedidos = await pedidosModel_1.pedidosModel.getPedidosCocina();
        logger_1.logger.debug(`Pedidos de cocina obtenidos: ${pedidos.length} items`);
        res.json({
            success: true,
            data: pedidos,
            count: pedidos.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener pedidos de cocina:', error);
        throw error;
    }
};
exports.getPedidosCocina = getPedidosCocina;
/**
 * Obtener historial de estados
 */
const getHistorialEstados = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de pedido inválido');
        }
        // Verificar que el pedido existe
        const pedido = await pedidosModel_1.pedidosModel.getById(id);
        if (!pedido) {
            res.status(404).json({
                success: false,
                error: 'Pedido no encontrado',
                code: 'PEDIDO_NOT_FOUND'
            });
            return;
        }
        const historial = await pedidosModel_1.pedidosModel.getHistorialEstados(id);
        logger_1.logger.debug(`Historial de estados obtenido para pedido ${id}: ${historial.length} registros`);
        res.json({
            success: true,
            data: {
                pedido: {
                    id: pedido.id,
                    numero_pedido: pedido.numero_pedido,
                    estado_actual: pedido.estado
                },
                historial
            },
            count: historial.length
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener historial de estados:', error);
        throw error;
    }
};
exports.getHistorialEstados = getHistorialEstados;
/**
 * Recalcular precios de pedido
 */
const recalcularPedido = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de pedido inválido');
        }
        const pedidoRecalculado = await recalcularPreciosPedido(id);
        if (!pedidoRecalculado) {
            res.status(404).json({
                success: false,
                error: 'Pedido no encontrado',
                code: 'PEDIDO_NOT_FOUND'
            });
            return;
        }
        logger_1.logger.info(`Pedido recalculado: ${pedidoRecalculado.numero_pedido} - Total: $${pedidoRecalculado.total}`);
        res.json({
            success: true,
            data: pedidoRecalculado,
            message: 'Precios recalculados exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al recalcular pedido:', error);
        throw error;
    }
};
exports.recalcularPedido = recalcularPedido;
/**
 * Función auxiliar para recalcular precios de un pedido
 */
async function recalcularPreciosPedido(pedidoId) {
    const pedido = await pedidosModel_1.pedidosModel.getById(pedidoId);
    if (!pedido)
        return null;
    // Construir parámetros para el cálculo
    const parametrosItems = pedido.items.map(item => ({
        pizza_principal: item.pizza,
        extras_principales: item.extras_principales,
        ingredientes_removidos: item.ingredientes_removidos,
        pizza_mitad2: item.pizza_mitad2,
        extras_mitad2: item.extras_mitad2,
        ingredientes_removidos_mitad2: item.ingredientes_removidos_mitad2,
        cantidad: item.cantidad
    }));
    // Calcular resumen
    const resumen = await preciosService_1.preciosService.calcularResumenPedido(parametrosItems, pedido.descuento);
    // Actualizar pedido con nuevos precios
    const pedidoActualizado = await pedidosModel_1.pedidosModel.update(pedidoId, {
        subtotal: resumen.subtotal,
        total: resumen.total
    });
    return pedidoActualizado;
}
/**
 * Validar transición de estado
 */
function esTransicionValida(estadoActual, nuevoEstado) {
    const transicionesValidas = {
        'nuevo': ['en_preparacion', 'cancelado'],
        'en_preparacion': ['listo', 'cancelado'],
        'listo': ['entregado', 'cancelado'],
        'entregado': [], // Estado final
        'cancelado': [] // Estado final
    };
    return transicionesValidas[estadoActual].includes(nuevoEstado);
}
exports.pedidosController = {
    getAllPedidos: exports.getAllPedidos,
    getPedidoById: exports.getPedidoById,
    createPedido: exports.createPedido,
    updatePedido: exports.updatePedido,
    cancelPedido: exports.cancelPedido,
    cambiarEstado: exports.cambiarEstado,
    getPedidosByEstado: exports.getPedidosByEstado,
    getResumenHoy: exports.getResumenHoy,
    getPedidosCocina: exports.getPedidosCocina,
    getHistorialEstados: exports.getHistorialEstados,
    recalcularPedido: exports.recalcularPedido
};
//# sourceMappingURL=pedidosController.js.map