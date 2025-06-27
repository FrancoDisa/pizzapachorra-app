import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  MenuData, 
  Pedido, 
  Cliente, 
  AppState, 
  Pizza, 
  Extra,
  KitchenFilter,
  KitchenSettings,
  OrderTimerState,
  PedidoWithDetails,
  KitchenAudioSettings
} from '@/types';

interface AppStore extends AppState {
  // Actions para menu
  setMenu: (menu: MenuData) => void;
  updatePizza: (pizza: Pizza) => void;
  updateExtra: (extra: Extra) => void;
  
  // Actions para pedidos
  setPedidos: (pedidos: Pedido[]) => void;
  addPedido: (pedido: Pedido) => void;
  updatePedido: (pedido: Pedido) => void;
  removePedido: (id: number) => void;
  
  // Actions para clientes
  setClientes: (clientes: Cliente[]) => void;
  addCliente: (cliente: Cliente) => void;
  updateCliente: (cliente: Cliente) => void;
  
  // Actions para UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Kitchen-specific state and actions
  kitchenFilter: KitchenFilter;
  kitchenSettings: KitchenSettings;
  audioSettings: KitchenAudioSettings;
  orderTimers: OrderTimerState[];
  
  // Kitchen actions
  setKitchenFilter: (filter: Partial<KitchenFilter>) => void;
  updateKitchenSettings: (settings: Partial<KitchenSettings>) => void;
  updateAudioSettings: (settings: Partial<KitchenAudioSettings>) => void;
  addOrderTimer: (timer: OrderTimerState) => void;
  updateOrderTimer: (orderId: number, timer: Partial<OrderTimerState>) => void;
  removeOrderTimer: (orderId: number) => void;
  clearOrderTimers: () => void;
  
  // Kitchen helper methods
  getKitchenOrderIds: () => number[];
  getOrderWithDetails: (orderId: number) => PedidoWithDetails | null;
}

// Safeguards para prevenir infinite loops
const createSafeUpdater = <T>(updater: (state: T) => Partial<T>) => {
  let isUpdating = false;
  return (state: T): T => {
    if (isUpdating) {
      console.warn('Prevented potential infinite loop in store update');
      return state;
    }
    
    isUpdating = true;
    try {
      const updates = updater(state);
      return { ...state, ...updates };
    } finally {
      isUpdating = false;
    }
  };
};

