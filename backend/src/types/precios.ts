import { Pizza, Extra } from './index';

export interface CalculoPrecio {
  precio_base: number;
  precio_extras: number;
  descuento_ingredientes: number;
  precio_total: number;
}

export interface DetalleCalculoPrecio extends CalculoPrecio {
  extras_aplicados: ExtraAplicado[];
  ingredientes_removidos: string[];
  es_mitad_y_mitad: boolean;
  detalle_mitad1?: CalculoMitad;
  detalle_mitad2?: CalculoMitad;
}

export interface CalculoMitad {
  pizza: Pizza;
  extras: ExtraAplicado[];
  ingredientes_removidos: string[];
  precio_base_mitad: number;
  precio_extras_mitad: number;
}

export interface ExtraAplicado {
  extra: Extra;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  es_mitad?: boolean;
}

export interface ParametrosCalculoPizza {
  pizza_principal: Pizza;
  extras_principales: number[];
  ingredientes_removidos: string[];
  pizza_mitad2?: Pizza | undefined;
  extras_mitad2?: number[];
  ingredientes_removidos_mitad2?: string[];
  cantidad: number;
}

export interface ResumenPedido {
  subtotal: number;
  descuento: number;
  total: number;
  cantidad_items: number;
  detalles_items: DetalleCalculoPrecio[];
}

export interface ConfiguracionPrecios {
  descuento_maximo: number;
  precio_minimo_pedido: number;
  recargo_delivery?: number;
  descuento_cliente_frecuente?: number;
}

export type TipoDescuento = 'porcentaje' | 'monto_fijo' | 'cliente_frecuente';

export interface AplicacionDescuento {
  tipo: TipoDescuento;
  valor: number;
  descripcion: string;
  monto_descuento: number;
}