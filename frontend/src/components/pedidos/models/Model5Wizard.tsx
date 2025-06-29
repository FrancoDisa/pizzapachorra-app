import { useState, useEffect, useRef, useCallback } from 'react';
import { usePizzas, useExtras, useClientes, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente } from '@/types';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export default function Model5Wizard() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const clientes = useClientes();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, updateOrderItemQuantity, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPizzas, setSelectedPizzas] = useState<Pizza[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [tempCustomer, setTempCustomer] = useState<Cliente | null>(null);
  const [canAdvance, setCanAdvance] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const customerRef = useRef<HTMLInputElement>(null);

  const steps: WizardStep[] = [
    { id: 1, title: 'Seleccionar Pizzas', description: 'Elige las pizzas para el pedido', icon: '🍕' },
    { id: 2, title: 'Configurar Extras', description: 'Añade extras y personaliza', icon: '➕' },
    { id: 3, title: 'Cliente y Confirmación', description: 'Datos del cliente y finalizar', icon: '✅' }
  ];

  // Verificar si se puede avanzar
  useEffect(() => {
    switch (currentStep) {
      case 1:
        setCanAdvance(selectedPizzas.length > 0);
        break;
      case 2:
        setCanAdvance(true); // Siempre se puede avanzar del paso 2
        break;
      case 3:
        setCanAdvance(!!tempCustomer);
        break;
      default:
        setCanAdvance(false);
    }
  }, [currentStep, selectedPizzas, tempCustomer]);

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          if (currentStep === 1 || currentStep === 2) {
            searchRef.current?.focus();
          } else if (currentStep === 3) {
            customerRef.current?.focus();
          }
          break;
        case 'enter':
          e.preventDefault();
          if (canAdvance) {
            handleNext();
          }
          break;
        case 'backspace':
          e.preventDefault();
          if (currentStep > 1) {
            handlePrevious();
          }
          break;
        case 'escape':
          e.preventDefault();
          setSearchTerm('');
          setCustomerSearch('');
          break;
        case '1':
          e.preventDefault();
          setCurrentStep(1);
          break;
        case '2':
          e.preventDefault();
          if (selectedPizzas.length > 0) setCurrentStep(2);
          break;
        case '3':
          e.preventDefault();
          if (selectedPizzas.length > 0) setCurrentStep(3);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [canAdvance, currentStep, selectedPizzas.length]);

  // Funciones de navegación
  const handleNext = useCallback(() => {
    if (currentStep < 3 && canAdvance) {
      if (currentStep === 2) {
        // Al pasar del paso 2 al 3, añadir productos al carrito
        selectedPizzas.forEach(pizza => addItemToOrder(pizza));
        selectedExtras.forEach(extra => {
          console.log('Agregando extra:', extra);
        });
      }
      setCurrentStep(currentStep + 1);
      setSearchTerm('');
    } else if (currentStep === 3 && canAdvance) {
      // Finalizar pedido
      handleFinishOrder();
    }
  }, [currentStep, canAdvance, selectedPizzas, selectedExtras, addItemToOrder]);

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSearchTerm('');
    }
  };

  const handleFinishOrder = () => {
    if (tempCustomer) {
      setOrderCustomer(tempCustomer);
      // Reset wizard
      setCurrentStep(1);
      setSelectedPizzas([]);
      setSelectedExtras([]);
      setTempCustomer(null);
      setCustomerSearch('');
    }
  };

  // Funciones específicas por paso
  const handlePizzaSelect = (pizza: Pizza) => {
    setSelectedPizzas(prev => {
      const exists = prev.find(p => p.id === pizza.id);
      if (exists) {
        return prev.filter(p => p.id !== pizza.id);
      } else {
        return [...prev, pizza];
      }
    });
  };

  const handleExtraSelect = (extra: Extra) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.id === extra.id);
      if (exists) {
        return prev.filter(e => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const handleCustomerSelect = (customer: Cliente) => {
    setTempCustomer(customer);
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
      setTempCustomer(newCustomer);
    }
  };

  // Filtros por paso
  const filteredPizzas = pizzas.filter(pizza =>
    pizza.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pizza.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExtras = extras.filter(extra =>
    extra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    extra.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = clientes.filter(cliente =>
    cliente.telefono.includes(customerSearch) ||
    (cliente.nombre && cliente.nombre.toLowerCase().includes(customerSearch.toLowerCase()))
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      
      {/* Header del Wizard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Wizard de Pedidos - 3 Pasos</h1>
        <div className="text-sm text-gray-400 mb-6">
          Navegación: <kbd className="bg-gray-700 px-1 rounded">Enter</kbd>=Siguiente •
          <kbd className="bg-gray-700 px-1 rounded mx-1">Backspace</kbd>=Anterior •
          <kbd className="bg-gray-700 px-1 rounded">F</kbd>=Buscar •
          <kbd className="bg-gray-700 px-1 rounded mx-1">1-3</kbd>=Ir a paso
        </div>
        
        {/* Indicador de progreso */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Círculo del paso */}
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                currentStep === step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : currentStep > step.id
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-600 text-gray-400'
              }`}>
                {currentStep > step.id ? '✓' : step.icon}
              </div>
              
              {/* Información del paso */}
              <div className="ml-4">
                <div className={`font-medium ${
                  currentStep === step.id ? 'text-blue-400' : 
                  currentStep > step.id ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
                <div className="text-sm text-gray-500">{step.description}</div>
              </div>
              
              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-8 ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        
        {/* Paso 1: Seleccionar Pizzas */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Paso 1: Seleccionar Pizzas ({selectedPizzas.length} seleccionadas)
            </h2>
            
            {/* Búsqueda */}
            <div className="mb-6 relative">
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

            {/* Pizzas seleccionadas */}
            {selectedPizzas.length > 0 && (
              <div className="mb-6 p-4 bg-green-900/30 border border-green-600/30 rounded-lg">
                <h3 className="text-green-400 font-medium mb-2">Pizzas Seleccionadas:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPizzas.map(pizza => (
                    <span
                      key={pizza.id}
                      className="px-3 py-1 bg-green-600 text-white rounded-full text-sm cursor-pointer hover:bg-green-700 transition-colors"
                      onClick={() => handlePizzaSelect(pizza)}
                    >
                      {pizza.nombre} (${pizza.precio_base}) ✕
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Grid de pizzas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPizzas.map(pizza => (
                <div
                  key={pizza.id}
                  onClick={() => handlePizzaSelect(pizza)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPizzas.find(p => p.id === pizza.id)
                      ? 'border-green-500 bg-green-900/30'
                      : 'border-gray-600 bg-gray-700 hover:border-blue-500 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{pizza.nombre}</h3>
                    <span className="text-green-400 font-bold">${pizza.precio_base}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{pizza.descripcion}</p>
                  
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Configurar Extras */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Paso 2: Configurar Extras ({selectedExtras.length} seleccionados)
            </h2>
            
            {/* Resumen de pizzas */}
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600/30 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2">Pizzas Seleccionadas:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPizzas.map(pizza => (
                  <span key={pizza.id} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                    {pizza.nombre} (${pizza.precio_base})
                  </span>
                ))}
              </div>
            </div>
            
            {/* Búsqueda de extras */}
            <div className="mb-6 relative">
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar extras... (F para focus, opcional)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Extras seleccionados */}
            {selectedExtras.length > 0 && (
              <div className="mb-6 p-4 bg-orange-900/30 border border-orange-600/30 rounded-lg">
                <h3 className="text-orange-400 font-medium mb-2">Extras Seleccionados:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExtras.map(extra => (
                    <span
                      key={extra.id}
                      className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm cursor-pointer hover:bg-orange-700 transition-colors"
                      onClick={() => handleExtraSelect(extra)}
                    >
                      {extra.nombre} (+${extra.precio}) ✕
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Grid de extras */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredExtras.map(extra => (
                <div
                  key={extra.id}
                  onClick={() => handleExtraSelect(extra)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedExtras.find(e => e.id === extra.id)
                      ? 'border-orange-500 bg-orange-900/30'
                      : 'border-gray-600 bg-gray-700 hover:border-blue-500 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{extra.nombre}</h3>
                    <span className="text-green-400 font-bold">+${extra.precio}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{extra.categoria}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Cliente y Confirmación */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Paso 3: Cliente y Confirmación</h2>
            
            {/* Resumen del pedido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              
              {/* Selección de cliente */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Información del Cliente</h3>
                
                {tempCustomer ? (
                  <div className="p-4 bg-green-900/30 border border-green-600/30 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-green-400 font-medium">{tempCustomer.nombre}</div>
                        <div className="text-green-300 text-sm">{tempCustomer.telefono}</div>
                      </div>
                      <button
                        onClick={() => {
                          setTempCustomer(null);
                          setCustomerSearch('');
                        }}
                        className="text-xs text-gray-400 hover:text-white bg-gray-700 px-2 py-1 rounded"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 relative">
                      <input
                        ref={customerRef}
                        type="text"
                        placeholder="Teléfono o nombre del cliente... (F para focus)"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Lista de clientes */}
                    {customerSearch && (
                      <div className="space-y-2 mb-4">
                        {filteredCustomers.length > 0 ? (
                          <>
                            {filteredCustomers.map(customer => (
                              <button
                                key={customer.id}
                                onClick={() => handleCustomerSelect(customer)}
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
              
              {/* Resumen del pedido */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Resumen del Pedido</h3>
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  
                  {/* Pizzas */}
                  <div>
                    <h4 className="text-green-400 font-medium mb-2">Pizzas ({selectedPizzas.length})</h4>
                    {selectedPizzas.map(pizza => (
                      <div key={pizza.id} className="flex justify-between text-sm">
                        <span className="text-white">{pizza.nombre}</span>
                        <span className="text-green-400">${pizza.precio_base}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Extras */}
                  {selectedExtras.length > 0 && (
                    <div>
                      <h4 className="text-orange-400 font-medium mb-2">Extras ({selectedExtras.length})</h4>
                      {selectedExtras.map(extra => (
                        <div key={extra.id} className="flex justify-between text-sm">
                          <span className="text-white">{extra.nombre}</span>
                          <span className="text-green-400">+${extra.precio}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Total estimado */}
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total Estimado:</span>
                      <span className="text-green-400">
                        ${(
                          selectedPizzas.reduce((sum, pizza) => sum + parseFloat(pizza.precio_base), 0) +
                          selectedExtras.reduce((sum, extra) => sum + parseFloat(extra.precio), 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles de navegación */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          ← Anterior (Backspace)
        </button>
        
        <div className="text-center text-gray-400">
          Paso {currentStep} de {steps.length}
        </div>
        
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          {currentStep === 3 ? 'Finalizar Pedido' : 'Siguiente →'} (Enter)
        </button>
      </div>
      
      {/* Ayuda contextual */}
      <div className="mt-4 text-center text-sm text-gray-500">
        {currentStep === 1 && !canAdvance && "Selecciona al menos una pizza para continuar"}
        {currentStep === 3 && !canAdvance && "Selecciona o crea un cliente para finalizar"}
      </div>
    </div>
  );
}