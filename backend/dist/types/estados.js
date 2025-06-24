"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSICIONES_VALIDAS = exports.ESTADOS_PEDIDO = void 0;
exports.esTransicionValida = esTransicionValida;
exports.obtenerSiguientesEstados = obtenerSiguientesEstados;
exports.ESTADOS_PEDIDO = {
    nuevo: 'Nuevo',
    en_preparacion: 'En Preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
};
exports.TRANSICIONES_VALIDAS = {
    nuevo: ['en_preparacion', 'cancelado'],
    en_preparacion: ['listo', 'cancelado'],
    listo: ['entregado', 'cancelado'],
    entregado: [],
    cancelado: []
};
function esTransicionValida(estadoActual, nuevoEstado) {
    return exports.TRANSICIONES_VALIDAS[estadoActual].includes(nuevoEstado);
}
function obtenerSiguientesEstados(estadoActual) {
    return exports.TRANSICIONES_VALIDAS[estadoActual];
}
//# sourceMappingURL=estados.js.map