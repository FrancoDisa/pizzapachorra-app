/**
 * Controlador para endpoints de pizzas
 * Maneja la lógica de negocio para el menú de pizzas
 */
import { pizzasModel } from '@/models/pizzasModel';
import { ValidationError, BusinessError } from '@/middleware/errorHandler';
import { validatePizzaSchema } from '@/types/validacion';
import { logger } from '@/utils/logger';
/**
 * Obtener todas las pizzas
 */
export const getAllPizzas = async (req, res) => {
    try {
        const includeInactive = req.query.include_inactive === 'true';
        const pizzas = await pizzasModel.getAll(includeInactive);
        logger.info(`Pizzas obtenidas: ${pizzas.length} items`);
        res.json({
            success: true,
            data: pizzas,
            count: pizzas.length
        });
    }
    catch (error) {
        logger.error('Error al obtener pizzas:', error);
        throw error;
    }
};
/**
 * Obtener pizza por ID
 */
export const getPizzaById = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new ValidationError('ID de pizza inválido');
        }
        const pizza = await pizzasModel.getById(id);
        if (!pizza) {
            res.status(404).json({
                success: false,
                error: 'Pizza no encontrada',
                code: 'PIZZA_NOT_FOUND'
            });
            return;
        }
        logger.debug(`Pizza obtenida: ${pizza.nombre}`);
        res.json({
            success: true,
            data: pizza
        });
    }
    catch (error) {
        logger.error('Error al obtener pizza por ID:', error);
        throw error;
    }
};
/**
 * Crear nueva pizza
 */
export const createPizza = async (req, res) => {
    try {
        // Validar datos de entrada
        const { error, value } = validatePizzaSchema.validate(req.body);
        if (error) {
            throw new ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const pizzaData = value;
        // Verificar que no existe una pizza con el mismo nombre
        const exists = await pizzasModel.existsByName(pizzaData.nombre);
        if (exists) {
            throw new BusinessError('Ya existe una pizza con ese nombre');
        }
        // Si no se especifica orden_menu, asignar el siguiente disponible
        if (!pizzaData.orden_menu) {
            const allPizzas = await pizzasModel.getAll(true);
            pizzaData.orden_menu = Math.max(...allPizzas.map(p => p.orden_menu), 0) + 1;
        }
        const newPizza = await pizzasModel.create(pizzaData);
        logger.info(`Pizza creada: ${newPizza.nombre} (ID: ${newPizza.id})`);
        res.status(201).json({
            success: true,
            data: newPizza,
            message: 'Pizza creada exitosamente'
        });
    }
    catch (error) {
        logger.error('Error al crear pizza:', error);
        throw error;
    }
};
/**
 * Actualizar pizza existente
 */
export const updatePizza = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new ValidationError('ID de pizza inválido');
        }
        // Validar datos de entrada (schema parcial)
        const { error, value } = validatePizzaSchema.validate(req.body, { allowUnknown: false });
        if (error) {
            throw new ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
        }
        const pizzaData = value;
        // Verificar que la pizza existe
        const existingPizza = await pizzasModel.getById(id);
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
            const nameExists = await pizzasModel.existsByName(pizzaData.nombre, id);
            if (nameExists) {
                throw new BusinessError('Ya existe una pizza con ese nombre');
            }
        }
        const updatedPizza = await pizzasModel.update(id, pizzaData);
        logger.info(`Pizza actualizada: ${updatedPizza?.nombre} (ID: ${id})`);
        res.json({
            success: true,
            data: updatedPizza,
            message: 'Pizza actualizada exitosamente'
        });
    }
    catch (error) {
        logger.error('Error al actualizar pizza:', error);
        throw error;
    }
};
/**
 * Eliminar pizza (soft delete)
 */
export const deletePizza = async (req, res) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            throw new ValidationError('id requerido');
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            throw new ValidationError('ID de pizza inválido');
        }
        // Verificar que la pizza existe
        const existingPizza = await pizzasModel.getById(id);
        if (!existingPizza) {
            res.status(404).json({
                success: false,
                error: 'Pizza no encontrada',
                code: 'PIZZA_NOT_FOUND'
            });
            return;
        }
        const deleted = await pizzasModel.delete(id);
        if (!deleted) {
            throw new BusinessError('No se pudo eliminar la pizza');
        }
        logger.info(`Pizza eliminada: ${existingPizza.nombre} (ID: ${id})`);
        res.json({
            success: true,
            message: 'Pizza eliminada exitosamente'
        });
    }
    catch (error) {
        logger.error('Error al eliminar pizza:', error);
        throw error;
    }
};
/**
 * Obtener menú activo
 */
export const getActiveMenu = async (_req, res) => {
    try {
        const pizzas = await pizzasModel.getActiveMenu();
        logger.debug(`Menú activo obtenido: ${pizzas.length} pizzas`);
        res.json({
            success: true,
            data: pizzas,
            count: pizzas.length,
            menu_active: true
        });
    }
    catch (error) {
        logger.error('Error al obtener menú activo:', error);
        throw error;
    }
};
export const pizzasController = {
    getAllPizzas,
    getPizzaById,
    createPizza,
    updatePizza,
    deletePizza,
    getActiveMenu
};
//# sourceMappingURL=pizzasController.js.map