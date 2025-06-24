"use strict";
/**
 * Servicio para cálculo de precios de pizzas
 * Implementa la lógica compleja de precios para pizzas enteras y mitad-y-mitad
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.preciosService = exports.PreciosService = void 0;
const pizzasModel_1 = require("@/models/pizzasModel");
const extrasModel_1 = require("@/models/extrasModel");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
class PreciosService {
    /**
     * Calcular precio de una pizza completa
     */
    async calcularPrecioPizza(parametros) {
        try {
            const { pizza_principal, extras_principales, ingredientes_removidos, pizza_mitad2, extras_mitad2, ingredientes_removidos_mitad2, cantidad } = parametros;
            // Verificar que las pizzas existen
            const pizzaBase = await pizzasModel_1.pizzasModel.getById(pizza_principal.id);
            if (!pizzaBase) {
                throw new errorHandler_1.BusinessError(`Pizza con ID ${pizza_principal.id} no encontrada`);
            }
            const es_mitad_y_mitad = !!pizza_mitad2;
            let calculo;
            if (es_mitad_y_mitad) {
                // Validar pizza mitad 2
                const pizzaMitad2 = await pizzasModel_1.pizzasModel.getById(pizza_mitad2.id);
                if (!pizzaMitad2) {
                    throw new errorHandler_1.BusinessError(`Pizza mitad 2 con ID ${pizza_mitad2.id} no encontrada`);
                }
                calculo = await this.calcularPizzaMitadYMitad(pizzaBase, extras_principales, ingredientes_removidos, pizzaMitad2, extras_mitad2 || [], ingredientes_removidos_mitad2 || []);
            }
            else {
                calculo = await this.calcularPizzaEntera(pizzaBase, extras_principales, ingredientes_removidos);
            }
            // Multiplicar por cantidad
            if (cantidad > 1) {
                calculo.precio_base *= cantidad;
                calculo.precio_extras *= cantidad;
                calculo.precio_total *= cantidad;
                calculo.extras_aplicados.forEach(extra => {
                    extra.precio_total *= cantidad;
                });
            }
            return calculo;
        }
        catch (error) {
            logger_1.logger.error('Error al calcular precio de pizza:', error);
            throw error;
        }
    }
    /**
     * Calcular precio de pizza entera
     */
    async calcularPizzaEntera(pizza, extrasIds, ingredientesRemovidos) {
        // Obtener extras
        const extras = await extrasModel_1.extrasModel.getByIds(extrasIds);
        const extrasAplicados = extras.map(extra => ({
            extra,
            cantidad: 1,
            precio_unitario: extra.precio,
            precio_total: extra.precio,
            es_mitad: false
        }));
        // Calcular precios
        const precio_base = pizza.precio_base;
        const precio_extras = extrasAplicados.reduce((sum, extra) => sum + extra.precio_total, 0);
        const descuento_ingredientes = this.calcularDescuentoIngredientes(ingredientesRemovidos);
        const precio_total = precio_base + precio_extras - descuento_ingredientes;
        return {
            precio_base,
            precio_extras,
            descuento_ingredientes,
            precio_total: Math.max(precio_total, 0), // No permitir precios negativos
            extras_aplicados: extrasAplicados,
            ingredientes_removidos: ingredientesRemovidos,
            es_mitad_y_mitad: false
        };
    }
    /**
     * Calcular precio de pizza mitad y mitad
     * Lógica compleja: extras en ambas mitades cuestan precio completo,
     * extras en una mitad cuestan mitad de precio
     */
    async calcularPizzaMitadYMitad(pizza1, extras1, ingredientesRemovidos1, pizza2, extras2, ingredientesRemovidos2) {
        // Precio base: promedio de ambas pizzas
        const precio_base = (pizza1.precio_base + pizza2.precio_base) / 2;
        // Obtener extras de ambas mitades
        const extrasData1 = await extrasModel_1.extrasModel.getByIds(extras1);
        const extrasData2 = await extrasModel_1.extrasModel.getByIds(extras2);
        // Identificar extras que están en ambas mitades
        const extrasEnAmbas = extrasData1.filter(extra1 => extrasData2.some(extra2 => extra2.id === extra1.id));
        // Extras solo en mitad 1
        const extrasSoloMitad1 = extrasData1.filter(extra1 => !extrasData2.some(extra2 => extra2.id === extra1.id));
        // Extras solo en mitad 2
        const extrasSoloMitad2 = extrasData2.filter(extra2 => !extrasData1.some(extra1 => extra1.id === extra2.id));
        // Calcular precios de extras
        const extrasAplicados = [];
        // Extras en ambas mitades: precio completo
        extrasEnAmbas.forEach(extra => {
            extrasAplicados.push({
                extra,
                cantidad: 1,
                precio_unitario: extra.precio,
                precio_total: extra.precio,
                es_mitad: false
            });
        });
        // Extras solo en mitad 1: mitad de precio
        extrasSoloMitad1.forEach(extra => {
            extrasAplicados.push({
                extra,
                cantidad: 1,
                precio_unitario: extra.precio / 2,
                precio_total: extra.precio / 2,
                es_mitad: true
            });
        });
        // Extras solo en mitad 2: mitad de precio
        extrasSoloMitad2.forEach(extra => {
            extrasAplicados.push({
                extra,
                cantidad: 1,
                precio_unitario: extra.precio / 2,
                precio_total: extra.precio / 2,
                es_mitad: true
            });
        });
        const precio_extras = extrasAplicados.reduce((sum, extra) => sum + extra.precio_total, 0);
        // Descuentos por ingredientes removidos
        const descuento1 = this.calcularDescuentoIngredientes(ingredientesRemovidos1) / 2;
        const descuento2 = this.calcularDescuentoIngredientes(ingredientesRemovidos2) / 2;
        const descuento_ingredientes = descuento1 + descuento2;
        const precio_total = Math.max(precio_base + precio_extras - descuento_ingredientes, 0);
        // Detalles de cada mitad
        const detalle_mitad1 = {
            pizza: pizza1,
            extras: extrasAplicados.filter(ea => extras1.includes(ea.extra.id)),
            ingredientes_removidos: ingredientesRemovidos1,
            precio_base_mitad: pizza1.precio_base / 2,
            precio_extras_mitad: extrasAplicados
                .filter(ea => extras1.includes(ea.extra.id))
                .reduce((sum, ea) => sum + ea.precio_total, 0)
        };
        const detalle_mitad2 = {
            pizza: pizza2,
            extras: extrasAplicados.filter(ea => extras2.includes(ea.extra.id)),
            ingredientes_removidos: ingredientesRemovidos2,
            precio_base_mitad: pizza2.precio_base / 2,
            precio_extras_mitad: extrasAplicados
                .filter(ea => extras2.includes(ea.extra.id))
                .reduce((sum, ea) => sum + ea.precio_total, 0)
        };
        return {
            precio_base,
            precio_extras,
            descuento_ingredientes,
            precio_total,
            extras_aplicados: extrasAplicados,
            ingredientes_removidos: [...ingredientesRemovidos1, ...ingredientesRemovidos2],
            es_mitad_y_mitad: true,
            detalle_mitad1,
            detalle_mitad2
        };
    }
    /**
     * Calcular descuento por ingredientes removidos
     * Por ahora, descuento básico por ingrediente
     */
    calcularDescuentoIngredientes(ingredientesRemovidos) {
        // Descuento básico: $10 por ingrediente removido (configurable)
        const DESCUENTO_POR_INGREDIENTE = 10;
        return ingredientesRemovidos.length * DESCUENTO_POR_INGREDIENTE;
    }
    /**
     * Calcular resumen completo de un pedido
     */
    async calcularResumenPedido(items, descuentoMonto = 0) {
        try {
            const detalles_items = [];
            let subtotal = 0;
            // Calcular cada item
            for (const item of items) {
                const detalleItem = await this.calcularPrecioPizza(item);
                detalles_items.push(detalleItem);
                subtotal += detalleItem.precio_total;
            }
            // Aplicar descuento
            const descuento = Math.min(descuentoMonto, subtotal); // No puede ser mayor al subtotal
            const total = Math.max(subtotal - descuento, 0);
            return {
                subtotal,
                descuento,
                total,
                cantidad_items: items.length,
                detalles_items
            };
        }
        catch (error) {
            logger_1.logger.error('Error al calcular resumen de pedido:', error);
            throw error;
        }
    }
    /**
     * Validar que un conjunto de extras sea válido
     */
    async validarExtras(extrasIds) {
        if (extrasIds.length === 0)
            return [];
        const extras = await extrasModel_1.extrasModel.getByIds(extrasIds);
        if (extras.length !== extrasIds.length) {
            const extrasEncontrados = extras.map(e => e.id);
            const extrasNoEncontrados = extrasIds.filter(id => !extrasEncontrados.includes(id));
            throw new errorHandler_1.BusinessError(`Extras no encontrados: ${extrasNoEncontrados.join(', ')}`);
        }
        return extras;
    }
    /**
     * Generar número de pedido único
     */
    generateNumeroPedido() {
        const fecha = new Date();
        const year = fecha.getFullYear().toString().slice(-2);
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const day = fecha.getDate().toString().padStart(2, '0');
        const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
        return `${year}${month}${day}-${timestamp}`;
    }
}
exports.PreciosService = PreciosService;
exports.preciosService = new PreciosService();
//# sourceMappingURL=preciosService.js.map