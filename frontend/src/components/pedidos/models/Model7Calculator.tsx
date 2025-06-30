import { useState, useEffect, useRef, useMemo } from 'react';
import { usePizzas, useExtras, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente } from '@/types';

interface CalculatorButton {
  id: string;
  label: string;
  shortcut: string;
  type: 'pizza' | 'extra' | 'action' | 'number';
  data?: any;
  color: string;
}

export default function Model7Calculator() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, updateOrderItemQuantity, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [currentInput, setCurrentInput] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [display, setDisplay] = useState('Pizza Pachorra - Listo para pedidos');
  const [customerPhone, setCustomerPhone] = useState('');
  const [mode, setMode] = useState<'pizza' | 'extra' | 'cliente'>('pizza');
  const displayRef = useRef<HTMLDivElement>(null);

  // Configurar botones de calculadora basados en productos más populares
  const calculatorButtons = useMemo((): CalculatorButton[] => {
    const buttons: CalculatorButton[] = [];
    
    if (mode === 'pizza') {
      // Primeras 9 pizzas más populares
      const popularPizzas = pizzas.slice(0, 9);
      popularPizzas.forEach((pizza, index) => {
        buttons.push({
          id: `pizza-${pizza.id}`,
          label: pizza.nombre.substring(0, 12),
          shortcut: (index + 1).toString(),
          type: 'pizza',
          data: pizza,
          color: 'bg-red-600 hover:bg-red-700'
        });
      });
      
      // Rellenar con botones vacíos si hay menos de 9 pizzas
      while (buttons.length < 9) {
        buttons.push({
          id: `empty-${buttons.length}`,
          label: '-',
          shortcut: (buttons.length + 1).toString(),
          type: 'action',
          color: 'bg-gray-600'
        });
      }
    } else if (mode === 'extra') {
      // Primeros 9 extras más populares
      const popularExtras = extras.slice(0, 9);
      popularExtras.forEach((extra, index) => {
        buttons.push({
          id: `extra-${extra.id}`,
          label: extra.nombre.substring(0, 12),
          shortcut: (index + 1).toString(),
          type: 'extra',
          data: extra,
          color: 'bg-green-600 hover:bg-green-700'
        });
      });
      
      // Rellenar con botones vacíos si hay menos de 9 extras
      while (buttons.length < 9) {
        buttons.push({
          id: `empty-${buttons.length}`,
          label: '-',
          shortcut: (buttons.length + 1).toString(),
          type: 'action',
          color: 'bg-gray-600'
        });
      }
    }
    
    // Botones de acción siempre presentes
    const actionButtons: CalculatorButton[] = [
      { id: 'clear', label: 'Limpiar', shortcut: 'C', type: 'action', color: 'bg-red-700 hover:bg-red-800' },
      { id: 'quantity', label: `Cant: ${quantity}`, shortcut: '0', type: 'number', color: 'bg-blue-600 hover:bg-blue-700' },
      { id: 'confirm', label: 'Confirmar', shortcut: '=', type: 'action', color: 'bg-green-700 hover:bg-green-800' }
    ];
    
    return [...buttons, ...actionButtons];
  }, [pizzas, extras, mode, quantity]);

  // Manejar teclas de calculadora
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      const key = e.key.toLowerCase();
      
      // Números 1-9 para productos
      if (key >= '1' && key <= '9') {
        e.preventDefault();
        const index = parseInt(key) - 1;
        const button = calculatorButtons[index];
        if (button && (button.type === 'pizza' || button.type === 'extra')) {
          handleButtonPress(button);
        }
      }
      
      // Teclas especiales
      switch (key) {
        case '0':
          e.preventDefault();
          toggleQuantity();
          break;
        case 'c':
          e.preventDefault();
          handleClear();
          break;
        case 'enter':
        case '=':
          e.preventDefault();
          handleConfirm();
          break;
        case 'p':
          e.preventDefault();
          setMode('pizza');
          setDisplay('Modo: Pizzas');
          break;
        case 'e':
          e.preventDefault();
          setMode('extra');
          setDisplay('Modo: Extras');
          break;
        case 'escape':
          e.preventDefault();
          setCurrentInput('');
          setDisplay('Operación cancelada');
          break;
        case '+':
          e.preventDefault();
          setQuantity(prev => Math.min(prev + 1, 99));
          setDisplay(`Cantidad: ${Math.min(quantity + 1, 99)}`);
          break;
        case '-':
          e.preventDefault();
          setQuantity(prev => Math.max(prev - 1, 1));
          setDisplay(`Cantidad: ${Math.max(quantity - 1, 1)}`);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [calculatorButtons, quantity]);

  const handleButtonPress = (button: CalculatorButton) => {
    switch (button.type) {
      case 'pizza':
        handleAddPizza(button.data);
        break;
      case 'extra':
        handleAddExtra(button.data);
        break;
      case 'action':
        handleAction(button.id);
        break;
      case 'number':
        if (button.id === 'quantity') {
          toggleQuantity();
        }
        break;
    }
  };

  const handleAddPizza = (pizza: Pizza) => {
    for (let i = 0; i < quantity; i++) {
      addItemToOrder(pizza);
    }
    setDisplay(`✓ ${quantity}x ${pizza.nombre} - $${(parseFloat(pizza.precio_base) * quantity).toFixed(0)}`);
    setCurrentInput(`${quantity}x ${pizza.nombre}`);
    
    // Auto-resetear cantidad a 1 después de agregar
    setTimeout(() => setQuantity(1), 1000);
  };

  const handleAddExtra = (extra: Extra) => {
    console.log('Agregando extra:', extra);
    setDisplay(`✓ ${quantity}x ${extra.nombre} - +$${(parseFloat(extra.precio) * quantity).toFixed(0)}`);
    setCurrentInput(`${quantity}x ${extra.nombre}`);
  };

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'clear':
        handleClear();
        break;
      case 'confirm':
        handleConfirm();
        break;
    }
  };

  const handleClear = () => {
    if (currentInput) {
      setCurrentInput('');
      setDisplay('Operación cancelada');
    } else {
      clearCurrentOrder();
      setDisplay('Pedido limpiado');
    }
  };

  const handleConfirm = () => {
    if (items.length === 0) {
      setDisplay('⚠️ Agrega productos al pedido');
      return;
    }
    
    if (!currentOrder.cliente) {
      setDisplay('⚠️ Agrega cliente para confirmar');
      return;
    }
    
    setDisplay(`✅ Pedido confirmado - Total: $${currentOrder.total.toFixed(0)}`);
  };

  const toggleQuantity = () => {
    const newQuantity = quantity >= 9 ? 1 : quantity + 1;
    setQuantity(newQuantity);
    setDisplay(`Cantidad ajustada: ${newQuantity}`);
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
      setDisplay(`✓ Cliente agregado: ${customerPhone}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Layout Tipo Calculadora</h1>
        <div className="text-sm text-gray-400">
          Shortcuts: <kbd className="bg-gray-700 px-1 rounded">1-9</kbd>=Productos •
          <kbd className="bg-gray-700 px-1 rounded mx-1">0</kbd>=Cantidad •
          <kbd className="bg-gray-700 px-1 rounded">C</kbd>=Limpiar •
          <kbd className="bg-gray-700 px-1 rounded mx-1">=</kbd>=Confirmar •
          <kbd className="bg-gray-700 px-1 rounded">P/E</kbd>=Modo •
          <kbd className="bg-gray-700 px-1 rounded mx-1">+/-</kbd>=Ajustar cantidad
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Calculadora Principal */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg p-6">
            
            {/* Display de calculadora */}
            <div className="mb-6">
              <div
                ref={displayRef}
                className="bg-black rounded-lg p-4 text-green-400 font-mono text-xl min-h-[80px] flex items-center"
              >
                <div className="w-full">
                  <div className="text-right text-2xl font-bold mb-1">
                    {currentInput || display}
                  </div>
                  <div className="text-right text-sm opacity-70">
                    {items.length > 0 && `Total: $${currentOrder.total.toFixed(0)}`}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Selector de modo */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => {
                  setMode('pizza');
                  setDisplay('Modo: Pizzas');
                }}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  mode === 'pizza' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:text-white'
                }`}
              >
                🍕 Pizzas (P)
              </button>
              <button
                onClick={() => {
                  setMode('extra');
                  setDisplay('Modo: Extras');
                }}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  mode === 'extra' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:text-white'
                }`}
              >
                ➕ Extras (E)
            </button>
            </div>
            
            {/* Grid de botones 4x3 */}
            <div className="grid grid-cols-3 gap-4">
              {calculatorButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleButtonPress(button)}
                  disabled={button.label === '-'}
                  className={`h-16 rounded-lg font-medium text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${button.color}`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-sm font-bold">{button.shortcut}</div>
                    <div className="text-xs truncate w-full px-1">{button.label}</div>
                    {button.data && (
                      <div className="text-xs text-green-200">
                        ${'precio_base' in button.data ? button.data.precio_base : button.data.precio}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Info adicional */}
            <div className="mt-6 bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Información de Productos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-blue-400 mb-1">Modo Actual: {mode === 'pizza' ? 'Pizzas' : 'Extras'}</h4>
                  <p className="text-gray-300">
                    Presiona 1-9 para agregar productos al pedido
                  </p>
                </div>
                <div>
                  <h4 className="text-green-400 mb-1">Cantidad: {quantity}</h4>
                  <p className="text-gray-300">
                    Presiona 0 para cambiar cantidad, +/- para ajustar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral: Cliente y Ticket */}
        <div className="space-y-6">
          
          {/* Cliente */}
          <div className="bg-gray-800 rounded-lg p-4">
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
              <div className="space-y-3">
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
                  Agregar Cliente
                </button>
              </div>
            )}
          </div>

          {/* Ticket resumido */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">
              Ticket ({items.length})
            </h3>
            
            {items.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <div className="text-4xl mb-2">🧮</div>
                <p className="text-sm">Usa la calculadora para agregar productos</p>
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
                      
                      {/* Controles rápidos */}
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => updateOrderItemQuantity(item.id, item.cantidad + 1)}
                          className="px-1 py-0.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
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
                          className="px-1 py-0.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                        >
                          -
                        </button>
                        <button
                          onClick={() => removeItemFromOrder(item.id)}
                          className="px-1 py-0.5 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total grande */}
                <div className="border-t border-gray-600 pt-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      ${currentOrder.total.toFixed(0)}
                    </div>
                    <button
                      disabled={!currentOrder.cliente_id}
                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
                    >
                      Confirmar (=)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Leyenda de teclas */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-2">Atajos de Teclado</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <div><kbd className="bg-gray-700 px-1 rounded">1-9</kbd> Agregar producto</div>
              <div><kbd className="bg-gray-700 px-1 rounded">0</kbd> Cambiar cantidad</div>
              <div><kbd className="bg-gray-700 px-1 rounded">C</kbd> Limpiar</div>
              <div><kbd className="bg-gray-700 px-1 rounded">=</kbd> Confirmar pedido</div>
              <div><kbd className="bg-gray-700 px-1 rounded">P</kbd> Modo pizzas</div>
              <div><kbd className="bg-gray-700 px-1 rounded">E</kbd> Modo extras</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}