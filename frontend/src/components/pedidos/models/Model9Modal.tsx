import { useState, useEffect, useRef } from 'react';
import { usePizzas, useExtras, useClientes, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente } from '@/types';

interface ModalState {
  type: 'none' | 'pizza-selector' | 'extra-selector' | 'customer-selector' | 'order-review' | 'pizza-customizer';
  data?: any;
}

export default function Model9Modal() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const clientes = useClientes();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, updateOrderItemQuantity, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickActions, setQuickActions] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Shortcuts de teclado globales
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Si hay un modal abierto, manejar shortcuts específicos del modal
      if (modalState.type !== 'none') {
        handleModalKeyPress(e);
        return;
      }

      // Shortcuts globales cuando no hay modal
      switch (e.key.toLowerCase()) {
        case 'p':
          e.preventDefault();
          setModalState({ type: 'pizza-selector' });
          break;
        case 'e':
          e.preventDefault();
          setModalState({ type: 'extra-selector' });
          break;
        case 'c':
          e.preventDefault();
          setModalState({ type: 'customer-selector' });
          break;
        case 'r':
          e.preventDefault();
          if (items.length > 0) {
            setModalState({ type: 'order-review' });
          }
          break;
        case 'escape':
          e.preventDefault();
          closeModal();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [modalState, items.length]);

  // Shortcuts específicos del modal
  const handleModalKeyPress = (e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'escape':
        e.preventDefault();
        closeModal();
        break;
      case 'enter':
        e.preventDefault();
        if (modalState.type === 'order-review') {
          handleConfirmOrder();
        }
        break;
      case 'f':
        e.preventDefault();
        searchRef.current?.focus();
        break;
    }
  };

  // Auto-focus en input de búsqueda cuando se abre modal
  useEffect(() => {
    if (modalState.type !== 'none' && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
    setSearchTerm('');
  }, [modalState.type]);

  const closeModal = () => {
    setModalState({ type: 'none' });
    setSelectedPizza(null);
    setSearchTerm('');
  };

  const handleSelectPizza = (pizza: Pizza) => {
    setSelectedPizza(pizza);
    setModalState({ type: 'pizza-customizer', data: pizza });
  };

  const handleAddPizza = (pizza: Pizza, customizations?: any) => {
    addItemToOrder(pizza);
    closeModal();
  };

  const handleAddExtra = (extra: Extra) => {
    console.log('Agregando extra:', extra);
    closeModal();
  };

  const handleSelectCustomer = (customer: Cliente) => {
    setOrderCustomer(customer);
    closeModal();
  };

  const handleCreateCustomer = () => {
    if (searchTerm.trim()) {
      const newCustomer: Cliente = {
        id: Date.now(),
        nombre: searchTerm.includes('@') ? 'Cliente' : searchTerm,
        telefono: searchTerm.includes('@') ? '000000000' : searchTerm,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setOrderCustomer(newCustomer);
      closeModal();
    }
  };

  const handleConfirmOrder = () => {
    if (currentOrder.cliente_id && items.length > 0) {
      console.log('Pedido confirmado:', currentOrder);
      closeModal();
    }
  };

  // Filtros de búsqueda
  const filteredPizzas = pizzas.filter(pizza =>
    pizza.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pizza.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExtras = extras.filter(extra =>
    extra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    extra.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = clientes.filter(customer =>
    customer.telefono.includes(searchTerm) ||
    (customer.nombre && customer.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderModal = () => {
    if (modalState.type === 'none') return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div
          ref={modalRef}
          className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header del modal */}
          <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {modalState.type === 'pizza-selector' && '🍕 Seleccionar Pizza'}
                {modalState.type === 'extra-selector' && '➕ Seleccionar Extra'}
                {modalState.type === 'customer-selector' && '👤 Seleccionar Cliente'}
                {modalState.type === 'order-review' && '📋 Revisar Pedido'}
                {modalState.type === 'pizza-customizer' && '⚙️ Personalizar Pizza'}
              </h2>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-400">
                  <kbd className="bg-gray-600 px-1 rounded">Esc</kbd> = Cerrar •
                  <kbd className="bg-gray-600 px-1 rounded mx-1">F</kbd> = Buscar
                  {modalState.type === 'order-review' && (
                    <>
                     • <kbd className="bg-gray-600 px-1 rounded">Enter</kbd> = Confirmar
                    </>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {renderModalContent()}
          </div>
        </div>
      </div>
    );
  };

  const renderModalContent = () => {
    switch (modalState.type) {
      case 'pizza-selector':
        return (
          <div className="space-y-6">
            {/* Búsqueda */}
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar pizzas por nombre o descripción... (F)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Grid de pizzas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPizzas.map((pizza) => (
                <div
                  key={pizza.id}
                  onClick={() => handleSelectPizza(pizza)}
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 border-2 border-transparent hover:border-blue-500"
                >
                  <div className="text-center mb-3">
                    <div className="text-4xl mb-2">🍕</div>
                    <h3 className="text-white font-bold">{pizza.nombre}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{pizza.descripcion}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {pizza.ingredientes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pizza.ingredientes.slice(0, 3).map((ingrediente, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                            {ingrediente}
                          </span>
                        ))}
                        {pizza.ingredientes.length > 3 && (
                          <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                            +{pizza.ingredientes.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-bold text-lg">${pizza.precio_base}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddPizza(pizza);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        Agregar Simple
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'extra-selector':
        return (
          <div className="space-y-6">
            {/* Búsqueda */}
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar extras por nombre o categoría... (F)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Lista de extras agrupados por categoría */}
            <div className="space-y-4">
              {Object.entries(
                filteredExtras.reduce((acc, extra) => {
                  const category = extra.categoria || 'Sin categoría';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(extra);
                  return acc;
                }, {} as Record<string, Extra[]>)
              ).map(([category, categoryExtras]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-white mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryExtras.map((extra) => (
                      <button
                        key={extra.id}
                        onClick={() => handleAddExtra(extra)}
                        className="text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border-2 border-transparent hover:border-green-500"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{extra.nombre}</h4>
                            <p className="text-gray-400 text-sm">{extra.categoria}</p>
                          </div>
                          <span className="text-green-400 font-bold">+${extra.precio}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'customer-selector':
        return (
          <div className="space-y-6">
            {/* Búsqueda/Creación de cliente */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar por teléfono o nombre, o crear nuevo cliente... (F)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {searchTerm && (
                <button
                  onClick={handleCreateCustomer}
                  className="w-full p-3 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors text-left"
                >
                  <div className="text-blue-200 font-medium">+ Crear nuevo cliente: "{searchTerm}"</div>
                  <div className="text-blue-300 text-sm">Click para crear cliente rápido</div>
                </button>
              )}
            </div>

            {/* Lista de clientes existentes */}
            {filteredCustomers.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Clientes Encontrados</h3>
                <div className="space-y-2">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border-2 border-transparent hover:border-blue-500"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-white font-medium">{customer.nombre}</div>
                          <div className="text-gray-400 text-sm">{customer.telefono}</div>
                          {customer.direccion && (
                            <div className="text-gray-500 text-xs mt-1">{customer.direccion}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Cliente #{customer.id}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'pizza-customizer':
        const pizza = modalState.data as Pizza;
        return (
          <div className="space-y-6">
            {/* Info de la pizza seleccionada */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="text-6xl">🍕</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{pizza.nombre}</h3>
                  <p className="text-gray-400">{pizza.descripcion}</p>
                  <div className="text-green-400 font-bold text-lg">Precio base: ${pizza.precio_base}</div>
                </div>
              </div>
            </div>

            {/* Opciones de personalización */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Opciones de Personalización</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleAddPizza(pizza)}
                  className="p-4 bg-green-700 hover:bg-green-600 rounded-lg transition-colors text-left"
                >
                  <div className="text-white font-medium">Pizza Completa</div>
                  <div className="text-green-200 text-sm">Agregar como está</div>
                  <div className="text-green-300 font-bold">${pizza.precio_base}</div>
                </button>
                
                <button
                  onClick={() => {
                    console.log('Configurar mitad y mitad para:', pizza);
                    handleAddPizza(pizza);
                  }}
                  className="p-4 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors text-left"
                >
                  <div className="text-white font-medium">Mitad y Mitad</div>
                  <div className="text-purple-200 text-sm">Combinar con otra pizza</div>
                  <div className="text-purple-300 font-bold">Precio variable</div>
                </button>
              </div>
              
              {/* Extras disponibles para la pizza */}
              <div>
                <h4 className="text-white font-medium mb-2">Extras Disponibles</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {extras.slice(0, 6).map((extra) => (
                    <button
                      key={extra.id}
                      onClick={() => console.log('Agregando extra a pizza:', extra)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-left transition-colors"
                    >
                      <div className="text-white text-sm font-medium">{extra.nombre}</div>
                      <div className="text-green-400 text-xs">+${extra.precio}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t border-gray-600">
              <button
                onClick={() => setModalState({ type: 'pizza-selector' })}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                ← Volver a Pizzas
              </button>
              <button
                onClick={() => handleAddPizza(pizza)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors"
              >
                Agregar Pizza
              </button>
            </div>
          </div>
        );

      case 'order-review':
        return (
          <div className="space-y-6">
            {/* Info del cliente */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3">Cliente</h3>
              {currentOrder.cliente ? (
                <div className="flex items-center gap-3">
                  <div className="text-4xl">👤</div>
                  <div>
                    <div className="text-white font-medium">{currentOrder.cliente.nombre}</div>
                    <div className="text-gray-400">{currentOrder.cliente.telefono}</div>
                  </div>
                </div>
              ) : (
                <div className="text-red-400">⚠️ No hay cliente seleccionado</div>
              )}
            </div>

            {/* Lista de items */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Items del Pedido ({items.length})</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.pizza?.nombre}</h4>
                        <p className="text-gray-400 text-sm">{item.pizza?.descripcion}</p>
                        <div className="text-sm text-gray-300 mt-1">Cantidad: {item.cantidad}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">
                          ${(item.precio_unitario * item.cantidad).toFixed(0)}
                        </div>
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => updateOrderItemQuantity(item.id, item.cantidad + 1)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
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
                          >
                            -
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total y confirmación */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-white">Total:</span>
                <span className="text-2xl font-bold text-green-400">${currentOrder.total.toFixed(0)}</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={clearCurrentOrder}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Limpiar Pedido
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={!currentOrder.cliente_id}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
                >
                  Confirmar Pedido (Enter)
                </button>
              </div>
              
              {!currentOrder.cliente_id && (
                <p className="text-yellow-400 text-sm mt-2 text-center">
                  Selecciona un cliente para confirmar el pedido
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      
      {/* Header principal */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Interfaz Modal/Popup Workflows</h1>
        <p className="text-gray-400 mb-4">
          Flujo de trabajo basado en ventanas modales para un proceso paso a paso intuitivo
        </p>
        <div className="text-sm text-gray-400">
          Shortcuts: <kbd className="bg-gray-700 px-1 rounded">P</kbd>=Pizzas •
          <kbd className="bg-gray-700 px-1 rounded mx-1">E</kbd>=Extras •
          <kbd className="bg-gray-700 px-1 rounded">C</kbd>=Cliente •
          <kbd className="bg-gray-700 px-1 rounded mx-1">R</kbd>=Revisar •
          <kbd className="bg-gray-700 px-1 rounded">Esc</kbd>=Cerrar modal
        </div>
      </div>

      {/* Panel principal con acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Acciones principales */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Acciones Principales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <button
                onClick={() => setModalState({ type: 'pizza-selector' })}
                className="group p-8 bg-red-700 hover:bg-red-600 rounded-xl transition-all hover:scale-105 text-left"
              >
                <div className="text-6xl mb-4 group-hover:animate-bounce">🍕</div>
                <h3 className="text-xl font-bold text-white mb-2">Seleccionar Pizza (P)</h3>
                <p className="text-red-200">Explora el catálogo completo de pizzas con opciones de personalización</p>
                <div className="mt-4 text-red-300 text-sm">
                  {pizzas.length} pizzas disponibles
                </div>
              </button>
              
              <button
                onClick={() => setModalState({ type: 'extra-selector' })}
                className="group p-8 bg-green-700 hover:bg-green-600 rounded-xl transition-all hover:scale-105 text-left"
              >
                <div className="text-6xl mb-4 group-hover:animate-bounce">➕</div>
                <h3 className="text-xl font-bold text-white mb-2">Agregar Extras (E)</h3>
                <p className="text-green-200">Personaliza tu pedido con ingredientes adicionales</p>
                <div className="mt-4 text-green-300 text-sm">
                  {extras.length} extras disponibles
                </div>
              </button>
              
              <button
                onClick={() => setModalState({ type: 'customer-selector' })}
                className="group p-8 bg-blue-700 hover:bg-blue-600 rounded-xl transition-all hover:scale-105 text-left"
              >
                <div className="text-6xl mb-4 group-hover:animate-bounce">👤</div>
                <h3 className="text-xl font-bold text-white mb-2">Gestionar Cliente (C)</h3>
                <p className="text-blue-200">Busca clientes existentes o crea nuevos perfiles</p>
                <div className="mt-4 text-blue-300 text-sm">
                  {clientes.length} clientes registrados
                </div>
              </button>
              
              <button
                onClick={() => items.length > 0 && setModalState({ type: 'order-review' })}
                disabled={items.length === 0}
                className="group p-8 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-all hover:scale-105 text-left"
              >
                <div className="text-6xl mb-4 group-hover:animate-bounce">📋</div>
                <h3 className="text-xl font-bold text-white mb-2">Revisar Pedido (R)</h3>
                <p className="text-purple-200">Confirma los detalles antes de enviar a cocina</p>
                <div className="mt-4 text-purple-300 text-sm">
                  {items.length} items en el pedido
                </div>
              </button>
            </div>
            
            {/* Información adicional */}
            <div className="mt-8 bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">💡 Flujo de Trabajo Recomendado</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <div>1. <span className="text-red-400">Seleccionar Pizzas</span> - Explora y personaliza</div>
                <div>2. <span className="text-green-400">Agregar Extras</span> - Mejora tu pedido</div>
                <div>3. <span className="text-blue-400">Gestionar Cliente</span> - Asigna el pedido</div>
                <div>4. <span className="text-purple-400">Revisar Pedido</span> - Confirma y envía</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral: Resumen actual */}
        <div className="space-y-6">
          
          {/* Cliente actual */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">Cliente Actual</h3>
            {currentOrder.cliente ? (
              <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-3">
                <div className="text-green-400 font-medium">{currentOrder.cliente.nombre}</div>
                <div className="text-green-300 text-sm">{currentOrder.cliente.telefono}</div>
                <button
                  onClick={() => setModalState({ type: 'customer-selector' })}
                  className="mt-2 text-xs text-green-400 hover:text-green-300 underline"
                >
                  Cambiar cliente
                </button>
              </div>
            ) : (
              <button
                onClick={() => setModalState({ type: 'customer-selector' })}
                className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-center text-gray-400"
              >
                Sin cliente seleccionado<br />
                <span className="text-blue-400 text-sm">Click para seleccionar</span>
              </button>
            )}
          </div>

          {/* Resumen del pedido */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">
              Pedido Actual ({items.length} items)
            </h3>
            
            {items.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p>Pedido vacío</p>
                <p className="text-sm">Usa los botones para agregar productos</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="bg-gray-700 rounded p-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="text-white font-medium truncate">{item.pizza?.nombre}</div>
                          <div className="text-xs text-gray-400">x{item.cantidad}</div>
                        </div>
                        <div className="text-green-400 font-bold">
                          ${(item.precio_unitario * item.cantidad).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between text-xl font-bold text-white mb-3">
                    <span>Total:</span>
                    <span>${currentOrder.total.toFixed(0)}</span>
                  </div>
                  
                  <button
                    onClick={() => setModalState({ type: 'order-review' })}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    Revisar Pedido
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Acciones rápidas toggle */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-white">Acciones Rápidas</h3>
              <button
                onClick={() => setQuickActions(!quickActions)}
                className="text-gray-400 hover:text-white"
              >
                {quickActions ? '🔽' : '🔼'}
              </button>
            </div>
            
            {quickActions && (
              <div className="space-y-2">
                <button
                  onClick={clearCurrentOrder}
                  disabled={items.length === 0}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                >
                  Limpiar Pedido
                </button>
                <button
                  onClick={() => setModalState({ type: 'pizza-selector' })}
                  className="w-full px-3 py-2 bg-red-700 hover:bg-red-600 text-white text-sm rounded transition-colors"
                >
                  Agregar Pizza
                </button>
                <button
                  onClick={() => setModalState({ type: 'extra-selector' })}
                  className="w-full px-3 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded transition-colors"
                >
                  Agregar Extra
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Renderizar modal */}
      {renderModal()}
    </div>
  );
}