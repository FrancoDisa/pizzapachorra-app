import { useState } from 'react';
import Section from '@/components/ui/Section';
import type { Pedido, PedidoItem } from '@/types';

export default function TicketSection() {
  const [pedidoActual] = useState<Pedido | null>(null); // TODO: Implementar lógica de pedido actual
  const [items] = useState<PedidoItem[]>([]); // TODO: Implementar items del pedido actual
  const [total] = useState({ subtotal: 0, descuento: 0, total: 0 }); // TODO: Calcular totales

  const headerAction = (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </span>
      {items.length > 0 && (
        <button className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
          Limpiar
        </button>
      )}
    </div>
  );

  return (
    <Section title="Ticket de Pedido" headerAction={headerAction}>
      <div className="space-y-4">
        
        {/* Estado del pedido */}
        {pedidoActual && (
          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Pedido #{pedidoActual.id}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                pedidoActual.estado === 'nuevo' 
                  ? 'bg-blue-600 text-white'
                  : pedidoActual.estado === 'en_preparacion'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-green-600 text-white'
              }`}>
                {pedidoActual.estado.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Creado: {new Date(pedidoActual.created_at).toLocaleString()}
            </p>
          </div>
        )}

        {/* Lista de items */}
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-lg font-medium">Ticket vacío</p>
              <p className="text-sm">Agrega pizzas y extras desde el menú</p>
            </div>
          ) : (
            items.map((item: PedidoItem, index: number) => (
              <div
                key={`${item.id}-${index}`}
                className="bg-gray-700 rounded-lg p-3 border border-gray-600"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Pizza #{item.pizza_id}</h4>
                    
                    {/* Detalles del item */}
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-gray-400">
                        Cantidad: {item.cantidad}
                      </p>
                      
                      {item.es_mitad_y_mitad && (
                        <div className="text-xs text-gray-400">
                          <span>Mitad y mitad</span>
                        </div>
                      )}

                      {item.extras_agregados.length > 0 && (
                        <div className="text-xs text-gray-400">
                          <span>Extras agregados: {item.extras_agregados.length}</span>
                        </div>
                      )}

                      {item.notas && (
                        <p className="text-xs text-yellow-400">
                          Nota: {item.notas}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Precio y controles */}
                  <div className="ml-3 text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <button className="w-6 h-6 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors">
                        -
                      </button>
                      <span className="text-sm text-white min-w-[2rem] text-center">
                        {item.cantidad}
                      </span>
                      <button className="w-6 h-6 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors">
                        +
                      </button>
                    </div>
                    <p className="text-sm font-medium text-green-400">
                      ${(item.precio_unitario * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total y acciones */}
        {items.length > 0 && (
          <div className="border-t border-gray-600 pt-4">
            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>${total.subtotal.toFixed(2)}</span>
              </div>

              {/* Descuentos si los hay */}
              {total.descuento > 0 && (
                <div className="flex justify-between text-yellow-400">
                  <span>Descuento:</span>
                  <span>-${total.descuento.toFixed(2)}</span>
                </div>
              )}

              {/* Total final */}
              <div className="flex justify-between text-lg font-bold text-white border-t border-gray-600 pt-2">
                <span>Total:</span>
                <span>${total.total.toFixed(2)}</span>
              </div>

              {/* Botones de acción */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
                  Guardar
                </button>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-medium">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Section>
  );
}