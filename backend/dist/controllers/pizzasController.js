"use strict";
/**
 * Controlador para endpoints de pizzas
 * Maneja la lógica de negocio para el menú de pizzas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pizzasController = exports.getActiveMenu = exports.deletePizza = exports.updatePizza = exports.createPizza = exports.getPizzaById = exports.getAllPizzas = void 0;
const pizzasModel_1 = require("@/models/pizzasModel");
const errorHandler_1 = require("@/middleware/errorHandler");
const validacion_1 = require("@/types/validacion");
const logger_1 = require("@/utils/logger");
/**
 * Obtener todas las pizzas
 */
const getAllPizzas = async (req, res) => {
    try {
        const includeInactive = req.query.include_inactive === 'true';
        const pizzas = await pizzasModel_1.pizzasModel.getAll(includeInactive);
        logger_1.logger.info(`Pizzas obtenidas: ${pizzas.length} items`);
        res.json({
            success: true,
            data: pizzas,
            count: pizzas.length
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener pizzas:', error);
        throw error;
    }
};
exports.getAllPizzas = getAllPizzas;
/**
 * Obtener pizza por ID
 */
const getPizzaById = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de pizza inválido');
        }
        const pizza = await pizzasModel_1.pizzasModel.getById(id);
        if (!pizza) {
            res.status(404).json({
                success: false,
                error: 'Pizza no encontrada',
                code: 'PIZZA_NOT_FOUND'
            });
            return;
        }
        logger_1.logger.debug(`Pizza obtenida: ${pizza.nombre}`);
        res.json({
            success: true,
            data: pizza
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener pizza por ID:', error);
        throw error;
    }
};
exports.getPizzaById = getPizzaById;
/**
 * Crear nueva pizza
 */
const createPizza = async (req, res) => {
    try {
        // Validar datos de entrada
        const { error, value } = validacion_1.validatePizzaSchema.validate(req.body);
        if (error) {
            throw new errorHandler_1.ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const pizzaData = value;
        // Verificar que no existe una pizza con el mismo nombre
        const exists = await pizzasModel_1.pizzasModel.existsByName(pizzaData.nombre);
        if (exists) {
            throw new errorHandler_1.BusinessError('Ya existe una pizza con ese nombre');
        }
        // Si no se especifica orden_menu, asignar el siguiente disponible
        if (!pizzaData.orden_menu) {
            const allPizzas = await pizzasModel_1.pizzasModel.getAll(true);
            pizzaData.orden_menu = Math.max(...allPizzas.map(p => p.orden_menu), 0) + 1;
        }
        const newPizza = await pizzasModel_1.pizzasModel.create(pizzaData);
        logger_1.logger.info(`Pizza creada: ${newPizza.nombre} (ID: ${newPizza.id})`);
        res.status(201).json({
            success: true,
            data: newPizza,
            message: 'Pizza creada exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al crear pizza:', error);
        throw error;
    }
};
exports.createPizza = createPizza;
/**
 * Actualizar pizza existente
 */
const updatePizza = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de pizza inválido');
        }
        // Validar datos de entrada (schema parcial)
        const { error, value } = validacion_1.validatePizzaSchema.validate(req.body, { allowUnknown: false });
        if (error) {
            throw new errorHandler_1.ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const pizzaData = value;
        // Verificar que la pizza existe
        const existingPizza = await pizzasModel_1.pizzasModel.getById(id);
        if (!existingPizza) {
            res.status(404).json({
                success: false,
                error: 'Pizza no encontrada',
                code: 'PIZZA_NOT_FOUND'
            });
            return;
        }
        // Verificar nombre único si se está cambiando
        if (pizzaData.nombre && pizzaData.nombre !== existingPizza.nombre) {
            const nameExists = await pizzasModel_1.pizzasModel.existsByName(pizzaData.nombre, id);
            if (nameExists) {
                throw new errorHandler_1.BusinessError('Ya existe una pizza con ese nombre');
            }
        }
        const updatedPizza = await pizzasModel_1.pizzasModel.update(id, pizzaData);
        logger_1.logger.info(`Pizza actualizada: ${updatedPizza?.nombre} (ID: ${id})`);
        res.json({
            success: true,
            data: updatedPizza,
            message: 'Pizza actualizada exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al actualizar pizza:', error);
        throw error;
    }
};
exports.updatePizza = updatePizza;
/**
 * Eliminar pizza (soft delete)
 */
const deletePizza = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new errorHandler_1.ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new errorHandler_1.ValidationError('ID de pizza inválido');
        }
        // Verificar que la pizza existe
        const existingPizza = await pizzasModel_1.pizzasModel.getById(id);
        if (!existingPizza) {
            res.status(404).json({
                success: false,
                error: 'Pizza no encontrada',
                code: 'PIZZA_NOT_FOUND'
            });
            return;
        }
        const deleted = await pizzasModel_1.pizzasModel.delete(id);
        if (!deleted) {
            throw new errorHandler_1.BusinessError('No se pudo eliminar la pizza');
        }
        logger_1.logger.info(`Pizza eliminada: ${existingPizza.nombre} (ID: ${id})`);
        res.json({
            success: true,
            message: 'Pizza eliminada exitosamente'
        });
    }
    catch (error) {
        logger_1.logger.error('Error al eliminar pizza:', error);
        throw error;
    }
};
exports.deletePizza = deletePizza;
/**
 * Obtener menú activo
 */
const getActiveMenu = async (_req, res) => {
    try {
        const pizzas = await pizzasModel_1.pizzasModel.getActiveMenu();
        logger_1.logger.debug(`Menú activo obtenido: ${pizzas.length} pizzas`);
        res.json({
            success: true,
            data: pizzas,
            count: pizzas.length,
            menu_active: true
        });
    }
    catch (error) {
        logger_1.logger.error('Error al obtener menú activo:', error);
        throw error;
    }
};
exports.getActiveMenu = getActiveMenu;
exports.pizzasController = {
    getAllPizzas: exports.getAllPizzas,
    getPizzaById: exports.getPizzaById,
    createPizza: exports.createPizza,
    updatePizza: exports.updatePizza,
    deletePizza: exports.deletePizza,
    getActiveMenu: exports.getActiveMenu
};
//# sourceMappingURL=pizzasController.js.map