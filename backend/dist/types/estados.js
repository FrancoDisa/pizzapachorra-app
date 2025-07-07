export const ESTADOS_PEDIDO = {
    nuevo: 'Nuevo',
    en_preparacion: 'En Preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
};
export const TRANSICIONES_VALIDAS = {
    nuevo: ['en_preparacion', 'cancelado'],
    en_preparacion: ['listo', 'cancelado'],
    listo: ['entregado', 'cancelado'],
    entregado: [],
    cancelado: []
};
export function esTransicionValida(estadoActual, nuevoEstado) {
    return TRANSICIONES_VALIDAS[estadoActual].includes(nuevoEstado);
}
export function obtenerSiguientesEstados(estadoActual) {
    return TRANSICIONES_VALIDAS[estadoActual];
}
//# sourceMappingURL=estados.js.map