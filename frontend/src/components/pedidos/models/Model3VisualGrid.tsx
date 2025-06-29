import { useState, useEffect, useRef } from 'react';
import { usePizzas, useExtras, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente } from '@/types';

export default function Model3VisualGrid() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, updateOrderItemQuantity, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'pizzas' | 'extras'>('pizzas');
  const [quickAddQuantity, setQuickAddQuantity] = useState(1);
  const [showTicket, setShowTicket] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Filtrar productos
  const filteredPizzas = pizzas.filter(pizza =>
    pizza.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pizza.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExtras = extras.filter(extra =>
    extra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    extra.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generar colores para categorías
  const getCategoryColor = (category: string) => {
    const colors = {
      'clasica': 'bg-red-500',
      'especial': 'bg-purple-500',
      'vegetariana': 'bg-green-500',
      'veggie': 'bg-green-500',
      'premium': 'bg-yellow-500',
      'tradicional': 'bg-blue-500'
    };
    return colors[category.toLowerCase() as keyof typeof colors] || 'bg-gray-500';
  };

  // Obtener emoji para pizza (simulación)
  const getPizzaEmoji = (name: string) => {
    const emojis = {
      'margarita': '🍕',
      'pepperoni': '🍕',
      'hawaiana': '🍍',
      'veggie': '🥬',
      'mediterranea': '🫒',
      'especial': '⭐',
      'pollo': '🐔',
      'carne': '🥩',
      'queso': '🧀'
    };
    
    const key = Object.keys(emojis).find(k => name.toLowerCase().includes(k));
    return emojis[key as keyof typeof emojis] || '🍕';
  };

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case 'p':
          e.preventDefault();
          setSelectedView('pizzas');
          break;
        case 'e':
          e.preventDefault();
          setSelectedView('extras');
          break;
        case 't':
          e.preventDefault();
          setShowTicket(!showTicket);
          break;
        case '+':
          e.preventDefault();
          setQuickAddQuantity(prev => Math.min(prev + 1, 9));
          break;
        case '-':
          e.preventDefault();
          setQuickAddQuantity(prev => Math.max(prev - 1, 1));
          break;
        case 'escape':
          e.preventDefault();
          setSearchTerm('');
          setShowTicket(false);
          break;
      }

      // Números 1-9 para cantidad
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        setQuickAddQuantity(parseInt(e.key));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showTicket]);

  const handleAddProduct = (product: Pizza | Extra, quantity = quickAddQuantity) => {
    if ('precio_base' in product) {
      for (let i = 0; i < quantity; i++) {
        addItemToOrder(product);
      }
    } else {
      console.log('Agregando extra:', product);
    }
  };

  const handleQuickCustomer = () => {
    if (customerPhone.trim()) {
      const quickCustomer: Cliente = {
        id: Date.now(),
        nombre: `Cliente ${customerPhone}`,
        telefono: customerPhone.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setOrderCustomer(quickCustomer);
      setCustomerPhone('');
    }
  };

  const currentProducts = selectedView === 'pizzas' ? filteredPizzas : filteredExtras;

  return (
    <div className="min-h-screen bg-gray-900 relative">
      
      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Visual Grid Menu</h1>
          
          <div className="flex items-center gap-4">
            {/* Toggle Ticket */}
            <button
              onClick={() => setShowTicket(!showTicket)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showTicket ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Ticket ({items.length}) (T)
            </button>
            
            {/* Cantidad rápida */}
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
              <span className="text-gray-300 text-sm">Cant:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQuickAddQuantity(Math.max(1, quickAddQuantity - 1))}
                  className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-8 text-center text-white font-bold">{quickAddQuantity}</span>
                <button
                  onClick={() => setQuickAddQuantity(Math.min(9, quickAddQuantity + 1))}
                  className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controles */}
        <div className="flex gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar productos... (F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Toggle Pizzas/Extras */}
          <div className="flex bg-gray-700 rounded-lg">
            <button
              onClick={() => setSelectedView('pizzas')}
              className={`px-6 py-2 rounded-l-lg font-medium transition-colors ${
                selectedView === 'pizzas' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Pizzas (P)
            </button>
            <button
              onClick={() => setSelectedView('extras')}
              className={`px-6 py-2 rounded-r-lg font-medium transition-colors ${
                selectedView === 'extras' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Extras (E)
            </button>
          </div>
        </div>
        
        {/* Shortcuts info */}
        <div className="mt-2 text-xs text-gray-400">
          <kbd className="bg-gray-700 px-1 rounded">F</kbd>=Buscar •
          <kbd className="bg-gray-700 px-1 rounded mx-1">P/E</kbd>=Cambiar vista •
          <kbd className="bg-gray-700 px-1 rounded">T</kbd>=Ticket •
          <kbd className="bg-gray-700 px-1 rounded mx-1">1-9</kbd>=Cantidad •
          <kbd className="bg-gray-700 px-1 rounded">+/-</kbd>=Ajustar cantidad
        </div>
      </div>

      <div className="flex">
        {/* Grid Principal */}
        <div className={`transition-all duration-300 ${showTicket ? 'w-2/3' : 'w-full'} p-6`}>
          
          {/* Contador de productos */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white">
              {selectedView === 'pizzas' ? 'Pizzas' : 'Extras'} ({currentProducts.length} productos)
            </h2>
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-blue-500 shadow-lg hover:shadow-xl"
                onClick={() => handleAddProduct(product as any)}
              >
                {/* Imagen/Emoji de producto */}
                <div className="relative h-40 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <div className="text-6xl">
                    {selectedView === 'pizzas' 
                      ? getPizzaEmoji((product as Pizza).nombre)
                      : '➕'
                    }
                  </div>
                  
                  {/* Badge de categoría */}
                  {'categoria' in product && (
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(product.categoria)}`}>
                      {product.categoria}
                    </div>
                  )}
                  
                  {/* Precio destacado */}
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full font-bold">
                    ${'precio_base' in product ? product.precio_base : (product as Extra).precio}
                  </div>
                  
                  {/* Overlay de hover */}
                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                      + Agregar ({quickAddQuantity})
                    </div>
                  </div>
                </div>
                
                {/* Información del producto */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-1 line-clamp-1">{product.nombre}</h3>
                  {'descripcion' in product ? (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{product.descripcion}</p>
                  ) : (
                    <p className="text-gray-400 text-sm mb-3">{(product as Extra).categoria}</p>
                  )}
                  
                  {/* Ingredientes o info extra */}
                  {'ingredientes' in product && product.ingredientes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.ingredientes.slice(0, 3).map((ingrediente, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                          {ingrediente}
                        </span>
                      ))}
                      {product.ingredientes.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                          +{product.ingredientes.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddProduct(product as any, 1);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      +1
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddProduct(product as any, quickAddQuantity);
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      +{quickAddQuantity}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {currentProducts.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="text-8xl mb-4">🔍</div>
              <p className="text-xl mb-2">No se encontraron productos</p>
              <p>Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>

        {/* Panel de Ticket (deslizable) */}
        {showTicket && (
          <div className="w-1/3 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
            
            {/* Cliente rápido */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">Cliente</h3>
              {currentOrder.cliente ? (
                <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-3">
                  <div className="text-green-400 font-medium">{currentOrder.cliente.nombre}</div>
                  <div className="text-green-300 text-sm">{currentOrder.cliente.telefono}</div>
                  <button
                    onClick={() => setOrderCustomer({} as Cliente)}
                    className="mt-2 text-xs text-gray-400 hover:text-white"
                  >
                    Cambiar cliente
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="tel"
                    placeholder="Teléfono del cliente..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleQuickCustomer}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Confirmar Cliente
                  </button>
                </div>
              )}
            </div>

            {/* Ticket */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">
                Ticket ({items.length} items)
              </h3>
              
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📋</div>
                  <p>Ticket vacío</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="text-white font-medium">{item.pizza?.nombre}</div>
                            <div className="text-xs text-gray-400">Cantidad: {item.cantidad}</div>
                          </div>
                          <div className="text-green-400 font-bold">
                            ${(item.precio_unitario * item.cantidad).toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
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
                          <button
                            onClick={() => removeItemFromOrder(item.id)}
                            className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total */}
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between text-xl font-bold text-white mb-4">
                      <span>Total:</span>
                      <span>${currentOrder.total.toFixed(2)}</span>
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
                        Agrega un cliente para continuar
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}