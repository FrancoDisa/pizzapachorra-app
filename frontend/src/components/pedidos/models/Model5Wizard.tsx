import { useState, useEffect, useRef, useCallback } from 'react';
import { usePizzas, useExtras, useClientes, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente, CurrentOrderItem } from '@/types';

// Demo data for customer search
const DEMO_CLIENTES: Cliente[] = [
  { id: 1, nombre: 'Juan Carlos Pérez', telefono: '099123456', direccion: 'Av. 18 de Julio 1234, Montevideo' },
  { id: 2, nombre: 'María Fernández', telefono: '099234567', direccion: 'Bulevar Artigas 567, Montevideo' },
  { id: 3, nombre: 'Carlos Rodríguez', telefono: '099345678', direccion: 'Mercedes 890, Montevideo' },
  { id: 4, nombre: 'Ana Martínez', telefono: '099456789', direccion: 'Constituyente 1234, Montevideo' },
  { id: 5, nombre: 'Pedro González', telefono: '099567890', direccion: 'Propios 567, Montevideo' },
  { id: 6, nombre: 'Sofía López', telefono: '099678901', direccion: 'Colonia 890, Montevideo' },
  { id: 7, nombre: 'Miguel Torres', telefono: '099789012', direccion: 'Pocitos 1234, Montevideo' },
  { id: 8, nombre: 'Valentina Silva', telefono: '099890123', direccion: 'Cordón 567, Montevideo' }
];

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
  const { addCustomizedItemToOrder, updateCustomizedItemInOrder, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPizzas, setSelectedPizzas] = useState<Pizza[]>([]);
  const [wizardItems, setWizardItems] = useState<CurrentOrderItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [tempCustomer, setTempCustomer] = useState<Cliente | null>(null);
  const [canAdvance, setCanAdvance] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerRef = useRef<HTMLInputElement>(null);

  const steps: WizardStep[] = [
    { id: 1, title: 'Seleccionar Pizzas', description: 'Elige las pizzas para el pedido', icon: '🍕' },
    { id: 2, title: 'Personalizar Pizzas', description: 'Personaliza cada pizza individualmente', icon: '🎨' },
    { id: 3, title: 'Cliente y Confirmación', description: 'Datos del cliente y finalizar', icon: '✅' }
  ];

  // Verificar si se puede avanzar
  useEffect(() => {
    switch (currentStep) {
      case 1:
        setCanAdvance(wizardItems.length > 0);
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
  }, [currentStep, wizardItems, tempCustomer]);

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          if (currentStep === 3) {
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
          setCustomerSearch('');
          break;
        case '1':
          e.preventDefault();
          setCurrentStep(1);
          break;
        case '2':
          e.preventDefault();
          if (wizardItems.length > 0) setCurrentStep(2);
          break;
        case '3':
          e.preventDefault();
          if (wizardItems.length > 0) setCurrentStep(3);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [canAdvance, currentStep, wizardItems.length]);

  // Funciones de navegación
  const handleNext = useCallback(() => {
    if (currentStep < 3 && canAdvance) {
      if (currentStep === 2) {
        // Al pasar del paso 2 al 3, añadir productos del wizard al carrito global
        wizardItems.forEach(item => {
          addCustomizedItemToOrder(item);
        });
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3 && canAdvance) {
      // Finalizar pedido
      handleFinishOrder();
    }
  }, [currentStep, canAdvance, wizardItems, addCustomizedItemToOrder]);

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinishOrder = () => {
    if (tempCustomer) {
      setOrderCustomer(tempCustomer);
      // Reset wizard
      setCurrentStep(1);
      setSelectedPizzas([]);
      setWizardItems([]);
      setTempCustomer(null);
      setCustomerSearch('');
    }
  };

  // Funciones específicas por paso
  const handlePizzaSelect = (pizza: Pizza) => {
    // Simple selection - add pizza with default configuration
    const newItem: CurrentOrderItem = {
      id: Date.now() + Math.random(),
      pizza_id: pizza.id,
      pizza_nombre: pizza.nombre,
      precio_base: Math.round(parseFloat(pizza.precio_base.toString())),
      cantidad: 1,
      es_mitad_y_mitad: false,
      extras: [],
      ingredientes_removidos: [],
      notas: '',
      precio_total: Math.round(parseFloat(pizza.precio_base.toString()))
    };
    
    setWizardItems(prev => [...prev, newItem]);
    
    // Also add to selectedPizzas for display purposes
    setSelectedPizzas(prev => {
      if (!prev.find(p => p.id === pizza.id)) {
        return [...prev, pizza];
      }
      return prev;
    });
  };

  const handleQuantityChange = (itemId: string | number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setWizardItems(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    
    setWizardItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, cantidad: newQuantity, precio_total: item.precio_base * newQuantity }
        : item
    ));
  };


  const handleCustomerSelect = (customer: Cliente) => {
    setTempCustomer(customer);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const handleCreateCustomer = () => {
    setShowCustomerModal(true);
    setShowCustomerDropdown(false);
  };

  const handleCustomerModalConfirm = (customerData: { nombre: string; telefono: string; direccion?: string }) => {
    const newCustomer: Cliente = {
      id: Date.now(),
      nombre: customerData.nombre,
      telefono: customerData.telefono,
      direccion: customerData.direccion,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTempCustomer(newCustomer);
    setShowCustomerModal(false);
    setCustomerSearch('');
  };

  const searchCustomers = (query: string) => {
    if (!query.trim()) return [];
    return DEMO_CLIENTES.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(query.toLowerCase()) ||
      cliente.telefono.includes(query)
    );
  };


  const filteredCustomers = searchCustomers(customerSearch).slice(0, 5);
  const isPhoneSearch = /^[0-9+\-\s]+$/.test(customerSearch.trim());

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      
      {/* Header del Wizard - OPTIMIZADO */}
      <div className="mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">🧙‍♂️</span> Wizard de Pedidos
            </h1>
            <div className="text-sm text-gray-300">
              <kbd className="bg-gray-700 px-2 py-1 rounded mr-1">Enter</kbd> Siguiente •
              <kbd className="bg-gray-700 px-2 py-1 rounded mx-1">Backspace</kbd> Anterior •
              <kbd className="bg-gray-700 px-2 py-1 rounded mx-1">1-3</kbd> Saltar
            </div>
          </div>
        </div>
        
        {/* Indicador de progreso - COMPACTO */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                {/* Círculo del paso - MÁS PEQUEÑO */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all text-sm font-bold ${
                  currentStep === step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : currentStep > step.id
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                
                {/* Información del paso - COMPACTA */}
                <div className="ml-3 flex-1">
                  <div className={`font-medium text-sm ${
                    currentStep === step.id ? 'text-blue-400' : 
                    currentStep > step.id ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  {currentStep === step.id && (
                    <div className="text-xs text-gray-500">{step.description}</div>
                  )}
                </div>
                
                {/* Línea conectora */}
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
        
        {/* Paso 1: Seleccionar Pizzas */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Paso 1: Seleccionar Pizzas ({wizardItems.length} seleccionadas)
            </h2>
            

            {/* Pizzas seleccionadas con controles */}
            {wizardItems.length > 0 && (
              <div className="mb-6 p-4 bg-green-900/30 border border-green-600/30 rounded-lg">
                <h3 className="text-green-400 font-medium mb-3">Pizzas Seleccionadas:</h3>
                <div className="space-y-3">
                  {wizardItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-green-800/50 rounded-lg p-3">
                      <div className="flex-1">
                        <span className="text-white font-medium">{item.pizza_nombre}</span>
                        <div className="text-green-300 text-sm">${item.precio_base} c/u</div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Control de cantidad */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                            className="w-8 h-8 bg-gray-600 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <span className="text-white font-medium w-8 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Precio total */}
                        <div className="text-green-400 font-bold min-w-[60px] text-right">
                          ${item.precio_total}
                        </div>
                        
                        {/* Botón eliminar */}
                        <button
                          onClick={() => setWizardItems(prev => prev.filter(i => i.id !== item.id))}
                          className="w-8 h-8 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-green-600/30">
                  <div className="flex justify-between items-center">
                    <span className="text-green-300">Total Paso 1:</span>
                    <span className="text-green-400 font-bold text-lg">
                      ${wizardItems.reduce((sum, item) => sum + item.precio_total, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Menú de Pizzas - DISEÑO OPTIMIZADO */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <span>📋</span> Menú de Pizzas Disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pizzas.slice(0, 6).map(pizza => (
                  <button
                    key={pizza.id}
                    onClick={() => handlePizzaSelect(pizza)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-left hover:scale-[1.02] ${
                      selectedPizzas.find(p => p.id === pizza.id)
                        ? 'border-green-500 bg-green-900/30 hover:bg-green-900/40'
                        : 'border-gray-600 bg-gray-700/70 hover:border-blue-500 hover:bg-gray-600/90'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-white text-lg">{pizza.nombre}</h3>
                      <span className="text-green-400 font-bold text-xl">${Math.round(parseFloat(pizza.precio_base.toString()))}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 leading-relaxed">{pizza.descripcion}</p>
                    
                    {pizza.ingredientes.length > 0 && (
                      <div className="mb-3">
                        <div className="text-gray-500 text-sm mb-2">
                          <span className="font-medium">Ingredientes:</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {pizza.ingredientes.join(', ')}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="text-center">
                        {selectedPizzas.find(p => p.id === pizza.id) ? (
                          <span className="text-green-400 font-medium flex items-center justify-center gap-1">
                            <span>✓</span> Agregada al Pedido
                          </span>
                        ) : (
                          <span className="text-blue-400 font-medium hover:text-blue-300">
                            + Agregar al Pedido
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Personalizar Pizzas */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Paso 2: Personalizar Cada Pizza
            </h2>
            
            <p className="text-gray-300 mb-6">
              Personaliza cada pizza individualmente: quita ingredientes (-$50 c/u) o agrega extras
            </p>
            
            {/* Personalización por pizza */}
            <div className="space-y-6">
              {wizardItems.map((item, index) => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{item.pizza_nombre}</h3>
                      <p className="text-gray-400">Cantidad: {item.cantidad} | Precio base: ${item.precio_base} c/u</p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">${item.precio_total}</div>
                    </div>
                  </div>
                  
                  {/* Ingredientes incluidos */}
                  <div className="mb-4">
                    <h4 className="text-gray-300 font-medium mb-2">Ingredientes incluidos (click para quitar, -$50 c/u):</h4>
                    <div className="flex flex-wrap gap-2">
                      {pizzas.find(p => p.id === item.pizza_id)?.ingredientes.map((ingrediente, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const isRemoved = item.ingredientes_removidos.includes(ingrediente);
                            const newRemoved = isRemoved 
                              ? item.ingredientes_removidos.filter(i => i !== ingrediente)
                              : [...item.ingredientes_removidos, ingrediente];
                            
                            const discount = newRemoved.length * 50;
                            const newTotal = (item.precio_base - discount + 
                              item.extras.reduce((sum, extra) => sum + parseFloat(extra.precio.toString()), 0)) * item.cantidad;
                            
                            setWizardItems(prev => prev.map(wi => 
                              wi.id === item.id 
                                ? { ...wi, ingredientes_removidos: newRemoved, precio_total: Math.max(0, newTotal) }
                                : wi
                            ));
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            item.ingredientes_removidos.includes(ingrediente)
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                          }`}
                        >
                          {ingrediente} {item.ingredientes_removidos.includes(ingrediente) ? '(QUITADO)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Extras disponibles */}
                  <div className="mb-4">
                    <h4 className="text-gray-300 font-medium mb-2">Agregar extras:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {extras.map(extra => (
                        <button
                          key={extra.id}
                          onClick={() => {
                            const hasExtra = item.extras.find(e => e.id === extra.id);
                            const newExtras = hasExtra
                              ? item.extras.filter(e => e.id !== extra.id)
                              : [...item.extras, extra];
                            
                            const discount = item.ingredientes_removidos.length * 50;
                            const extrasTotal = newExtras.reduce((sum, e) => sum + parseFloat(e.precio.toString()), 0);
                            const newTotal = (item.precio_base - discount + extrasTotal) * item.cantidad;
                            
                            setWizardItems(prev => prev.map(wi => 
                              wi.id === item.id 
                                ? { ...wi, extras: newExtras, precio_total: Math.max(0, newTotal) }
                                : wi
                            ));
                          }}
                          className={`p-2 rounded border text-sm transition-colors ${
                            item.extras.find(e => e.id === extra.id)
                              ? 'border-green-500 bg-green-900/30 text-green-300'
                              : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-blue-500'
                          }`}
                        >
                          <div className="font-medium">{extra.nombre}</div>
                          <div className="text-xs">+${Math.round(parseFloat(extra.precio.toString()))}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Notas especiales */}
                  <div className="mb-4">
                    <h4 className="text-gray-300 font-medium mb-2">Notas especiales:</h4>
                    <textarea
                      value={item.notas || ''}
                      onChange={(e) => {
                        setWizardItems(prev => prev.map(wi => 
                          wi.id === item.id 
                            ? { ...wi, notas: e.target.value }
                            : wi
                        ));
                      }}
                      placeholder="Ej: Poco cocida, extra queso en el borde..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                      rows={2}
                    />
                  </div>
                  
                  {/* Resumen de modificaciones */}
                  {(item.ingredientes_removidos.length > 0 || item.extras.length > 0 || item.notas) && (
                    <div className="bg-gray-700/50 rounded p-3">
                      <h5 className="text-gray-300 font-medium mb-2">Modificaciones:</h5>
                      <div className="text-sm space-y-1">
                        {item.ingredientes_removidos.map((ingrediente, idx) => (
                          <div key={idx} className="text-red-300">➖ Sin {ingrediente} (-$50)</div>
                        ))}
                        {item.extras.map((extra, idx) => (
                          <div key={idx} className="text-green-300">➕ {extra.nombre} (+${Math.round(parseFloat(extra.precio.toString()))})</div>
                        ))}
                        {item.notas && (
                          <div className="text-yellow-300">📝 {item.notas}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Total general */}
            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-600/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-blue-300 text-lg">Total con personalizaciones:</span>
                <span className="text-blue-400 font-bold text-xl">
                  ${wizardItems.reduce((sum, item) => sum + item.precio_total, 0)}
                </span>
              </div>
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
                        {tempCustomer.direccion && (
                          <div className="text-gray-400 text-xs mt-1">{tempCustomer.direccion}</div>
                        )}
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
                  <div className="relative">
                    <input
                      ref={customerRef}
                      type="text"
                      placeholder="Buscar cliente por teléfono o nombre..."
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowCustomerDropdown(customerSearch.length > 0)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    {/* Dropdown de clientes */}
                    {showCustomerDropdown && customerSearch && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {filteredCustomers.map(customer => (
                          <button
                            key={customer.id}
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
                          >
                            <div className="text-white font-medium">{customer.nombre}</div>
                            <div className="text-gray-400 text-sm">{customer.telefono}</div>
                            {customer.direccion && (
                              <div className="text-gray-500 text-xs">{customer.direccion}</div>
                            )}
                          </button>
                        ))}
                        <button
                          onClick={handleCreateCustomer}
                          className="w-full text-left px-4 py-3 bg-blue-700 hover:bg-blue-600 text-blue-200 transition-colors"
                        >
                          <div className="font-medium">+ Crear nuevo cliente</div>
                          <div className="text-sm text-blue-300">{customerSearch}</div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Resumen del pedido */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Resumen del Pedido</h3>
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  
                  {/* Items del pedido actual */}
                  {items.length > 0 ? (
                    <div>
                      <h4 className="text-green-400 font-medium mb-2">Items del Pedido ({items.length})</h4>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div key={item.id} className="bg-gray-600 rounded p-3">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium">{item.pizza_nombre}</span>
                                  <span className="text-gray-400 text-sm">x{item.cantidad}</span>
                                  <button
                                    onClick={() => {
                                      const pizza = pizzas.find(p => p.id === item.pizza_id);
                                      if (pizza) {
                                        setEditingItem(item);
                                        setSelectedPizzaForCustomization(pizza);
                                        setShowCustomizationModal(true);
                                      }
                                    }}
                                    className="text-blue-400 hover:text-blue-300 text-xs bg-gray-700 px-2 py-1 rounded"
                                  >
                                    Editar
                                  </button>
                                </div>
                                
                                {/* Mostrar extras */}
                                {item.extras && item.extras.length > 0 && (
                                  <div className="text-xs text-gray-300 mt-1">
                                    {item.extras.map((extra, index) => (
                                      <span key={index} className="mr-2">
                                        ➕ {extra.nombre} (+${Math.round(parseFloat(extra.precio.toString()))})
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Mostrar ingredientes removidos */}
                                {item.ingredientes_removidos && item.ingredientes_removidos.length > 0 && (
                                  <div className="text-xs text-gray-300 mt-1">
                                    {item.ingredientes_removidos.map((ingrediente, index) => (
                                      <span key={index} className="mr-2">
                                        ➖ Sin {ingrediente} (-$50)
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Notas especiales */}
                                {item.notas && (
                                  <div className="text-xs text-yellow-400 mt-1">
                                    📝 {item.notas}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-green-400 font-bold">${item.precio_total}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Pizzas seleccionadas en wizard */}
                      <div>
                        <h4 className="text-green-400 font-medium mb-2">Pizzas Seleccionadas ({selectedPizzas.length})</h4>
                        {selectedPizzas.map(pizza => (
                          <div key={pizza.id} className="flex justify-between text-sm">
                            <span className="text-white">{pizza.nombre}</span>
                            <span className="text-green-400">${Math.round(parseFloat(pizza.precio_base.toString()))}</span>
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
                              <span className="text-green-400">+${Math.round(parseFloat(extra.precio.toString()))}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Total */}
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total:</span>
                      <span className="text-green-400">
                        ${items.length > 0 
                          ? items.reduce((sum, item) => sum + item.precio_total, 0)
                          : Math.round(
                              selectedPizzas.reduce((sum, pizza) => sum + parseFloat(pizza.precio_base.toString()), 0) +
                              selectedExtras.reduce((sum, extra) => sum + parseFloat(extra.precio.toString()), 0)
                            )
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles de navegación - OPTIMIZADOS */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            <span>←</span> Anterior
            <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Backspace</kbd>
          </button>
          
          <div className="text-center">
            <div className="text-white font-medium text-lg">Paso {currentStep} de {steps.length}</div>
            <div className="text-gray-400 text-sm">{steps[currentStep - 1]?.title}</div>
          </div>
          
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {currentStep === 3 ? (
              <>
                <span>✓</span> Finalizar Pedido
              </>
            ) : (
              <>
                Siguiente <span>→</span>
              </>
            )}
            <kbd className="bg-blue-700 px-2 py-1 rounded text-xs">Enter</kbd>
          </button>
        </div>
        
        {/* Ayuda contextual */}
        {(!canAdvance) && (
          <div className="mt-3 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
            <div className="text-center text-sm text-yellow-300 font-medium">
              {currentStep === 1 && "⚠️ Selecciona al menos una pizza para continuar"}
              {currentStep === 3 && "⚠️ Selecciona o crea un cliente para finalizar"}
            </div>
          </div>
        )}
      </div>


      {/* Customer Creation Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Crear Nuevo Cliente</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCustomerModalConfirm({
                nombre: formData.get('nombre') as string,
                telefono: formData.get('telefono') as string,
                direccion: formData.get('direccion') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nombre *</label>
                  <input
                    name="nombre"
                    type="text"
                    required
                    defaultValue={isPhoneSearch ? '' : customerSearch}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono *</label>
                  <input
                    name="telefono"
                    type="tel"
                    required
                    defaultValue={isPhoneSearch ? customerSearch : ''}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                  <input
                    name="direccion"
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Crear Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}