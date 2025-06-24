import * as Joi from 'joi';
import { EstadoPedido, MetodoPago, CategoriaExtra } from './index';

export const pizzaSchema = Joi.object({
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

export const extraSchema = Joi.object({
  id: Joi.number().integer().positive(),
  nombre: Joi.string().max(50).required(),
  precio: Joi.number().positive().precision(2).required(),
  categoria: Joi.string().valid(...Object.values(['condimentos', 'vegetales', 'proteinas', 'carnes', 'quesos', 'especiales', 'general'] as CategoriaExtra[])).default('general'),
  activo: Joi.boolean().default(true),
  orden_categoria: Joi.number().integer().min(0).default(0),
  created_at: Joi.date()
});

export const clienteSchema = Joi.object({
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

export const pedidoSchema = Joi.object({
  id: Joi.number().integer().positive(),
  numero_pedido: Joi.string().max(20).required(),
  cliente_id: Joi.number().integer().positive().allow(null),
  estado: Joi.string().valid(...(['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado'] as EstadoPedido[])).required(),
  subtotal: Joi.number().min(0).precision(2).required(),
  descuento: Joi.number().min(0).precision(2).default(0),
  total: Joi.number().min(0).precision(2).required(),
  metodo_pago: Joi.string().valid(...(['efectivo', 'tarjeta', 'transferencia'] as MetodoPago[])).default('efectivo'),
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

export const pedidoItemSchema = Joi.object({
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

export const crearPedidoSchema = Joi.object({
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
  items: Joi.array().items(
    Joi.object({
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
    })
  ).min(1).required(),
  descuento: Joi.number().min(0).precision(2).default(0),
  metodo_pago: Joi.string().valid(...(['efectivo', 'tarjeta', 'transferencia'] as MetodoPago[])).default('efectivo'),
  notas: Joi.string().max(1000).allow('', null),
  tiempo_estimado: Joi.number().integer().min(0).allow(null)
});

export const actualizarEstadoSchema = Joi.object({
  estado: Joi.string().valid(...(['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado'] as EstadoPedido[])).required(),
  motivo: Joi.string().max(500).allow('', null),
  usuario: Joi.string().max(50).default('sistema')
});

// Schemas para validación en controladores
export const validatePizzaSchema = pizzaSchema.keys({
  id: Joi.forbidden(),
  created_at: Joi.forbidden(),
  updated_at: Joi.forbidden()
});

export const validateExtraSchema = extraSchema.keys({
  id: Joi.forbidden(),
  created_at: Joi.forbidden()
});

export const validateClienteSchema = clienteSchema.keys({
  id: Joi.forbidden(),
  total_pedidos: Joi.forbidden(),
  total_gastado: Joi.forbidden(),
  ultimo_pedido: Joi.forbidden(),
  created_at: Joi.forbidden(),
  updated_at: Joi.forbidden()
});

export const validatePedidoSchema = crearPedidoSchema;