import { useState, useEffect, Suspense, lazy } from 'react';
import { useAppStore } from '@/stores';
import { menuApi, clientesApi, pedidosApi } from '@/services/api';

// Lazy loading de los modelos seleccionados
const Model1QuickEntry = lazy(() => import('@/components/pedidos/models/Model1QuickEntry'));
const Model5Wizard = lazy(() => import('@/components/pedidos/models/Model5Wizard'));

export default function PedidosPage() {
  const { setMenu, setClientes, setPedidos, setLoading, setError } = useAppStore();
  
  // Estado para el modelo seleccionado (por defecto QuickEntry)
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('pizza-pachorra-selected-model') || 'model1';
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




  const renderSelectedModel = () => {
    const modelComponents = {
      model1: Model1QuickEntry,
      model5: Model5Wizard,
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
      {/* Renderizar el modelo seleccionado */}
      {renderSelectedModel()}
    </div>
  );
}