import { useState, useEffect, useRef } from 'react';
import { usePizzas, useExtras, useClientes, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente } from '@/types';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'active' | 'completed';
  optional?: boolean;
}

export default function Model10Timeline() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const clientes = useClientes();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, updateOrderItemQuantity, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pizzas' | 'extras'>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Definir pasos del timeline
  const timelineSteps: TimelineStep[] = [
    {
      id: 'pizzas',
      title: 'Seleccionar Pizzas',
      description: 'Elige las pizzas para el pedido',
      icon: '🍕',
      status: 'active'
    },
    {
      id: 'extras',
      title: 'Agregar Extras',
      description: 'Personaliza con ingredientes adicionales',
      icon: '➕',
      status: 'pending',
      optional: true
    },
    {
      id: 'cliente',
      title: 'Información del Cliente',
      description: 'Datos de contacto y entrega',
      icon: '👤',
      status: 'pending'
    },
    {
      id: 'revision',
      title: 'Revisar Pedido',
      description: 'Verificar detalles y cantidades',
      icon: '📋',
      status: 'pending'
    },
    {
      id: 'confirmacion',
      title: 'Confirmar y Enviar',
      description: 'Enviar pedido a cocina',
      icon: '✅',
      status: 'pending'
    }
  ];

  // Actualizar estado de los pasos basado en el progreso
  const [steps, setSteps] = useState(timelineSteps);

  useEffect(() => {
    setSteps(prev => prev.map((step, index) => {
      let status: 'pending' | 'active' | 'completed' = 'pending';
      
      if (index < currentStepIndex) {
        status = 'completed';
      } else if (index === currentStepIndex) {
        status = 'active';
      }
      
      // Lógica específica para determinar si un paso puede considerarse completo
      if (step.id === 'pizzas' && items.length > 0) {
        if (index < currentStepIndex || (index === currentStepIndex && items.length > 0)) {
          status = index === currentStepIndex ? 'active' : 'completed';
        }
      }
      
      if (step.id === 'cliente' && currentOrder.cliente) {
        if (index <= currentStepIndex) {
          status = index === currentStepIndex ? 'active' : 'completed';
        }
      }
      
      return { ...step, status };
    }));
  }, [currentStepIndex, items.length, currentOrder.cliente]);

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'arrowright':
          e.preventDefault();
          handleNextStep();
          break;
        case 'arrowleft':
          e.preventDefault();
          handlePreviousStep();
          break;
        case 'f':
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case '1':
          e.preventDefault();
          setCurrentStepIndex(0);
          break;
        case '2':
          e.preventDefault();
          if (items.length > 0) setCurrentStepIndex(1);
          break;
        case '3':
          e.preventDefault();
          if (items.length > 0) setCurrentStepIndex(2);
          break;
        case '4':
          e.preventDefault();
          if (items.length > 0 && currentOrder.cliente) setCurrentStepIndex(3);
          break;
        case '5':
          e.preventDefault();
          if (items.length > 0 && currentOrder.cliente) setCurrentStepIndex(4);
          break;
        case 'escape':
          e.preventDefault();
          setSearchTerm('');
          setCustomerSearch('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [items.length, currentOrder.cliente]);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      // Validar que se puede avanzar
      const currentStep = steps[currentStepIndex];
      
      if (currentStep.id === 'pizzas' && items.length === 0) {
        alert('Agrega al menos una pizza para continuar');
        return;
      }
      
      if (currentStep.id === 'cliente' && !currentOrder.cliente) {
        alert('Selecciona un cliente para continuar');
        return;
      }
      
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    const step = steps[stepIndex];
    
    // Validar si se puede saltar a este paso
    if (stepIndex > currentStepIndex) {
      if (stepIndex >= 1 && items.length === 0) {
        alert('Agrega productos antes de continuar');
        return;
      }
      if (stepIndex >= 2 && !currentOrder.cliente) {
        alert('Selecciona un cliente antes de continuar');
        return;
      }
    }
    
    setCurrentStepIndex(stepIndex);
  };

  const handleAddProduct = (product: Pizza | Extra) => {
    if ('precio_base' in product) {
      addItemToOrder(product);
    } else {
      console.log('Agregando extra:', product);
    }
  };

  const handleSelectCustomer = (customer: Cliente) => {
    setOrderCustomer(customer);
    setCustomerSearch(`${customer.nombre} - ${customer.telefono}`);
  };

  const handleCreateCustomer = () => {
    if (customerSearch.trim()) {
      const newCustomer: Cliente = {
        id: Date.now(),
        nombre: customerSearch.includes('-') ? customerSearch.split('-')[0].trim() : customerSearch,
        telefono: customerSearch.includes('-') ? customerSearch.split('-')[1]?.trim() || '000000000' : customerSearch,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setOrderCustomer(newCustomer);
    }
  };

  const handleConfirmOrder = () => {
    if (items.length === 0) {
      alert('El pedido está vacío');
      return;
    }
    
    if (!currentOrder.cliente) {
      alert('Selecciona un cliente');
      return;
    }
    
    console.log('Pedido confirmado:', { ...currentOrder, notas: orderNotes });
    alert('¡Pedido enviado a cocina!');
    
    // Reset timeline
    setCurrentStepIndex(0);
    setOrderNotes('');
    setCustomerSearch('');
    clearCurrentOrder();
  };

  // Filtrar productos según categoría y búsqueda
  const getFilteredProducts = () => {
    let products: (Pizza | Extra)[] = [];
    
    if (selectedCategory === 'all' || selectedCategory === 'pizzas') {
      products = [...products, ...pizzas];
    }
    
    if (selectedCategory === 'all' || selectedCategory === 'extras') {
      products = [...products, ...extras];
    }
    
    return products.filter(product =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ('descripcion' in product ? product.descripcion : product.categoria).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredCustomers = clientes.filter(cliente =>
    cliente.telefono.includes(customerSearch) ||
    (cliente.nombre && cliente.nombre.toLowerCase().includes(customerSearch.toLowerCase()))
  ).slice(0, 5);

  const renderStepContent = () => {
    const currentStep = steps[currentStepIndex];
    
    switch (currentStep.id) {
      case 'pizzas':
        return (
          <div className="space-y-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar pizzas... (F para focus)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex bg-gray-700 rounded-lg">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-3 rounded-l-lg transition-colors ${
                    selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedCategory('pizzas')}
                  className={`px-4 py-3 transition-colors ${
                    selectedCategory === 'pizzas' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Pizzas
                </button>
                <button
                  onClick={() => setSelectedCategory('extras')}
                  className={`px-4 py-3 rounded-r-lg transition-colors ${
                    selectedCategory === 'extras' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Extras
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getFilteredProducts().map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 border-2 border-transparent hover:border-blue-500"
                >
                  <div className="text-center mb-3">
                    <div className="text-4xl mb-2">
                      {'precio_base' in product ? '🍕' : '➕'}
                    </div>
                    <h3 className="text-white font-medium">{product.nombre}</h3>
                    <p className="text-gray-400 text-sm">
                      {'descripcion' in product ? product.descripcion : product.categoria}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-bold">
                      ${'precio_base' in product ? product.precio_base : product.precio}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddProduct(product);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'extras':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">➕</div>
              <h2 className="text-2xl font-bold text-white mb-2">Personaliza tu Pedido</h2>
              <p className="text-gray-400">Agrega extras para mejorar tus pizzas (opcional)</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {extras.map((extra) => (
                <button
                  key={extra.id}
                  onClick={() => handleAddProduct(extra)}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all hover:scale-105 text-left"
                >
                  <h4 className="text-white font-medium text-sm">{extra.nombre}</h4>
                  <p className="text-gray-400 text-xs">{extra.categoria}</p>
                  <p className="text-green-400 font-bold text-sm">+${extra.precio}</p>
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setCurrentStepIndex(2)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Continuar sin extras
              </button>
            </div>
          </div>
        );

      case 'cliente':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-6xl mb-4">👤</div>
              <h2 className="text-2xl font-bold text-white mb-2">Información del Cliente</h2>
              <p className="text-gray-400">Busca un cliente existente o crea uno nuevo</p>
            </div>
            
            {currentOrder.cliente ? (
              <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-6 text-center">
                <div className="text-green-400 font-bold text-xl">{currentOrder.cliente.nombre}</div>
                <div className="text-green-300">{currentOrder.cliente.telefono}</div>
                {currentOrder.cliente.direccion && (
                  <div className="text-green-200 text-sm mt-2">{currentOrder.cliente.direccion}</div>
                )}
                <button
                  onClick={() => setOrderCustomer({} as Cliente)}
                  className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Cambiar Cliente
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Buscar cliente por teléfono o nombre..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {customerSearch && (
                  <div className="space-y-2">
                    {filteredCustomers.length > 0 ? (
                      <>
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                          >
                            <div className="text-white font-medium">{customer.nombre}</div>
                            <div className="text-gray-400 text-sm">{customer.telefono}</div>
                          </button>
                        ))}
                        <button
                          onClick={handleCreateCustomer}
                          className="w-full text-left p-3 bg-blue-700 hover:bg-blue-600 rounded transition-colors text-blue-200"
                        >
                          + Crear nuevo: "{customerSearch}"
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleCreateCustomer}
                        className="w-full text-left p-3 bg-blue-700 hover:bg-blue-600 rounded transition-colors text-blue-200"
                      >
                        + Crear cliente: "{customerSearch}"
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'revision':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-white mb-2">Revisar Pedido</h2>
              <p className="text-gray-400">Verifica los detalles antes de enviar a cocina</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información del cliente */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">Cliente</h3>
                {currentOrder.cliente ? (
                  <div>
                    <div className="text-white font-medium">{currentOrder.cliente.nombre}</div>
                    <div className="text-gray-400">{currentOrder.cliente.telefono}</div>
                    {currentOrder.cliente.direccion && (
                      <div className="text-gray-400 text-sm mt-1">{currentOrder.cliente.direccion}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-400">Sin cliente seleccionado</div>
                )}
              </div>
              
              {/* Resumen de productos */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">Productos ({items.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <div className="text-white text-sm">{item.pizza?.nombre}</div>
                        <div className="text-gray-400 text-xs">x{item.cantidad}</div>
                      </div>
                      <div className="text-green-400 font-bold">
                        ${(item.precio_unitario * item.cantidad).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Notas del pedido */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3">Notas del Pedido (Opcional)</h3>
              <textarea
                placeholder="Instrucciones especiales, alergias, etc..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
            
            {/* Total */}
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-white">Total:</span>
                <span className="text-3xl font-bold text-green-400">${currentOrder.total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        );

      case 'confirmacion':
        return (
          <div className="space-y-6 max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-white mb-2">¡Listo para Confirmar!</h2>
            <p className="text-gray-400 text-lg">El pedido será enviado inmediatamente a cocina</p>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white">Cliente:</span>
                  <span className="text-white font-medium">{currentOrder.cliente?.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Items:</span>
                  <span className="text-white font-medium">{items.length} productos</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t border-gray-600 pt-4">
                  <span className="text-white">Total:</span>
                  <span className="text-green-400">${currentOrder.total.toFixed(0)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentStepIndex(3)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                ← Volver a Revisar
              </button>
              <button
                onClick={handleConfirmOrder}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded transition-colors"
              >
                🚀 Confirmar y Enviar
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Timeline de Pedido Horizontal</h1>
        <div className="text-sm text-gray-400">
          Navegación: <kbd className="bg-gray-700 px-1 rounded">←→</kbd>=Navegar pasos •
          <kbd className="bg-gray-700 px-1 rounded mx-1">1-5</kbd>=Ir a paso •
          <kbd className="bg-gray-700 px-1 rounded">F</kbd>=Buscar
        </div>
      </div>

      {/* Timeline horizontal */}
      <div className="mb-8">
        <div
          ref={timelineRef}
          className="relative flex items-center justify-between bg-gray-800 rounded-lg p-6 overflow-x-auto"
        >
          {/* Línea conectora */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-600 -translate-y-1/2">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          {/* Pasos del timeline */}
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative flex flex-col items-center cursor-pointer z-10"
              onClick={() => handleStepClick(index)}
            >
              {/* Círculo del paso */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 transition-all ${
                step.status === 'completed'
                  ? 'bg-green-600 border-green-600 text-white'
                  : step.status === 'active'
                    ? 'bg-blue-600 border-blue-600 text-white animate-pulse'
                    : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}>
                {step.status === 'completed' ? '✓' : step.icon}
              </div>
              
              {/* Información del paso */}
              <div className="mt-3 text-center">
                <div className={`font-medium ${
                  step.status === 'active' ? 'text-blue-400' : 
                  step.status === 'completed' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 max-w-24 mt-1">
                  {step.description}
                </div>
                {step.optional && (
                  <div className="text-xs text-yellow-500 mt-1">Opcional</div>
                )}
              </div>
              
              {/* Número del paso */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="bg-gray-800 rounded-lg p-8 min-h-[500px]">
        {renderStepContent()}
      </div>

      {/* Controles de navegación */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePreviousStep}
          disabled={currentStepIndex === 0}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded transition-colors"
        >
          ← Anterior (←)
        </button>
        
        <div className="text-center">
          <div className="text-white font-medium">
            Paso {currentStepIndex + 1} de {steps.length}
          </div>
          <div className="text-gray-400 text-sm">
            {steps[currentStepIndex].title}
          </div>
        </div>
        
        <button
          onClick={handleNextStep}
          disabled={currentStepIndex === steps.length - 1}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
        >
          Siguiente → (→)
        </button>
      </div>

      {/* Panel lateral con resumen del pedido */}
      <div className="fixed bottom-6 right-6 w-80 bg-gray-800 rounded-lg p-4 shadow-2xl border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">Resumen del Pedido</h3>
        
        {items.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <div className="text-2xl mb-1">📋</div>
            <p className="text-sm">Pedido vacío</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="max-h-32 overflow-y-auto space-y-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-white truncate">{item.pizza?.nombre}</span>
                  <span className="text-green-400 font-medium">
                    x{item.cantidad} ${(item.precio_unitario * item.cantidad).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-600 pt-2">
              <div className="flex justify-between font-bold">
                <span className="text-white">Total:</span>
                <span className="text-green-400">${currentOrder.total.toFixed(0)}</span>
              </div>
            </div>
            
            {currentOrder.cliente && (
              <div className="text-xs text-gray-400">
                Cliente: {currentOrder.cliente.nombre}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}