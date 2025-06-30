import { useState, useRef, useCallback } from 'react';
import { usePizzas, useExtras, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente, CurrentOrderItem } from '@/types';
import PizzaCustomizationModal from '../PizzaCustomizationModal';

// Datos demo de clientes uruguayos para simulación
const DEMO_CLIENTES: Cliente[] = [
  { id: 1, nombre: 'Juan Carlos Pérez', telefono: '099123456', direccion: 'Av. 18 de Julio 1234', created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id: 2, nombre: 'María Fernanda González', telefono: '099456789', direccion: 'Bvar. Artigas 567', created_at: '2024-01-20', updated_at: '2024-01-20' },
  { id: 3, nombre: 'Pedro Luis Rodríguez', telefono: '099789123', direccion: 'Canelones 890', created_at: '2024-02-01', updated_at: '2024-02-01' },
  { id: 4, nombre: 'Ana Sofía Martínez', telefono: '099321654', direccion: 'Pocitos 123', created_at: '2024-02-05', updated_at: '2024-02-05' },
  { id: 5, nombre: 'Carlos Alberto Silva', telefono: '099654987', direccion: 'Cordón 456', created_at: '2024-02-10', updated_at: '2024-02-10' },
  { id: 6, nombre: 'Lucía Beatriz Fernández', telefono: '099147258', direccion: 'Punta Carretas 789', created_at: '2024-02-15', updated_at: '2024-02-15' },
  { id: 7, nombre: 'Roberto Daniel López', telefono: '099369741', direccion: 'Centro 321', created_at: '2024-02-20', updated_at: '2024-02-20' },
  { id: 8, nombre: 'Patricia Elena García', telefono: '099852963', direccion: 'Malvín 654', created_at: '2024-02-25', updated_at: '2024-02-25' }
];

