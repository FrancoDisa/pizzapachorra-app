import { useState, useEffect } from 'react';
import { usePizzas, useExtras } from '@/stores';
import type { Pizza, Extra, CurrentOrderItem } from '@/types';

// Enum para las pestañas del modal
type TabType = 'mitad1' | 'mitad2' | 'ambas' | 'entera';

interface PizzaCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: CurrentOrderItem) => void;
  pizza: Pizza;
  editingItem?: CurrentOrderItem; // Para editar item existente
  initialQuantity?: number; // Cantidad inicial para usar desde el dashboard
}

export default function PizzaCustomizationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  pizza,
  editingItem,
  initialQuantity = 1
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
  
  // Extras para pizza entera (cuando NO es mitad y mitad)
  const [extrasAgregados, setExtrasAgregados] = useState<number[]>([]);
  const [extrasRemovidos, setExtrasRemovidos] = useState<number[]>([]);
  
  // Extras por mitad
  const [mitad1ExtrasAgregados, setMitad1ExtrasAgregados] = useState<number[]>([]);
  const [mitad1ExtrasRemovidos, setMitad1ExtrasRemovidos] = useState<number[]>([]);
  const [mitad2ExtrasAgregados, setMitad2ExtrasAgregados] = useState<number[]>([]);
  const [mitad2ExtrasRemovidos, setMitad2ExtrasRemovidos] = useState<number[]>([]);
  const [ambasMitadesExtrasAgregados, setAmbasMitadesExtrasAgregados] = useState<number[]>([]);
  const [ambasMitadesExtrasRemovidos, setAmbasMitadesExtrasRemovidos] = useState<number[]>([]);
  
  // Inicializar con datos del item existente si se está editando
  useEffect(() => {
    if (!isOpen || !pizza) return;
    
    if (editingItem) {
      setCantidad(editingItem.cantidad);
      setEsMitadYMitad(editingItem.es_mitad_y_mitad);
      setPizzaMitad1(editingItem.pizza_mitad_1 || pizza.id);
      setPizzaMitad2(editingItem.pizza_mitad_2 || pizza.id);
      setExtrasAgregados(editingItem.extras_agregados || []);
      setExtrasRemovidos(editingItem.extras_removidos || []);
      setMitad1ExtrasAgregados(editingItem.mitad1_extras_agregados || []);
      setMitad1ExtrasRemovidos(editingItem.mitad1_extras_removidos || []);
      setMitad2ExtrasAgregados(editingItem.mitad2_extras_agregados || []);
      setMitad2ExtrasRemovidos(editingItem.mitad2_extras_removidos || []);
      setAmbasMitadesExtrasAgregados(editingItem.ambas_mitades_extras_agregados || []);
      setAmbasMitadesExtrasRemovidos(editingItem.ambas_mitades_extras_removidos || []);
      setNotas(editingItem.notas || '');
      setActiveTab(editingItem.es_mitad_y_mitad ? 'mitad1' : 'entera');
    } else {
      // Reset para nueva pizza, usando cantidad inicial
      setCantidad(initialQuantity);
      setEsMitadYMitad(false);
      setPizzaMitad1(pizza.id);
      setPizzaMitad2(pizza.id);
      setExtrasAgregados([]);
      setExtrasRemovidos([]);
      setMitad1ExtrasAgregados([]);
      setMitad1ExtrasRemovidos([]);
      setMitad2ExtrasAgregados([]);
      setMitad2ExtrasRemovidos([]);
      setAmbasMitadesExtrasAgregados([]);
      setAmbasMitadesExtrasRemovidos([]);
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

  // Calcular precio según el algoritmo de arquitectura.md con mitades
  const calcularPrecio = (): number => {
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
      mitad1ExtrasAgregados.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId);
        if (extra) precioExtras += parseFloat(extra.precio);
      });
      
      // Extras específicos de mitad 2 (precio completo)
      mitad2ExtrasAgregados.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId);
        if (extra) precioExtras += parseFloat(extra.precio);
      });
      
      // Extras en ambas mitades (precio completo también)
      ambasMitadesExtrasAgregados.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId);
        if (extra) precioExtras += parseFloat(extra.precio);
      });
      
      // Descuentos por ingredientes removidos
      const totalIngredientesRemovidos = mitad1ExtrasRemovidos.length + 
                                          mitad2ExtrasRemovidos.length + 
                                          ambasMitadesExtrasRemovidos.length;
      descuentoIngredientes = totalIngredientesRemovidos * 50;
      
    } else {
      // Pizza entera
      precioBase = parseFloat(pizza.precio_base);
      
      // Calcular extras para pizza entera
      extrasAgregados.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId);
        if (extra) precioExtras += parseFloat(extra.precio);
      });
      
      // Ingredientes removidos: descuento de $50 por ingrediente
      descuentoIngredientes = extrasRemovidos.length * 50;
    }
    
    return Math.max(0, precioBase + precioExtras - descuentoIngredientes);
  };

  const handleConfirm = () => {
    const precioUnitario = calcularPrecio();
    
    // DEBUG: Verificar datos de extras
    if (!esMitadYMitad && (extrasAgregados.length > 0 || extrasRemovidos.length > 0)) {
      console.log('🐛 DEBUG - Extras para pizza entera:', {
        extrasAgregados,
        extrasRemovidos,
        extras_agregados_data: extrasAgregados.map(id => extras.find(e => e.id === id)).filter(Boolean),
        extras_removidos_data: extrasRemovidos.map(id => extras.find(e => e.id === id)).filter(Boolean)
      });
    }
    
    const item: CurrentOrderItem = {
      id: editingItem?.id || `temp_${Date.now()}`,
      pizza_id: esMitadYMitad ? 0 : pizza.id, // 0 para mitad y mitad
      cantidad,
      precio_unitario: precioUnitario,
      es_mitad_y_mitad: esMitadYMitad,
      pizza_mitad_1: esMitadYMitad ? pizzaMitad1 : 0,
      pizza_mitad_2: esMitadYMitad ? pizzaMitad2 : 0,
      // Extras para pizza entera
      extras_agregados: esMitadYMitad ? [] : extrasAgregados,
      extras_removidos: esMitadYMitad ? [] : extrasRemovidos,
      // Extras por mitad
      mitad1_extras_agregados: esMitadYMitad ? mitad1ExtrasAgregados : undefined,
      mitad1_extras_removidos: esMitadYMitad ? mitad1ExtrasRemovidos : undefined,
      mitad2_extras_agregados: esMitadYMitad ? mitad2ExtrasAgregados : undefined,
      mitad2_extras_removidos: esMitadYMitad ? mitad2ExtrasRemovidos : undefined,
      ambas_mitades_extras_agregados: esMitadYMitad ? ambasMitadesExtrasAgregados : undefined,
      ambas_mitades_extras_removidos: esMitadYMitad ? ambasMitadesExtrasRemovidos : undefined,
      notas: notas.trim() || undefined,
      pizza: esMitadYMitad ? undefined : pizza,
      // Datos de extras para mostrar - MEJORADO con validación
      extras_agregados_data: esMitadYMitad ? [] : extrasAgregados.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)),
      extras_removidos_data: esMitadYMitad ? [] : extrasRemovidos.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)),
      mitad1_extras_agregados_data: esMitadYMitad ? mitad1ExtrasAgregados.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)) : undefined,
      mitad1_extras_removidos_data: esMitadYMitad ? mitad1ExtrasRemovidos.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)) : undefined,
      mitad2_extras_agregados_data: esMitadYMitad ? mitad2ExtrasAgregados.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)) : undefined,
      mitad2_extras_removidos_data: esMitadYMitad ? mitad2ExtrasRemovidos.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)) : undefined,
      ambas_mitades_extras_agregados_data: esMitadYMitad ? ambasMitadesExtrasAgregados.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)) : undefined,
      ambas_mitades_extras_removidos_data: esMitadYMitad ? ambasMitadesExtrasRemovidos.map(id => extras.find(e => e.id === id)).filter((e): e is Extra => Boolean(e)) : undefined
    };
    
    onConfirm(item);
    onClose();
  };

  // Funciones para manejar toggles según la pestaña activa
  const toggleExtraAgregado = (extraId: number) => {
    switch (activeTab) {
      case 'entera':
        setExtrasAgregados(prev => 
          prev.includes(extraId) 
            ? prev.filter(id => id !== extraId)
            : [...prev, extraId]
        );
        break;
      case 'mitad1':
        setMitad1ExtrasAgregados(prev => 
          prev.includes(extraId) 
            ? prev.filter(id => id !== extraId)
            : [...prev, extraId]
        );
        break;
      case 'mitad2':
        setMitad2ExtrasAgregados(prev => 
          prev.includes(extraId) 
            ? prev.filter(id => id !== extraId)
            : [...prev, extraId]
        );
        break;
      case 'ambas':
        setAmbasMitadesExtrasAgregados(prev => 
          prev.includes(extraId) 
            ? prev.filter(id => id !== extraId)
            : [...prev, extraId]
        );
        break;
    }
  };

  const toggleExtraRemovido = (extraId: number) => {
    switch (activeTab) {
      case 'entera':
        setExtrasRemovidos(prev => 
          prev.includes(extraId) 
            ? prev.filter(id => id !== extraId)
            : [...prev, extraId]
        );
        break;
      case 'mitad1':
        setMitad1ExtrasRemovidos(prev => 
          prev.includes(extraId) 
            ? prev.filter(id => id !== extraId)
            : [...prev, extraId]
        );
        break;
      case 'mitad2':
        setMitad2ExtrasRemovidos(prev => 
          prev.includes(extraId) 
            ? prev.filter(id => id !== extraId)
            : [...prev, extraId]
        );
        break;
      case 'ambas':
        setAmbasMitadesExtrasRemovidos(prev => 
          prev.includes(extraId) 
            ? prev.filter(id => id !== extraId)
            : [...prev, extraId]
        );
        break;
    }
  };
  
  // Función para obtener los extras según la pestaña activa
  const getActiveExtrasAgregados = (): number[] => {
    switch (activeTab) {
      case 'entera': return extrasAgregados;
      case 'mitad1': return mitad1ExtrasAgregados;
      case 'mitad2': return mitad2ExtrasAgregados;
      case 'ambas': return ambasMitadesExtrasAgregados;
      default: return [];
    }
  };

  const getActiveExtrasRemovidos = (): number[] => {
    switch (activeTab) {
      case 'entera': return extrasRemovidos;
      case 'mitad1': return mitad1ExtrasRemovidos;
      case 'mitad2': return mitad2ExtrasRemovidos;
      case 'ambas': return ambasMitadesExtrasRemovidos;
      default: return [];
    }
  };

  if (!isOpen || !pizza) return null;

  const precioTotal = calcularPrecio() * cantidad;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Personalizar Pizza</h2>
            <p className="text-gray-400">{pizza.nombre} - Base: ${Math.round(parseFloat(pizza.precio_base))}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Cantidad */}
          <div className="flex items-center gap-4">
            <label className="text-white font-medium">Cantidad:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded"
              >
                -
              </button>
              <span className="text-white font-bold text-lg w-8 text-center">{cantidad}</span>
              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* Opción Mitad y Mitad */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="mitad-y-mitad"
                checked={esMitadYMitad}
                onChange={(e) => setEsMitadYMitad(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="mitad-y-mitad" className="text-white font-medium">
                Pizza Mitad y Mitad
              </label>
            </div>

            {esMitadYMitad && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mitad 1:</label>
                  <select
                    value={pizzaMitad1}
                    onChange={(e) => setPizzaMitad1(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {pizzas.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (${Math.round(parseFloat(p.precio_base))})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mitad 2:</label>
                  <select
                    value={pizzaMitad2}
                    onChange={(e) => setPizzaMitad2(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {pizzas.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (${Math.round(parseFloat(p.precio_base))})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Sistema de Pestañas para Customización */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Customización por Sección</h3>
            
            {/* Pestañas */}
            <div className="flex mb-4 bg-gray-700 rounded-lg p-1">
              {!esMitadYMitad ? (
                <button
                  onClick={() => setActiveTab('entera')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'entera'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  🍕 Personalizar
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('mitad1')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      activeTab === 'mitad1'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    🟦 Mitad 1
                  </button>
                  <button
                    onClick={() => setActiveTab('mitad2')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      activeTab === 'mitad2'
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    🟧 Mitad 2
                  </button>
                  <button
                    onClick={() => setActiveTab('ambas')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      activeTab === 'ambas'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    🔮 Ambas Mitades
                  </button>
                </>
              )}
            </div>

            {/* Información de la pestaña activa - simplificada */}
            <div className="mb-3 text-center">
              {activeTab === 'entera' && (
                <span className="text-sm text-gray-400">🍕 {pizza.nombre}</span>
              )}
              {activeTab === 'mitad1' && (
                <span className="text-sm text-gray-400">🟦 {pizzas.find(p => p.id === pizzaMitad1)?.nombre}</span>
              )}
              {activeTab === 'mitad2' && (
                <span className="text-sm text-gray-400">🟧 {pizzas.find(p => p.id === pizzaMitad2)?.nombre}</span>
              )}
              {activeTab === 'ambas' && (
                <span className="text-sm text-gray-400">🔮 Ambas Mitades</span>
              )}
            </div>

            {/* Ingredientes incluidos según la pestaña */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-white mb-3">Ingredientes Incluidos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
                    // Para ambas mitades, mostrar ingredientes comunes
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
                    
                    const extrasActivosRemovidos = getActiveExtrasRemovidos();
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
                        className={`p-2 rounded text-sm transition-colors ${
                          estaRemovido
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                        }`}
                      >
                        {ingrediente} {estaRemovido && '❌'}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Extras disponibles según la pestaña */}
            <div>
              <h4 className="text-md font-medium text-white mb-3">Extras Disponibles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {extras.map(extra => {
                  const extrasActivosAgregados = getActiveExtrasAgregados();
                  const estaAgregado = extrasActivosAgregados.includes(extra.id);
                  
                  return (
                    <button
                      key={`${activeTab}-extra-${extra.id}`}
                      onClick={() => toggleExtraAgregado(extra.id)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        estaAgregado
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      }`}
                    >
                      <div className="font-medium">{extra.nombre}</div>
                      <div className="text-sm font-bold">+${Math.round(parseFloat(extra.precio))}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notas especiales */}
          <div>
            <label className="block text-white font-medium mb-2">Notas especiales:</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Instrucciones especiales para la pizza..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Resumen de Precio con desglose */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">💰 Resumen de Precio</h4>
            
            {/* Precio Base */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">
                {esMitadYMitad ? 'Base (promedio):' : 'Precio base:'}
              </span>
              <span className="text-white font-bold">
                ${esMitadYMitad 
                  ? Math.round((parseFloat(pizzas.find(p => p.id === pizzaMitad1)?.precio_base || '0') + 
                      parseFloat(pizzas.find(p => p.id === pizzaMitad2)?.precio_base || '0')) / 2)
                  : Math.round(parseFloat(pizza?.precio_base || '0'))}
              </span>
            </div>
            
            {/* Mostrar extras agregados con nombres específicos */}
            {(() => {
              if (esMitadYMitad) {
                // Para pizzas mitad y mitad
                return (
                  <div className="space-y-2">
                    {/* Mitad 1 - Extras agregados */}
                    {mitad1ExtrasAgregados.length > 0 && (
                      <div className="bg-blue-900/20 rounded p-2">
                        <div className="text-blue-300 text-sm font-medium mb-1">🟦 Mitad 1 - Extras:</div>
                        {mitad1ExtrasAgregados.map(id => {
                          const extra = extras.find(e => e.id === id);
                          return extra ? (
                            <div key={id} className="flex justify-between items-center text-xs">
                              <span className="text-green-300">+ {extra.nombre}</span>
                              <span className="text-green-400 font-bold">+${Math.round(parseFloat(extra.precio))}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {/* Mitad 1 - Ingredientes removidos */}
                    {mitad1ExtrasRemovidos.length > 0 && (
                      <div className="bg-blue-900/20 rounded p-2">
                        <div className="text-blue-300 text-sm font-medium mb-1">🟦 Mitad 1 - Sin:</div>
                        {mitad1ExtrasRemovidos.map(id => {
                          const extra = extras.find(e => e.id === id);
                          return extra ? (
                            <div key={id} className="flex justify-between items-center text-xs">
                              <span className="text-red-300">- {extra.nombre}</span>
                              <span className="text-red-400 font-bold">-$50</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {/* Mitad 2 - Extras agregados */}
                    {mitad2ExtrasAgregados.length > 0 && (
                      <div className="bg-orange-900/20 rounded p-2">
                        <div className="text-orange-300 text-sm font-medium mb-1">🟧 Mitad 2 - Extras:</div>
                        {mitad2ExtrasAgregados.map(id => {
                          const extra = extras.find(e => e.id === id);
                          return extra ? (
                            <div key={id} className="flex justify-between items-center text-xs">
                              <span className="text-green-300">+ {extra.nombre}</span>
                              <span className="text-green-400 font-bold">+${Math.round(parseFloat(extra.precio))}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {/* Mitad 2 - Ingredientes removidos */}
                    {mitad2ExtrasRemovidos.length > 0 && (
                      <div className="bg-orange-900/20 rounded p-2">
                        <div className="text-orange-300 text-sm font-medium mb-1">🟧 Mitad 2 - Sin:</div>
                        {mitad2ExtrasRemovidos.map(id => {
                          const extra = extras.find(e => e.id === id);
                          return extra ? (
                            <div key={id} className="flex justify-between items-center text-xs">
                              <span className="text-red-300">- {extra.nombre}</span>
                              <span className="text-red-400 font-bold">-$50</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {/* Ambas mitades - Extras agregados */}
                    {ambasMitadesExtrasAgregados.length > 0 && (
                      <div className="bg-purple-900/20 rounded p-2">
                        <div className="text-purple-300 text-sm font-medium mb-1">🔮 Ambas - Extras:</div>
                        {ambasMitadesExtrasAgregados.map(id => {
                          const extra = extras.find(e => e.id === id);
                          return extra ? (
                            <div key={id} className="flex justify-between items-center text-xs">
                              <span className="text-green-300">+ {extra.nombre}</span>
                              <span className="text-green-400 font-bold">+${Math.round(parseFloat(extra.precio))}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {/* Ambas mitades - Ingredientes removidos */}
                    {ambasMitadesExtrasRemovidos.length > 0 && (
                      <div className="bg-purple-900/20 rounded p-2">
                        <div className="text-purple-300 text-sm font-medium mb-1">🔮 Ambas - Sin:</div>
                        {ambasMitadesExtrasRemovidos.map(id => {
                          const extra = extras.find(e => e.id === id);
                          return extra ? (
                            <div key={id} className="flex justify-between items-center text-xs">
                              <span className="text-red-300">- {extra.nombre}</span>
                              <span className="text-red-400 font-bold">-$50</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Para pizza entera
                return (
                  <div className="space-y-2">
                    {/* Extras agregados */}
                    {extrasAgregados.length > 0 && (
                      <div className="bg-gray-600/30 rounded p-2">
                        <div className="text-gray-300 text-sm font-medium mb-1">➕ Extras agregados:</div>
                        {extrasAgregados.map(id => {
                          const extra = extras.find(e => e.id === id);
                          return extra ? (
                            <div key={id} className="flex justify-between items-center text-xs">
                              <span className="text-green-300">+ {extra.nombre}</span>
                              <span className="text-green-400 font-bold">+${Math.round(parseFloat(extra.precio))}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {/* Ingredientes removidos */}
                    {extrasRemovidos.length > 0 && (
                      <div className="bg-gray-600/30 rounded p-2">
                        <div className="text-gray-300 text-sm font-medium mb-1">➖ Ingredientes removidos:</div>
                        {extrasRemovidos.map(id => {
                          const extra = extras.find(e => e.id === id);
                          return extra ? (
                            <div key={id} className="flex justify-between items-center text-xs">
                              <span className="text-red-300">- {extra.nombre}</span>
                              <span className="text-red-400 font-bold">-$50</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              }
            })()}
            
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Precio unitario:</span>
                <span className="text-white font-bold">${Math.round(calcularPrecio())}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Cantidad:</span>
                <span className="text-white font-bold">x{cantidad}</span>
              </div>
              <div className="border-t border-gray-600 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total:</span>
                  <span className="text-xl font-bold text-green-400">${Math.round(precioTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Cancelar
            </button>
            
            {!editingItem && !esMitadYMitad && 
             extrasAgregados.length === 0 && extrasRemovidos.length === 0 &&
             mitad1ExtrasAgregados.length === 0 && mitad1ExtrasRemovidos.length === 0 &&
             mitad2ExtrasAgregados.length === 0 && mitad2ExtrasRemovidos.length === 0 &&
             ambasMitadesExtrasAgregados.length === 0 && ambasMitadesExtrasRemovidos.length === 0 && (
              <button
                onClick={() => {
                  // Agregar pizza estándar rápida (sin personalizaciones)
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
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
              >
                ⚡ Agregar Estándar
              </button>
            )}
            
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
            >
              🎨 {editingItem ? 'Actualizar' : 'Agregar'} Personalizada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}