import { useState, useEffect, Suspense, lazy } from 'react';
import { useAppStore } from '@/stores';
import { menuApi, clientesApi, pedidosApi } from '@/services/api';
import ModelSelector from '@/components/pedidos/ModelSelector';

// Lazy loading de los modelos para optimizar la carga inicial
const Model1QuickEntry = lazy(() => import('@/components/pedidos/models/Model1QuickEntry'));
const Model2SplitScreen = lazy(() => import('@/components/pedidos/models/Model2SplitScreen'));
const Model3VisualGrid = lazy(() => import('@/components/pedidos/models/Model3VisualGrid'));
const Model4CompactList = lazy(() => import('@/components/pedidos/models/Model4CompactList'));
const Model5Wizard = lazy(() => import('@/components/pedidos/models/Model5Wizard'));
const Model6Autocomplete = lazy(() => import('@/components/pedidos/models/Model6Autocomplete'));
const Model7Calculator = lazy(() => import('@/components/pedidos/models/Model7Calculator'));
const Model8Favorites = lazy(() => import('@/components/pedidos/models/Model8Favorites'));
const Model9Modal = lazy(() => import('@/components/pedidos/models/Model9Modal'));
const Model10Timeline = lazy(() => import('@/components/pedidos/models/Model10Timeline'));

export default function PedidosPage() {
  const { setMenu, setClientes, setPedidos, setLoading, setError } = useAppStore();
  
  // Estado para el modelo seleccionado
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('pizza-pachorra-selected-model') || 'model1';
  });
  
  const [showSelector, setShowSelector] = useState(() => {
    return localStorage.getItem('pizza-pachorra-show-selector') !== 'false';
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [pizzas, extras, clientes, pedidos] = await Promise.all([
          menuApi.getPizzas(),
          menuApi.getExtras(),
          clientesApi.getClientes(),
          pedidosApi.getPedidos()
        ]);

        setMenu({ pizzas, extras });
        setClientes(clientes);
        setPedidos(pedidos);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error instanceof Error ? error.message : 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem('pizza-pachorra-selected-model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('pizza-pachorra-show-selector', showSelector.toString());
  }, [showSelector]);

  // Shortcuts globales para cambiar de modelo
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      // Solo si estamos presionando Ctrl + número
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const modelNumber = parseInt(e.key);
        if (modelNumber <= 10) {
          setSelectedModel(`model${modelNumber}`);
        }
      }
      
      // Ctrl + M para mostrar/ocultar selector
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setShowSelector(prev => !prev);
      }
      
      // Ctrl + R para resetear a modelo por defecto
      if (e.ctrlKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setSelectedModel('model1');
      }
    };

    document.addEventListener('keydown', handleGlobalKeyPress);
    return () => document.removeEventListener('keydown', handleGlobalKeyPress);
  }, []);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const renderSelectedModel = () => {
    const modelComponents = {
      model1: Model1QuickEntry,
      model2: Model2SplitScreen,
      model3: Model3VisualGrid,
      model4: Model4CompactList,
      model5: Model5Wizard,
      model6: Model6Autocomplete,
      model7: Model7Calculator,
      model8: Model8Favorites,
      model9: Model9Modal,
      model10: Model10Timeline,
    };

    const SelectedComponent = modelComponents[selectedModel as keyof typeof modelComponents];
    
    if (!SelectedComponent) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Modelo No Encontrado</h2>
            <p className="text-gray-400 mb-4">El modelo "{selectedModel}" no está disponible</p>
            <button
              onClick={() => setSelectedModel('model1')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Volver al Modelo 1
            </button>
          </div>
        </div>
      );
    }

    return (
      <Suspense 
        fallback={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg">Cargando modelo de interfaz...</p>
              <p className="text-gray-400 text-sm">Preparando {selectedModel}</p>
            </div>
          </div>
        }
      >
        <SelectedComponent />
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      
      {/* Selector de modelos (colapsible) */}
      {showSelector && (
        <div className="relative">
          <ModelSelector 
            currentModel={selectedModel} 
            onModelChange={handleModelChange} 
          />
          
          {/* Botón para ocultar selector */}
          <button
            onClick={() => setShowSelector(false)}
            className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded transition-colors"
            title="Ocultar selector (Ctrl+M)"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Botón flotante para mostrar selector cuando está oculto */}
      {!showSelector && (
        <button
          onClick={() => setShowSelector(true)}
          className="fixed top-4 right-4 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
          title="Mostrar selector de modelos (Ctrl+M)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      
      {/* Shortcuts de ayuda flotante */}
      <div className="fixed bottom-4 left-4 z-40 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300">
        <div className="font-medium text-white mb-1">Shortcuts Globales:</div>
        <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+1-9</kbd> = Cambiar modelo</div>
        <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+M</kbd> = Toggle selector</div>
        <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+R</kbd> = Reset a modelo 1</div>
      </div>

      {/* Renderizar el modelo seleccionado */}
      {renderSelectedModel()}
    </div>
  );
}