export default function Model1QuickEntry() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, addCustomizedItemToOrder, updateCustomizedItemInOrder, updateOrderItemQuantity, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });
  const [customizationModal, setCustomizationModal] = useState<{
    isOpen: boolean;
    pizza?: Pizza;
    editingItem?: CurrentOrderItem;
  }>({ isOpen: false });
  const customerInputRef = useRef<HTMLInputElement>(null);
  const firstPizzaButtonRef = useRef<HTMLButtonElement>(null);
  const [currentFocusSection, setCurrentFocusSection] = useState(0); // 0: customer, 1: pizzas


  // Solo 5 pizzas con shortcuts F1-F5
  const popularPizzas = pizzas.slice(0, 5);

  // Función de búsqueda simulada de clientes
  const searchCustomers = useCallback((query: string) => {
    if (!query.trim()) return [];
    
    return DEMO_CLIENTES.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(query.toLowerCase()) ||
      cliente.telefono.includes(query)
    ).slice(0, 5); // Máximo 5 resultados
  }, []);

  // Manejar cambios en la búsqueda de clientes
  const handleCustomerSearchChange = useCallback((value: string) => {
    setCustomerSearch(value);
    setShowCustomerDropdown(value.length > 0);
  }, []);

  // Seleccionar cliente de la lista
  const handleSelectCustomer = useCallback((cliente: Cliente) => {
    setSelectedCustomer(cliente);
    setOrderCustomer(cliente);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  }, [setOrderCustomer]);

  // Abrir modal para crear nuevo cliente
  const handleCreateNewCustomer = useCallback(() => {
    // Pre-llenar el formulario con datos de la búsqueda
    const searchValue = customerSearch.trim();
    setNewCustomerForm({
      nombre: searchValue.length > 2 && !searchValue.match(/^\d+$/) ? searchValue : '',
      telefono: searchValue.match(/^\d+$/) ? searchValue : '',
      direccion: ''
    });
    setShowNewCustomerModal(true);
    setShowCustomerDropdown(false);
  }, [customerSearch]);

  // Confirmar creación de nuevo cliente desde modal
  const handleConfirmNewCustomer = useCallback(() => {
    if (newCustomerForm.nombre.trim() && newCustomerForm.telefono.trim()) {
      const newCustomer: Cliente = {
        id: Date.now(), // ID temporal único
        nombre: newCustomerForm.nombre.trim(),
        telefono: newCustomerForm.telefono.trim(),
        direccion: newCustomerForm.direccion.trim() || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSelectedCustomer(newCustomer);
      setOrderCustomer(newCustomer);
      setCustomerSearch('');
      setShowNewCustomerModal(false);
      setNewCustomerForm({ nombre: '', telefono: '', direccion: '' });
    }
  }, [newCustomerForm, setOrderCustomer]);

  // Cancelar creación de nuevo cliente
  const handleCancelNewCustomer = useCallback(() => {
    setShowNewCustomerModal(false);
    setNewCustomerForm({ nombre: '', telefono: '', direccion: '' });
  }, []);


  // Atajos de teclado deshabilitados para demo visual

  const handleQuickAdd = useCallback((item: Pizza | Extra) => {
    if ('precio_base' in item) {
      // Es una pizza - abre personalización inmediatamente
      setCustomizationModal({
        isOpen: true,
        pizza: item
      });
    }
  }, []);

  // Handlers para el modal de personalización
  const handleCustomizationConfirm = useCallback((item: CurrentOrderItem) => {
    if (customizationModal.editingItem) {
      updateCustomizedItemInOrder(item);
    } else {
      addCustomizedItemToOrder(item);
    }
    setCustomizationModal({ isOpen: false });
    
    // Resetear cantidad
    setQuickQuantity(1);
  }, [customizationModal.editingItem, addCustomizedItemToOrder, updateCustomizedItemInOrder]);

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
                    <div className="text-green-400 font-bold text-lg">${Math.round(parseFloat(pizza.precio_base))}</div>
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
          
          {/* Cliente - MEJORADO */}
          <div className="bg-gray-800 rounded-lg p-3 relative">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              👤 Cliente <kbd className="bg-gray-600 px-1 rounded text-xs">C</kbd>
            </h3>
            {currentOrder.cliente ? (
              <div className="bg-green-900/30 rounded p-2">
                <div className="text-green-400 font-medium text-sm">{currentOrder.cliente.nombre}</div>
                <div className="text-green-300 text-xs">{currentOrder.cliente.telefono}</div>
                {currentOrder.cliente.direccion && (
                  <div className="text-green-200 text-xs">📍 {currentOrder.cliente.direccion}</div>
                )}
                <button
                  onClick={() => {
                    setOrderCustomer({} as Cliente);
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                  }}
                  className="mt-1 text-xs text-gray-400 hover:text-white"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                  <input
                    ref={customerInputRef}
                    type="text"
                    placeholder="Buscar por teléfono o nombre..."
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearchChange(e.target.value)}
                    onFocus={() => {
                      setCurrentFocusSection(0);
                      setShowCustomerDropdown(customerSearch.length > 0);
                    }}
                    onBlur={() => {
                      // Delay para permitir clicks en dropdown
                      setTimeout(() => setShowCustomerDropdown(false), 200);
                    }}
                    className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Dropdown de resultados */}
                {showCustomerDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {(() => {
                      const results = searchCustomers(customerSearch);
                      if (results.length > 0) {
                        return (
                          <>
                            <div className="px-3 py-2 text-xs text-gray-400 bg-gray-800/50">
                              📋 Clientes encontrados:
                            </div>
                            {results.map((cliente) => (
                              <button
                                key={cliente.id}
                                onClick={() => handleSelectCustomer(cliente)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-600 border-b border-gray-600 last:border-b-0"
                              >
                                <div className="text-white text-sm font-medium">👤 {cliente.nombre}</div>
                                <div className="text-gray-300 text-xs">📱 {cliente.telefono}</div>
                                {cliente.direccion && (
                                  <div className="text-gray-400 text-xs">📍 {cliente.direccion}</div>
                                )}
                              </button>
                            ))}
                          </>
                        );
                      } else {
                        return (
                          <div className="px-3 py-2 text-xs text-gray-400">
                            ❌ No se encontraron clientes
                          </div>
                        );
                      }
                    })()}
                    
                    {/* Opción para crear nuevo cliente */}
                    {customerSearch.trim() && (
                      <button
                        onClick={handleCreateNewCustomer}
                        className="w-full px-3 py-2 text-left hover:bg-blue-600 bg-blue-700 text-white border-t border-gray-600"
                      >
                        <div className="text-white text-sm font-medium">➕ Crear nuevo cliente</div>
                        <div className="text-blue-200 text-xs">"{customerSearch}"</div>
                      </button>
                    )}
                  </div>
                )}
              </div>
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
                        
                        {/* Mostrar extras y modificaciones - MEJORADO */}
                        {item.es_mitad_y_mitad ? (
                          // Mostrar customizaciones por mitad
                          <div className="text-xs mt-2 space-y-1">
                            {/* Mitad 1 */}
                            {((item.mitad1_extras_agregados_data && item.mitad1_extras_agregados_data.length > 0) ||
                              (item.mitad1_extras_removidos_data && item.mitad1_extras_removidos_data.length > 0)) && (
                              <div className="bg-blue-900/30 rounded p-1">
                                <div className="text-blue-200 font-medium text-xs">🟦 Mitad 1</div>
                                {item.mitad1_extras_agregados_data && item.mitad1_extras_agregados_data.length > 0 && (
                                  <div className="text-green-400 font-medium">
                                    ➕ {item.mitad1_extras_agregados_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                                {item.mitad1_extras_removidos_data && item.mitad1_extras_removidos_data.length > 0 && (
                                  <div className="text-red-400 font-medium">
                                    ➖ {item.mitad1_extras_removidos_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Mitad 2 */}
                            {((item.mitad2_extras_agregados_data && item.mitad2_extras_agregados_data.length > 0) ||
                              (item.mitad2_extras_removidos_data && item.mitad2_extras_removidos_data.length > 0)) && (
                              <div className="bg-orange-900/30 rounded p-1">
                                <div className="text-orange-200 font-medium text-xs">🟧 Mitad 2</div>
                                {item.mitad2_extras_agregados_data && item.mitad2_extras_agregados_data.length > 0 && (
                                  <div className="text-green-400 font-medium">
                                    ➕ {item.mitad2_extras_agregados_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                                {item.mitad2_extras_removidos_data && item.mitad2_extras_removidos_data.length > 0 && (
                                  <div className="text-red-400 font-medium">
                                    ➖ {item.mitad2_extras_removidos_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Ambas mitades */}
                            {((item.ambas_mitades_extras_agregados_data && item.ambas_mitades_extras_agregados_data.length > 0) ||
                              (item.ambas_mitades_extras_removidos_data && item.ambas_mitades_extras_removidos_data.length > 0)) && (
                              <div className="bg-purple-900/30 rounded p-1">
                                <div className="text-purple-200 font-medium text-xs">🔮 Ambas</div>
                                {item.ambas_mitades_extras_agregados_data && item.ambas_mitades_extras_agregados_data.length > 0 && (
                                  <div className="text-green-400 font-medium">
                                    ➕ {item.ambas_mitades_extras_agregados_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                                {item.ambas_mitades_extras_removidos_data && item.ambas_mitades_extras_removidos_data.length > 0 && (
                                  <div className="text-red-400 font-medium">
                                    ➖ {item.ambas_mitades_extras_removidos_data.map(e => e.nombre).join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Mostrar customizaciones para pizza entera - MEJORADO
                          (item.extras_agregados_data && item.extras_agregados_data.length > 0) || 
                          (item.extras_removidos_data && item.extras_removidos_data.length > 0) ? (
                            <div className="text-xs mt-2 bg-gray-700/50 rounded p-2 space-y-1">
                              {item.extras_agregados_data && item.extras_agregados_data.length > 0 && (
                                <div className="text-green-400 font-medium">
                                  ➕ {item.extras_agregados_data.map(e => e.nombre).join(', ')}
                                </div>
                              )}
                              {item.extras_removidos_data && item.extras_removidos_data.length > 0 && (
                                <div className="text-red-400 font-medium">
                                  ➖ {item.extras_removidos_data.map(e => e.nombre).join(', ')}
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
                        ${Math.round(item.precio_unitario * item.cantidad)}
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
                  <span>${Math.round(currentOrder.total)}</span>
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

      {/* Modal de Nuevo Cliente */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">➕ Nuevo Cliente</h2>
              <button
                onClick={handleCancelNewCustomer}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <div className="p-4 space-y-4">
              
              {/* Nombre (requerido) */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nombre completo del cliente"
                  value={newCustomerForm.nombre}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* Teléfono (requerido) */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Teléfono <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="099123456"
                  value={newCustomerForm.telefono}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Dirección (opcional) */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Dirección <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Av. 18 de Julio 1234"
                  value={newCustomerForm.direccion}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, direccion: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Validación visual */}
              {(!newCustomerForm.nombre.trim() || !newCustomerForm.telefono.trim()) && (
                <div className="text-red-400 text-sm">
                  ⚠️ Nombre y teléfono son requeridos
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 p-4 border-t border-gray-700">
              <button
                onClick={handleCancelNewCustomer}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmNewCustomer}
                disabled={!newCustomerForm.nombre.trim() || !newCustomerForm.telefono.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
              >
                Crear Cliente
              </button>
            </div>
          </div>
        </div>
      )}

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