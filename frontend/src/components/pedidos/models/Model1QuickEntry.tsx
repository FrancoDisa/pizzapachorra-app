import { useState, useRef, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { usePizzas, useExtras, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente, CurrentOrderItem } from '@/types';
import PizzaCustomizationModal from '../PizzaCustomizationModal';

export default function Model1QuickEntry() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, addCustomizedItemToOrder, updateCustomizedItemInOrder, updateOrderItemQuantity, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customizationModal, setCustomizationModal] = useState<{
    isOpen: boolean;
    pizza?: Pizza;
    editingItem?: CurrentOrderItem;
  }>({ isOpen: false });
  const customerInputRef = useRef<HTMLInputElement>(null);
  const firstPizzaButtonRef = useRef<HTMLButtonElement>(null);
  const [currentFocusSection, setCurrentFocusSection] = useState(0); // 0: customer, 1: pizzas

  // Función para feedback sonoro sutil
  const playFeedbackSound = useCallback((type: 'success' | 'action' | 'error' = 'action') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Diferentes tonos para diferentes acciones
      switch (type) {
        case 'success':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          break;
        case 'action':
        default:
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          break;
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio is not supported
    }
  }, []);

  // Solo 5 pizzas con shortcuts F1-F5
  const popularPizzas = pizzas.slice(0, 5);


  // Hotkeys con react-hotkeys-hook para mejor compatibilidad
  
  // F1-F5 para pizzas principales (siempre abren personalización)
  useHotkeys('f1', () => popularPizzas[0] && handleQuickAdd(popularPizzas[0]), { preventDefault: true });
  useHotkeys('f2', () => popularPizzas[1] && handleQuickAdd(popularPizzas[1]), { preventDefault: true });
  useHotkeys('f3', () => popularPizzas[2] && handleQuickAdd(popularPizzas[2]), { preventDefault: true });
  useHotkeys('f4', () => popularPizzas[3] && handleQuickAdd(popularPizzas[3]), { preventDefault: true });
  useHotkeys('f5', () => popularPizzas[4] && handleQuickAdd(popularPizzas[4]), { preventDefault: true });
  
  // Navegación rápida
  useHotkeys('c', () => {
    customerInputRef.current?.focus();
    setCurrentFocusSection(0);
  }, { preventDefault: true });
  
  useHotkeys('escape', () => {
    customerInputRef.current?.blur();
    setCurrentFocusSection(-1);
  }, { preventDefault: true });

  // Navegación con Tab entre secciones
  useHotkeys('tab', () => {
    const nextSection = (currentFocusSection + 1) % 2;
    setCurrentFocusSection(nextSection);
    
    switch (nextSection) {
      case 0:
        customerInputRef.current?.focus();
        break;
      case 1:
        firstPizzaButtonRef.current?.focus();
        break;
    }
  }, { preventDefault: true });

  // Enter para confirmar acciones rápidas
  useHotkeys('enter', () => {
    if (currentFocusSection === 1 && popularPizzas[0]) {
      handleQuickAdd(popularPizzas[0]);
    }
  }, { preventDefault: true });
  
  // Control de cantidades
  useHotkeys('plus', () => setQuickQuantity(prev => Math.min(prev + 1, 99)), { preventDefault: true });
  useHotkeys('minus', () => setQuickQuantity(prev => Math.max(prev - 1, 1)), { preventDefault: true });
  
  // Números 1-9 para cantidad rápida
  useHotkeys('1', () => setQuickQuantity(1), { preventDefault: true });
  useHotkeys('2', () => setQuickQuantity(2), { preventDefault: true });
  useHotkeys('3', () => setQuickQuantity(3), { preventDefault: true });
  useHotkeys('4', () => setQuickQuantity(4), { preventDefault: true });
  useHotkeys('5', () => setQuickQuantity(5), { preventDefault: true });
  useHotkeys('6', () => setQuickQuantity(6), { preventDefault: true });
  useHotkeys('7', () => setQuickQuantity(7), { preventDefault: true });
  useHotkeys('8', () => setQuickQuantity(8), { preventDefault: true });
  useHotkeys('9', () => setQuickQuantity(9), { preventDefault: true });

  const handleQuickAdd = useCallback((item: Pizza | Extra) => {
    if ('precio_base' in item) {
      // Feedback sonoro
      playFeedbackSound('action');
      
      // Es una pizza - abre personalización inmediatamente
      setCustomizationModal({
        isOpen: true,
        pizza: item
      });
    }
  }, [playFeedbackSound]);

  // Handlers para el modal de personalización
  const handleCustomizationConfirm = useCallback((item: CurrentOrderItem) => {
    // Feedback sonoro de éxito
    playFeedbackSound('success');
    
    if (customizationModal.editingItem) {
      updateCustomizedItemInOrder(item);
    } else {
      addCustomizedItemToOrder(item);
    }
    setCustomizationModal({ isOpen: false });
    
    // Resetear cantidad
    setQuickQuantity(1);
  }, [customizationModal.editingItem, addCustomizedItemToOrder, updateCustomizedItemInOrder, playFeedbackSound]);

  const handleEditItem = useCallback((item: CurrentOrderItem) => {
    const pizza = pizzas.find(p => p.id === item.pizza_id) || 
                 (item.es_mitad_y_mitad ? pizzas[0] : undefined); // Para mitad y mitad usamos primera pizza como base
    
    if (pizza) {
      setCustomizationModal({
        isOpen: true,
        pizza,
        editingItem: item
      });
    }
  }, [pizzas]);

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerPhone.trim()) {
      // Cliente rápido basado en teléfono
      const quickCustomer: Cliente = {
        id: -1,
        nombre: `Cliente ${customerPhone}`,
        telefono: customerPhone.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setOrderCustomer(quickCustomer);
      setCustomerPhone('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Header compacto */}
      <div className="mb-4 bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-white">⚡ Quick Entry</h1>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              🍕 <kbd className="bg-blue-600 px-1 rounded text-white">F1-F5</kbd>
            </div>
            <div className="flex items-center gap-1">
              👤 <kbd className="bg-purple-600 px-1 rounded text-white">C</kbd>
            </div>
            <div className="flex items-center gap-1">
              🔢 <kbd className="bg-orange-600 px-1 rounded text-white">1-9</kbd>
            </div>
            <div className="bg-yellow-600/20 px-2 py-1 rounded text-yellow-300">
              Qty: <span className="font-bold">{quickQuantity}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel Izquierdo: Pizzas principales */}
        <div className="lg:col-span-1 space-y-4">
          

          {/* Pizzas Principales (F1-F5) */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">🍕 Pizzas Principales (F1-F5)</h3>
            <div className="space-y-2">
              {popularPizzas.map((pizza, index) => (
                <button
                  key={pizza.id}
                  ref={index === 0 ? firstPizzaButtonRef : null}
                  onClick={() => handleQuickAdd(pizza)}
                  onFocus={() => setCurrentFocusSection(1)}
                  className="w-full p-3 rounded-lg transition-all text-left border-2 bg-gray-700 hover:bg-gray-600 border-transparent hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-blue-400 font-bold bg-blue-900/30 px-2 py-1 rounded min-w-[2rem] text-center">F{index + 1}</div>
                      <div className="text-white font-medium">{pizza.nombre}</div>
                    </div>
                    <div className="text-green-400 font-bold text-lg">${pizza.precio_base}</div>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {pizza.ingredientes.slice(0, 4).join(', ')}
                    {pizza.ingredientes.length > 4 && '...'}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Panel Derecho: Cliente y Ticket */}
        <div className="space-y-3 flex flex-col h-full">
          
          {/* Cliente */}
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              👤 Cliente <kbd className="bg-gray-600 px-1 rounded text-xs">C</kbd>
            </h3>
            {currentOrder.cliente ? (
              <div className="bg-green-900/30 rounded p-2">
                <div className="text-green-400 font-medium text-sm">{currentOrder.cliente.nombre}</div>
                <div className="text-green-300 text-xs">{currentOrder.cliente.telefono}</div>
                <button
                  onClick={() => setOrderCustomer({} as Cliente)}
                  className="mt-1 text-xs text-gray-400 hover:text-white"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomerSubmit}>
                <input
                  ref={customerInputRef}
                  type="tel"
                  placeholder="Teléfono..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  onFocus={() => setCurrentFocusSection(0)}
                  className="w-full px-3 py-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  Confirmar
                </button>
              </form>
            )}
          </div>

          {/* Ticket */}
          <div className="bg-gray-800 rounded-lg p-3 flex-1">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center justify-between">
              <span>🧾 Ticket</span>
              <span className="text-xs bg-blue-900/30 px-2 py-1 rounded">{items.length} items</span>
            </h3>
            
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">🍕</div>
                <p>Ticket vacío</p>
                <p className="text-sm">Agrega pizzas desde el menú</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-700 rounded p-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        {item.es_mitad_y_mitad ? (
                          <div className="text-white font-medium">
                            <div className="flex items-center gap-2 mb-1">
                              <span>🍕 Mitad y Mitad</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-gray-600 rounded p-1">
                                <div className="text-blue-300 font-medium">Izquierda:</div>
                                <div className="text-gray-300">
                                  {item.pizza_mitad_1 && pizzas.find(p => p.id === item.pizza_mitad_1)?.nombre || 'Sin seleccionar'}
                                </div>
                              </div>
                              <div className="bg-gray-600 rounded p-1">
                                <div className="text-orange-300 font-medium">Derecha:</div>
                                <div className="text-gray-300">
                                  {item.pizza_mitad_2 && pizzas.find(p => p.id === item.pizza_mitad_2)?.nombre || 'Sin seleccionar'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-white font-medium">{item.pizza?.nombre}</div>
                        )}
                        
                        <div className="text-xs text-gray-400">Cantidad: {item.cantidad}</div>
                        
                        {/* Mostrar extras y modificaciones */}
                        {item.es_mitad_y_mitad ? (
                          // Mostrar customizaciones por mitad
                          <div className="text-xs mt-1 bg-gray-600 rounded p-1">
                            {/* Mitad 1 */}
                            {((item.mitad1_extras_agregados_data && item.mitad1_extras_agregados_data.length > 0) ||
                              (item.mitad1_extras_removidos_data && item.mitad1_extras_removidos_data.length > 0)) && (
                              <div className="mb-1">
                                <div className="text-blue-300 font-medium">🟦 Mitad 1:</div>
                                {item.mitad1_extras_agregados_data && item.mitad1_extras_agregados_data.length > 0 && (
                                  <div className="text-green-300 ml-2">
                                    + {item.mitad1_extras_agregados_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                                {item.mitad1_extras_removidos_data && item.mitad1_extras_removidos_data.length > 0 && (
                                  <div className="text-red-300 ml-2">
                                    - {item.mitad1_extras_removidos_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Mitad 2 */}
                            {((item.mitad2_extras_agregados_data && item.mitad2_extras_agregados_data.length > 0) ||
                              (item.mitad2_extras_removidos_data && item.mitad2_extras_removidos_data.length > 0)) && (
                              <div className="mb-1">
                                <div className="text-orange-300 font-medium">🟧 Mitad 2:</div>
                                {item.mitad2_extras_agregados_data && item.mitad2_extras_agregados_data.length > 0 && (
                                  <div className="text-green-300 ml-2">
                                    + {item.mitad2_extras_agregados_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                                {item.mitad2_extras_removidos_data && item.mitad2_extras_removidos_data.length > 0 && (
                                  <div className="text-red-300 ml-2">
                                    - {item.mitad2_extras_removidos_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Ambas mitades */}
                            {((item.ambas_mitades_extras_agregados_data && item.ambas_mitades_extras_agregados_data.length > 0) ||
                              (item.ambas_mitades_extras_removidos_data && item.ambas_mitades_extras_removidos_data.length > 0)) && (
                              <div>
                                <div className="text-purple-300 font-medium">🔮 Ambas mitades:</div>
                                {item.ambas_mitades_extras_agregados_data && item.ambas_mitades_extras_agregados_data.length > 0 && (
                                  <div className="text-green-300 ml-2">
                                    + {item.ambas_mitades_extras_agregados_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                                {item.ambas_mitades_extras_removidos_data && item.ambas_mitades_extras_removidos_data.length > 0 && (
                                  <div className="text-red-300 ml-2">
                                    - {item.ambas_mitades_extras_removidos_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Mostrar customizaciones para pizza entera
                          (item.extras_agregados_data && item.extras_agregados_data.length > 0) || 
                          (item.extras_removidos_data && item.extras_removidos_data.length > 0) ? (
                            <div className="text-xs mt-1 bg-gray-600 rounded p-1">
                              {item.extras_agregados_data && item.extras_agregados_data.length > 0 && (
                                <div className="text-green-300">
                                  + {item.extras_agregados_data.map(e => e.nombre).join(', ')}
                                </div>
                              )}
                              {item.extras_removidos_data && item.extras_removidos_data.length > 0 && (
                                <div className="text-red-300">
                                  - {item.extras_removidos_data.map(e => e.nombre).join(', ')}
                                </div>
                              )}
                            </div>
                          ) : null
                        )}
                        
                        {/* Mostrar notas */}
                        {item.notas && (
                          <div className="text-xs text-yellow-300 mt-1 italic">
                            📝 {item.notas}
                          </div>
                        )}
                      </div>
                      <div className="text-green-400 font-bold">
                        ${(item.precio_unitario * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => updateOrderItemQuantity(item.id, item.cantidad + 1)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                        title="Agregar cantidad"
                      >
                        +
                      </button>
                      <button
                        onClick={() => {
                          if (item.cantidad > 1) {
                            updateOrderItemQuantity(item.id, item.cantidad - 1);
                          } else {
                            removeItemFromOrder(item.id);
                          }
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                        title="Reducir cantidad"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => removeItemFromOrder(item.id)}
                        className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex justify-between text-xl font-bold text-white mb-4">
                  <span>Total:</span>
                  <span>${currentOrder.total.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={clearCurrentOrder}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Limpiar Ticket
                  </button>
                  <button
                    disabled={!currentOrder.cliente_id}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
                  >
                    Confirmar Pedido
                  </button>
                </div>
                
                {!currentOrder.cliente_id && (
                  <p className="text-xs text-yellow-400 mt-2 text-center">
                    Agrega un cliente para confirmar
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Personalización */}
      {customizationModal.isOpen && customizationModal.pizza && (
        <PizzaCustomizationModal
          isOpen={customizationModal.isOpen}
          onClose={() => setCustomizationModal({ isOpen: false })}
          onConfirm={handleCustomizationConfirm}
          pizza={customizationModal.pizza}
          editingItem={customizationModal.editingItem}
          initialQuantity={customizationModal.editingItem ? undefined : quickQuantity}
        />
      )}
    </div>
  );
}