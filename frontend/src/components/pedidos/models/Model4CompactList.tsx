import { useState, useEffect, useRef, useMemo } from 'react';
import { usePizzas, useExtras, useClientes, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente } from '@/types';

export default function Model4CompactList() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const clientes = useClientes();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, updateOrderItemQuantity, removeItemFromOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'pizzas' | 'extras' | 'clientes'>('pizzas');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [quickQuantity, setQuickQuantity] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Datos combinados para tabla unificada
  const allData = useMemo(() => {
    let data: any[] = [];
    
    if (selectedTab === 'pizzas') {
      data = pizzas.map(pizza => ({
        ...pizza,
        type: 'pizza',
        price: parseFloat(pizza.precio_base),
        category: pizza.categoria || 'Sin categoría',
        description: pizza.descripcion
      }));
    } else if (selectedTab === 'extras') {
      data = extras.map(extra => ({
        ...extra,
        type: 'extra',
        price: parseFloat(extra.precio),
        category: extra.categoria,
        description: extra.categoria
      }));
    } else {
      data = clientes.map(cliente => ({
        ...cliente,
        type: 'cliente',
        price: 0,
        category: 'Cliente',
        description: cliente.telefono
      }));
    }
    
    return data;
  }, [pizzas, extras, clientes, selectedTab]);

  // Filtrar y ordenar datos
  const filteredAndSortedData = useMemo(() => {
    let filtered = allData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.nombre.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.id.toString().includes(searchTerm) ||
        (item.telefono && item.telefono.includes(searchTerm))
      );
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.nombre.toLowerCase();
          bVal = b.nombre.toLowerCase();
          break;
        case 'price':
          aVal = a.price || 0;
          bVal = b.price || 0;
          break;
        case 'category':
          aVal = a.category.toLowerCase();
          bVal = b.category.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allData, searchTerm, sortBy, sortOrder]);

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.target !== searchRef.current) return;

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case '1':
          e.preventDefault();
          setSelectedTab('pizzas');
          break;
        case '2':
          e.preventDefault();
          setSelectedTab('extras');
          break;
        case '3':
          e.preventDefault();
          setSelectedTab('clientes');
          break;
        case 'n':
          e.preventDefault();
          setSortBy('name');
          break;
        case 'p':
          e.preventDefault();
          setSortBy('price');
          break;
        case 'c':
          e.preventDefault();
          setSortBy('category');
          break;
        case 's':
          e.preventDefault();
          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
          break;
        case 'a':
          e.preventDefault();
          if (selectedRows.size > 0) {
            handleBulkAdd();
          }
          break;
        case 'escape':
          e.preventDefault();
          setSearchTerm('');
          setSelectedRows(new Set());
          break;
      }

      // Números para cantidad
      if (e.key >= '1' && e.key <= '9' && e.ctrlKey) {
        e.preventDefault();
        setQuickQuantity(parseInt(e.key));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedRows]);

  const handleRowSelect = (id: number, isSelected: boolean) => {
    const newSelected = new Set(selectedRows);
    if (isSelected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredAndSortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredAndSortedData.map(item => item.id)));
    }
  };

  const handleAddItem = (item: any) => {
    if (item.type === 'pizza') {
      for (let i = 0; i < quickQuantity; i++) {
        addItemToOrder(item);
      }
    } else if (item.type === 'extra') {
      console.log('Agregando extra:', item);
    } else if (item.type === 'cliente') {
      setOrderCustomer(item);
    }
  };

  const handleBulkAdd = () => {
    selectedRows.forEach(id => {
      const item = filteredAndSortedData.find(item => item.id === id);
      if (item && item.type !== 'cliente') {
        handleAddItem(item);
      }
    });
    setSelectedRows(new Set());
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Lista Compacta de Alta Densidad</h1>
        <div className="text-sm text-gray-400 mb-4">
          Shortcuts: 
          <kbd className="bg-gray-700 px-1 rounded mx-1">F</kbd>=Buscar
          <kbd className="bg-gray-700 px-1 rounded mx-1">1-3</kbd>=Tabs
          <kbd className="bg-gray-700 px-1 rounded mx-1">N/P/C</kbd>=Ordenar
          <kbd className="bg-gray-700 px-1 rounded mx-1">S</kbd>=Invertir orden
          <kbd className="bg-gray-700 px-1 rounded mx-1">A</kbd>=Agregar seleccionados
          <kbd className="bg-gray-700 px-1 rounded mx-1">Ctrl+1-9</kbd>=Cantidad
        </div>
        
        {/* Controles superiores */}
        <div className="flex gap-4 mb-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar por ID, nombre, descripción o teléfono... (F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Cantidad */}
          <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2">
            <span className="text-gray-300 text-sm">Cant:</span>
            <input
              type="number"
              min="1"
              max="99"
              value={quickQuantity}
              onChange={(e) => setQuickQuantity(parseInt(e.target.value) || 1)}
              className="w-16 bg-gray-700 text-white text-center rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Acciones en lote */}
          {selectedRows.size > 0 && (
            <button
              onClick={handleBulkAdd}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Agregar {selectedRows.size} items (A)
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'pizzas', label: 'Pizzas (1)', count: pizzas.length },
            { key: 'extras', label: 'Extras (2)', count: extras.length },
            { key: 'clientes', label: 'Clientes (3)', count: clientes.length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as any)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                selectedTab === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        
        {/* Tabla principal */}
        <div className="flex-1">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            
            {/* Header de tabla */}
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <div className="flex items-center text-sm font-medium text-gray-300">
                <div className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </div>
                <div className="w-16">ID</div>
                <div className="flex-1 cursor-pointer flex items-center gap-1" onClick={() => setSortBy('name')}>
                  Nombre {getSortIcon('name')} (N)
                </div>
                <div className="w-32 cursor-pointer flex items-center gap-1" onClick={() => setSortBy('category')}>
                  Categoría {getSortIcon('category')} (C)
                </div>
                <div className="w-24 cursor-pointer flex items-center gap-1" onClick={() => setSortBy('price')}>
                  Precio {getSortIcon('price')} (P)
                </div>
                <div className="w-32">Acciones</div>
              </div>
            </div>
            
            {/* Cuerpo de tabla */}
            <div ref={tableRef} className="max-h-96 overflow-y-auto">
              {filteredAndSortedData.map((item, index) => (
                <div
                  key={item.id}
                  className={`px-4 py-2 border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                    selectedRows.has(item.id) ? 'bg-blue-900/30' : ''
                  } ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}
                >
                  <div className="flex items-center text-sm">
                    <div className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(item.id)}
                        onChange={(e) => handleRowSelect(item.id, e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <div className="w-16 text-gray-400 font-mono">#{item.id}</div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{item.nombre}</div>
                      <div className="text-xs text-gray-400 truncate">{item.description}</div>
                    </div>
                    <div className="w-32">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.type === 'pizza' ? 'bg-red-900 text-red-200' :
                        item.type === 'extra' ? 'bg-green-900 text-green-200' :
                        'bg-blue-900 text-blue-200'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <div className="w-24">
                      {item.type !== 'cliente' && (
                        <span className="text-green-400 font-bold">${item.price.toFixed(0)}</span>
                      )}
                    </div>
                    <div className="w-32 flex gap-1">
                      {item.type === 'cliente' ? (
                        <button
                          onClick={() => handleAddItem(item)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                          Seleccionar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAddItem({ ...item, type: item.type })}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                          >
                            +{quickQuantity}
                          </button>
                          <button
                            onClick={() => {
                              const tempQuant = quickQuantity;
                              setQuickQuantity(1);
                              handleAddItem({ ...item, type: item.type });
                              setQuickQuantity(tempQuant);
                            }}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          >
                            +1
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer de tabla */}
            <div className="bg-gray-700 px-4 py-2 text-sm text-gray-300">
              Mostrando {filteredAndSortedData.length} de {allData.length} registros
              {selectedRows.size > 0 && ` • ${selectedRows.size} seleccionados`}
            </div>
          </div>
        </div>

        {/* Panel de ticket lateral compacto */}
        <div className="w-80 bg-gray-800 rounded-lg p-4">
          
          {/* Cliente actual */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Cliente</h3>
            {currentOrder.cliente ? (
              <div className="bg-green-900/30 border border-green-600/30 rounded p-2">
                <div className="text-green-400 text-sm font-medium">{currentOrder.cliente.nombre}</div>
                <div className="text-green-300 text-xs">{currentOrder.cliente.telefono}</div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Sin cliente seleccionado</div>
            )}
          </div>

          {/* Resumen de ticket */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Ticket ({items.length} items)
            </h3>
            
            {items.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">Ticket vacío</div>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-700 rounded p-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <div className="text-white font-medium truncate">{item.pizza?.nombre}</div>
                        <div className="text-xs text-gray-400">x{item.cantidad}</div>
                      </div>
                      <div className="text-green-400 font-bold">
                        ${(item.precio_unitario * item.cantidad).toFixed(0)}
                      </div>
                    </div>
                    
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
            )}
          </div>
          
          {/* Total y acciones */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg font-bold text-white border-t border-gray-600 pt-3">
                <span>Total:</span>
                <span>${currentOrder.total.toFixed(0)}</span>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={clearCurrentOrder}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Limpiar
                </button>
                <button
                  disabled={!currentOrder.cliente_id}
                  className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                >
                  Confirmar Pedido
                </button>
              </div>
              
              {!currentOrder.cliente_id && (
                <p className="text-xs text-yellow-400 text-center">
                  Selecciona un cliente para continuar
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}