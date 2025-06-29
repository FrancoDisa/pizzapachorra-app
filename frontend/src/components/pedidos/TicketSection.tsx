import Section from '@/components/ui/Section';
import { useCurrentOrder, useCurrentOrderItems, useCurrentOrderItemCount, useAppStore } from '@/stores';

export default function TicketSection() {
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const itemCount = useCurrentOrderItemCount();
  const updateOrderItemQuantity = useAppStore((state) => state.updateOrderItemQuantity);
  const removeItemFromOrder = useAppStore((state) => state.removeItemFromOrder);
  const clearCurrentOrder = useAppStore((state) => state.clearCurrentOrder);

  const handleClearOrder = () => {
    clearCurrentOrder();
  };

  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    updateOrderItemQuantity(itemId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateOrderItemQuantity(itemId, currentQuantity - 1);
    } else {
      removeItemFromOrder(itemId);
    }
  };

  const handleQuantityInput = (itemId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 1;
    if (quantity > 0) {
      updateOrderItemQuantity(itemId, quantity);
    }
  };

  const handleBulkIncrease = (itemId: string, currentQuantity: number, amount: number) => {
    updateOrderItemQuantity(itemId, currentQuantity + amount);
  };

  const headerAction = (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </span>
      {items.length > 0 && (
        <button 
          onClick={handleClearOrder}
          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
        >
          Limpiar
        </button>
      )}
    </div>
  );

  return (
    <Section title="Ticket de Pedido" headerAction={headerAction}>
      <div className="space-y-4">
        
        {/* Estado del pedido */}
        {currentOrder.cliente && (
          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Cliente: {currentOrder.cliente.nombre || 'Sin nombre'}</span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white">
                NUEVO
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Teléfono: {currentOrder.cliente.telefono}
            </p>
            {currentOrder.cliente.direccion && (
              <p className="text-xs text-gray-400">
                Dirección: {currentOrder.cliente.direccion}
              </p>
            )}
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
            items.map((item, index) => (
              <div
                key={item.id}
                className="bg-gray-700 rounded-lg p-3 border border-gray-600"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{item.pizza?.nombre || `Pizza #${item.pizza_id}`}</h4>
                    
                    {/* Detalles del item */}
                    <div className="mt-1 space-y-1">
                      {item.pizza?.descripcion && (
                        <p className="text-xs text-gray-400">
                          {item.pizza.descripcion}
                        </p>
                      )}
                      
                      {item.es_mitad_y_mitad && (
                        <div className="text-xs text-gray-400">
                          <span>Mitad y mitad</span>
                        </div>
                      )}

                      {item.extras_agregados_data && item.extras_agregados_data.length > 0 && (
                        <div className="text-xs text-gray-400">
                          <span>Extras: {item.extras_agregados_data.map(extra => extra.nombre).join(', ')}</span>
                        </div>
                      )}

                      {item.notas && (
                        <p className="text-xs text-yellow-400">
                          Nota: {item.notas}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Precio y controles optimizados */}
                  <div className="ml-3 text-right">
                    {/* Controles de cantidad grandes */}
                    <div className="flex items-center gap-2 mb-2">
                      <button 
                        onClick={() => handleDecreaseQuantity(item.id, item.cantidad)}
                        className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded transition-colors flex items-center justify-center"
                        title="Disminuir cantidad"
                      >
                        −
                      </button>
                      
                      {/* Input directo de cantidad */}
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={item.cantidad}
                        onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                        className="w-16 h-12 bg-gray-700 border border-gray-600 rounded text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      
                      <button 
                        onClick={() => handleIncreaseQuantity(item.id, item.cantidad)}
                        className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded transition-colors flex items-center justify-center"
                        title="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Shortcuts de cantidad */}
                    <div className="flex gap-1 mb-2">
                      <button 
                        onClick={() => handleBulkIncrease(item.id, item.cantidad, 5)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        title="Agregar 5"
                      >
                        +5
                      </button>
                      <button 
                        onClick={() => handleBulkIncrease(item.id, item.cantidad, 10)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        title="Agregar 10"
                      >
                        +10
                      </button>
                    </div>
                    
                    <p className="text-lg font-bold text-green-400">
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
                <span>${currentOrder.subtotal.toFixed(2)}</span>
              </div>

              {/* Total final */}
              <div className="flex justify-between text-lg font-bold text-white border-t border-gray-600 pt-2">
                <span>Total:</span>
                <span>${currentOrder.total.toFixed(2)}</span>
              </div>

              {/* Botones de acción grandes */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  className="px-6 py-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors font-medium text-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
                  disabled={!currentOrder.cliente_id}
                  onClick={() => console.log('Guardando pedido...', currentOrder)}
                >
                  💾 Guardar
                </button>
                <button 
                  className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-bold text-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
                  disabled={!currentOrder.cliente_id}
                  onClick={() => console.log('Confirmando pedido...', currentOrder)}
                >
                  ✓ Confirmar
                </button>
              </div>
              
              {/* Mensaje de validación */}
              {!currentOrder.cliente_id && (
                <div className="text-center py-2 bg-yellow-900/30 rounded-lg border border-yellow-600/30">
                  <p className="text-sm text-yellow-400 font-medium">
                    ⚠️ Selecciona un cliente para continuar
                  </p>
                  <p className="text-xs text-yellow-500">
                    Usa el botón "Walk-in" para pedidos rápidos
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </Section>
  );
}