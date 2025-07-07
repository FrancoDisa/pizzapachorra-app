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

// Componente para card de pedido horizontal optimizada
const QuickActionCard = memo(function QuickActionCard({ order, onStatusUpdate }: { 
  order: PedidoWithDetails; 
  onStatusUpdate: (orderId: number, status: string) => void;
}) {
  const getPriorityBorder = (prioridad: string) => {
    switch (prioridad) {
      case 'critico':
        return 'border-l-4 border-l-red-500 bg-red-900/10';
      case 'urgente':
        return 'border-l-4 border-l-yellow-500 bg-yellow-900/10';
      default:
        return 'border-l-4 border-l-slate-600 bg-slate-800/50';
    }
  };

  const getStatusClass = (estado: string) => {
    switch (estado) {
      case 'nuevo':
        return 'bg-blue-600 text-white';
      case 'en_preparacion':
        return 'bg-yellow-600 text-white';
      case 'listo':
        return 'bg-green-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getTimeClass = (minutes: number) => {
    if (minutes >= 30) return 'text-red-400 font-bold';
    if (minutes >= 15) return 'text-yellow-400 font-medium';
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
  const canComplete = order.estado === 'listo';

  return (
    <div className={`rounded-lg transition-all hover:shadow-lg ${getPriorityBorder(order.prioridad!)}`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-4 space-y-3 lg:space-y-0 lg:space-x-4">
        {/* Información principal del pedido */}
        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 w-full lg:w-auto">
          <div className="flex-shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-amber-50">#{order.id}</div>
            <div className={`text-xs sm:text-sm ${getTimeClass(order.tiempoTranscurrido!)}`}>
              {formatTime(order.tiempoTranscurrido!)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.estado)}`}>
                {order.estado === 'nuevo' ? 'Nuevo' : order.estado === 'en_preparacion' ? 'En Prep' : 'Listo'}
              </span>
              {order.prioridad !== 'normal' && (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  order.prioridad === 'critico' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'
                }`}>
                  {order.prioridad}
                </span>
              )}
            </div>
            
            {/* Items del pedido en formato compacto */}
            <div className="space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="font-medium text-amber-50">
                    {item.cantidad}x {item.pizza?.nombre || 'Pizza'}
                  </span>
                  {item.es_mitad_y_mitad && (
                    <span className="text-slate-300 text-xs">
                      (½{item.pizza_mitad_1_data?.nombre} + ½{item.pizza_mitad_2_data?.nombre})
                    </span>
                  )}
                  {item.extras_agregados_data && item.extras_agregados_data.length > 0 && (
                    <span className="text-green-400 text-xs">+{item.extras_agregados_data.length}</span>
                  )}
                  {item.extras_removidos_data && item.extras_removidos_data.length > 0 && (
                    <span className="text-red-400 text-xs">-{item.extras_removidos_data.length}</span>
                  )}
                  {item.notas && (
                    <span className="text-yellow-300">📝</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Información del cliente en móvil */}
            <div className="block lg:hidden mt-2 text-xs text-slate-400">
              <span className="font-medium text-amber-50">{order.cliente.nombre || 'Cliente'}</span>
              <span className="mx-2">•</span>
              <span>{order.cliente.telefono}</span>
              <span className="mx-2">•</span>
              <span className="font-bold text-amber-50">${order.total}</span>
            </div>
          </div>
        </div>

        {/* Información del cliente en desktop */}
        <div className="hidden lg:block flex-shrink-0 text-right text-sm text-slate-400 min-w-0">
          <div className="font-medium text-amber-50 truncate">{order.cliente.nombre || 'Cliente'}</div>
          <div>{order.cliente.telefono}</div>
          <div className="font-bold text-amber-50">${order.total}</div>
          <div>{new Date(order.created_at).toLocaleTimeString()}</div>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex-shrink-0 flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {canStartPreparation && (
            <button
              onClick={() => onStatusUpdate(order.id, 'en_preparacion')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded font-medium transition-colors flex items-center space-x-1 text-xs sm:text-sm"
              title="Iniciar preparación"
            >
              <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
              </svg>
              <span>Iniciar</span>
            </button>
          )}
          {canMarkReady && (
            <button
              onClick={() => onStatusUpdate(order.id, 'listo')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 sm:px-4 rounded font-medium transition-colors flex items-center space-x-1 text-xs sm:text-sm"
              title="Marcar como listo"
            >
              <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Listo</span>
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => onStatusUpdate(order.id, 'entregado')}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 sm:px-4 rounded font-medium transition-colors flex items-center space-x-1 text-xs sm:text-sm"
              title="Marcar como entregado"
            >
              <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Entregar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// Componente para filtros de tabs rápidos
const QuickFilters = memo(function QuickFilters({ 
  activeFilter, 
  onFilterChange, 
  counts 
}: { 
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: { todos: number; nuevos: number; enPreparacion: number; listos: number };
}) {
  const filters = [
    { key: 'todos', label: 'Todos', count: counts.todos, color: 'bg-slate-600' },
    { key: 'nuevos', label: 'Nuevos', count: counts.nuevos, color: 'bg-blue-600' },
    { key: 'en_preparacion', label: 'En Prep', count: counts.enPreparacion, color: 'bg-yellow-600' },
    { key: 'listos', label: 'Listos', count: counts.listos, color: 'bg-green-600' }
  ];

  return (
    <div className="flex space-x-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
            activeFilter === filter.key
              ? `${filter.color} text-white border-transparent shadow-lg`
              : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
          }`}
        >
          <span className="font-medium">{filter.label}</span>
          <span className={`inline-flex items-center justify-center min-w-[20px] h-5 text-xs font-bold rounded-full ${
            activeFilter === filter.key
              ? 'bg-white/20 text-white'
              : 'bg-slate-600 text-slate-200'
          }`}>
            {filter.count}
          </span>
        </button>
      ))}
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
  const [activeFilter, setActiveFilter] = useState('todos');

  // Conectar WebSocket y cargar datos iniciales al montar
  useEffect(() => {
    // Conectar WebSocket para tiempo real
    if (!ws.isConnected) {
      ws.connect();
    }
    
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
    // Podríamos agregar más estados como 'entregado' en el futuro
  }, [startPreparation, markReady]);

  // Filtrar órdenes según filtro activo
  const getFilteredOrders = useCallback(() => {
    switch (activeFilter) {
      case 'nuevos':
        return nuevos;
      case 'en_preparacion':
        return enPreparacion;
      case 'listos':
        return listos;
      default:
        return orders;
    }
  }, [activeFilter, orders, nuevos, enPreparacion, listos]);

  const filteredOrders = getFilteredOrders();
  
  // Contadores para los tabs
  const counts = {
    todos: orders.length,
    nuevos: nuevos.length,
    enPreparacion: enPreparacion.length,
    listos: listos.length
  };

  const layoutClass = isFullscreen 
    ? "min-h-screen bg-slate-900 p-4" 
    : "p-4";

  const content = (
    <div className={layoutClass}>
      {/* Header de cocina */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-amber-50">🍕 Vista de Cocina</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
          {/* Búsqueda */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-slate-800 text-amber-50 px-4 py-2 pr-10 rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none"
            />
            <svg className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Ordenamiento */}
          <select
            value={filter.ordenamiento}
            onChange={(e) => setSorting(e.target.value as typeof filter.ordenamiento)}
            className="w-full sm:w-auto bg-slate-800 text-amber-50 px-3 py-2 rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none"
          >
            <option value="tiempo_asc">Más antiguos primero</option>
            <option value="tiempo_desc">Más recientes primero</option>
            <option value="prioridad">Por prioridad</option>
            <option value="id_asc">Por número (asc)</option>
            <option value="id_desc">Por número (desc)</option>
          </select>

          {/* Controles */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-start">
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

      {/* Filtros de tabs rápidos */}
      <QuickFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      {/* Lista unificada de pedidos */}
      <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-700">
          <h2 className="text-base sm:text-lg font-semibold text-amber-50">
            {activeFilter === 'todos' ? 'Todos los Pedidos' : 
             activeFilter === 'nuevos' ? 'Pedidos Nuevos' :
             activeFilter === 'en_preparacion' ? 'En Preparación' :
             'Pedidos Listos'} ({filteredOrders.length})
          </h2>
        </div>
        
        <div className="max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center text-slate-500 py-8 sm:py-12 px-4">
              <svg className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-base sm:text-lg">
                {activeFilter === 'todos' ? 'No hay pedidos activos' :
                 activeFilter === 'nuevos' ? 'No hay pedidos nuevos' :
                 activeFilter === 'en_preparacion' ? 'No hay pedidos en preparación' :
                 'No hay pedidos listos'}
              </p>
              <p className="text-xs sm:text-sm mt-1">Los pedidos aparecerán aquí automáticamente</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredOrders.map((order) => (
                <QuickActionCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
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