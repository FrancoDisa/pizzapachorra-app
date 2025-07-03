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
  
  // Estados de loading y feedback visual
  const [loadingStates, setLoadingStates] = useState<{
    addingPizza: number | null;
    creatingCustomer: boolean;
    confirmingOrder: boolean;
  }>({
    addingPizza: null,
    creatingCustomer: false,
    confirmingOrder: false,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
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

  // Confirmar creación de nuevo cliente desde modal con loading
  const handleConfirmNewCustomer = useCallback(async () => {
    if (newCustomerForm.nombre.trim() && newCustomerForm.telefono.trim()) {
      setLoadingStates(prev => ({ ...prev, creatingCustomer: true }));
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
      setLoadingStates(prev => ({ ...prev, creatingCustomer: false }));
      
      // Mostrar mensaje de éxito
      setSuccessMessage('✅ Cliente creado exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [newCustomerForm, setOrderCustomer]);

  // Cancelar creación de nuevo cliente
  const handleCancelNewCustomer = useCallback(() => {
    setShowNewCustomerModal(false);
    setNewCustomerForm({ nombre: '', telefono: '', direccion: '' });
  }, []);


  // Atajos de teclado deshabilitados para demo visual

  const handleQuickAdd = useCallback(async (item: Pizza | Extra) => {
    if ('precio_base' in item) {
      // Es una pizza - mostrar loading y luego abrir personalización
      setLoadingStates(prev => ({ ...prev, addingPizza: item.id }));
      
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCustomizationModal({
        isOpen: true,
        pizza: item
      });
      
      setLoadingStates(prev => ({ ...prev, addingPizza: null }));
    }
  }, []);

  // Handlers para el modal de personalización con feedback
  const handleCustomizationConfirm = useCallback((item: CurrentOrderItem) => {
    if (customizationModal.editingItem) {
      updateCustomizedItemInOrder(item);
      setSuccessMessage('✅ Pizza actualizada');
    } else {
      addCustomizedItemToOrder(item);
      setSuccessMessage('✅ Pizza agregada al ticket');
    }
    setCustomizationModal({ isOpen: false });
    
    // Resetear cantidad
    setQuickQuantity(1);
    
    // Ocultar mensaje después de 2 segundos
    setTimeout(() => setSuccessMessage(null), 2000);
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
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.8);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 1);
        }
      `}</style>
      <div className="min-h-screen bg-gray-900 p-4">
      {/* Header optimizado */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-blue-400">⚡</span> Quick Entry Dashboard
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-300">
              <span className="text-blue-400 font-medium">🍕 F1-F5</span> Pizzas Rápidas
            </div>
            <div className="bg-blue-600/20 px-3 py-2 rounded-lg border border-blue-600/30">
              <span className="text-blue-300 text-sm font-medium">Cantidad:</span>
              <span className="text-white text-lg font-bold ml-2">{quickQuantity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="mb-4 animate-fade-in">
          <div className="bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2">
            <span className="animate-pulse-success">🎉</span>
            {successMessage}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel Izquierdo: Pizzas principales */}
        <div className="lg:col-span-1 space-y-4">
          

          {/* Pizzas Principales (F1-F5) */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-orange-400">🍕</span> Pizzas Principales
            </h3>
            <div className="space-y-3">
              {popularPizzas.map((pizza, index) => (
                <button
                  key={pizza.id}
                  ref={index === 0 ? firstPizzaButtonRef : null}
                  onClick={() => handleQuickAdd(pizza)}
                  onFocus={() => setCurrentFocusSection(1)}
                  disabled={loadingStates.addingPizza === pizza.id}
                  className={`w-full p-4 rounded-lg transition-all duration-200 text-left border-2 group relative ${
                    loadingStates.addingPizza === pizza.id 
                      ? 'bg-blue-600/20 border-blue-500 cursor-wait' 
                      : 'bg-gray-700/80 hover:bg-gray-600/90 border-gray-600 hover:border-blue-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50'
                  }`}
                >
                  {loadingStates.addingPizza === pizza.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-700/90 rounded-lg">
                      <div className="loading-spinner text-blue-400"></div>
                      <span className="ml-2 text-blue-300 font-medium">Agregando...</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-blue-300 font-bold bg-blue-600/20 px-3 py-1 rounded-full border border-blue-600/30 min-w-[3rem] text-center group-hover:bg-blue-600/30 transition-colors">
                        F{index + 1}
                      </div>
                      <div className="text-white font-semibold text-lg group-hover:text-blue-100 transition-colors">{pizza.nombre}</div>
                    </div>
                    <div className="text-green-400 font-bold text-xl">${Math.round(parseFloat(pizza.precio_base))}</div>
                  </div>
                  <div className="text-gray-400 text-sm leading-relaxed pl-12">
                    <span className="text-gray-500 font-medium">Ingredientes:</span> {pizza.ingredientes.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Panel Derecho: Cliente y Ticket */}
        <div className="space-y-3 flex flex-col h-full">
          
          {/* Cliente - OPTIMIZADO */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 relative">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-purple-400">👤</span> Cliente
            </h3>
            {currentOrder.cliente ? (
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400 text-sm">✓</span>
                  <span className="text-green-400 font-medium text-sm">Cliente Seleccionado</span>
                </div>
                <div className="text-green-100 font-semibold">{currentOrder.cliente.nombre}</div>
                <div className="text-green-200 text-sm">{currentOrder.cliente.telefono}</div>
                {currentOrder.cliente.direccion && (
                  <div className="text-green-300 text-sm">📍 {currentOrder.cliente.direccion}</div>
                )}
                <button
                  onClick={() => {
                    setOrderCustomer({} as Cliente);
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                  }}
                  className="mt-2 text-sm text-gray-400 hover:text-white underline transition-colors"
                >
                  Cambiar Cliente
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
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex-1">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-yellow-400">🧾</span> Ticket de Venta
              </span>
              <span className="text-sm bg-blue-600/20 px-3 py-1 rounded-full border border-blue-600/30 text-blue-300">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
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
                          // Mostrar customizaciones para pizza entera - OPTIMIZADO
                          (item.extras_agregados_data && item.extras_agregados_data.length > 0) || 
                          (item.extras_removidos_data && item.extras_removidos_data.length > 0) ? (
                            <div className="text-sm mt-2 bg-gray-600/40 rounded-lg p-2 space-y-1">
                              {item.extras_agregados_data && item.extras_agregados_data.length > 0 && (
                                <div className="text-green-300 font-medium">
                                  <span className="text-green-400">➕</span> {item.extras_agregados_data.map(e => e.nombre).join(', ')}
                                </div>
                              )}
                              {item.extras_removidos_data && item.extras_removidos_data.length > 0 && (
                                <div className="text-red-300 font-medium">
                                  <span className="text-red-400">➖</span> {item.extras_removidos_data.map(e => e.nombre).join(', ')}
                                </div>
                              )}
                            </div>
                          ) : null
                        )}
                        
                        {/* Mostrar notas */}
                        {item.notas && (
                          <div className="text-sm text-yellow-300 mt-2 p-2 bg-yellow-600/10 border border-yellow-600/20 rounded italic">
                            <span className="text-yellow-400">📝</span> {item.notas}
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
                        className="btn-success px-2 py-1 text-xs rounded hover:scale-105 transition-transform"
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
                        className="btn-danger px-2 py-1 text-xs rounded hover:scale-105 transition-transform"
                        title="Reducir cantidad"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => removeItemFromOrder(item.id)}
                        className="btn-secondary px-2 py-1 text-xs rounded hover:scale-105 transition-transform"
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
                disabled={!newCustomerForm.nombre.trim() || !newCustomerForm.telefono.trim() || loadingStates.creatingCustomer}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
              >
                {loadingStates.creatingCustomer ? (
                  <>
                    <div className="loading-spinner"></div>
                    Creando...
                  </>
                ) : (
                  'Crear Cliente'
                )}
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
    </>
  );
}