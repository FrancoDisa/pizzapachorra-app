/**
 * Modelo para operaciones CRUD de pizzas
 * Gestiona la interacción con la tabla pizzas
 */
import { Pizza } from '@/types';
export declare class PizzasModel {
    private pool;
    constructor();
    /**
     * Obtener todas las pizzas
     */
    getAll(includeInactive?: boolean): Promise<Pizza[]>;
    /**
     * Obtener pizza por ID
     */
    getById(id: number): Promise<Pizza | null>;
    /**
     * Crear nueva pizza
     */
    create(pizzaData: Omit<Pizza, 'id' | 'created_at' | 'updated_at'>): Promise<Pizza>;
    /**
     * Actualizar pizza existente
     */
    update(id: number, pizzaData: Partial<Omit<Pizza, 'id' | 'created_at' | 'updated_at'>>): Promise<Pizza | null>;
    /**
     * Eliminar pizza (soft delete)
     */
    delete(id: number): Promise<boolean>;
    /**
     * Obtener menú activo ordenado
     */
    getActiveMenu(): Promise<Pizza[]>;
    /**
     * Verificar si existe una pizza por nombre
     */
    existsByName(nombre: string, excludeId?: number): Promise<boolean>;
}
export declare const pizzasModel: PizzasModel;
//# sourceMappingURL=pizzasModel.d.ts.map