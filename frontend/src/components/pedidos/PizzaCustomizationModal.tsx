import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePizzas, useExtras } from '@/stores';
import type { Pizza, Extra, CurrentOrderItem } from '@/types';

// Enum para las pestañas del modal
type TabType = 'mitad1' | 'mitad2' | 'ambas' | 'entera';

// Temas disponibles para el modal
type ModalTheme = 'default' | 'traditional';

interface PizzaCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: CurrentOrderItem) => void;
  pizza: Pizza;
  editingItem?: CurrentOrderItem; // Para editar item existente
  initialQuantity?: number; // Cantidad inicial para usar desde el dashboard
  theme?: ModalTheme; // Tema del modal para adaptarse al dashboard
}

export default function PizzaCustomizationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  pizza,
  editingItem,
  initialQuantity = 1,
  theme = 'default'
}: PizzaCustomizationModalProps) {
  const pizzas = usePizzas();
  const extras = useExtras();
  
  // Estados para la customización
  const [cantidad, setCantidad] = useState(1);
  const [esMitadYMitad, setEsMitadYMitad] = useState(false);
  const [pizzaMitad1, setPizzaMitad1] = useState<number>(pizza.id);
  const [pizzaMitad2, setPizzaMitad2] = useState<number>(pizza.id);
  const [notas, setNotas] = useState('');
  
  // Estados para customización por pestañas
  const [activeTab, setActiveTab] = useState<TabType>('entera');
  
  // Estado simplificado para extras
  const [extrasState, setExtrasState] = useState({
    entera: { agregados: [] as number[], removidos: [] as number[] },
    mitad1: { agregados: [] as number[], removidos: [] as number[] },
    mitad2: { agregados: [] as number[], removidos: [] as number[] },
    ambas: { agregados: [] as number[], removidos: [] as number[] }
  });
  
  // Inicializar con datos del item existente si se está editando
  useEffect(() => {
    if (!isOpen || !pizza) return;
    
    if (editingItem) {
      setCantidad(editingItem.cantidad);
      setEsMitadYMitad(editingItem.es_mitad_y_mitad);
      setPizzaMitad1(editingItem.pizza_mitad_1 || pizza.id);
      setPizzaMitad2(editingItem.pizza_mitad_2 || pizza.id);
      setExtrasState({
        entera: { 
          agregados: editingItem.extras_agregados || [], 
          removidos: editingItem.extras_removidos || [] 
        },
        mitad1: { 
          agregados: editingItem.mitad1_extras_agregados || [], 
          removidos: editingItem.mitad1_extras_removidos || [] 
        },
        mitad2: { 
          agregados: editingItem.mitad2_extras_agregados || [], 
          removidos: editingItem.mitad2_extras_removidos || [] 
        },
        ambas: { 
          agregados: editingItem.ambas_mitades_extras_agregados || [], 
          removidos: editingItem.ambas_mitades_extras_removidos || [] 
        }
      });
      setNotas(editingItem.notas || '');
      setActiveTab(editingItem.es_mitad_y_mitad ? 'mitad1' : 'entera');
    } else {
      // Reset para nueva pizza, usando cantidad inicial
      setCantidad(initialQuantity);
      setEsMitadYMitad(false);
      setPizzaMitad1(pizza.id);
      setPizzaMitad2(pizza.id);
      setExtrasState({
        entera: { agregados: [], removidos: [] },
        mitad1: { agregados: [], removidos: [] },
        mitad2: { agregados: [], removidos: [] },
        ambas: { agregados: [], removidos: [] }
      });
      setNotas('');
      setActiveTab('entera');
    }
  }, [editingItem, pizza?.id, isOpen, initialQuantity]);
  
  // Actualizar pestaña activa cuando cambia mitad y mitad
  useEffect(() => {
    if (esMitadYMitad && activeTab === 'entera') {
      setActiveTab('mitad1');
    } else if (!esMitadYMitad && (activeTab === 'mitad1' || activeTab === 'mitad2' || activeTab === 'ambas')) {
      setActiveTab('entera');
    }
  }, [esMitadYMitad, activeTab]);

  // Calcular precio según el algoritmo de arquitectura.md con mitades - MEMOIZADO
  const calcularPrecio = useMemo((): number => {
    if (!pizza) return 0;
    
    let precioBase = 0;
    let precioExtras = 0;
    let descuentoIngredientes = 0;
    
    if (esMitadYMitad) {
      // Mitad y mitad: promedio de ambas mitades
      const pizza1 = pizzas.find(p => p.id === pizzaMitad1);
      const pizza2 = pizzas.find(p => p.id === pizzaMitad2);
      
      if (pizza1 && pizza2) {
        precioBase = (parseFloat(pizza1.precio_base) + parseFloat(pizza2.precio_base)) / 2;
      }
      
      // Extras específicos de mitad 1 (precio completo)
      extrasState.mitad1.agregados.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId);
        if (extra) precioExtras += parseFloat(extra.precio);
      });
      
      // Extras específicos de mitad 2 (precio completo)
      extrasState.mitad2.agregados.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId);
        if (extra) precioExtras += parseFloat(extra.precio);
      });
      
      // Extras en ambas mitades (precio completo también)
      extrasState.ambas.agregados.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId);
        if (extra) precioExtras += parseFloat(extra.precio);
      });
      
      // Descuentos por ingredientes removidos
      const totalIngredientesRemovidos = extrasState.mitad1.removidos.length + 
                                          extrasState.mitad2.removidos.length + 
                                          extrasState.ambas.removidos.length;
      descuentoIngredientes = totalIngredientesRemovidos * 50;
      
    } else {
      // Pizza entera
      precioBase = parseFloat(pizza.precio_base);
      
      // Calcular extras para pizza entera
      extrasState.entera.agregados.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId);
        if (extra) precioExtras += parseFloat(extra.precio);
      });
      
      // Ingredientes removidos: descuento de $50 por ingrediente
      descuentoIngredientes = extrasState.entera.removidos.length * 50;
    }
    
    return Math.max(0, precioBase + precioExtras - descuentoIngredientes);
  }, [
    pizza,
    pizzas,
    extras,
    esMitadYMitad,
    pizzaMitad1,
    pizzaMitad2,
    extrasState.entera.agregados,
    extrasState.entera.removidos,
    extrasState.mitad1.agregados,
    extrasState.mitad1.removidos,
    extrasState.mitad2.agregados,
    extrasState.mitad2.removidos,
    extrasState.ambas.agregados,
    extrasState.ambas.removidos
  ]);

  const handleConfirm = useCallback(() => {
    const precioUnitario = calcularPrecio;
    
    
    const item: CurrentOrderItem = {
      id: editingItem?.id || `temp_${Date.now()}`,
      pizza_id: esMitadYMitad ? 0 : pizza.id, // 0 para mitad y mitad
      cantidad,
      precio_unitario: precioUnitario,
      es_mitad_y_mitad: esMitadYMitad,
      pizza_mitad_1: esMitadYMitad ? pizzaMitad1 : 0,
      pizza_mitad_2: esMitadYMitad ? pizzaMitad2 : 0,
      // Extras para pizza entera
      extras_agregados: esMitadYMitad ? [] : extrasState.entera.agregados,
      extras_removidos: esMitadYMitad ? [] : extrasState.entera.removidos,
      // Extras por mitad
      ...(esMitadYMitad ? {
        mitad1_extras_agregados: extrasState.mitad1.agregados,
        mitad1_extras_removidos: extrasState.mitad1.removidos,
        mitad2_extras_agregados: extrasState.mitad2.agregados,
        mitad2_extras_removidos: extrasState.mitad2.removidos,
        ambas_mitades_extras_agregados: extrasState.ambas.agregados,
        ambas_mitades_extras_removidos: extrasState.ambas.removidos,
      } : {}),
      ...(notas.trim() ? { notas: notas.trim() } : {}),
      ...(esMitadYMitad ? {} : { pizza }),
      // Datos de extras para mostrar - MEJORADO con validación
      extras_agregados_data: esMitadYMitad ? [] : extrasState.entera.agregados.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)),
      extras_removidos_data: esMitadYMitad ? [] : extrasState.entera.removidos.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)),
      ...(esMitadYMitad ? {
        mitad1_extras_agregados_data: extrasState.mitad1.agregados.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)),
        mitad1_extras_removidos_data: extrasState.mitad1.removidos.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)),
        mitad2_extras_agregados_data: extrasState.mitad2.agregados.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)),
        mitad2_extras_removidos_data: extrasState.mitad2.removidos.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)),
        ambas_mitades_extras_agregados_data: extrasState.ambas.agregados.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)),
        ambas_mitades_extras_removidos_data: extrasState.ambas.removidos.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e))
      } : {})
    };
    
    onConfirm(item);
    onClose();
  }, [
    calcularPrecio,
    cantidad,
    esMitadYMitad,
    pizza,
    pizzaMitad1,
    pizzaMitad2,
    extrasState,
    notas,
    editingItem,
    extras,
    onConfirm,
    onClose
  ]);

  // Funciones simplificadas para manejar toggles - MEMOIZADAS
  const toggleExtraAgregado = useCallback((extraId: number) => {
    setExtrasState(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        agregados: prev[activeTab].agregados.includes(extraId)
          ? prev[activeTab].agregados.filter(id => id !== extraId)
          : [...prev[activeTab].agregados, extraId]
      }
    }));
  }, [activeTab]);

  const toggleExtraRemovido = useCallback((extraId: number) => {
    setExtrasState(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        removidos: prev[activeTab].removidos.includes(extraId)
          ? prev[activeTab].removidos.filter(id => id !== extraId)
          : [...prev[activeTab].removidos, extraId]
      }
    }));
  }, [activeTab]);
  
  // Función para obtener los extras según la pestaña activa - MEMOIZADAS
  const getActiveExtrasAgregados = useMemo((): number[] => {
    return extrasState[activeTab].agregados;
  }, [extrasState, activeTab]);

  const getActiveExtrasRemovidos = useMemo((): number[] => {
    return extrasState[activeTab].removidos;
  }, [extrasState, activeTab]);

  if (!isOpen || !pizza) return null;

  const precioTotal = calcularPrecio * cantidad;

  // Helper functions para clases de tema - OPTIMIZADO
  const getThemeClass = useMemo(() => ({
    header: theme === 'traditional' ? 'bg-red-600' : 'bg-gray-800',
    controls: theme === 'traditional' ? 'bg-orange-50 border border-orange-200' : 'bg-gray-700',
    priceSection: theme === 'traditional' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-700',
    text: {
      primary: theme === 'traditional' ? 'text-gray-800' : 'text-white',
      secondary: theme === 'traditional' ? 'text-orange-600' : 'text-gray-300',
      muted: theme === 'traditional' ? 'text-gray-600' : 'text-gray-400'
    },
    input: theme === 'traditional' 
      ? 'w-full px-4 py-3 border-2 border-orange-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-red-500 bg-orange-50/50 font-medium'
      : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
    tabActive: theme === 'traditional'
      ? 'px-6 py-3 bg-red-600 text-white rounded-2xl shadow-lg font-bold'
      : 'px-4 py-2 bg-blue-600 text-white rounded',
    tabInactive: theme === 'traditional'
      ? 'px-6 py-3 text-red-700 hover:text-red-800 border-2 border-orange-300 bg-orange-50 hover:bg-orange-100 rounded-2xl font-bold transition-all'
      : 'px-4 py-2 text-gray-300 hover:text-white rounded'
  }), [theme]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className={`${theme === 'traditional' ? 'bg-white/95 backdrop-blur-sm rounded-3xl border-4 border-orange-300 shadow-2xl' : 'bg-gray-800 rounded-lg'} max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto mx-2 md:mx-0`}>
        
        {/* Header Compacto */}
        <div className={`${getThemeClass.header} px-4 py-2`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-white font-bold text-base">
                {pizza.nombre}
              </h2>
              <span className={`text-white text-sm font-medium px-2 py-1 ${theme === 'traditional' ? 'bg-white/20 rounded-md' : 'bg-gray-600 rounded-md'}`}>
                ${Math.round(parseFloat(pizza.precio_base))}
              </span>
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 ${theme === 'traditional' ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-700 hover:bg-gray-600'} rounded-full flex items-center justify-center text-white transition-colors`}
            >
              ✕
            </button>
          </div>
        </div>

        <div className={`${theme === 'traditional' ? 'p-8' : 'p-6'} space-y-4`}>
          
          {/* Controles Optimizados en Una Línea */}
          <div className={`${getThemeClass.controls} rounded-xl p-3`}>
            <div className="flex items-center gap-4 flex-wrap">
              
              {/* Cantidad */}
              <div className="flex items-center gap-2">
                <span className={`${getThemeClass.text.primary} font-bold text-sm`}>Cantidad:</span>
                <div className="flex items-center gap-1 bg-white rounded-lg overflow-hidden shadow-md">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white font-bold transition-all duration-200 flex items-center justify-center text-xs hover:shadow-lg active:scale-95"
                  >
                    −
                  </button>
                  <span className="px-3 py-1 font-black text-gray-900 min-w-[2rem] text-center text-sm">
                    {cantidad}
                  </span>
                  <button
                    onClick={() => setCantidad(cantidad + 1)}
                    className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-200 flex items-center justify-center text-xs hover:shadow-lg active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mitad y Mitad */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mitad-y-mitad"
                  checked={esMitadYMitad}
                  onChange={(e) => setEsMitadYMitad(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-white border border-purple-300 rounded"
                />
                <label htmlFor="mitad-y-mitad" className={`${getThemeClass.text.primary} font-bold cursor-pointer text-sm`}>
                  Mitad y Mitad
                </label>
              </div>

              {/* Selección de Mitades (solo si está activado) */}
              {esMitadYMitad && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                    <select
                      value={pizzaMitad1}
                      onChange={(e) => setPizzaMitad1(parseInt(e.target.value))}
                      className={`${getThemeClass.input} text-xs py-1 ${theme === 'traditional' ? 'border-l-4 border-l-blue-600' : 'border-l-4 border-l-blue-500'} min-w-[140px]`}
                    >
                      {pizzas.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                    <select
                      value={pizzaMitad2}
                      onChange={(e) => setPizzaMitad2(parseInt(e.target.value))}
                      className={`${getThemeClass.input} text-xs py-1 ${theme === 'traditional' ? 'border-l-4 border-l-slate-600' : 'border-l-4 border-l-slate-500'} min-w-[140px]`}
                    >
                      {pizzas.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
            </div>
          </div>

          {/* SECCIÓN PRINCIPAL: Personalización de Ingredientes */}
          <div className={`${theme === 'traditional' ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800'} rounded-xl p-4 space-y-4`}>
            {/* Header principal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className={`text-lg font-black ${getThemeClass.text.primary}`}>
                  Personalizar Ingredientes
                </h3>
              </div>
              <span className={`text-sm ${theme === 'traditional' ? 'text-gray-600' : 'text-gray-400'} font-medium`}>
                {activeTab === 'entera' && pizza.nombre}
                {activeTab === 'mitad1' && pizzas.find(p => p.id === pizzaMitad1)?.nombre}
                {activeTab === 'mitad2' && pizzas.find(p => p.id === pizzaMitad2)?.nombre}
                {activeTab === 'ambas' && 'Toda la pizza (ambas mitades)'}
              </span>
            </div>
            
            {/* Pestañas compactas */}
            {esMitadYMitad && (
              <div className={`flex gap-1 p-1 ${theme === 'traditional' ? 'bg-white border border-gray-300' : 'bg-gray-700'} rounded-lg`}>
                <button
                  onClick={() => setActiveTab('mitad1')}
                  className={`flex-1 px-2 py-2 rounded-md font-bold transition-all text-xs ${
                    activeTab === 'mitad1'
                      ? getThemeClass.tabActive
                      : getThemeClass.tabInactive
                  }`}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">1</span>
                    <span>Izquierda</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('mitad2')}
                  className={`flex-1 px-2 py-2 rounded-md font-bold transition-all text-xs ${
                    activeTab === 'mitad2'
                      ? getThemeClass.tabActive
                      : getThemeClass.tabInactive
                  }`}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <span className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">2</span>
                    <span>Derecha</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('ambas')}
                  className={`flex-1 px-2 py-2 rounded-md font-bold transition-all text-xs ${
                    activeTab === 'ambas'
                      ? getThemeClass.tabActive
                      : getThemeClass.tabInactive
                  }`}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <div className="w-5 h-5 relative flex items-center justify-center">
                      <div className="w-2.5 h-5 bg-blue-600 rounded-l-full"></div>
                      <div className="w-2.5 h-5 bg-slate-600 rounded-r-full"></div>
                    </div>
                    <span>Toda</span>
                  </div>
                </button>
              </div>
            )}

            {/* Ingredientes y Extras - Sin Scroll */}
            <div className="space-y-3">
              {/* Ingredientes base - compactos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 ${theme === 'traditional' ? 'bg-gray-500' : 'bg-gray-600'} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                    ➖
                  </div>
                  <h4 className={`text-sm font-bold ${getThemeClass.text.primary}`}>
                    Ingredientes (toca para quitar)
                  </h4>
                </div>
                
                <div className="grid grid-cols-5 md:grid-cols-8 gap-2">
                {(() => {
                  let ingredientesBase: string[] = [];
                  
                  if (activeTab === 'entera') {
                    ingredientesBase = pizza.ingredientes;
                  } else if (activeTab === 'mitad1') {
                    const pizzaMitad1Data = pizzas.find(p => p.id === pizzaMitad1);
                    ingredientesBase = pizzaMitad1Data?.ingredientes || [];
                  } else if (activeTab === 'mitad2') {
                    const pizzaMitad2Data = pizzas.find(p => p.id === pizzaMitad2);
                    ingredientesBase = pizzaMitad2Data?.ingredientes || [];
                  } else if (activeTab === 'ambas') {
                    const pizza1 = pizzas.find(p => p.id === pizzaMitad1);
                    const pizza2 = pizzas.find(p => p.id === pizzaMitad2);
                    const ingredientes1 = new Set(pizza1?.ingredientes || []);
                    const ingredientes2 = new Set(pizza2?.ingredientes || []);
                    ingredientesBase = Array.from(new Set([...ingredientes1, ...ingredientes2]));
                  }
                  
                  return ingredientesBase.map((ingrediente, index) => {
                    const extraCorrespondiente = extras.find(e => 
                      e.nombre.toLowerCase().includes(ingrediente.toLowerCase()) ||
                      ingrediente.toLowerCase().includes(e.nombre.toLowerCase())
                    );
                    
                    const extrasActivosRemovidos = getActiveExtrasRemovidos;
                    const estaRemovido = extraCorrespondiente ? 
                      extrasActivosRemovidos.includes(extraCorrespondiente.id) : false;

                    return (
                      <button
                        key={`${activeTab}-${index}-${ingrediente}`}
                        onClick={() => {
                          if (extraCorrespondiente) {
                            toggleExtraRemovido(extraCorrespondiente.id);
                          }
                        }}
                        className={`px-3 py-1 rounded text-center transition-all duration-200 text-xs transform ${
                          estaRemovido
                            ? 'bg-gray-500 text-white border-2 border-gray-600 shadow-lg scale-95'
                            : theme === 'traditional' 
                              ? 'bg-white border border-gray-300 text-gray-800 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md hover:scale-105 active:scale-95'
                              : 'bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-500 hover:border-gray-400 hover:shadow-md hover:scale-105 active:scale-95'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">
                          {ingrediente}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

              </div>
              
              {/* Extras disponibles - compactos sin scroll */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 ${theme === 'traditional' ? 'bg-blue-500' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                    ➕
                  </div>
                  <h4 className={`text-sm font-bold ${getThemeClass.text.primary}`}>
                    Extras (toca para agregar)
                  </h4>
                </div>
                
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {extras.map(extra => {
                  const extrasActivosAgregados = getActiveExtrasAgregados;
                  const estaAgregado = extrasActivosAgregados.includes(extra.id);
                  
                  return (
                    <button
                      key={`${activeTab}-extra-${extra.id}`}
                      onClick={() => toggleExtraAgregado(extra.id)}
                      className={`px-3 py-1 rounded text-center transition-all duration-200 text-xs transform ${
                        estaAgregado
                          ? 'bg-blue-500 text-white border-2 border-blue-600 shadow-lg scale-105'
                          : theme === 'traditional'
                            ? 'bg-white border border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:scale-105 active:scale-95'
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-500 hover:border-blue-400 hover:shadow-md hover:scale-105 active:scale-95'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">
                        {extra.nombre}
                        <div className={`text-xs font-black ${
                          estaAgregado 
                            ? 'text-white' 
                            : theme === 'traditional' 
                              ? 'text-blue-600' 
                              : 'text-blue-400'
                        }`}>
                          +${Math.round(parseFloat(extra.precio))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detalle de Precio y Notas en la misma línea */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Detalle de Precio - Compacto */}
            <div className={`${getThemeClass.priceSection} rounded-lg p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <h4 className={`text-sm font-bold ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                  Detalle de Precio
                </h4>
              </div>
              
              <div className={`${theme === 'traditional' ? 'bg-white border border-gray-200' : 'bg-gray-600'} rounded p-2 space-y-1 text-xs`}>
                {/* Precio base */}
                <div className="flex justify-between">
                  <span className={`${getThemeClass.text.muted}`}>
                    {esMitadYMitad ? 'Base (promedio)' : 'Base'}:
                  </span>
                  <span className={`font-bold ${getThemeClass.text.primary}`}>
                    ${esMitadYMitad 
                      ? Math.round((parseFloat(pizzas.find(p => p.id === pizzaMitad1)?.precio_base || '0') + 
                          parseFloat(pizzas.find(p => p.id === pizzaMitad2)?.precio_base || '0')) / 2)
                      : Math.round(parseFloat(pizza?.precio_base || '0'))}
                  </span>
                </div>
                
                {/* Extras agregados */}
                {(() => {
                  const extrasAgregadosActivos = getActiveExtrasAgregados;
                  const precioExtrasAgregados = extrasAgregadosActivos.reduce((total, extraId) => {
                    const extra = extras.find(e => e.id === extraId);
                    return total + (extra ? parseFloat(extra.precio) : 0);
                  }, 0);
                  
                  if (extrasAgregadosActivos.length > 0) {
                    return (
                      <div className="flex justify-between">
                        <span className={`${theme === 'traditional' ? 'text-blue-700' : 'text-blue-300'}`}>
                          Extras (+{extrasAgregadosActivos.length}):
                        </span>
                        <span className={`font-bold ${theme === 'traditional' ? 'text-blue-700' : 'text-blue-300'}`}>
                          +${Math.round(precioExtrasAgregados)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* Extras removidos */}
                {(() => {
                  const extrasRemovidosActivos = getActiveExtrasRemovidos;
                  const precioExtrasRemovidos = extrasRemovidosActivos.reduce((total, extraId) => {
                    const extra = extras.find(e => e.id === extraId);
                    return total + (extra ? parseFloat(extra.precio) : 0);
                  }, 0);
                  
                  if (extrasRemovidosActivos.length > 0) {
                    return (
                      <div className="flex justify-between">
                        <span className={`${theme === 'traditional' ? 'text-gray-700' : 'text-gray-300'}`}>
                          Removidos (-{extrasRemovidosActivos.length}):
                        </span>
                        <span className={`font-bold ${theme === 'traditional' ? 'text-gray-700' : 'text-gray-300'}`}>
                          -${Math.round(precioExtrasRemovidos)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* Subtotal y cantidad */}
                <div className={`flex justify-between pt-1 border-t ${theme === 'traditional' ? 'border-gray-200' : 'border-gray-500'}`}>
                  <span className={`${getThemeClass.text.muted}`}>
                    Subtotal x{cantidad}:
                  </span>
                  <span className={`font-bold ${getThemeClass.text.primary}`}>
                    ${Math.round(calcularPrecio)} x{cantidad}
                  </span>
                </div>
                
                {/* Total final */}
                <div className={`flex justify-between text-sm pt-1 border-t ${theme === 'traditional' ? 'border-gray-200' : 'border-gray-500'}`}>
                  <span className={`font-black ${getThemeClass.text.primary}`}>
                    TOTAL:
                  </span>
                  <span className={`font-black text-lg ${theme === 'traditional' ? 'text-blue-600' : 'text-blue-400'}`}>
                    ${precioTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Notas compactas */}
            <div className={`${theme === 'traditional' ? 'bg-gray-50 border border-gray-200' : 'bg-gray-700'} rounded-lg p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <label className={`text-sm font-bold ${getThemeClass.text.primary}`}>
                  Notas Especiales
                </label>
              </div>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Poco cocida, sin cebolla..."
                className={`w-full px-2 py-1 ${theme === 'traditional' 
                  ? 'bg-white border border-gray-300 text-gray-900' 
                  : 'bg-gray-600 border border-gray-500 text-white'
                } rounded focus:outline-none resize-none text-xs`}
                rows={3}
              />
            </div>
          </div>

          {/* Botones de Acción Ultra-Compactos */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={onClose}
              className={`flex-1 px-3 py-2 rounded-lg font-bold transition-all text-sm ${
                theme === 'traditional'
                  ? 'bg-gray-500 hover:bg-gray-600 text-white border border-gray-600'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              ❌ Cancelar
            </button>
            
            {!editingItem && !esMitadYMitad && 
             extrasState.entera.agregados.length === 0 && extrasState.entera.removidos.length === 0 &&
             extrasState.mitad1.agregados.length === 0 && extrasState.mitad1.removidos.length === 0 &&
             extrasState.mitad2.agregados.length === 0 && extrasState.mitad2.removidos.length === 0 &&
             extrasState.ambas.agregados.length === 0 && extrasState.ambas.removidos.length === 0 && (
              <button
                onClick={() => {
                  const standardItem: CurrentOrderItem = {
                    id: `temp_${Date.now()}`,
                    pizza_id: pizza.id,
                    cantidad,
                    precio_unitario: parseFloat(pizza.precio_base),
                    es_mitad_y_mitad: false,
                    extras_agregados: [],
                    extras_removidos: [],
                    pizza,
                    extras_agregados_data: [],
                    extras_removidos_data: []
                  };
                  onConfirm(standardItem);
                }}
                className={`flex-1 px-3 py-2 rounded-lg font-bold transition-all text-sm ${
                  theme === 'traditional'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-600'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                ⚡ Estándar
              </button>
            )}
            
            <button
              onClick={handleConfirm}
              className={`flex-1 px-3 py-2 rounded-lg font-bold transition-all text-sm ${
                theme === 'traditional'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-600'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              🎨 {editingItem ? 'Actualizar' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
