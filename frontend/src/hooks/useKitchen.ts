import { useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  useAppStore, 
  useKitchenSettings, 
  useOrderTimers,
  useAudioSettings,
  useKitchenOrderIds
} from '@/stores';
import { useWebSocket } from '@/services/websocket';
import { pedidosApi } from '@/services/api';
import type { EstadoPedido, PedidoWithDetails } from '@/types';

/**
 * Hook principal para gestión de pedidos de cocina
 * Proporciona todos los pedidos activos con información detallada
 */
export function useKitchenOrders() {
  const orderIds = useKitchenOrderIds();
  const { setLoading, setError, clearError } = useAppStore();
  const filter = useAppStore(state => state.kitchenFilter);

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

  // Usar ref para cachear orders y evitar recalculos innecesarios
  const ordersRef = useRef<PedidoWithDetails[]>([]);
  const lastOrderIdsRef = useRef<string>('');
  const lastOrderingRef = useRef<string>('');

  const orders = useMemo(() => {
    const orderIdsString = JSON.stringify(orderIds);
    const ordering = filter.ordenamiento;
    
    // Solo recalcular si orderIds o ordering cambiaron
    if (orderIdsString === lastOrderIdsRef.current && ordering === lastOrderingRef.current) {
      return ordersRef.current;
    }
    
    const store = useAppStore.getState();
    const ordersWithDetails: PedidoWithDetails[] = [];
    
    for (const id of orderIds) {
      const orderWithDetails = store.getOrderWithDetails(id);
      if (orderWithDetails) {
        ordersWithDetails.push(orderWithDetails);
      }
    }
    
    // Aplicar ordenamiento
    const sortedOrders = ordersWithDetails.sort((a, b) => {
      switch (ordering) {
        case 'tiempo_desc':
          return b.tiempoTranscurrido! - a.tiempoTranscurrido!;
        case 'id_asc':
          return a.id - b.id;
        case 'id_desc':
          return b.id - a.id;
        case 'prioridad': {
          const prioridadOrder = { critico: 3, urgente: 2, normal: 1 };
          return prioridadOrder[b.prioridad!] - prioridadOrder[a.prioridad!];
        }
        default: // tiempo_asc
          return a.tiempoTranscurrido! - b.tiempoTranscurrido!;
      }
    });
    
    // Cachear resultado
    ordersRef.current = sortedOrders;
    lastOrderIdsRef.current = orderIdsString;
    lastOrderingRef.current = ordering;
    
    return sortedOrders;
  }, [orderIds, filter.ordenamiento]);

  // Memoizar filtros por estado con referencia estable
  const statusFilters = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    return {
      nuevos: safeOrders.filter(o => o.estado === 'nuevo'),
      enPreparacion: safeOrders.filter(o => o.estado === 'en_preparacion'),
      listos: safeOrders.filter(o => o.estado === 'listo'),
      prioritarios: safeOrders.filter(o => o.prioridad !== 'normal')
    };
  }, [orders]);

  return {
    orders,
    refreshOrders,
    ...statusFilters
  };
}

/**
 * Hook para gestión de timers de pedidos
 * Maneja el tiempo transcurrido y alertas por tiempo
 */
export function useOrderTimer(orderId?: number) {
  const timers = useOrderTimers();
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
      const store = useAppStore.getState();
      const currentTimers = store.orderTimers;
      const currentSettings = store.kitchenSettings;
      
      // Verificar si hay timers antes de procesar
      if (!currentTimers || currentTimers.length === 0) {
        return;
      }
      
      currentTimers.forEach(timer => {
        if (timer.status === 'running') {
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - timer.startTime.getTime()) / (1000 * 60));
          
          // Solo actualizar si el tiempo ha cambiado y el timer aún existe
          if (elapsed !== timer.elapsed && elapsed >= 0) {
            // Verificar que el timer aún existe antes de actualizar
            const stillExists = useAppStore.getState().orderTimers.find(t => t.orderId === timer.orderId);
            if (stillExists) {
              useAppStore.getState().updateOrderTimer(timer.orderId, { elapsed });
              
              // Verificar alertas de tiempo
              if (elapsed === currentSettings.tiempoAlertaUrgente || elapsed === currentSettings.tiempoAlertaCritico) {
                // Solo reproducir sonido si WebSocket está disponible y conectado
                try {
                  if (ws && ws.isConnected) {
                    ws.playSound('alerta_tiempo');
                  }
                } catch (error) {
                  console.warn('Error playing audio alert:', error);
                }
              }
            }
          }
        }
      });
    }, 60000); // Cada minuto

    return () => {
      clearInterval(interval);
    };
  }, []); // Sin dependencias para evitar loops

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
    const clampedVolume = Math.max(0, Math.min(100, volume));
    updateKitchenSettings({ volumenAudio: clampedVolume });
  }, [updateKitchenSettings]);

  const toggleAudio = useCallback(() => {
    updateKitchenSettings({ 
      notificacionesAudio: !useAppStore.getState().kitchenSettings.notificacionesAudio 
    });
  }, [updateKitchenSettings]);

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
export function useKitchenFilters(orders: PedidoWithDetails[] = []) {
  const filter = useAppStore(state => state.kitchenFilter);
  const { setKitchenFilter } = useAppStore();

  const filteredOrders = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    let filtered = [...safeOrders];

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
  }, [orders, filter]);

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
    totalOrders: orders.length,
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