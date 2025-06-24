"use strict";
/**
 * Controlador para endpoints de extras
 * Maneja la lógica de negocio para ingredientes adicionales
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extrasController = exports.getActiveMenu = exports.getExtrasByCategory = exports.deleteExtra = exports.updateExtra = exports.createExtra = exports.getExtraById = exports.getAllExtras = void 0;
const extrasModel_1 = require("@/models/extrasModel");
const errorHandler_1 = require("@/middleware/errorHandler");
const validacion_1 = require("@/types/validacion");
const logger_1 = require("@/utils/logger");
/**
 * Obtener todos los extras
 */
const getAllExtras = async (req, res) => {
    try {
        const includeInactive = req.query.include_inactive === 'true';
        const extras = await extrasModel_1.extrasModel.getAll(includeInactive);
        logger_1.logger.info(`Extras obtenidos: ${extras.length} items`);
        res.json({
            success: true,
            data: extras,
            count: extras.length
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener extras:', error);
        throw error;
    }
};
exports.getAllExtras = getAllExtras;
/**
 * Obtener extra por ID
 */
const getExtraById = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de extra inválido');
        }
        const extra = await extrasModel_1.extrasModel.getById(id);
        if (!extra) {
            res.status(404).json({
                success: false,
                error: 'Extra no encontrado',
                code: 'EXTRA_NOT_FOUND'
            });
            return;
        }
        logger_1.logger.debug(`Extra obtenido: ${extra.nombre}`);
        res.json({
            success: true,
            data: extra
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener extra por ID:', error);
        throw error;
    }
};
exports.getExtraById = getExtraById;
/**
 * Crear nuevo extra
 */
const createExtra = async (req, res) => {
    try {
        // Validar datos de entrada
        const { error, value } = validacion_1.validateExtraSchema.validate(req.body);
        if (error) {
            throw new errorHandler_1.ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const extraData = value;
        // Verificar que no existe un extra con el mismo nombre en la misma categoría
        const exists = await extrasModel_1.extrasModel.existsByNameAndCategory(extraData.nombre, extraData.categoria);
        if (exists) {
            throw new errorHandler_1.BusinessError('Ya existe un extra con ese nombre en la misma categoría');
        }
        // Si no se especifica orden_categoria, asignar el siguiente disponible en esa categoría
        if (!extraData.orden_categoria) {
            const extrasEnCategoria = await extrasModel_1.extrasModel.getByCategory(extraData.categoria, true);
            extraData.orden_categoria = Math.max(...extrasEnCategoria.map(e => e.orden_categoria), 0) + 1;
        }
        const newExtra = await extrasModel_1.extrasModel.create(extraData);
        logger_1.logger.info(`Extra creado: ${newExtra.nombre} (ID: ${newExtra.id}, Categoría: ${newExtra.categoria})`);
        res.status(201).json({
            success: true,
            data: newExtra,
            message: 'Extra creado exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al crear extra:', error);
        throw error;
    }
};
exports.createExtra = createExtra;
/**
 * Actualizar extra existente
 */
const updateExtra = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de extra inválido');
        }
        // Validar datos de entrada
        const { error, value } = validacion_1.validateExtraSchema.validate(req.body, { allowUnknown: false });
        if (error) {
            throw new errorHandler_1.ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const extraData = value;
        // Verificar que el extra existe
        const existingExtra = await extrasModel_1.extrasModel.getById(id);
        if (!existingExtra) {
            res.status(404).json({
                success: false,
                error: 'Extra no encontrado',
                code: 'EXTRA_NOT_FOUND'
            });
            return;
        }
        // Verificar nombre único en categoría si se están cambiando
        if (extraData.nombre || extraData.categoria) {
            const nombre = extraData.nombre || existingExtra.nombre;
            const categoria = extraData.categoria || existingExtra.categoria;
            if (nombre !== existingExtra.nombre || categoria !== existingExtra.categoria) {
                const nameExists = await extrasModel_1.extrasModel.existsByNameAndCategory(nombre, categoria, id);
                if (nameExists) {
                    throw new errorHandler_1.BusinessError('Ya existe un extra con ese nombre en la categoría especificada');
                }
            }
        }
        const updatedExtra = await extrasModel_1.extrasModel.update(id, extraData);
        logger_1.logger.info(`Extra actualizado: ${updatedExtra?.nombre} (ID: ${id})`);
        res.json({
            success: true,
            data: updatedExtra,
            message: 'Extra actualizado exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al actualizar extra:', error);
        throw error;
    }
};
exports.updateExtra = updateExtra;
/**
 * Eliminar extra (soft delete)
 */
const deleteExtra = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de extra inválido');
        }
        // Verificar que el extra existe
        const existingExtra = await extrasModel_1.extrasModel.getById(id);
        if (!existingExtra) {
            res.status(404).json({
                success: false,
                error: 'Extra no encontrado',
                code: 'EXTRA_NOT_FOUND'
            });
            return;
        }
        const deleted = await extrasModel_1.extrasModel.delete(id);
        if (!deleted) {
            throw new errorHandler_1.BusinessError('No se pudo eliminar el extra');
        }
        logger_1.logger.info(`Extra eliminado: ${existingExtra.nombre} (ID: ${id})`);
        res.json({
            success: true,
            message: 'Extra eliminado exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al eliminar extra:', error);
        throw error;
    }
};
exports.deleteExtra = deleteExtra;
/**
 * Obtener extras por categoría
 */
const getExtrasByCategory = async (req, res) => {
    try {
        const categoria = req.params.categoria;
        const includeInactive = req.query.include_inactive === 'true';
        // Validar que la categoría es válida
        const categoriasValidas = ['condimentos', 'vegetales', 'proteinas', 'carnes', 'quesos', 'especiales', 'general'];
        if (!categoriasValidas.includes(categoria)) {
            throw new errorHandler_1.ValidationError('Categoría inválida');
        }
        const extras = await extrasModel_1.extrasModel.getByCategory(categoria, includeInactive);
        logger_1.logger.debug(`Extras por categoría ${categoria}: ${extras.length} items`);
        res.json({
            success: true,
            data: extras,
            count: extras.length,
            categoria
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener extras por categoría:', error);
        throw error;
    }
};
exports.getExtrasByCategory = getExtrasByCategory;
/**
 * Obtener menú activo agrupado por categorías
 */
const getActiveMenu = async (_req, res) => {
    try {
        const menuPorCategoria = await extrasModel_1.extrasModel.getActiveMenu();
        const totalExtras = Object.values(menuPorCategoria).reduce((acc, extras) => acc + extras.length, 0);
        const categoriasConExtras = Object.keys(menuPorCategoria).length;
        logger_1.logger.debug(`Menú activo de extras obtenido: ${totalExtras} extras en ${categoriasConExtras} categorías`);
        res.json({
            success: true,
            data: menuPorCategoria,
            count: totalExtras,
            categorias: categoriasConExtras,
            menu_active: true
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener menú activo de extras:', error);
        throw error;
    }
};
exports.getActiveMenu = getActiveMenu;
exports.extrasController = {
    getAllExtras: exports.getAllExtras,
    getExtraById: exports.getExtraById,
    createExtra: exports.createExtra,
    updateExtra: exports.updateExtra,
    deleteExtra: exports.deleteExtra,
    getExtrasByCategory: exports.getExtrasByCategory,
    getActiveMenu: exports.getActiveMenu
};
//# sourceMappingURL=extrasController.js.map