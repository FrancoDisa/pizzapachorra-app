"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePedidoSchema = exports.validateClienteSchema = exports.validateExtraSchema = exports.validatePizzaSchema = exports.actualizarEstadoSchema = exports.crearPedidoSchema = exports.pedidoItemSchema = exports.pedidoSchema = exports.clienteSchema = exports.extraSchema = exports.pizzaSchema = void 0;
const Joi = __importStar(require("joi"));
exports.pizzaSchema = Joi.object({
    id: Joi.number().integer().positive(),
    nombre: Joi.string().max(100).required(),
    precio_base: Joi.number().positive().precision(2).required(),
    ingredientes: Joi.array().items(Joi.string().max(50)).required(),
    descripcion: Joi.string().max(500).allow('', null),
    activa: Joi.boolean().default(true),
    orden_menu: Joi.number().integer().min(0).default(0),
    created_at: Joi.date(),
    updated_at: Joi.date()
});
exports.extraSchema = Joi.object({
    id: Joi.number().integer().positive(),
    nombre: Joi.string().max(50).required(),
    precio: Joi.number().positive().precision(2).required(),
    categoria: Joi.string().valid(...Object.values(['condimentos', 'vegetales', 'proteinas', 'carnes', 'quesos', 'especiales', 'general'])).default('general'),
    activo: Joi.boolean().default(true),
    orden_categoria: Joi.number().integer().min(0).default(0),
    created_at: Joi.date()
});
exports.clienteSchema = Joi.object({
    id: Joi.number().integer().positive(),
    telefono: Joi.string().pattern(/^\+?[0-9\s\-()]{10,20}$/).required(),
    nombre: Joi.string().max(100).allow('', null),
    direccion: Joi.string().max(500).allow('', null),
    referencias: Joi.string().max(500).allow('', null),
    notas: Joi.string().max(1000).allow('', null),
    total_pedidos: Joi.number().integer().min(0).default(0),
    total_gastado: Joi.number().min(0).precision(2).default(0),
    ultimo_pedido: Joi.date().allow(null),
    created_at: Joi.date(),
    updated_at: Joi.date()
});
exports.pedidoSchema = Joi.object({
    id: Joi.number().integer().positive(),
    numero_pedido: Joi.string().max(20).required(),
    cliente_id: Joi.number().integer().positive().allow(null),
    estado: Joi.string().valid(...['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado']).required(),
    subtotal: Joi.number().min(0).precision(2).required(),
    descuento: Joi.number().min(0).precision(2).default(0),
    total: Joi.number().min(0).precision(2).required(),
    metodo_pago: Joi.string().valid(...['efectivo', 'tarjeta', 'transferencia']).default('efectivo'),
    notas: Joi.string().max(1000).allow('', null),
    tiempo_estimado: Joi.number().integer().min(0).allow(null),
    fecha_pedido: Joi.date().required(),
    fecha_preparacion: Joi.date().allow(null),
    fecha_listo: Joi.date().allow(null),
    fecha_entrega: Joi.date().allow(null),
    fecha_cancelacion: Joi.date().allow(null),
    created_at: Joi.date(),
    updated_at: Joi.date()
});
exports.pedidoItemSchema = Joi.object({
    id: Joi.number().integer().positive(),
    pedido_id: Joi.number().integer().positive().required(),
    pizza_id: Joi.number().integer().positive().required(),
    cantidad: Joi.number().integer().min(1).required(),
    es_mitad_y_mitad: Joi.boolean().default(false),
    extras_principales: Joi.array().items(Joi.number().integer().positive()).default([]),
    ingredientes_removidos: Joi.array().items(Joi.string().max(50)).default([]),
    pizza_id_mitad2: Joi.number().integer().positive().allow(null),
    extras_mitad2: Joi.array().items(Joi.number().integer().positive()).default([]),
    ingredientes_removidos_mitad2: Joi.array().items(Joi.string().max(50)).default([]),
    precio_base: Joi.number().positive().precision(2).required(),
    precio_extras: Joi.number().min(0).precision(2).default(0),
    precio_total: Joi.number().positive().precision(2).required(),
    notas: Joi.string().max(500).allow('', null),
    created_at: Joi.date()
});
exports.crearPedidoSchema = Joi.object({
    cliente_id: Joi.number().integer().positive().allow(null),
    cliente_data: Joi.when('cliente_id', {
        is: Joi.exist(),
        then: Joi.forbidden(),
        otherwise: Joi.object({
            telefono: Joi.string().pattern(/^\+?[0-9\s\-()]{10,20}$/).required(),
            nombre: Joi.string().max(100).allow('', null),
            direccion: Joi.string().max(500).allow('', null),
            referencias: Joi.string().max(500).allow('', null)
        }).required()
    }),
    items: Joi.array().items(Joi.object({
        pizza_id: Joi.number().integer().positive().required(),
        cantidad: Joi.number().integer().min(1).required(),
        es_mitad_y_mitad: Joi.boolean().default(false),
        extras_principales: Joi.array().items(Joi.number().integer().positive()).default([]),
        ingredientes_removidos: Joi.array().items(Joi.string().max(50)).default([]),
        pizza_id_mitad2: Joi.when('es_mitad_y_mitad', {
            is: true,
            then: Joi.number().integer().positive().required(),
            otherwise: Joi.forbidden()
        }),
        extras_mitad2: Joi.when('es_mitad_y_mitad', {
            is: true,
            then: Joi.array().items(Joi.number().integer().positive()).default([]),
            otherwise: Joi.forbidden()
        }),
        ingredientes_removidos_mitad2: Joi.when('es_mitad_y_mitad', {
            is: true,
            then: Joi.array().items(Joi.string().max(50)).default([]),
            otherwise: Joi.forbidden()
        }),
        notas: Joi.string().max(500).allow('', null)
    })).min(1).required(),
    descuento: Joi.number().min(0).precision(2).default(0),
    metodo_pago: Joi.string().valid(...['efectivo', 'tarjeta', 'transferencia']).default('efectivo'),
    notas: Joi.string().max(1000).allow('', null),
    tiempo_estimado: Joi.number().integer().min(0).allow(null)
});
exports.actualizarEstadoSchema = Joi.object({
    estado: Joi.string().valid(...['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado']).required(),
    motivo: Joi.string().max(500).allow('', null),
    usuario: Joi.string().max(50).default('sistema')
});
// Schemas para validación en controladores
exports.validatePizzaSchema = exports.pizzaSchema.keys({
    id: Joi.forbidden(),
    created_at: Joi.forbidden(),
    updated_at: Joi.forbidden()
});
exports.validateExtraSchema = exports.extraSchema.keys({
    id: Joi.forbidden(),
    created_at: Joi.forbidden()
});
exports.validateClienteSchema = exports.clienteSchema.keys({
    id: Joi.forbidden(),
    total_pedidos: Joi.forbidden(),
    total_gastado: Joi.forbidden(),
    ultimo_pedido: Joi.forbidden(),
    created_at: Joi.forbidden(),
    updated_at: Joi.forbidden()
});
exports.validatePedidoSchema = exports.crearPedidoSchema;
//# sourceMappingURL=validacion.js.map