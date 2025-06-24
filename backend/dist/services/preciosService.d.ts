/**
 * Servicio para cálculo de precios de pizzas
 * Implementa la lógica compleja de precios para pizzas enteras y mitad-y-mitad
 */
import { Extra } from '@/types';
import { DetalleCalculoPrecio, ParametrosCalculoPizza, ResumenPedido } from '@/types/precios';
export declare class PreciosService {
    /**
     * Calcular precio de una pizza completa
     */
    calcularPrecioPizza(parametros: ParametrosCalculoPizza): Promise<DetalleCalculoPrecio>;
    /**
     * Calcular precio de pizza entera
     */
    private calcularPizzaEntera;
    /**
     * Calcular precio de pizza mitad y mitad
     * Lógica compleja: extras en ambas mitades cuestan precio completo,
     * extras en una mitad cuestan mitad de precio
     */
    private calcularPizzaMitadYMitad;
    /**
     * Calcular descuento por ingredientes removidos
     * Por ahora, descuento básico por ingrediente
     */
    private calcularDescuentoIngredientes;
    /**
     * Calcular resumen completo de un pedido
     */
    calcularResumenPedido(items: ParametrosCalculoPizza[], descuentoMonto?: number): Promise<ResumenPedido>;
    /**
     * Validar que un conjunto de extras sea válido
     */
    validarExtras(extrasIds: number[]): Promise<Extra[]>;
    /**
     * Generar número de pedido único
     */
    generateNumeroPedido(): string;
}
export declare const preciosService: PreciosService;
//# sourceMappingURL=preciosService.d.ts.map