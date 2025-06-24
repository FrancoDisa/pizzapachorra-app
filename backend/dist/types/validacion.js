"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarEstadoSchema = exports.crearPedidoSchema = exports.pedidoItemSchema = exports.pedidoSchema = exports.clienteSchema = exports.extraSchema = exports.pizzaSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.pizzaSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive(),
    nombre: joi_1.default.string().max(100).required(),
    precio_base: joi_1.default.number().positive().precision(2).required(),
    ingredientes: joi_1.default.array().items(joi_1.default.string().max(50)).required(),
    descripcion: joi_1.default.string().max(500).allow('', null),
    activa: joi_1.default.boolean().default(true),
    orden_menu: joi_1.default.number().integer().min(0).default(0),
    created_at: joi_1.default.date(),
    updated_at: joi_1.default.date()
});
exports.extraSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive(),
    nombre: joi_1.default.string().max(50).required(),
    precio: joi_1.default.number().positive().precision(2).required(),
    categoria: joi_1.default.string().valid(...Object.values(['condimentos', 'vegetales', 'proteinas', 'carnes', 'quesos', 'especiales', 'general'])).default('general'),
    activo: joi_1.default.boolean().default(true),
    orden_categoria: joi_1.default.number().integer().min(0).default(0),
    created_at: joi_1.default.date()
});
exports.clienteSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive(),
    telefono: joi_1.default.string().pattern(/^\+?[0-9\s\-\(\)]{10,20}$/).required(),
    nombre: joi_1.default.string().max(100).allow('', null),
    direccion: joi_1.default.string().max(500).allow('', null),
    referencias: joi_1.default.string().max(500).allow('', null),
    notas: joi_1.default.string().max(1000).allow('', null),
    total_pedidos: joi_1.default.number().integer().min(0).default(0),
    total_gastado: joi_1.default.number().min(0).precision(2).default(0),
    ultimo_pedido: joi_1.default.date().allow(null),
    created_at: joi_1.default.date(),
    updated_at: joi_1.default.date()
});
exports.pedidoSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive(),
    numero_pedido: joi_1.default.string().max(20).required(),
    cliente_id: joi_1.default.number().integer().positive().allow(null),
    estado: joi_1.default.string().valid(...['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado']).required(),
    subtotal: joi_1.default.number().min(0).precision(2).required(),
    descuento: joi_1.default.number().min(0).precision(2).default(0),
    total: joi_1.default.number().min(0).precision(2).required(),
    metodo_pago: joi_1.default.string().valid(...['efectivo', 'tarjeta', 'transferencia']).default('efectivo'),
    notas: joi_1.default.string().max(1000).allow('', null),
    tiempo_estimado: joi_1.default.number().integer().min(0).allow(null),
    fecha_pedido: joi_1.default.date().required(),
    fecha_preparacion: joi_1.default.date().allow(null),
    fecha_listo: joi_1.default.date().allow(null),
    fecha_entrega: joi_1.default.date().allow(null),
    fecha_cancelacion: joi_1.default.date().allow(null),
    created_at: joi_1.default.date(),
    updated_at: joi_1.default.date()
});
exports.pedidoItemSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive(),
    pedido_id: joi_1.default.number().integer().positive().required(),
    pizza_id: joi_1.default.number().integer().positive().required(),
    cantidad: joi_1.default.number().integer().min(1).required(),
    es_mitad_y_mitad: joi_1.default.boolean().default(false),
    extras_principales: joi_1.default.array().items(joi_1.default.number().integer().positive()).default([]),
    ingredientes_removidos: joi_1.default.array().items(joi_1.default.string().max(50)).default([]),
    pizza_id_mitad2: joi_1.default.number().integer().positive().allow(null),
    extras_mitad2: joi_1.default.array().items(joi_1.default.number().integer().positive()).default([]),
    ingredientes_removidos_mitad2: joi_1.default.array().items(joi_1.default.string().max(50)).default([]),
    precio_base: joi_1.default.number().positive().precision(2).required(),
    precio_extras: joi_1.default.number().min(0).precision(2).default(0),
    precio_total: joi_1.default.number().positive().precision(2).required(),
    notas: joi_1.default.string().max(500).allow('', null),
    created_at: joi_1.default.date()
});
exports.crearPedidoSchema = joi_1.default.object({
    cliente_id: joi_1.default.number().integer().positive().allow(null),
    cliente_data: joi_1.default.when('cliente_id', {
        is: null,
        then: joi_1.default.object({
            telefono: joi_1.default.string().pattern(/^\+?[0-9\s\-\(\)]{10,20}$/).required(),
            nombre: joi_1.default.string().max(100).allow('', null),
            direccion: joi_1.default.string().max(500).allow('', null),
            referencias: joi_1.default.string().max(500).allow('', null)
        }).required(),
        otherwise: joi_1.default.forbidden()
    }),
    items: joi_1.default.array().items(joi_1.default.object({
        pizza_id: joi_1.default.number().integer().positive().required(),
        cantidad: joi_1.default.number().integer().min(1).required(),
        es_mitad_y_mitad: joi_1.default.boolean().default(false),
        extras_principales: joi_1.default.array().items(joi_1.default.number().integer().positive()).default([]),
        ingredientes_removidos: joi_1.default.array().items(joi_1.default.string().max(50)).default([]),
        pizza_id_mitad2: joi_1.default.when('es_mitad_y_mitad', {
            is: true,
            then: joi_1.default.number().integer().positive().required(),
            otherwise: joi_1.default.forbidden()
        }),
        extras_mitad2: joi_1.default.when('es_mitad_y_mitad', {
            is: true,
            then: joi_1.default.array().items(joi_1.default.number().integer().positive()).default([]),
            otherwise: joi_1.default.forbidden()
        }),
        ingredientes_removidos_mitad2: joi_1.default.when('es_mitad_y_mitad', {
            is: true,
            then: joi_1.default.array().items(joi_1.default.string().max(50)).default([]),
            otherwise: joi_1.default.forbidden()
        }),
        notas: joi_1.default.string().max(500).allow('', null)
    })).min(1).required(),
    descuento: joi_1.default.number().min(0).precision(2).default(0),
    metodo_pago: joi_1.default.string().valid(...['efectivo', 'tarjeta', 'transferencia']).default('efectivo'),
    notas: joi_1.default.string().max(1000).allow('', null),
    tiempo_estimado: joi_1.default.number().integer().min(0).allow(null)
});
exports.actualizarEstadoSchema = joi_1.default.object({
    estado: joi_1.default.string().valid(...['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado']).required(),
    motivo: joi_1.default.string().max(500).allow('', null),
    usuario: joi_1.default.string().max(50).default('sistema')
});
//# sourceMappingURL=validacion.js.map