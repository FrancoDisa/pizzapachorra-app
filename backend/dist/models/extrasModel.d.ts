/**
 * Modelo para operaciones CRUD de extras
 * Gestiona la interacción con la tabla extras
 */
import { Extra, CategoriaExtra } from '@/types';
export declare class ExtrasModel {
    private pool;
    constructor();
    /**
     * Obtener todos los extras
     */
    getAll(includeInactive?: boolean): Promise<Extra[]>;
    /**
     * Obtener extra por ID
     */
    getById(id: number): Promise<Extra | null>;
    /**
     * Crear nuevo extra
     */
    create(extraData: Omit<Extra, 'id' | 'created_at'>): Promise<Extra>;
    /**
     * Actualizar extra existente
     */
    update(id: number, extraData: Partial<Omit<Extra, 'id' | 'created_at'>>): Promise<Extra | null>;
    /**
     * Eliminar extra (soft delete)
     */
    delete(id: number): Promise<boolean>;
    /**
     * Obtener extras por categoría
     */
    getByCategory(categoria: CategoriaExtra, includeInactive?: boolean): Promise<Extra[]>;
    /**
     * Obtener menú activo agrupado por categorías
     */
    getActiveMenu(): Promise<Record<CategoriaExtra, Extra[]>>;
    /**
     * Verificar si existe un extra por nombre en la misma categoría
     */
    existsByNameAndCategory(nombre: string, categoria: CategoriaExtra, excludeId?: number): Promise<boolean>;
    /**
     * Obtener extras por IDs (útil para pedidos)
     */
    getByIds(ids: number[]): Promise<Extra[]>;
}
export declare const extrasModel: ExtrasModel;
//# sourceMappingURL=extrasModel.d.ts.map