import {
  pizzaSchema,
  extraSchema,
  clienteSchema,
  crearPedidoSchema,
  actualizarEstadoSchema
} from '../validacion';

describe('Validación de Esquemas Joi', () => {
  describe('pizzaSchema', () => {
    it('debe validar una pizza válida', () => {
      const pizzaValida = {
        id: 1,
        nombre: 'Pachorra Extrem',
        precio_base: 390.00,
        ingredientes: ['muzzarella', 'bacon', 'huevo frito'],
        descripcion: 'La más completa',
        activa: true,
        orden_menu: 1
      };

      const { error, value } = pizzaSchema.validate(pizzaValida);
      expect(error).toBeUndefined();
      expect(value.nombre).toBe('Pachorra Extrem');
    });

    it('debe rechazar pizza con precio negativo', () => {
      const pizzaInvalida = {
        nombre: 'Pizza Test',
        precio_base: -100,
        ingredientes: ['muzzarella']
      };

      const { error } = pizzaSchema.validate(pizzaInvalida);
      expect(error).toBeDefined();
      expect(error?.message).toContain('precio_base');
    });
  });

  describe('extraSchema', () => {
    it('debe validar un extra válido', () => {
      const extraValido = {
        id: 1,
        nombre: 'Aceitunas',
        precio: 40.00,
        categoria: 'vegetales',
        activo: true
      };

      const { error, value } = extraSchema.validate(extraValido);
      expect(error).toBeUndefined();
      expect(value.categoria).toBe('vegetales');
    });

    it('debe rechazar categoría inválida', () => {
      const extraInvalido = {
        nombre: 'Test',
        precio: 40.00,
        categoria: 'categoria_inexistente'
      };

      const { error } = extraSchema.validate(extraInvalido);
      expect(error).toBeDefined();
    });
  });

  describe('clienteSchema', () => {
    it('debe validar un cliente válido', () => {
      const clienteValido = {
        id: 1,
        telefono: '+549111234567',
        nombre: 'Juan Pérez',
        direccion: 'Sarandí 123',
        total_pedidos: 5,
        total_gastado: 1950.00
      };

      const { error, value } = clienteSchema.validate(clienteValido);
      expect(error).toBeUndefined();
      expect(value.telefono).toBe('+549111234567');
    });

    it('debe rechazar teléfono inválido', () => {
      const clienteInvalido = {
        telefono: '123',
        nombre: 'Test'
      };

      const { error } = clienteSchema.validate(clienteInvalido);
      expect(error).toBeDefined();
      expect(error?.message).toContain('telefono');
    });
  });

  describe('crearPedidoSchema', () => {
    it('debe validar pedido con cliente nuevo', () => {
      const pedidoValido = {
        cliente_data: {
          telefono: '+549111234567',
          nombre: 'Cliente Nuevo'
        },
        items: [{
          pizza_id: 1,
          cantidad: 1,
          es_mitad_y_mitad: false,
          extras_principales: [1, 2]
        }],
        metodo_pago: 'efectivo'
      };

      const { error, value } = crearPedidoSchema.validate(pedidoValido);
      expect(error).toBeUndefined();
      expect(value.cliente_data.telefono).toBe('+549111234567');
    });

    it('debe validar pedido con cliente existente', () => {
      const pedidoValido = {
        cliente_id: 1,
        items: [{
          pizza_id: 1,
          cantidad: 2
        }]
      };

      const { error, value } = crearPedidoSchema.validate(pedidoValido);
      expect(error).toBeUndefined();
      expect(value.cliente_id).toBe(1);
    });

    it('debe validar pedido mitad y mitad', () => {
      const pedidoMitadYMitad = {
        cliente_id: 1,
        items: [{
          pizza_id: 1,
          cantidad: 1,
          es_mitad_y_mitad: true,
          pizza_id_mitad2: 2,
          extras_principales: [1],
          extras_mitad2: [2, 3]
        }]
      };

      const { error, value } = crearPedidoSchema.validate(pedidoMitadYMitad);
      expect(error).toBeUndefined();
      expect(value.items[0].es_mitad_y_mitad).toBe(true);
      expect(value.items[0].pizza_id_mitad2).toBe(2);
    });

    it('debe rechazar pedido sin items', () => {
      const pedidoInvalido = {
        cliente_id: 1,
        items: []
      };

      const { error } = crearPedidoSchema.validate(pedidoInvalido);
      expect(error).toBeDefined();
      expect(error?.message).toContain('items');
    });
  });

  describe('actualizarEstadoSchema', () => {
    it('debe validar cambio de estado válido', () => {
      const cambioEstado = {
        estado: 'en_preparacion',
        motivo: 'Iniciando cocina',
        usuario: 'cocinero1'
      };

      const { error, value } = actualizarEstadoSchema.validate(cambioEstado);
      expect(error).toBeUndefined();
      expect(value.estado).toBe('en_preparacion');
    });

    it('debe rechazar estado inválido', () => {
      const cambioInvalido = {
        estado: 'estado_inexistente'
      };

      const { error } = actualizarEstadoSchema.validate(cambioInvalido);
      expect(error).toBeDefined();
    });
  });
});