// Rate limiting para updates frecuentes (unused pero disponible para futuro uso)
// const createRateLimitedUpdate = <T>(updateFn: (updates: Partial<T>) => void, limit = 100) => {
//   let lastUpdate = 0;
//   return (updates: Partial<T>) => {
//     const now = Date.now();
//     if (now - lastUpdate < limit) {
//       return; // Skip update if too frequent
//     }
//     lastUpdate = now;
//     updateFn(updates);
//   };
// };

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        menu: { pizzas: [], extras: [] },
        pedidos: [],
        clientes: [],
        loading: false,
        error: null,

        // Kitchen state inicial
        kitchenFilter: {
          ordenamiento: 'tiempo_asc'
        },
        kitchenSettings: {
          notificacionesAudio: true,
          volumenAudio: 70,
          tiempoAlertaUrgente: 15,
          tiempoAlertaCritico: 30,
          modoFullscreen: false,
          actualizacionAutomatica: true
        },
        audioSettings: {
          nuevoPedido: {
            type: 'nuevo_pedido',
            audioFile: '/sounds/nuevo-pedido.mp3',
            enabled: true
          },
          cambioEstado: {
            type: 'cambio_estado',
            audioFile: '/sounds/cambio-estado.mp3',
            enabled: true
          },
          alertaTiempo: {
            type: 'alerta_tiempo',
            audioFile: '/sounds/alerta-tiempo.mp3',
            enabled: true
          },
          volumenGeneral: 70
        },
        orderTimers: [],

        // Menu actions
        setMenu: (menu) => set({ menu }),
        updatePizza: (pizza) => set((state) => ({
          menu: {
            ...state.menu,
            pizzas: state.menu.pizzas.map(p => p.id === pizza.id ? pizza : p)
          }
        })),
        updateExtra: (extra) => set((state) => ({
          menu: {
            ...state.menu,
            extras: state.menu.extras.map(e => e.id === extra.id ? extra : e)
          }
        })),

        // Pedidos actions con protecciones
        setPedidos: (pedidos) => set({ pedidos: Array.isArray(pedidos) ? pedidos : [] }),
        addPedido: (pedido) => set((state) => ({
          pedidos: [pedido, ...(Array.isArray(state.pedidos) ? state.pedidos : [])]
        })),
        updatePedido: (pedido) => set((state) => ({
          pedidos: Array.isArray(state.pedidos) 
            ? state.pedidos.map(p => p.id === pedido.id ? pedido : p)
            : [pedido]
        })),
        removePedido: (id) => set((state) => ({
          pedidos: Array.isArray(state.pedidos) 
            ? state.pedidos.filter(p => p.id !== id)
            : []
        })),

        // Clientes actions
        setClientes: (clientes) => set({ clientes }),
        addCliente: (cliente) => set((state) => ({
          clientes: [cliente, ...state.clientes]
        })),
        updateCliente: (cliente) => set((state) => ({
          clientes: state.clientes.map(c => c.id === cliente.id ? cliente : c)
        })),

        // UI actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Kitchen actions con safeguards
        setKitchenFilter: (filter) => set(createSafeUpdater((state) => ({
          kitchenFilter: { ...state.kitchenFilter, ...filter }
        }))),

        updateKitchenSettings: (settings) => set(createSafeUpdater((state) => ({
          kitchenSettings: { ...state.kitchenSettings, ...settings }
        }))),

        updateAudioSettings: (settings) => set(createSafeUpdater((state) => ({
          audioSettings: { ...state.audioSettings, ...settings }
        }))),

        addOrderTimer: (timer) => set(createSafeUpdater((state) => ({
          orderTimers: [...state.orderTimers.filter(t => t.orderId !== timer.orderId), timer]
        }))),

        updateOrderTimer: (orderId, timerUpdate) => set(createSafeUpdater((state) => ({
          orderTimers: state.orderTimers.map(timer => 
            timer.orderId === orderId ? { ...timer, ...timerUpdate } : timer
          )
        }))),

        removeOrderTimer: (orderId) => set(createSafeUpdater((state) => ({
          orderTimers: state.orderTimers.filter(timer => timer.orderId !== orderId)
        }))),

        clearOrderTimers: () => set({ orderTimers: [] }),

        // Kitchen helper methods - devuelve IDs para evitar infinite loops
        getKitchenOrderIds: (() => {
          let cachedResult: number[] = [];
          let lastPedidosHash = '';
          let lastFilterHash = '';
          
          return () => {
            const state = get();
            
            // Verificar que pedidos sea un array
            if (!Array.isArray(state.pedidos)) {
              console.warn('state.pedidos is not an array:', state.pedidos);
              return [];
            }
            
            // Crear hash para detectar cambios
            const pedidosHash = JSON.stringify(state.pedidos.map(p => ({ id: p.id, estado: p.estado })));
            const filterHash = state.kitchenFilter.ordenamiento;
            
            // Solo recalcular si algo cambió
            if (pedidosHash !== lastPedidosHash || filterHash !== lastFilterHash) {
              cachedResult = state.pedidos
                .filter(pedido => ['nuevo', 'en_preparacion', 'listo'].includes(pedido.estado))
                .map(pedido => pedido.id)
                .sort((a, b) => {
                  const { ordenamiento } = state.kitchenFilter;
                  
                  switch (ordenamiento) {
                    case 'id_asc':
                      return a - b;
                    case 'id_desc':
                      return b - a;
                    default: // tiempo_asc, tiempo_desc, prioridad se manejan en el hook
                      return a - b;
                  }
                });
              
              lastPedidosHash = pedidosHash;
              lastFilterHash = filterHash;
            }
            
            return cachedResult;
          };
        })(),

        // Método helper para obtener un pedido con detalles (con caching)
        getOrderWithDetails: (() => {
          const cache = new Map<number, { result: PedidoWithDetails | null; timestamp: number; pedidoHash: string }>();
          const CACHE_TTL = 30000; // 30 segundos para cache de tiempo transcurrido
          
          return (orderId: number) => {
            const state = get();
            
            // Verificar que pedidos sea un array
            if (!Array.isArray(state.pedidos)) {
              console.warn('state.pedidos is not an array in getOrderWithDetails:', state.pedidos);
              return null;
            }
            
            const pedido = state.pedidos.find(p => p.id === orderId);
            if (!pedido) {
              cache.delete(orderId);
              return null;
            }

            // Hash para detectar cambios en el pedido
            const pedidoHash = JSON.stringify({
              id: pedido.id,
              estado: pedido.estado,
              created_at: pedido.created_at,
              itemsCount: pedido.items.length
            });

            const now = Date.now();
            const cached = cache.get(orderId);
            
            // Usar cache si existe, no expiró y el pedido no cambió
            if (cached && 
                now - cached.timestamp < CACHE_TTL && 
                cached.pedidoHash === pedidoHash) {
              return cached.result;
            }

            // Calcular nuevo resultado
            const tiempoTranscurrido = Math.floor(
              (now - new Date(pedido.created_at).getTime()) / (1000 * 60)
            );
            
            let prioridad: 'normal' | 'urgente' | 'critico' = 'normal';
            if (tiempoTranscurrido >= state.kitchenSettings.tiempoAlertaCritico) {
              prioridad = 'critico';
            } else if (tiempoTranscurrido >= state.kitchenSettings.tiempoAlertaUrgente) {
              prioridad = 'urgente';
            }

            const result = {
              ...pedido,
              tiempoTranscurrido,
              prioridad,
              items: pedido.items.map(item => ({
                ...item,
                pizza: state.menu.pizzas.find(p => p.id === item.pizza_id),
                pizza_mitad_1_data: item.pizza_mitad_1 ? 
                  state.menu.pizzas.find(p => p.id === item.pizza_mitad_1) : undefined,
                pizza_mitad_2_data: item.pizza_mitad_2 ? 
                  state.menu.pizzas.find(p => p.id === item.pizza_mitad_2) : undefined,
                extras_agregados_data: item.extras_agregados
                  .map(id => state.menu.extras.find(e => e.id === id))
                  .filter((e): e is Extra => Boolean(e)),
                extras_removidos_data: item.extras_removidos
                  .map(id => state.menu.extras.find(e => e.id === id))
                  .filter((e): e is Extra => Boolean(e))
              }))
            };

            // Guardar en cache
            cache.set(orderId, { result, timestamp: now, pedidoHash });
            
            return result;
          };
        })(),

      }),
      {
        name: 'pizza-pachorra-storage',
        partialize: (state) => ({
          menu: state.menu,
          clientes: state.clientes,
          kitchenSettings: state.kitchenSettings,
          audioSettings: state.audioSettings,
          kitchenFilter: state.kitchenFilter
        })
      }
    ),
    { name: 'pizza-pachorra-store' }
  )
);

// Selectores útiles
export const usePizzas = () => useAppStore((state) => Array.isArray(state.menu?.pizzas) ? state.menu.pizzas : []);
export const useExtras = () => useAppStore((state) => Array.isArray(state.menu?.extras) ? state.menu.extras : []);
export const usePedidos = () => useAppStore((state) => Array.isArray(state.pedidos) ? state.pedidos : []);
export const useClientes = () => useAppStore((state) => state.clientes);
export const useLoading = () => useAppStore((state) => state.loading);
export const useError = () => useAppStore((state) => state.error);

// Kitchen-specific selectors
export const useKitchenFilter = () => useAppStore((state) => state.kitchenFilter);
export const useKitchenSettings = () => useAppStore((state) => state.kitchenSettings);
export const useAudioSettings = () => useAppStore((state) => state.audioSettings);
export const useOrderTimers = () => useAppStore((state) => state.orderTimers);
export const useKitchenOrderIds = () => useAppStore((state) => state.getKitchenOrderIds());