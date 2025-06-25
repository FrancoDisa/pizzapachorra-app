import { useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  useAppStore, 
  useKitchenSettings, 
  useOrderTimers,
  useAudioSettings 
} from '@/stores';
import { useWebSocket } from '@/services/websocket';
import { pedidosApi } from '@/services/api';
import type { EstadoPedido } from '@/types';

/**
 * Hook principal para gestión de pedidos de cocina
 * Proporciona todos los pedidos activos con información detallada
 */
export function useKitchenOrders() {
  const orders = useAppStore(state => state.getKitchenOrders());
  const { setLoading, setError, clearError } = useAppStore();

  const refreshOrders = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      const pedidos = await pedidosApi.getPedidos();
      useAppStore.getState().setPedidos(pedidos);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  return {
    orders,
    refreshOrders,
    nuevos: orders.filter(o => o.estado === 'nuevo'),
    enPreparacion: orders.filter(o => o.estado === 'en_preparacion'),
    listos: orders.filter(o => o.estado === 'listo'),
    prioritarios: orders.filter(o => o.prioridad !== 'normal')
  };
}

/**
 * Hook para gestión de timers de pedidos
 * Maneja el tiempo transcurrido y alertas por tiempo
 */
export function useOrderTimer(orderId?: number) {
  const timers = useOrderTimers();
  const settings = useKitchenSettings();
  const { addOrderTimer, updateOrderTimer, removeOrderTimer } = useAppStore();
  const ws = useWebSocket();
  
  const timer = useMemo(() => 
    orderId ? timers.find(t => t.orderId === orderId) : undefined, 
    [timers, orderId]
  );

  const startTimer = useCallback((orderIdToStart: number) => {
    addOrderTimer({
      orderId: orderIdToStart,
      startTime: new Date(),
      elapsed: 0,
      status: 'running'
    });
  }, [addOrderTimer]);

  const stopTimer = useCallback((orderIdToStop: number) => {
    updateOrderTimer(orderIdToStop, { status: 'completed' });
  }, [updateOrderTimer]);

  const pauseTimer = useCallback((orderIdToPause: number) => {
    updateOrderTimer(orderIdToPause, { status: 'paused' });
  }, [updateOrderTimer]);

  const resumeTimer = useCallback((orderIdToResume: number) => {
    updateOrderTimer(orderIdToResume, { status: 'running' });
  }, [updateOrderTimer]);

  const deleteTimer = useCallback((orderIdToDelete: number) => {
    removeOrderTimer(orderIdToDelete);
  }, [removeOrderTimer]);

  // Actualizar timers cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      timers.forEach(timer => {
        if (timer.status === 'running') {
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - timer.startTime.getTime()) / (1000 * 60));
          
          updateOrderTimer(timer.orderId, { elapsed });
          
          // Verificar alertas de tiempo
          if (elapsed === settings.tiempoAlertaUrgente || elapsed === settings.tiempoAlertaCritico) {
            ws.playSound('alerta_tiempo');
          }
        }
      });
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [timers, settings, updateOrderTimer, ws]);

  return {
    timer,
    timers,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    deleteTimer
  };
}

/**
 * Hook para gestión de notificaciones de audio
 * Controla la reproducción de sonidos y configuración de audio
 */
export function useAudioNotifications() {
  const audioSettings = useAudioSettings();
  const kitchenSettings = useKitchenSettings();
  const { updateAudioSettings, updateKitchenSettings } = useAppStore();
  const ws = useWebSocket();
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Pre-cargar archivos de audio
  useEffect(() => {
    const audioFiles = [
      audioSettings.nuevoPedido.audioFile,
      audioSettings.cambioEstado.audioFile,
      audioSettings.alertaTiempo.audioFile
    ];

    audioFiles.forEach(file => {
      if (!audioCache.current.has(file)) {
        const audio = new Audio(file);
        audio.preload = 'auto';
        audioCache.current.set(file, audio);
      }
    });
  }, [audioSettings]);

  const playSound = useCallback((type: 'nuevo_pedido' | 'cambio_estado' | 'alerta_tiempo') => {
    if (!kitchenSettings.notificacionesAudio) return;

    ws.playSound(type);
  }, [kitchenSettings.notificacionesAudio, ws]);

  const testSound = useCallback((type: 'nuevo_pedido' | 'cambio_estado' | 'alerta_tiempo') => {
    // Temporalmente habilitar audio para test
    const wasEnabled = kitchenSettings.notificacionesAudio;
    if (!wasEnabled) {
      updateKitchenSettings({ notificacionesAudio: true });
    }
    
    ws.playSound(type);
    
    // Restaurar configuración original
    if (!wasEnabled) {
      setTimeout(() => {
        updateKitchenSettings({ notificacionesAudio: wasEnabled });
      }, 100);
    }
  }, [kitchenSettings.notificacionesAudio, updateKitchenSettings, ws]);

  const updateVolume = useCallback((volume: number) => {
    updateKitchenSettings({ volumenAudio: Math.max(0, Math.min(100, volume)) });
  }, [updateKitchenSettings]);

  const toggleAudio = useCallback(() => {
    updateKitchenSettings({ notificacionesAudio: !kitchenSettings.notificacionesAudio });
  }, [kitchenSettings.notificacionesAudio, updateKitchenSettings]);

  const updateNotificationSettings = useCallback((
    type: 'nuevo_pedido' | 'cambio_estado' | 'alerta_tiempo',
    enabled: boolean
  ) => {
    const setting = type === 'nuevo_pedido' ? 'nuevoPedido' : 
                    type === 'cambio_estado' ? 'cambioEstado' : 'alertaTiempo';
    
    updateAudioSettings({
      [setting]: {
        ...audioSettings[setting],
        enabled
      }
    });
  }, [audioSettings, updateAudioSettings]);

  return {
    audioSettings,
    kitchenSettings,
    playSound,
    testSound,
    updateVolume,
    toggleAudio,
    updateNotificationSettings,
    isAudioEnabled: kitchenSettings.notificacionesAudio
  };
}

