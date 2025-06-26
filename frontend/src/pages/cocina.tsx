import { useState, useEffect, memo, useCallback } from 'react';
import AudioSettings from '@/components/kitchen/AudioSettings';
import ErrorBoundary from '@/components/ErrorBoundary';
import { 
  useKitchenOrders, 
  useWebSocket, 
  useKitchenFullscreen,
  useOrderStatusUpdate,
  useKitchenFilters,
  useAudioNotifications
} from '@/hooks';
import type { PedidoWithDetails } from '@/types';

// Componente para una card de pedido
const OrderCard = memo(function OrderCard({ order, onStatusUpdate }: { 
  order: PedidoWithDetails; 
  onStatusUpdate: (orderId: number, status: string) => void;
}) {
  const getPriorityClass = (prioridad: string) => {
    switch (prioridad) {
      case 'critico':
        return 'border-red-500 bg-red-900/20';
      case 'urgente':
        return 'border-yellow-500 bg-yellow-900/20';
      default:
        return 'border-slate-600 bg-slate-800';
    }
  };

  const getTimeClass = (minutes: number) => {
    if (minutes >= 30) return 'text-red-400';
    if (minutes >= 15) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const canStartPreparation = order.estado === 'nuevo';
  const canMarkReady = order.estado === 'en_preparacion';

  return (
    <div className={`border-2 rounded-lg p-4 transition-all hover:shadow-lg ${getPriorityClass(order.prioridad!)}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-amber-50">#{order.id}</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getTimeClass(order.tiempoTranscurrido!)}`}>
            {formatTime(order.tiempoTranscurrido!)}
          </span>
          {order.prioridad !== 'normal' && (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              order.prioridad === 'critico' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'
            }`}>
              {order.prioridad}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="bg-slate-700/50 rounded p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-amber-50">
                {item.cantidad}x {item.pizza?.nombre || 'Pizza'}
              </span>
            </div>
            
            {item.es_mitad_y_mitad && (
              <div className="text-sm text-slate-300 mb-2">
                <div>½ {item.pizza_mitad_1_data?.nombre}</div>
                <div>½ {item.pizza_mitad_2_data?.nombre}</div>
              </div>
            )}

            {item.extras_agregados_data && item.extras_agregados_data.length > 0 && (
              <div className="text-sm text-slate-300 mb-1">
                <span className="text-green-400">+</span> {item.extras_agregados_data.map(e => e.nombre).join(', ')}
              </div>
            )}

            {item.extras_removidos_data && item.extras_removidos_data.length > 0 && (
              <div className="text-sm text-slate-300 mb-1">
                <span className="text-red-400">-</span> {item.extras_removidos_data.map(e => e.nombre).join(', ')}
              </div>
            )}

            {item.notas && (
              <div className="text-sm text-yellow-300 italic mt-2">
                📝 {item.notas}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-slate-400">
          <div>{order.cliente.nombre || 'Cliente'}</div>
          <div>{order.cliente.telefono}</div>
        </div>
        <div className="text-right text-sm text-slate-400">
          <div>Total: ${order.total}</div>
          <div>{new Date(order.created_at).toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="flex space-x-2">
        {canStartPreparation && (
          <button
            onClick={() => onStatusUpdate(order.id, 'en_preparacion')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors"
          >
            Iniciar
          </button>
        )}
        {canMarkReady && (
          <button
            onClick={() => onStatusUpdate(order.id, 'listo')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium transition-colors"
          >
            Listo
          </button>
        )}
      </div>
    </div>
  );
});

// Componente para columna de estado
const StatusColumn = memo(function StatusColumn({ 
  title, 
  orders, 
  onStatusUpdate, 
  bgColor 
}: { 
  title: string; 
  orders: PedidoWithDetails[]; 
  onStatusUpdate: (orderId: number, status: string) => void;
  bgColor: string;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className={`${bgColor} rounded-t-lg p-4 border-b border-slate-600`}>
        <h2 className="text-xl font-bold text-white text-center">
          {title} ({orders.length})
        </h2>
      </div>
      <div className="flex-1 bg-slate-900/50 rounded-b-lg p-4 space-y-4 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            No hay pedidos {title.toLowerCase()}
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onStatusUpdate={onStatusUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
});

// Componente principal con error boundary
export default function Cocina() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error en componente Cocina:', error, errorInfo);
        // Log para debugging
        if (error.message.includes('Maximum update depth')) {
          console.error('Infinite loop detectado en Cocina - reiniciando estado');
        }
      }}
    >
      <CocinaContent />
    </ErrorBoundary>
  );
}

// Componente de contenido interno
function CocinaContent() {
  const { orders, nuevos, enPreparacion, listos, refreshOrders } = useKitchenOrders();
  const { startPreparation, markReady } = useOrderStatusUpdate();
  const { isFullscreen, toggleFullscreen } = useKitchenFullscreen();
  const { filter, setSearch, setSorting } = useKitchenFilters(orders);
  const { isAudioEnabled, toggleAudio } = useAudioNotifications();
  const ws = useWebSocket();
  
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Conectar WebSocket y cargar datos iniciales al montar
  useEffect(() => {
    // TODO: Habilitar cuando WebSocket esté configurado en backend
    // if (!ws.isConnected) {
    //   ws.connect();
    // }
    
    // Cargar datos iniciales
    refreshOrders();

    return () => {
      // No desconectar WebSocket aquí para mantener conexión entre páginas
    };
  }, []); // Removido refreshOrders de dependencias para evitar loops

  // Actualizar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearch]);

  const handleStatusUpdate = useCallback(async (orderId: number, status: string) => {
    if (status === 'en_preparacion') {
      await startPreparation(orderId);
    } else if (status === 'listo') {
      await markReady(orderId);
    }
  }, [startPreparation, markReady]);

  const layoutClass = isFullscreen 
    ? "min-h-screen bg-slate-900 p-4" 
    : "";

  const content = (
    <div className={layoutClass}>
      {/* Header de cocina */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-50">🍕 Vista de Cocina</h1>
        
        <div className="flex items-center space-x-4">
          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 text-amber-50 px-4 py-2 pr-10 rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none"
            />
            <svg className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Ordenamiento */}
          <select
            value={filter.ordenamiento}
            onChange={(e) => setSorting(e.target.value as typeof filter.ordenamiento)}
            className="bg-slate-800 text-amber-50 px-3 py-2 rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none"
          >
            <option value="tiempo_asc">Más antiguos primero</option>
            <option value="tiempo_desc">Más recientes primero</option>
            <option value="prioridad">Por prioridad</option>
            <option value="id_asc">Por número (asc)</option>
            <option value="id_desc">Por número (desc)</option>
          </select>

          {/* Controles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-lg border transition-colors ${
                isAudioEnabled 
                  ? 'bg-amber-600 border-amber-600 text-white' 
                  : 'bg-slate-800 border-slate-600 text-slate-400'
              }`}
              title={isAudioEnabled ? 'Desactivar audio' : 'Activar audio'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isAudioEnabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 2l-3.464 3.464L4 9v6l4.536 3.536L12 22V2z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                )}
              </svg>
            </button>

            <button
              onClick={() => setShowAudioSettings(true)}
              className="p-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-400 hover:text-amber-50 transition-colors"
              title="Configuración de audio"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-400 hover:text-amber-50 transition-colors"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15H4.5M9 15v4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>

            <button
              onClick={refreshOrders}
              className="p-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-400 hover:text-amber-50 transition-colors"
              title="Actualizar pedidos"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Status de conexión */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${
            ws.isConnected ? 'text-green-400' : 'text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              ws.isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-sm">
              {ws.isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <div className="text-sm text-slate-400">
            Total: {orders.length} pedidos activos
          </div>
        </div>
      </div>

      {/* Layout de 3 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] lg:h-[calc(100vh-250px)]">
        <StatusColumn
          title="Nuevos"
          orders={nuevos}
          onStatusUpdate={handleStatusUpdate}
          bgColor="bg-blue-600"
        />
        <StatusColumn
          title="En Preparación"
          orders={enPreparacion}
          onStatusUpdate={handleStatusUpdate}
          bgColor="bg-yellow-600"
        />
        <StatusColumn
          title="Listos"
          orders={listos}
          onStatusUpdate={handleStatusUpdate}
          bgColor="bg-green-600"
        />
      </div>

      {/* Modal de configuración de audio */}
      <AudioSettings
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
      />
    </div>
  );

  // Si está en fullscreen, mostrar contenido completo
  if (isFullscreen) {
    return content;
  }

  // Mostrar contenido normal (el root.tsx ya provee el layout)
  return content;
}