/**
 * Controlador para endpoints de extras
 * Maneja la lógica de negocio para ingredientes adicionales
 */

import { Request, Response } from 'express';
import { extrasModel } from '@/models/extrasModel';
import { ValidationError, BusinessError } from '@/middleware/errorHandler';
import { validateExtraSchema } from '@/types/validacion';
import { CategoriaExtra } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Obtener todos los extras
 */
export const getAllExtras = async (req: Request, res: Response): Promise<void> => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const extras = await extrasModel.getAll(includeInactive);

    logger.info(`Extras obtenidos: ${extras.length} items`);

    res.json({
      success: true,
      data: extras,
      count: extras.length
    });
  } catch (error) {
    logger.error('Error al obtener extras:', error);
    throw error;
  }
};

/**
 * Obtener extra por ID
 */
export const getExtraById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      throw new ValidationError('id requerido');
    }
    const id = parseInt(idParam);

    if (isNaN(id)) {
      throw new ValidationError('ID de extra inválido');
    }

    const extra = await extrasModel.getById(id);

    if (!extra) {
      res.status(404).json({
        success: false,
        error: 'Extra no encontrado',
        code: 'EXTRA_NOT_FOUND'
      });
      return;
    }

    logger.debug(`Extra obtenido: ${extra.nombre}`);

    res.json({
      success: true,
      data: extra
    });
  } catch (error) {
    logger.error('Error al obtener extra por ID:', error);
    throw error;
  }
};

/**
 * Crear nuevo extra
 */
export const createExtra = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar datos de entrada
    const { error, value } = validateExtraSchema.validate(req.body);
    if (error) {
      throw new ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
    }

    const extraData = value;

    // Verificar que no existe un extra con el mismo nombre en la misma categoría
    const exists = await extrasModel.existsByNameAndCategory(extraData.nombre, extraData.categoria);
    if (exists) {
      throw new BusinessError('Ya existe un extra con ese nombre en la misma categoría');
    }

    // Si no se especifica orden_categoria, asignar el siguiente disponible en esa categoría
    if (!extraData.orden_categoria) {
      const extrasEnCategoria = await extrasModel.getByCategory(extraData.categoria, true);
      extraData.orden_categoria = Math.max(...extrasEnCategoria.map(e => e.orden_categoria), 0) + 1;
    }

    const newExtra = await extrasModel.create(extraData);

    logger.info(`Extra creado: ${newExtra.nombre} (ID: ${newExtra.id}, Categoría: ${newExtra.categoria})`);

    res.status(201).json({
      success: true,
      data: newExtra,
      message: 'Extra creado exitosamente'
    });
  } catch (error) {
    logger.error('Error al crear extra:', error);
    throw error;
  }
};

/**
 * Actualizar extra existente
 */
export const updateExtra = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      throw new ValidationError('id requerido');
    }
    const id = parseInt(idParam);

    if (isNaN(id)) {
      throw new ValidationError('ID de extra inválido');
    }

    // Validar datos de entrada
    const { error, value } = validateExtraSchema.validate(req.body, { allowUnknown: false });
    if (error) {
      throw new ValidationError(`Datos inválidos: ${error.details.map(d => d.message).join(', ')}`);
    }

    const extraData = value;

    // Verificar que el extra existe
    const existingExtra = await extrasModel.getById(id);
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
        const nameExists = await extrasModel.existsByNameAndCategory(nombre, categoria, id);
        if (nameExists) {
          throw new BusinessError('Ya existe un extra con ese nombre en la categoría especificada');
        }
      }
    }

    const updatedExtra = await extrasModel.update(id, extraData);

    logger.info(`Extra actualizado: ${updatedExtra?.nombre} (ID: ${id})`);

    res.json({
      success: true,
      data: updatedExtra,
      message: 'Extra actualizado exitosamente'
    });
  } catch (error) {
    logger.error('Error al actualizar extra:', error);
    throw error;
  }
};

/**
 * Eliminar extra (soft delete)
 */
export const deleteExtra = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      throw new ValidationError('id requerido');
    }
    const id = parseInt(idParam);

    if (isNaN(id)) {
      throw new ValidationError('ID de extra inválido');
    }

    // Verificar que el extra existe
    const existingExtra = await extrasModel.getById(id);
    if (!existingExtra) {
      res.status(404).json({
        success: false,
        error: 'Extra no encontrado',
        code: 'EXTRA_NOT_FOUND'
      });
      return;
    }

    const deleted = await extrasModel.delete(id);

    if (!deleted) {
      throw new BusinessError('No se pudo eliminar el extra');
    }

    logger.info(`Extra eliminado: ${existingExtra.nombre} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Extra eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error al eliminar extra:', error);
    throw error;
  }
};

/**
 * Obtener extras por categoría
 */
export const getExtrasByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoria = req.params.categoria as CategoriaExtra;
    const includeInactive = req.query.include_inactive === 'true';

    // Validar que la categoría es válida
    const categoriasValidas: CategoriaExtra[] = ['condimentos', 'vegetales', 'proteinas', 'carnes', 'quesos', 'especiales', 'general'];
    if (!categoriasValidas.includes(categoria)) {
      throw new ValidationError('Categoría inválida');
    }

    const extras = await extrasModel.getByCategory(categoria, includeInactive);

    logger.debug(`Extras por categoría ${categoria}: ${extras.length} items`);

    res.json({
      success: true,
      data: extras,
      count: extras.length,
      categoria
    });
  } catch (error) {
    logger.error('Error al obtener extras por categoría:', error);
    throw error;
  }
};

/**
 * Obtener menú activo agrupado por categorías
 */
export const getActiveMenu = async (_req: Request, res: Response): Promise<void> => {
  try {
    const menuPorCategoria = await extrasModel.getActiveMenu();

    const totalExtras = Object.values(menuPorCategoria).reduce((acc, extras) => acc + extras.length, 0);
    const categoriasConExtras = Object.keys(menuPorCategoria).length;

    logger.debug(`Menú activo de extras obtenido: ${totalExtras} extras en ${categoriasConExtras} categorías`);

    res.json({
      success: true,
      data: menuPorCategoria,
      count: totalExtras,
      categorias: categoriasConExtras,
      menu_active: true
    });
  } catch (error) {
    logger.error('Error al obtener menú activo de extras:', error);
    throw error;
  }
};

export const extrasController = {
  getAllExtras,
  getExtraById,
  createExtra,
  updateExtra,
  deleteExtra,
  getExtrasByCategory,
  getActiveMenu
};