import { useState, useEffect, useRef, useMemo } from 'react';
import { usePizzas, useExtras, useClientes, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente } from '@/types';

export default function Model2SplitScreen() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const clientes = useClientes();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, updateOrderItemQuantity, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'todas' | 'clasicas' | 'especiales' | 'veggie' | 'extras'>('todas');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const customerRef = useRef<HTMLInputElement>(null);

  // Categorizar pizzas
  const categorizedPizzas = useMemo(() => {
    const categories = {
      todas: pizzas,
      clasicas: pizzas.filter(p => p.categoria === 'clasica' || p.nombre.toLowerCase().includes('margarita') || p.nombre.toLowerCase().includes('pepperoni')),
      especiales: pizzas.filter(p => p.categoria === 'especial' || p.precio_base > '500'),
      veggie: pizzas.filter(p => p.categoria === 'vegetariana' || p.nombre.toLowerCase().includes('veggie')),
      extras: []
    };
    return categories;
  }, [pizzas]);

  // Filtros
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'extras') {
      return extras.filter(extra => 
        extra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extra.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const categoryProducts = categorizedPizzas[activeCategory as keyof typeof categorizedPizzas];
    return categoryProducts.filter(pizza => 
      pizza.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pizza.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeCategory, searchTerm, categorizedPizzas, extras]);

  // Filtro de clientes
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return clientes.filter(cliente => 
      cliente.telefono.includes(customerSearch) ||
      (cliente.nombre && cliente.nombre.toLowerCase().includes(customerSearch.toLowerCase()))
    ).slice(0, 5);
  }, [customerSearch, clientes]);

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case 'c':
          e.preventDefault();
          customerRef.current?.focus();
          break;
        case '1':
          e.preventDefault();
          setActiveCategory('todas');
          break;
        case '2':
          e.preventDefault();
          setActiveCategory('clasicas');
          break;
        case '3':
          e.preventDefault();
          setActiveCategory('especiales');
          break;
        case '4':
          e.preventDefault();
          setActiveCategory('veggie');
          break;
        case '5':
          e.preventDefault();
          setActiveCategory('extras');
          break;
        case 'escape':
          e.preventDefault();
          setSearchTerm('');
          setCustomerSearch('');
          setShowCustomerDropdown(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleAddProduct = (product: Pizza | Extra) => {
    if ('precio_base' in product) {
      addItemToOrder(product);
    } else {
      console.log('Agregando extra:', product);
    }
  };

  const handleSelectCustomer = (customer: Cliente) => {
    setOrderCustomer(customer);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const handleCreateQuickCustomer = () => {
    if (customerSearch.trim()) {
      const quickCustomer: Cliente = {
        id: Date.now(),
        nombre: customerSearch.includes('@') ? 'Cliente' : customerSearch,
        telefono: customerSearch.includes('@') ? '000000000' : customerSearch,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setOrderCustomer(quickCustomer);
      setCustomerSearch('');
      setShowCustomerDropdown(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      
      {/* Panel Izquierdo: Menú y Productos */}
      <div className="flex-1 bg-gray-800 p-6 overflow-hidden">
        
        {/* Header del Panel Izquierdo */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Command Center</h1>
          <div className="text-sm text-gray-400 mb-4">
            Shortcuts: <kbd className="bg-gray-700 px-1 rounded">F</kbd>=Buscar 
            <kbd className="bg-gray-700 px-1 rounded mx-1">1-5</kbd>=Categorías 
            <kbd className="bg-gray-700 px-1 rounded">C</kbd>=Cliente
          </div>
          
          {/* Búsqueda */}
          <div className="relative">
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar productos... (F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Pestañas de Categorías */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'todas', label: 'Todas (1)', count: pizzas.length },
              { key: 'clasicas', label: 'Clásicas (2)', count: categorizedPizzas.clasicas.length },
              { key: 'especiales', label: 'Especiales (3)', count: categorizedPizzas.especiales.length },
              { key: 'veggie', label: 'Veggie (4)', count: categorizedPizzas.veggie.length },
              { key: 'extras', label: 'Extras (5)', count: extras.length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
                onClick={() => handleAddProduct(product as any)}
              >
                <div className="flex flex-col h-full">
                  {/* Imagen placeholder */}
                  <div className="w-full h-24 bg-gray-600 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-4xl">
                      {'precio_base' in product ? '🍕' : '➕'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1 line-clamp-1">{product.nombre}</h3>
                    {'descripcion' in product ? (
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{product.descripcion}</p>
                    ) : (
                      <p className="text-gray-400 text-sm mb-2">{(product as Extra).categoria}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-green-400 font-bold text-lg">
                      ${'precio_base' in product ? product.precio_base : (product as Extra).precio}
                    </div>
                    <button
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddProduct(product as any);
                      }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg">No se encontraron productos</p>
              <p>Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel Derecho: Ticket y Cliente */}
      <div className="w-96 bg-gray-900 p-6 border-l border-gray-700 flex flex-col">
        
        {/* Cliente */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Cliente (C)</h2>
          
          {currentOrder.cliente ? (
            <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-green-400 font-medium">{currentOrder.cliente.nombre}</div>
                  <div className="text-green-300 text-sm">{currentOrder.cliente.telefono}</div>
                </div>
                <button
                  onClick={() => setOrderCustomer({} as Cliente)}
                  className="text-xs text-gray-400 hover:text-white bg-gray-700 px-2 py-1 rounded"
                >
                  Cambiar
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                ref={customerRef}
                type="text"
                placeholder="Teléfono o nombre del cliente..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(e.target.value.length > 0);
                }}
                onFocus={() => setShowCustomerDropdown(customerSearch.length > 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Dropdown de clientes */}
              {showCustomerDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    <>
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => handleSelectCustomer(customer)}
                          className="w-full text-left p-3 hover:bg-gray-600 transition-colors"
                        >
                          <div className="text-white font-medium">{customer.nombre}</div>
                          <div className="text-gray-400 text-sm">{customer.telefono}</div>
                        </button>
                      ))}
                      <div className="border-t border-gray-600">
                        <button
                          onClick={handleCreateQuickCustomer}
                          className="w-full text-left p-3 hover:bg-gray-600 transition-colors text-blue-400"
                        >
                          + Crear nuevo: "{customerSearch}"
                        </button>
                      </div>
                    </>
                  ) : customerSearch.length > 0 ? (
                    <button
                      onClick={handleCreateQuickCustomer}
                      className="w-full text-left p-3 hover:bg-gray-600 transition-colors text-blue-400"
                    >
                      + Crear cliente: "{customerSearch}"
                    </button>
                  ) : (
                    <div className="p-3 text-gray-400 text-sm">
                      Escribe para buscar clientes...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ticket */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Ticket</h2>
            <div className="text-gray-400 text-sm">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </div>
          </div>
          
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <p>Ticket vacío</p>
                <p className="text-sm">Selecciona productos del menú</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-white font-medium">{item.pizza?.nombre}</div>
                        {item.pizza?.descripcion && (
                          <div className="text-xs text-gray-400 line-clamp-1">{item.pizza.descripcion}</div>
                        )}
                      </div>
                      <div className="text-green-400 font-bold ml-2">
                        ${(item.precio_unitario * item.cantidad).toFixed(0)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (item.cantidad > 1) {
                              updateOrderItemQuantity(item.id, item.cantidad - 1);
                            } else {
                              removeItemFromOrder(item.id);
                            }
                          }}
                          className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-white font-medium">{item.cantidad}</span>
                        <button
                          onClick={() => updateOrderItemQuantity(item.id, item.cantidad + 1)}
                          className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItemFromOrder(item.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total y Acciones */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-white">Total:</span>
                  <span className="text-2xl font-bold text-green-400">${currentOrder.total.toFixed(0)}</span>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={clearCurrentOrder}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Limpiar Todo
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
                    Selecciona un cliente para continuar
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}