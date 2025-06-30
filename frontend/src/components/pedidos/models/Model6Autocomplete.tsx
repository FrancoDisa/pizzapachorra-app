import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePizzas, useExtras, useClientes, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente } from '@/types';

interface SearchResult {
  id: number;
  type: 'pizza' | 'extra' | 'cliente' | 'combo';
  title: string;
  subtitle: string;
  price?: string;
  data: any;
  searchScore: number;
}

export default function Model6Autocomplete() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const clientes = useClientes();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, setOrderCustomer, clearCurrentOrder } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [commandMode, setCommandMode] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Comandos especiales
  const commands = [
    { command: '/limpiar', description: 'Limpiar pedido actual', action: () => clearCurrentOrder() },
    { command: '/total', description: 'Mostrar total actual', action: () => alert(`Total: $${currentOrder.total.toFixed(0)}`) },
    { command: '/cliente', description: 'Buscar solo clientes', action: () => setSearchTerm('cliente:') },
    { command: '/pizza', description: 'Buscar solo pizzas', action: () => setSearchTerm('pizza:') },
    { command: '/extra', description: 'Buscar solo extras', action: () => setSearchTerm('extra:') },
  ];

  // Función de scoring para búsqueda inteligente
  const calculateSearchScore = useCallback((item: any, term: string, type: string): number => {
    const searchLower = term.toLowerCase();
    let score = 0;
    
    // Coincidencia exacta en nombre (peso alto)
    if (item.nombre.toLowerCase() === searchLower) score += 100;
    
    // Coincidencia al inicio del nombre (peso alto)
    if (item.nombre.toLowerCase().startsWith(searchLower)) score += 80;
    
    // Coincidencia en cualquier parte del nombre (peso medio)
    if (item.nombre.toLowerCase().includes(searchLower)) score += 50;
    
    // Coincidencia en descripción/categoría (peso bajo)
    if (item.descripcion?.toLowerCase().includes(searchLower)) score += 20;
    if (item.categoria?.toLowerCase().includes(searchLower)) score += 20;
    if (item.telefono?.includes(searchLower)) score += 30;
    
    // Coincidencia en ID (peso muy bajo)
    if (item.id.toString().includes(term)) score += 10;
    
    // Bonus por tipo según contexto
    if (type === 'pizza' && items.length === 0) score += 15; // Priorizar pizzas si no hay nada
    if (type === 'cliente' && items.length > 0 && !currentOrder.cliente) score += 25; // Priorizar cliente si hay items
    
    return score;
  }, [items.length, currentOrder.cliente]);

  // Generar resultados de búsqueda inteligente
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchTerm || searchTerm.length < 1) return [];
    
    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];
    
    // Detectar filtros especiales
    const isPizzaFilter = term.startsWith('pizza:');
    const isExtraFilter = term.startsWith('extra:');
    const isClienteFilter = term.startsWith('cliente:');
    const actualTerm = isPizzaFilter || isExtraFilter || isClienteFilter 
      ? term.split(':')[1]?.trim() || '' 
      : term;
    
    if (!actualTerm && (isPizzaFilter || isExtraFilter || isClienteFilter)) {
      // Mostrar todos los items del tipo filtrado
      if (isPizzaFilter) {
        pizzas.forEach(pizza => {
          results.push({
            id: pizza.id,
            type: 'pizza',
            title: pizza.nombre,
            subtitle: pizza.descripcion,
            price: `$${pizza.precio_base}`,
            data: pizza,
            searchScore: 100
          });
        });
      } else if (isExtraFilter) {
        extras.forEach(extra => {
          results.push({
            id: extra.id,
            type: 'extra',
            title: extra.nombre,
            subtitle: extra.categoria,
            price: `+$${extra.precio}`,
            data: extra,
            searchScore: 100
          });
        });
      } else if (isClienteFilter) {
        clientes.forEach(cliente => {
          results.push({
            id: cliente.id,
            type: 'cliente',
            title: cliente.nombre,
            subtitle: cliente.telefono,
            data: cliente,
            searchScore: 100
          });
        });
      }
      return results.slice(0, 8);
    }
    
    if (actualTerm.length < 1) return [];
    
    // Buscar pizzas
    if (!isExtraFilter && !isClienteFilter) {
      pizzas.forEach(pizza => {
        const score = calculateSearchScore(pizza, actualTerm, 'pizza');
        if (score > 0) {
          results.push({
            id: pizza.id,
            type: 'pizza',
            title: pizza.nombre,
            subtitle: pizza.descripcion,
            price: `$${pizza.precio_base}`,
            data: pizza,
            searchScore: score
          });
        }
      });
    }
    
    // Buscar extras
    if (!isPizzaFilter && !isClienteFilter) {
      extras.forEach(extra => {
        const score = calculateSearchScore(extra, actualTerm, 'extra');
        if (score > 0) {
          results.push({
            id: extra.id,
            type: 'extra',
            title: extra.nombre,
            subtitle: extra.categoria,
            price: `+$${extra.precio}`,
            data: extra,
            searchScore: score
          });
        }
      });
    }
    
    // Buscar clientes
    if (!isPizzaFilter && !isExtraFilter) {
      clientes.forEach(cliente => {
        const score = calculateSearchScore(cliente, actualTerm, 'cliente');
        if (score > 0) {
          results.push({
            id: cliente.id,
            type: 'cliente',
            title: cliente.nombre,
            subtitle: cliente.telefono,
            data: cliente,
            searchScore: score
          });
        }
      });
    }
    
    // Ordenar por score y limitar resultados
    return results
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, 8);
  }, [searchTerm, pizzas, extras, clientes, calculateSearchScore]);

  // Manejar navegación con teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target !== searchRef.current) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            Math.min(prev + 1, Math.max(searchResults.length - 1, commands.length - 1))
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          handleSelectResult();
          break;
        case 'Escape':
          e.preventDefault();
          setSearchTerm('');
          setShowSuggestions(false);
          setSelectedIndex(0);
          break;
        case 'Tab':
          e.preventDefault();
          if (searchResults.length > 0) {
            const result = searchResults[selectedIndex];
            if (result) {
              setSearchTerm(result.title + ' ');
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [searchResults, selectedIndex]);

  // Mostrar/ocultar sugerencias
  useEffect(() => {
    const shouldShow = searchTerm.length > 0 && (searchResults.length > 0 || searchTerm.startsWith('/'));
    setShowSuggestions(shouldShow);
    setSelectedIndex(0);
  }, [searchTerm, searchResults]);

  // Auto-focus en el input
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handleSelectResult = () => {
    // Comandos especiales
    if (searchTerm.startsWith('/')) {
      const command = commands.find(cmd => cmd.command === searchTerm);
      if (command) {
        command.action();
        setSearchTerm('');
        addToRecentSearches(searchTerm);
        return;
      }
    }
    
    if (searchResults.length === 0) return;
    
    const result = searchResults[selectedIndex];
    if (!result) return;
    
    switch (result.type) {
      case 'pizza':
        addItemToOrder(result.data);
        break;
      case 'extra':
        console.log('Agregando extra:', result.data);
        break;
      case 'cliente':
        setOrderCustomer(result.data);
        break;
    }
    
    addToRecentSearches(result.title);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const addToRecentSearches = (term: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== term);
      return [term, ...filtered].slice(0, 5);
    });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'pizza': return '🍕';
      case 'extra': return '➕';
      case 'cliente': return '👤';
      case 'combo': return '📦';
      default: return '📄';
    }
  };

  const getResultBadgeColor = (type: string) => {
    switch (type) {
      case 'pizza': return 'bg-red-600';
      case 'extra': return 'bg-green-600';
      case 'cliente': return 'bg-blue-600';
      case 'combo': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'pizza':
        setSearchTerm('pizza: ');
        break;
      case 'extra':
        setSearchTerm('extra: ');
        break;
      case 'cliente':
        setSearchTerm('cliente: ');
        break;
      case 'clear':
        setSearchTerm('');
        setShowSuggestions(false);
        break;
    }
    searchRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Búsqueda Inteligente Universal</h1>
        <p className="text-gray-400 mb-4">
          Escribe para buscar pizzas, extras, clientes o usar comandos. 
          Usa <kbd className="bg-gray-700 px-1 rounded">↑↓</kbd> para navegar, 
          <kbd className="bg-gray-700 px-1 rounded mx-1">Enter</kbd> para seleccionar,
          <kbd className="bg-gray-700 px-1 rounded">Tab</kbd> para autocompletar
        </p>
        
        {/* Acciones rápidas */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleQuickAction('pizza')}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            🍕 Pizzas
          </button>
          <button
            onClick={() => handleQuickAction('extra')}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
          >
            ➕ Extras
          </button>
          <button
            onClick={() => handleQuickAction('cliente')}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            👤 Clientes
          </button>
          <button
            onClick={() => handleQuickAction('clear')}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
          >
            ✕ Limpiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel principal de búsqueda */}
        <div className="lg:col-span-2">
          
          {/* Input de búsqueda principal */}
          <div className="relative mb-6">
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                placeholder="Escribe para buscar... (pizza:, extra:, cliente:, /comando)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-12 bg-gray-800 border-2 border-gray-600 rounded-xl text-white text-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
              <svg className="absolute left-4 top-4 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => handleQuickAction('clear')}
                  className="absolute right-4 top-4 h-6 w-6 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Sugerencias de búsqueda */}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute z-20 w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
              >
                {/* Comandos especiales */}
                {searchTerm.startsWith('/') && (
                  <div>
                    <div className="px-4 py-2 text-xs text-gray-400 bg-gray-700 border-b border-gray-600">
                      Comandos Especiales
                    </div>
                    {commands
                      .filter(cmd => cmd.command.includes(searchTerm))
                      .map((command, index) => (
                        <div
                          key={command.command}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            index === selectedIndex ? 'bg-blue-600' : 'hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            setSearchTerm(command.command);
                            handleSelectResult();
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">⚡</span>
                            <div>
                              <div className="text-white font-medium">{command.command}</div>
                              <div className="text-gray-400 text-sm">{command.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                
                {/* Resultados de búsqueda */}
                {!searchTerm.startsWith('/') && searchResults.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedIndex(index);
                      handleSelectResult();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getResultIcon(result.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{result.title}</span>
                          <span className={`px-2 py-0.5 rounded text-xs text-white ${getResultBadgeColor(result.type)}`}>
                            {result.type}
                          </span>
                          {result.price && (
                            <span className="text-green-400 font-bold">{result.price}</span>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm line-clamp-1">{result.subtitle}</div>
                      </div>
                      <div className="text-gray-500 text-xs">
                        Score: {result.searchScore}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Sin resultados */}
                {!searchTerm.startsWith('/') && searchResults.length === 0 && searchTerm.length > 0 && (
                  <div className="px-4 py-6 text-center text-gray-400">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>No se encontraron resultados para "{searchTerm}"</p>
                    <p className="text-sm mt-1">Intenta con: "pizza:", "extra:", "cliente:" o un comando "/"</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Búsquedas recientes */}
          {recentSearches.length > 0 && !showSuggestions && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">Búsquedas Recientes</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchTerm(search)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full text-sm transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Tips de búsqueda */}
          {!showSuggestions && searchTerm.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">💡 Tips de Búsqueda</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-blue-400 font-medium mb-2">Filtros Específicos:</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li><code className="bg-gray-700 px-1 rounded">pizza:</code> Solo pizzas</li>
                    <li><code className="bg-gray-700 px-1 rounded">extra:</code> Solo extras</li>
                    <li><code className="bg-gray-700 px-1 rounded">cliente:</code> Solo clientes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-green-400 font-medium mb-2">Comandos Especiales:</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li><code className="bg-gray-700 px-1 rounded">/limpiar</code> Limpiar pedido</li>
                    <li><code className="bg-gray-700 px-1 rounded">/total</code> Ver total</li>
                    <li><code className="bg-gray-700 px-1 rounded">/cliente</code> Buscar clientes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral: Ticket */}
        <div className="bg-gray-800 rounded-lg p-6">
          
          {/* Cliente actual */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Cliente</h3>
            {currentOrder.cliente ? (
              <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-3">
                <div className="text-green-400 font-medium">{currentOrder.cliente.nombre}</div>
                <div className="text-green-300 text-sm">{currentOrder.cliente.telefono}</div>
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-3 text-center text-gray-400">
                Sin cliente seleccionado
                <div className="text-xs mt-1">Busca "cliente:" o por teléfono</div>
              </div>
            )}
          </div>

          {/* Ticket */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">
              Ticket ({items.length} items)
            </h3>
            
            {items.length === 0 ? (
              <div className="bg-gray-700 rounded-lg p-6 text-center text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p>Ticket vacío</p>
                <p className="text-sm">Busca y agrega productos</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-white font-medium">{item.pizza?.nombre}</div>
                          <div className="text-xs text-gray-400">Cantidad: {item.cantidad}</div>
                        </div>
                        <div className="text-green-400 font-bold">
                          ${(item.precio_unitario * item.cantidad).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between text-xl font-bold text-white mb-4">
                    <span>Total:</span>
                    <span>${currentOrder.total.toFixed(0)}</span>
                  </div>
                  
                  <button
                    disabled={!currentOrder.cliente_id}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
                  >
                    Confirmar Pedido
                  </button>
                  
                  {!currentOrder.cliente_id && (
                    <p className="text-xs text-yellow-400 mt-2 text-center">
                      Busca y selecciona un cliente para continuar
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}