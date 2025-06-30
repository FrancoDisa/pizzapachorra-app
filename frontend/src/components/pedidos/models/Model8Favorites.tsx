import { useState, useEffect, useRef } from 'react';
import { usePizzas, useExtras, useCurrentOrder, useCurrentOrderItems, useAppStore } from '@/stores';
import type { Pizza, Extra, Cliente } from '@/types';

interface FavoriteSlot {
  id: string;
  position: number;
  shortcut: string;
  item?: Pizza | Extra;
  label?: string;
  customColor?: string;
}

interface FavoriteCombo {
  id: string;
  name: string;
  items: (Pizza | Extra)[];
  price: number;
  position: number;
}

export default function Model8Favorites() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const currentOrder = useCurrentOrder();
  const items = useCurrentOrderItems();
  const { addItemToOrder, clearCurrentOrder, setOrderCustomer } = useAppStore();
  
  const [editMode, setEditMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteSlots, setFavoriteSlots] = useState<FavoriteSlot[]>([]);
  const [favoriteCombos, setFavoriteCombos] = useState<FavoriteCombo[]>([]);
  const [showComboBuilder, setShowComboBuilder] = useState(false);
  const [newCombo, setNewCombo] = useState<{ name: string; items: (Pizza | Extra)[] }>({ name: '', items: [] });
  
  // Inicializar slots favoritos
  useEffect(() => {
    const savedSlots = localStorage.getItem('pizza-pachorra-favorites');
    if (savedSlots) {
      setFavoriteSlots(JSON.parse(savedSlots));
    } else {
      // Configuración inicial con productos más populares
      const initialSlots: FavoriteSlot[] = [];
      
      // F1-F12 para pizzas más vendidas
      for (let i = 0; i < 12; i++) {
        const pizza = pizzas[i];
        initialSlots.push({
          id: `f${i + 1}`,
          position: i,
          shortcut: `F${i + 1}`,
          item: pizza,
          label: pizza?.nombre || 'Vacío',
          customColor: pizza ? 'bg-red-600' : 'bg-gray-600'
        });
      }
      
      // Ctrl+1-9 para extras populares
      for (let i = 0; i < 9; i++) {
        const extra = extras[i];
        initialSlots.push({
          id: `ctrl${i + 1}`,
          position: i + 12,
          shortcut: `Ctrl+${i + 1}`,
          item: extra,
          label: extra?.nombre || 'Vacío',
          customColor: extra ? 'bg-green-600' : 'bg-gray-600'
        });
      }
      
      setFavoriteSlots(initialSlots);
    }
  }, [pizzas, extras]);

  // Inicializar combos favoritos
  useEffect(() => {
    const savedCombos = localStorage.getItem('pizza-pachorra-combos');
    if (savedCombos) {
      setFavoriteCombos(JSON.parse(savedCombos));
    } else {
      // Combos predeterminados populares
      const defaultCombos: FavoriteCombo[] = [
        {
          id: 'combo1',
          name: 'Combo Familiar',
          items: [pizzas[0], pizzas[1], extras[0]].filter(Boolean),
          price: 0,
          position: 0
        },
        {
          id: 'combo2',
          name: 'Combo Pareja',
          items: [pizzas[0], extras[1]].filter(Boolean),
          price: 0,
          position: 1
        }
      ];
      
      // Calcular precios de combos
      defaultCombos.forEach(combo => {
        combo.price = combo.items.reduce((sum, item) => {
          return sum + parseFloat('precio_base' in item ? item.precio_base : item.precio || '0');
        }, 0);
      });
      
      setFavoriteCombos(defaultCombos);
    }
  }, [pizzas, extras]);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (favoriteSlots.length > 0) {
      localStorage.setItem('pizza-pachorra-favorites', JSON.stringify(favoriteSlots));
    }
  }, [favoriteSlots]);

  useEffect(() => {
    if (favoriteCombos.length > 0) {
      localStorage.setItem('pizza-pachorra-combos', JSON.stringify(favoriteCombos));
    }
  }, [favoriteCombos]);

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      // F1-F12 para favoritos
      if (e.key.startsWith('F') && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const fKey = e.key;
        const slot = favoriteSlots.find(s => s.shortcut === fKey);
        if (slot?.item) {
          handleAddFavorite(slot);
        }
        return;
      }

      // Ctrl+1-9 para extras favoritos
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const shortcut = `Ctrl+${e.key}`;
        const slot = favoriteSlots.find(s => s.shortcut === shortcut);
        if (slot?.item) {
          handleAddFavorite(slot);
        }
        return;
      }

      // Otras teclas
      switch (e.key.toLowerCase()) {
        case 'e':
          e.preventDefault();
          setEditMode(!editMode);
          break;
        case 'c':
          e.preventDefault();
          setShowComboBuilder(true);
          break;
        case 'escape':
          e.preventDefault();
          setEditMode(false);
          setShowProductPicker(false);
          setShowComboBuilder(false);
          setSelectedSlot(null);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [favoriteSlots, editMode]);

  const handleAddFavorite = (slot: FavoriteSlot) => {
    if (!slot.item) return;
    
    if ('precio_base' in slot.item) {
      addItemToOrder(slot.item);
    } else {
      console.log('Agregando extra:', slot.item);
    }
  };

  const handleEditSlot = (slotId: string) => {
    setSelectedSlot(slotId);
    setShowProductPicker(true);
  };

  const handleAssignProduct = (product: Pizza | Extra) => {
    if (!selectedSlot) return;
    
    setFavoriteSlots(prev => prev.map(slot => 
      slot.id === selectedSlot 
        ? { 
            ...slot, 
            item: product, 
            label: product.nombre,
            customColor: 'precio_base' in product ? 'bg-red-600' : 'bg-green-600'
          }
        : slot
    ));
    
    setShowProductPicker(false);
    setSelectedSlot(null);
  };

  const handleRemoveFromSlot = (slotId: string) => {
    setFavoriteSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, item: undefined, label: 'Vacío', customColor: 'bg-gray-600' }
        : slot
    ));
  };

  const handleAddCombo = (combo: FavoriteCombo) => {
    combo.items.forEach(item => {
      if ('precio_base' in item) {
        addItemToOrder(item);
      } else {
        console.log('Agregando extra del combo:', item);
      }
    });
  };

  const handleCreateCombo = () => {
    if (newCombo.name && newCombo.items.length > 0) {
      const combo: FavoriteCombo = {
        id: `combo-${Date.now()}`,
        name: newCombo.name,
        items: newCombo.items,
        price: newCombo.items.reduce((sum, item) => {
          return sum + parseFloat('precio_base' in item ? item.precio_base : item.precio || '0');
        }, 0),
        position: favoriteCombos.length
      };
      
      setFavoriteCombos(prev => [...prev, combo]);
      setNewCombo({ name: '', items: [] });
      setShowComboBuilder(false);
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

  const filteredProducts = [...pizzas, ...extras].filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-white">Dashboard de Favoritos Personalizables</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                editMode 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:text-white'
              }`}
            >
              {editMode ? '✏️ Editando' : '⚙️ Editar'} (E)
            </button>
            <button
              onClick={() => setShowComboBuilder(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
            >
              + Crear Combo (C)
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Shortcuts: <kbd className="bg-gray-700 px-1 rounded">F1-F12</kbd>=Pizzas favoritas •
          <kbd className="bg-gray-700 px-1 rounded mx-1">Ctrl+1-9</kbd>=Extras favoritos •
          <kbd className="bg-gray-700 px-1 rounded">E</kbd>=Editar •
          <kbd className="bg-gray-700 px-1 rounded mx-1">C</kbd>=Crear combo
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Panel principal de favoritos */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Pizzas Favoritas (F1-F12) */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">🍕 Pizzas Favoritas (F1-F12)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {favoriteSlots.filter(slot => slot.shortcut.startsWith('F')).map((slot) => (
                <div
                  key={slot.id}
                  className={`relative group ${slot.customColor} rounded-lg p-3 transition-all cursor-pointer hover:scale-105 ${
                    editMode ? 'ring-2 ring-orange-500' : ''
                  }`}
                  onClick={() => editMode ? handleEditSlot(slot.id) : handleAddFavorite(slot)}
                >
                  <div className="text-center text-white">
                    <div className="text-xs font-bold mb-1">{slot.shortcut}</div>
                    <div className="text-sm font-medium truncate">{slot.label}</div>
                    {slot.item && 'precio_base' in slot.item && (
                      <div className="text-xs text-green-200">${slot.item.precio_base}</div>
                    )}
                  </div>
                  
                  {editMode && (
                    <div className="absolute top-1 right-1 flex gap-1">
                      {slot.item && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromSlot(slot.id);
                          }}
                          className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white text-xs rounded flex items-center justify-center"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Extras Favoritos (Ctrl+1-9) */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">➕ Extras Favoritos (Ctrl+1-9)</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-3">
              {favoriteSlots.filter(slot => slot.shortcut.startsWith('Ctrl')).map((slot) => (
                <div
                  key={slot.id}
                  className={`relative group ${slot.customColor} rounded-lg p-3 transition-all cursor-pointer hover:scale-105 ${
                    editMode ? 'ring-2 ring-orange-500' : ''
                  }`}
                  onClick={() => editMode ? handleEditSlot(slot.id) : handleAddFavorite(slot)}
                >
                  <div className="text-center text-white">
                    <div className="text-xs font-bold mb-1">{slot.shortcut.replace('Ctrl+', 'C')}</div>
                    <div className="text-sm font-medium truncate">{slot.label}</div>
                    {slot.item && !('precio_base' in slot.item) && (
                      <div className="text-xs text-green-200">+${slot.item.precio}</div>
                    )}
                  </div>
                  
                  {editMode && (
                    <div className="absolute top-1 right-1">
                      {slot.item && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromSlot(slot.id);
                          }}
                          className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white text-xs rounded flex items-center justify-center"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Combos Favoritos */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">📦 Combos Personalizados</h2>
            {favoriteCombos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📦</div>
                <p>No hay combos creados</p>
                <p className="text-sm">Presiona "Crear Combo" para empezar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteCombos.map((combo) => (
                  <div
                    key={combo.id}
                    className="bg-purple-700 hover:bg-purple-600 rounded-lg p-4 cursor-pointer transition-all hover:scale-105"
                    onClick={() => handleAddCombo(combo)}
                  >
                    <div className="text-white">
                      <h3 className="font-bold mb-2">{combo.name}</h3>
                      <div className="text-sm space-y-1 mb-3">
                        {combo.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="truncate">{item.nombre}</span>
                            <span className="text-green-200">
                              ${'precio_base' in item ? item.precio_base : item.precio}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-purple-500 pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-green-300">${combo.price.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {editMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavoriteCombos(prev => prev.filter(c => c.id !== combo.id));
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white text-xs rounded flex items-center justify-center"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          
          {/* Cliente */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">Cliente</h3>
            {currentOrder.cliente ? (
              <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-3">
                <div className="text-green-400 font-medium">{currentOrder.cliente.nombre}</div>
                <div className="text-green-300 text-sm">{currentOrder.cliente.telefono}</div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="tel"
                  placeholder="Teléfono..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleQuickCustomer}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Agregar
                </button>
              </div>
            )}
          </div>

          {/* Ticket */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">
              Ticket ({items.length} items)
            </h3>
            
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">⭐</div>
                <p>Usa tus favoritos</p>
                <p className="text-sm">F1-F12 o Ctrl+1-9</p>
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
                  
                  <div className="space-y-2">
                    <button
                      onClick={clearCurrentOrder}
                      className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      Limpiar
                    </button>
                    <button
                      disabled={!currentOrder.cliente_id}
                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Selector de productos */}
      {showProductPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Seleccionar Producto</h3>
              <button
                onClick={() => setShowProductPicker(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 mb-4 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAssignProduct(product)}
                  className="text-left p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  <div className="text-white font-medium">{product.nombre}</div>
                  <div className="text-sm text-gray-400">
                    {'descripcion' in product ? product.descripcion : product.categoria}
                  </div>
                  <div className="text-green-400 font-bold">
                    ${'precio_base' in product ? product.precio_base : product.precio}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Constructor de combos */}
      {showComboBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Crear Combo Personalizado</h3>
              <button
                onClick={() => setShowComboBuilder(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del combo..."
                value={newCombo.name}
                onChange={(e) => setNewCombo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div>
                <h4 className="text-white font-medium mb-2">Productos en el combo:</h4>
                <div className="space-y-2 mb-3">
                  {newCombo.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                      <span className="text-white">{item.nombre}</span>
                      <button
                        onClick={() => setNewCombo(prev => ({
                          ...prev,
                          items: prev.items.filter((_, i) => i !== index)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Agregar productos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {[...pizzas, ...extras].map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setNewCombo(prev => ({
                        ...prev,
                        items: [...prev.items, product]
                      }))}
                      className="text-left p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
                    >
                      <div className="text-white font-medium">{product.nombre}</div>
                      <div className="text-green-400">
                        ${'precio_base' in product ? product.precio_base : product.precio}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowComboBuilder(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCombo}
                  disabled={!newCombo.name || newCombo.items.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  Crear Combo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}