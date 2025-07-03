import { useState, useEffect } from 'react';
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

  // Obtener estilos según el tema del dashboard
  const getThemeStyles = () => {
    switch (theme) {
      case 'traditional':
        return {
          backdrop: 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4',
          container: 'bg-white/95 backdrop-blur-sm rounded-3xl max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto border-4 border-orange-300 shadow-2xl mx-2 md:mx-0',
          header: 'bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white p-6 relative overflow-hidden',
          title: 'text-3xl font-black text-white tracking-wide',
          body: 'p-8',
          button: 'px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105',
          cancelButton: 'px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300',
          tabActive: 'px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl shadow-lg font-bold',
          tabInactive: 'px-6 py-3 text-red-700 hover:text-red-800 border-2 border-orange-300 bg-orange-50 hover:bg-orange-100 rounded-2xl font-bold transition-all',
          input: 'w-full px-4 py-3 border-2 border-orange-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-red-500 bg-orange-50/50 font-medium',
          extraButton: 'p-4 border-2 border-orange-200 bg-orange-50 rounded-2xl text-gray-900 hover:border-red-500 hover:bg-orange-100 transition-all font-medium',
          extraButtonActive: 'p-4 border-2 border-red-500 bg-red-50 text-red-800 rounded-2xl font-bold shadow-lg'
        };
      default:
        return {
          backdrop: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
          container: 'bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto',
          header: 'bg-gray-700 p-6 border-b border-gray-600',
          title: 'text-2xl font-bold text-white',
          body: 'p-6',
          button: 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors',
          cancelButton: 'px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors',
          tabActive: 'px-4 py-2 bg-blue-600 text-white rounded',
          tabInactive: 'px-4 py-2 text-gray-300 hover:text-white rounded',
          input: 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
          extraButton: 'p-3 border border-gray-600 bg-gray-700 rounded text-gray-300 hover:border-blue-500 transition-colors',
          extraButtonActive: 'p-3 border-2 border-blue-500 bg-blue-900/30 text-blue-300 rounded'
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          {theme === 'traditional' && (
            <>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-4 left-8 text-6xl text-orange-300/20">🍕</div>
              <div className="absolute bottom-4 right-8 text-4xl text-yellow-300/20">🧀</div>
            </>
          )}
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-4">
              {theme === 'traditional' && (
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  🎨
                </div>
              )}
              <div>
                <h2 className={styles.title}>Personalizar Pizza</h2>
                <p className={theme === 'traditional' ? 'text-orange-100 font-medium' : 'text-gray-400'}>
                  {pizza.nombre} - Base: ${Math.round(parseFloat(pizza.precio_base))}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={theme === 'traditional' 
                ? "w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors text-xl"
                : "text-gray-400 hover:text-white text-xl"
              }
            >
              ✕
            </button>
          </div>
        </div>

        <div className={`${styles.body} space-y-6`}>
          
          {/* Cantidad con mejor diseño */}
          <div className={`${theme === 'traditional' ? 'bg-orange-50 border-2 border-orange-200' : 'bg-gray-700'} rounded-2xl p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${theme === 'traditional' ? 'bg-orange-500' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white font-bold`}>
                  📊
                </div>
                <label className={`${theme === 'traditional' ? 'text-gray-800' : 'text-white'} font-bold text-lg`}>Cantidad</label>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl overflow-hidden shadow-lg">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="px-4 py-2 font-black text-xl text-gray-900 min-w-[3rem] text-center">
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white font-bold transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Opción Mitad y Mitad con mejor diseño */}
          <div className={`${theme === 'traditional' ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-700'} rounded-2xl p-4 space-y-4`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${theme === 'traditional' ? 'bg-purple-500' : 'bg-purple-600'} rounded-full flex items-center justify-center text-white font-bold`}>
                🍕
              </div>
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  id="mitad-y-mitad"
                  checked={esMitadYMitad}
                  onChange={(e) => setEsMitadYMitad(e.target.checked)}
                  className="w-5 h-5 text-purple-600 bg-white border-2 border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="mitad-y-mitad" className={`${theme === 'traditional' ? 'text-gray-800' : 'text-white'} font-bold text-lg cursor-pointer`}>
                  Pizza Mitad y Mitad
                </label>
              </div>
              {esMitadYMitad && (
                <div className="px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
                  ¡Activado!
                </div>
              )}
            </div>

            {esMitadYMitad && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-purple-200">
                <div className="space-y-2">
                  <label className={`flex items-center gap-2 ${theme === 'traditional' ? 'text-gray-700' : 'text-gray-300'} font-bold text-sm`}>
                    <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                    Primera Mitad
                  </label>
                  <select
                    value={pizzaMitad1}
                    onChange={(e) => setPizzaMitad1(parseInt(e.target.value))}
                    className={styles.input}
                  >
                    {pizzas.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (${Math.round(parseFloat(p.precio_base))})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={`flex items-center gap-2 ${theme === 'traditional' ? 'text-gray-700' : 'text-gray-300'} font-bold text-sm`}>
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                    Segunda Mitad
                  </label>
                  <select
                    value={pizzaMitad2}
                    onChange={(e) => setPizzaMitad2(parseInt(e.target.value))}
                    className={styles.input}
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

          {/* Sistema de Personalización Rediseñado */}
          <div className={`${theme === 'traditional' ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-800'} rounded-2xl p-6 space-y-6`}>
            {/* Header de customización */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 ${theme === 'traditional' ? 'bg-green-600' : 'bg-green-500'} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                🎨
              </div>
              <div>
                <h3 className={`text-xl font-black ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                  Personalización
                </h3>
                <p className={`text-sm ${theme === 'traditional' ? 'text-gray-600' : 'text-gray-400'} font-medium`}>
                  Agrega o quita ingredientes
                </p>
              </div>
            </div>
            
            {/* Pestañas mejoradas */}
            <div className={`grid ${!esMitadYMitad ? 'grid-cols-1' : 'grid-cols-3'} gap-2 p-2 ${theme === 'traditional' ? 'bg-white border-2 border-green-300' : 'bg-gray-700'} rounded-2xl`}>
              {!esMitadYMitad ? (
                <button
                  onClick={() => setActiveTab('entera')}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'entera'
                      ? styles.tabActive + ' shadow-lg'
                      : styles.tabInactive
                  }`}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-lg">🍕</span>
                    <span>Pizza Completa</span>
                  </div>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('mitad1')}
                    className={`px-3 py-3 rounded-xl font-bold transition-all ${
                      activeTab === 'mitad1'
                        ? styles.tabActive + ' shadow-lg'
                        : styles.tabInactive
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                      <span className="text-xs">Mitad 1</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('mitad2')}
                    className={`px-3 py-3 rounded-xl font-bold transition-all ${
                      activeTab === 'mitad2'
                        ? styles.tabActive + ' shadow-lg'
                        : styles.tabInactive
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                      <span className="text-xs">Mitad 2</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('ambas')}
                    className={`px-3 py-3 rounded-xl font-bold transition-all ${
                      activeTab === 'ambas'
                        ? styles.tabActive + ' shadow-lg'
                        : styles.tabInactive
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">⚡</span>
                      <span className="text-xs">Ambas</span>
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Información de la pestaña activa */}
            <div className={`text-center p-3 ${theme === 'traditional' ? 'bg-white border border-green-300' : 'bg-gray-700'} rounded-xl`}>
              {activeTab === 'entera' && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🍕</span>
                  <span className={`font-bold ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                    {pizza.nombre}
                  </span>
                </div>
              )}
              {activeTab === 'mitad1' && (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                  <span className={`font-bold ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                    {pizzas.find(p => p.id === pizzaMitad1)?.nombre}
                  </span>
                </div>
              )}
              {activeTab === 'mitad2' && (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                  <span className={`font-bold ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                    {pizzas.find(p => p.id === pizzaMitad2)?.nombre}
                  </span>
                </div>
              )}
              {activeTab === 'ambas' && (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">⚡</span>
                  <span className={`font-bold ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                    Ambas Mitades
                  </span>
                </div>
              )}
            </div>

            {/* Ingredientes incluidos rediseñados */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${theme === 'traditional' ? 'bg-red-500' : 'bg-red-600'} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  ➖
                </div>
                <h4 className={`text-lg font-bold ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                  Ingredientes Base
                </h4>
                <div className={`px-3 py-1 ${theme === 'traditional' ? 'bg-red-100 text-red-700' : 'bg-red-900/30 text-red-300'} rounded-full text-xs font-bold`}>
                  Toca para quitar (-$50)
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                        className={`p-2 rounded-lg font-medium transition-all duration-200 ${
                          estaRemovido
                            ? 'bg-red-500 text-white shadow-lg transform scale-95 border-2 border-red-600'
                            : theme === 'traditional' 
                              ? 'bg-white border-2 border-gray-300 text-gray-800 hover:border-red-400 hover:bg-red-50'
                              : 'bg-gray-600 hover:bg-gray-500 text-gray-200 border-2 border-gray-500'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold">{ingrediente}</span>
                          {estaRemovido && <span className="text-xs">❌</span>}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Extras disponibles rediseñados */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${theme === 'traditional' ? 'bg-green-500' : 'bg-green-600'} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  ➕
                </div>
                <h4 className={`text-lg font-bold ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                  Extras Disponibles
                </h4>
                <div className={`px-3 py-1 ${theme === 'traditional' ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-300'} rounded-full text-xs font-bold`}>
                  Toca para agregar
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {extras.map(extra => {
                  const extrasActivosAgregados = getActiveExtrasAgregados();
                  const estaAgregado = extrasActivosAgregados.includes(extra.id);
                  
                  return (
                    <button
                      key={`${activeTab}-extra-${extra.id}`}
                      onClick={() => toggleExtraAgregado(extra.id)}
                      className={`p-2 rounded-lg text-center transition-all duration-200 ${
                        estaAgregado
                          ? 'bg-green-500 text-white shadow-lg transform scale-105 border-2 border-green-600'
                          : theme === 'traditional'
                            ? 'bg-white border-2 border-gray-300 text-gray-800 hover:border-green-400 hover:bg-green-50'
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-200 border-2 border-gray-500'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-xs">{extra.nombre}</div>
                        <div className={`text-sm font-black ${
                          estaAgregado 
                            ? 'text-white' 
                            : theme === 'traditional' 
                              ? 'text-green-600' 
                              : 'text-green-400'
                        }`}>
                          +${Math.round(parseFloat(extra.precio))}
                        </div>
                        {estaAgregado && (
                          <div className="text-xs text-white/90 font-medium">✅</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notas especiales rediseñadas */}
          <div className={`${theme === 'traditional' ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-700'} rounded-2xl p-4 space-y-3`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${theme === 'traditional' ? 'bg-yellow-500' : 'bg-yellow-600'} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                📝
              </div>
              <label className={`text-lg font-bold ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                Notas Especiales
              </label>
            </div>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Poco cocida, sin cebolla morada, extra queso..."
              className={`w-full px-4 py-3 ${theme === 'traditional' 
                ? 'bg-white border-2 border-yellow-300 text-gray-900 focus:border-yellow-500 focus:ring-yellow-200' 
                : 'bg-gray-600 border-2 border-gray-500 text-white focus:border-yellow-500 focus:ring-yellow-200'
              } rounded-xl focus:outline-none focus:ring-4 resize-none font-medium placeholder-gray-500`}
              rows={3}
            />
          </div>

          {/* Resumen de Precio completamente rediseñado */}
          <div className={`${theme === 'traditional' ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300' : 'bg-gray-700'} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${theme === 'traditional' ? 'bg-blue-600' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                💰
              </div>
              <h4 className={`text-xl font-black ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                Resumen de Precio
              </h4>
            </div>
            
            {/* Precio Base Simplificado */}
            <div className={`${theme === 'traditional' ? 'bg-white border border-blue-200' : 'bg-gray-600'} rounded-xl p-4 space-y-3`}>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${theme === 'traditional' ? 'text-gray-700' : 'text-gray-300'}`}>
                  {esMitadYMitad ? 'Precio Base (Promedio)' : 'Precio Base'}
                </span>
                <span className={`font-black text-xl ${theme === 'traditional' ? 'text-blue-600' : 'text-white'}`}>
                  ${esMitadYMitad 
                    ? Math.round((parseFloat(pizzas.find(p => p.id === pizzaMitad1)?.precio_base || '0') + 
                        parseFloat(pizzas.find(p => p.id === pizzaMitad2)?.precio_base || '0')) / 2)
                    : Math.round(parseFloat(pizza?.precio_base || '0'))}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`font-medium ${theme === 'traditional' ? 'text-gray-700' : 'text-gray-300'}`}>
                  Cantidad
                </span>
                <span className={`font-bold text-lg ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                  x{cantidad}
                </span>
              </div>
              
              <div className="border-t-2 border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-lg ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                    Precio Unitario
                  </span>
                  <span className={`font-black text-2xl ${theme === 'traditional' ? 'text-blue-600' : 'text-green-400'}`}>
                    ${Math.round(calcularPrecio())}
                  </span>
                </div>
              </div>
              
              <div className={`border-t-2 ${theme === 'traditional' ? 'border-blue-200' : 'border-gray-500'} pt-3`}>
                <div className="flex justify-between items-center">
                  <span className={`font-black text-xl ${theme === 'traditional' ? 'text-gray-800' : 'text-white'}`}>
                    TOTAL FINAL
                  </span>
                  <span className={`font-black text-3xl ${theme === 'traditional' ? 'text-green-600' : 'text-green-400'}`}>
                    ${Math.round(precioTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción Rediseñados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <button
              onClick={onClose}
              className={styles.cancelButton}
            >
              ❌ Cancelar
            </button>
            
            {!editingItem && !esMitadYMitad && 
             extrasAgregados.length === 0 && extrasRemovidos.length === 0 &&
             mitad1ExtrasAgregados.length === 0 && mitad1ExtrasRemovidos.length === 0 &&
             mitad2ExtrasAgregados.length === 0 && mitad2ExtrasRemovidos.length === 0 &&
             ambasMitadesExtrasAgregados.length === 0 && ambasMitadesExtrasRemovidos.length === 0 && (
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
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">⚡</span>
                  <span>Agregar Estándar</span>
                </div>
              </button>
            )}
            
            <button
              onClick={handleConfirm}
              className={styles.button}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🎨</span>
                <span>{editingItem ? 'Actualizar' : 'Agregar'} Personalizada</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
