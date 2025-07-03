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

export default function Model15PachorraTradicional() {
  const pizzas = usePizzas();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addCustomizedItemToOrder, updateCustomizedItemInOrder, updateOrderItemQuantity, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
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

  // Solo 5 pizzas con shortcuts F1-F5
  const popularPizzas = pizzas.slice(0, 5);

  // Función de búsqueda simulada de clientes
  const searchCustomers = useCallback((query: string) => {
    if (!query.trim()) return [];
    
    return DEMO_CLIENTES.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(query.toLowerCase()) ||
      cliente.telefono.includes(query)
    ).slice(0, 5);
  }, []);

  // Manejar cambios en la búsqueda de clientes
  const handleCustomerSearchChange = useCallback((value: string) => {
    setCustomerSearch(value);
    setShowCustomerDropdown(value.length > 0);
  }, []);

  // Seleccionar cliente de la lista
  const handleSelectCustomer = useCallback((cliente: Cliente) => {
    setOrderCustomer(cliente);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  }, [setOrderCustomer]);

  // Abrir modal para crear nuevo cliente
  const handleCreateNewCustomer = useCallback(() => {
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
        id: Date.now(),
        nombre: newCustomerForm.nombre.trim(),
        telefono: newCustomerForm.telefono.trim(),
        direccion: newCustomerForm.direccion.trim() || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
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

  const handleQuickAdd = useCallback((item: Pizza | Extra) => {
    if ('precio_base' in item) {
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
    setQuickQuantity(1);
  }, [customizationModal.editingItem, addCustomizedItemToOrder, updateCustomizedItemInOrder]);

  const handleEditItem = useCallback((item: CurrentOrderItem) => {
    const pizza = pizzas.find(p => p.id === item.pizza_id) || 
                 (item.es_mitad_y_mitad ? pizzas[0] : undefined);
    
    if (pizza) {
      setCustomizationModal({
        isOpen: true,
        pizza,
        editingItem: item
      });
    }
  }, [pizzas]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      
      {/* Header Moderno con Estilo Pizzería */}
      <div className="relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-10 text-6xl text-orange-300">🍕</div>
          <div className="absolute top-12 right-20 text-4xl text-yellow-300">🧀</div>
          <div className="absolute bottom-4 left-1/4 text-5xl text-red-300">🍅</div>
          <div className="absolute bottom-8 right-1/3 text-3xl text-green-300">🌿</div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                <img src="/logo.png" alt="Pizza Pachorra" className="relative w-16 h-16 rounded-full border-4 border-white/30 shadow-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-wide drop-shadow-lg">
                  PIZZA PACHORRA
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                    📍 Sarandí esq. Chiquito Perrini
                  </span>
                  <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full shadow-lg">
                    🎯 Modelo Tradicional
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right text-white">
              <div className="text-2xl font-bold">{new Date().toLocaleDateString('es-UY')}</div>
              <div className="text-orange-200 text-sm font-medium">
                {new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Panel Principal: Menú de Pizzas */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Menu de Pizzas Rediseñado */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-orange-200 overflow-hidden">
              <div className="relative bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white p-6">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                    🍕
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-wide">NUESTRAS PIZZAS</h2>
                    <p className="text-orange-100 text-sm font-medium">Selecciona tu favorita para personalizar</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {popularPizzas.map((pizza, index) => (
                    <button
                      key={pizza.id}
                      onClick={() => handleQuickAdd(pizza)}
                      className="group relative overflow-hidden bg-gradient-to-r from-white to-orange-50 rounded-xl border-2 border-orange-200 hover:border-red-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] p-3"
                    >
                      {/* Decoración de fondo más sutil */}
                      <div className="absolute top-2 right-2 text-4xl opacity-5 group-hover:opacity-10 transition-opacity">
                        🍕
                      </div>
                      
                      <div className="relative flex flex-col gap-2">
                        {/* Header con nombre y precio */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full flex items-center justify-center font-black text-xs shadow-md">
                              {index + 1}
                            </div>
                            <h3 className="text-base font-black text-gray-900 group-hover:text-red-700 transition-colors">
                              {pizza.nombre}
                            </h3>
                          </div>
                          <div className="text-xl font-black text-red-600">
                            ${Math.round(parseFloat(pizza.precio_base))}
                          </div>
                        </div>
                        
                        {/* Ingredientes en líneas compactas */}
                        <div className="flex flex-wrap gap-1">
                          {pizza.ingredientes.slice(0, 4).map((ingrediente, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-lg font-medium">
                              {ingrediente}
                            </span>
                          ))}
                          {pizza.ingredientes.length > 4 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">
                              +{pizza.ingredientes.length - 4} más
                            </span>
                          )}
                        </div>
                        
                        {/* Shortcut key */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                            F{index + 1}
                          </div>
                          <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full shadow-md group-hover:from-green-600 group-hover:to-green-700 transition-all">
                            🎨 Crear
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Panel Lateral: Cliente y Pedido */}
          <div className="space-y-6">
            
            {/* Cliente Rediseñado */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <h3 className="text-lg font-black">CLIENTE</h3>
                    <p className="text-blue-100 text-xs">Buscar o crear nuevo</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {currentOrder.cliente ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        ✓
                      </div>
                      <span className="text-green-700 font-bold">Cliente Seleccionado</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        <span className="text-gray-900 font-bold text-lg">{currentOrder.cliente.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📱</span>
                        <span className="text-gray-700 font-medium">{currentOrder.cliente.telefono}</span>
                      </div>
                      {currentOrder.cliente.direccion && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📍</span>
                          <span className="text-gray-600">{currentOrder.cliente.direccion}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setOrderCustomer({} as Cliente);
                        setCustomerSearch('');
                      }}
                      className="mt-4 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg"
                    >
                      🔄 Cambiar Cliente
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                        🔍
                      </div>
                      <input
                        ref={customerInputRef}
                        type="text"
                        placeholder="Buscar por nombre o teléfono..."
                        value={customerSearch}
                        onChange={(e) => handleCustomerSearchChange(e.target.value)}
                        onFocus={() => setShowCustomerDropdown(customerSearch.length > 0)}
                        onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-blue-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-blue-50/50 text-gray-900 font-medium placeholder-gray-500"
                      />
                    </div>
                    
                    {/* Dropdown Moderno */}
                    {showCustomerDropdown && (
                      <div className="absolute z-[100] w-full mt-2 bg-white border-2 border-blue-300 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                        {(() => {
                          const results = searchCustomers(customerSearch);
                          if (results.length > 0) {
                            return (
                              <>
                                <div className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm rounded-t-2xl">
                                  📋 Clientes Encontrados ({results.length})
                                </div>
                                {results.map((cliente) => (
                                  <button
                                    key={cliente.id}
                                    onClick={() => handleSelectCustomer(cliente)}
                                    className="w-full px-5 py-4 text-left hover:bg-blue-50 border-b border-blue-100 last:border-b-0 transition-colors group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:bg-blue-700 transition-colors">
                                        👤
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-gray-900 font-bold text-base">{cliente.nombre}</div>
                                        <div className="text-blue-600 text-sm font-medium">📱 {cliente.telefono}</div>
                                        {cliente.direccion && (
                                          <div className="text-gray-500 text-xs mt-1">📍 {cliente.direccion}</div>
                                        )}
                                      </div>
                                      <div className="text-blue-400 text-xl group-hover:text-blue-600 transition-colors">→</div>
                                    </div>
                                  </button>
                                ))}
                              </>
                            );
                          } else {
                            return (
                              <div className="px-5 py-4 text-center">
                                <div className="text-4xl mb-2">🔍</div>
                                <div className="text-gray-600 font-medium">No se encontraron clientes</div>
                                <div className="text-gray-400 text-sm">Intenta con otro término de búsqueda</div>
                              </div>
                            );
                          }
                        })()}
                        
                        {customerSearch.trim() && (
                          <button
                            onClick={handleCreateNewCustomer}
                            className="w-full px-5 py-4 text-left bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-t-2 border-green-300 rounded-b-2xl transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                                ➕
                              </div>
                              <div>
                                <div className="font-bold">Crear Nuevo Cliente</div>
                                <div className="text-green-100 text-sm">"{customerSearch}"</div>
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pedido Rediseñado */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                      🛒
                    </div>
                    <div>
                      <h3 className="text-lg font-black">PEDIDO ACTUAL</h3>
                      <p className="text-purple-100 text-xs">Items seleccionados</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black">{items.length}</div>
                    <div className="text-purple-200 text-xs font-medium">productos</div>
                  </div>
                </div>
              </div>
              
              <div className="p-5 h-full flex flex-col">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 flex-1 flex flex-col justify-center">
                    <div className="text-8xl mb-4 opacity-50">🍕</div>
                    <p className="text-lg font-bold mb-2">¡Tu pedido está vacío!</p>
                    <p className="text-sm text-gray-400 mb-4">Selecciona pizzas del menú para comenzar</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                      <span>💡</span>
                      <span>Tip: Usa las teclas F1-F5 para acceso rápido</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto flex-1 custom-scrollbar">
                    {items.map((item, index) => (
                      <div key={item.id} className="group bg-gradient-to-r from-white to-purple-50 border-2 border-purple-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start gap-4">
                          {/* Número de orden */}
                          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Nombre y cantidad */}
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-bold text-gray-900 truncate">
                                {item.pizza?.nombre || 'Pizza Personalizada'}
                              </h4>
                              <div className="text-right flex-shrink-0 ml-2">
                                <div className="text-xl font-black text-purple-600">
                                  ${Math.round(item.precio_unitario * item.cantidad)}
                                </div>
                                <div className="text-xs text-gray-500 font-medium">
                                  {item.cantidad}x ${Math.round(item.precio_unitario)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Modificaciones con mejor diseño */}
                            {((item.extras_agregados_data && item.extras_agregados_data.length > 0) || 
                             (item.extras_removidos_data && item.extras_removidos_data.length > 0)) && (
                              <div className="bg-white rounded-xl p-3 border border-purple-200 mb-3 space-y-2">
                                {item.extras_agregados_data && item.extras_agregados_data.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold text-sm">+</span>
                                    <div className="flex flex-wrap gap-1">
                                      {item.extras_agregados_data.map((e, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-medium">
                                          {e.nombre} (+${Math.round(parseFloat(e.precio.toString()))})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {item.extras_removidos_data && item.extras_removidos_data.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-red-600 font-bold text-sm">-</span>
                                    <div className="flex flex-wrap gap-1">
                                      {item.extras_removidos_data.map((e, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-medium">
                                          Sin {e.nombre} (-$50)
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Notas */}
                            {item.notas && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-2 mb-3">
                                <div className="flex items-center gap-2 text-yellow-800">
                                  <span className="text-sm">📝</span>
                                  <span className="text-sm font-medium italic">{item.notas}</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Controles */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-gray-100 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => {
                                    if (item.cantidad > 1) {
                                      updateOrderItemQuantity(item.id, item.cantidad - 1);
                                    } else {
                                      removeItemFromOrder(item.id);
                                    }
                                  }}
                                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="px-3 py-2 font-bold text-gray-900 min-w-[2rem] text-center">
                                  {item.cantidad}
                                </span>
                                <button
                                  onClick={() => updateOrderItemQuantity(item.id, item.cantidad + 1)}
                                  className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white font-bold transition-colors flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                              
                              <button
                                onClick={() => handleEditItem(item)}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors"
                              >
                                ✏️ Editar
                              </button>
                              
                              <button
                                onClick={() => removeItemFromOrder(item.id)}
                                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold rounded-lg transition-colors"
                              >
                                🗑️ Quitar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {items.length > 0 && (
                  <div className="mt-6 pt-6 border-t-2 border-purple-200">
                    {/* Total con diseño destacado */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-4 mb-4 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                            💰
                          </div>
                          <div>
                            <div className="text-purple-200 text-sm font-medium">Total del Pedido</div>
                            <div className="text-2xl font-black">${Math.round(currentOrder.total)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-purple-200 text-sm">{items.length} producto{items.length !== 1 ? 's' : ''}</div>
                          <div className="text-purple-200 text-xs">IVA incluido</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="space-y-3">
                      <button
                        onClick={clearCurrentOrder}
                        className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        🗑️ Limpiar Pedido
                      </button>
                      
                      <button
                        disabled={!currentOrder.cliente_id}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                      >
                        {currentOrder.cliente_id ? '🚀 Confirmar Pedido' : '⚠️ Selecciona un Cliente'}
                      </button>
                    </div>
                    
                    {!currentOrder.cliente_id && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <span className="text-lg">⚠️</span>
                          <span className="text-sm font-medium">Debes seleccionar un cliente antes de confirmar el pedido</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nuevo Cliente Rediseñado */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-blue-200 overflow-hidden">
            
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">NUEVO CLIENTE</h2>
                    <p className="text-blue-100 text-sm">Completa los datos del cliente</p>
                  </div>
                </div>
                <button
                  onClick={handleCancelNewCustomer}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-bold mb-3">
                  <span className="text-xl">👤</span>
                  <span>Nombre Completo</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Carlos Pérez"
                  value={newCustomerForm.nombre}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-blue-50/30 text-gray-900 font-medium placeholder-gray-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-bold mb-3">
                  <span className="text-xl">📱</span>
                  <span>Teléfono</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="099123456"
                  value={newCustomerForm.telefono}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-blue-50/30 text-gray-900 font-medium placeholder-gray-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-bold mb-3">
                  <span className="text-xl">📍</span>
                  <span>Dirección</span>
                  <span className="text-gray-400 text-sm font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. 18 de Julio 1234"
                  value={newCustomerForm.direccion}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, direccion: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-blue-50/30 text-gray-900 font-medium placeholder-gray-500"
                />
              </div>

              {(!newCustomerForm.nombre.trim() || !newCustomerForm.telefono.trim()) && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3 text-red-700">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-bold">Campos Requeridos</div>
                      <div className="text-sm">Nombre y teléfono son obligatorios</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-4 p-6 border-t-2 border-gray-100">
              <button
                onClick={handleCancelNewCustomer}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                ❌ Cancelar
              </button>
              <button
                onClick={handleConfirmNewCustomer}
                disabled={!newCustomerForm.nombre.trim() || !newCustomerForm.telefono.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                ✅ Crear Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Personalización con Tema Moderno */}
      {customizationModal.isOpen && customizationModal.pizza && (
        <PizzaCustomizationModal
          isOpen={customizationModal.isOpen}
          onClose={() => setCustomizationModal({ isOpen: false })}
          onConfirm={handleCustomizationConfirm}
          pizza={customizationModal.pizza}
          editingItem={customizationModal.editingItem || undefined}
          initialQuantity={customizationModal.editingItem ? undefined : quickQuantity}
          theme="traditional"
        />
      )}
      
      {/* Estilos adicionales para scrollbar personalizado */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8b5cf6;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }
      `}</style>
    </div>
  );
}