/**
 * Hook para actualización de estados de pedidos
 * Facilita la transición entre estados con validaciones
 */
export function useOrderStatusUpdate() {
  const { setLoading, setError, clearError } = useAppStore();
  const ws = useWebSocket();

  const updateOrderStatus = useCallback(async (
    orderId: number, 
    newStatus: EstadoPedido
  ): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      const updatedOrder = await pedidosApi.updateEstadoPedido(orderId, newStatus);
      useAppStore.getState().updatePedido(updatedOrder);

      // Notificar via WebSocket si está conectado
      if (ws.isConnected) {
        ws.send({
          type: 'order_status_update',
          orderId,
          newStatus,
          timestamp: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar estado');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError, ws]);

  const startPreparation = useCallback((orderId: number) => 
    updateOrderStatus(orderId, 'en_preparacion'), [updateOrderStatus]);
  
  const markReady = useCallback((orderId: number) => 
    updateOrderStatus(orderId, 'listo'), [updateOrderStatus]);
  
  const markDelivered = useCallback((orderId: number) => 
    updateOrderStatus(orderId, 'entregado'), [updateOrderStatus]);
  
  const cancelOrder = useCallback((orderId: number) => 
    updateOrderStatus(orderId, 'cancelado'), [updateOrderStatus]);

  return {
    updateOrderStatus,
    startPreparation,
    markReady,
    markDelivered,
    cancelOrder
  };
}

/**
 * Hook para filtrado y búsqueda de pedidos
 * Proporciona funcionalidad avanzada de filtros
 */
export function useKitchenFilters() {
  const filter = useAppStore(state => state.kitchenFilter);
  const { setKitchenFilter } = useAppStore();
  const allOrders = useAppStore(state => state.getKitchenOrders());

  const filteredOrders = useMemo(() => {
    let filtered = [...allOrders];

    // Filtrar por estado
    if (filter.estado && filter.estado.length > 0) {
      filtered = filtered.filter(order => filter.estado!.includes(order.estado));
    }

    // Filtrar por prioridad
    if (filter.prioridad) {
      filtered = filtered.filter(order => order.prioridad === filter.prioridad);
    }

    // Filtrar por búsqueda
    if (filter.busqueda) {
      const searchTerm = filter.busqueda.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.cliente.nombre?.toLowerCase().includes(searchTerm) ||
        order.cliente.telefono.includes(searchTerm) ||
        order.items.some(item => 
          item.pizza?.nombre.toLowerCase().includes(searchTerm) ||
          item.notas?.toLowerCase().includes(searchTerm)
        )
      );
    }

    return filtered;
  }, [allOrders, filter]);

  const updateFilter = useCallback((newFilter: Partial<typeof filter>) => {
    setKitchenFilter(newFilter);
  }, [setKitchenFilter]);

  const clearFilters = useCallback(() => {
    setKitchenFilter({ ordenamiento: 'tiempo_asc' });
  }, [setKitchenFilter]);

  const setSearch = useCallback((searchTerm: string) => {
    updateFilter({ busqueda: searchTerm });
  }, [updateFilter]);

  const setSorting = useCallback((sorting: typeof filter.ordenamiento) => {
    updateFilter({ ordenamiento: sorting });
  }, [updateFilter]);

  return {
    filter,
    filteredOrders,
    updateFilter,
    clearFilters,
    setSearch,
    setSorting,
    totalOrders: allOrders.length,
    filteredCount: filteredOrders.length
  };
}

/**
 * Hook para modo fullscreen
 * Controla el modo pantalla completa para displays de cocina
 */
export function useKitchenFullscreen() {
  const settings = useKitchenSettings();
  const { updateKitchenSettings } = useAppStore();

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        updateKitchenSettings({ modoFullscreen: true });
      } else {
        await document.exitFullscreen();
        updateKitchenSettings({ modoFullscreen: false });
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  }, [updateKitchenSettings]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        updateKitchenSettings({ modoFullscreen: false });
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  }, [updateKitchenSettings]);

  // Sincronizar estado cuando cambia fullscreen externamente
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      if (isFullscreen !== settings.modoFullscreen) {
        updateKitchenSettings({ modoFullscreen: isFullscreen });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [settings.modoFullscreen, updateKitchenSettings]);

  return {
    isFullscreen: settings.modoFullscreen,
    toggleFullscreen,
    exitFullscreen,
    isSupported: !!document.documentElement.requestFullscreen
  };
}