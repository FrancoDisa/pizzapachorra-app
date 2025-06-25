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
  getKitchenOrders: () => PedidoWithDetails[];
  getOrdersByStatus: (estado: string) => PedidoWithDetails[];
  getPriorityOrders: () => PedidoWithDetails[];
}

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

        // Pedidos actions
        setPedidos: (pedidos) => set({ pedidos }),
        addPedido: (pedido) => set((state) => ({
          pedidos: [pedido, ...state.pedidos]
        })),
        updatePedido: (pedido) => set((state) => ({
          pedidos: state.pedidos.map(p => p.id === pedido.id ? pedido : p)
        })),
        removePedido: (id) => set((state) => ({
          pedidos: state.pedidos.filter(p => p.id !== id)
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

        // Kitchen actions
        setKitchenFilter: (filter) => set((state) => ({
          kitchenFilter: { ...state.kitchenFilter, ...filter }
        })),

        updateKitchenSettings: (settings) => set((state) => ({
          kitchenSettings: { ...state.kitchenSettings, ...settings }
        })),

        updateAudioSettings: (settings) => set((state) => ({
          audioSettings: { ...state.audioSettings, ...settings }
        })),

        addOrderTimer: (timer) => set((state) => ({
          orderTimers: [...state.orderTimers.filter(t => t.orderId !== timer.orderId), timer]
        })),

        updateOrderTimer: (orderId, timerUpdate) => set((state) => ({
          orderTimers: state.orderTimers.map(timer => 
            timer.orderId === orderId ? { ...timer, ...timerUpdate } : timer
          )
        })),

        removeOrderTimer: (orderId) => set((state) => ({
          orderTimers: state.orderTimers.filter(timer => timer.orderId !== orderId)
        })),

        clearOrderTimers: () => set({ orderTimers: [] }),

        // Kitchen helper methods
        getKitchenOrders: () => {
          const state = get();
          const now = new Date();
          
          return state.pedidos
            .filter(pedido => ['nuevo', 'en_preparacion', 'listo'].includes(pedido.estado))
            .map(pedido => {
              const tiempoTranscurrido = Math.floor(
                (now.getTime() - new Date(pedido.created_at).getTime()) / (1000 * 60)
              );
              
              let prioridad: 'normal' | 'urgente' | 'critico' = 'normal';
              if (tiempoTranscurrido >= state.kitchenSettings.tiempoAlertaCritico) {
                prioridad = 'critico';
              } else if (tiempoTranscurrido >= state.kitchenSettings.tiempoAlertaUrgente) {
                prioridad = 'urgente';
              }

              return {
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
            })
            .sort((a, b) => {
              const { ordenamiento } = state.kitchenFilter;
              switch (ordenamiento) {
                case 'tiempo_desc':
                  return b.tiempoTranscurrido! - a.tiempoTranscurrido!;
                case 'id_asc':
                  return a.id - b.id;
                case 'id_desc':
                  return b.id - a.id;
                case 'prioridad':
                  const prioridadOrder = { critico: 3, urgente: 2, normal: 1 };
                  return prioridadOrder[b.prioridad!] - prioridadOrder[a.prioridad!];
                default: // tiempo_asc
                  return a.tiempoTranscurrido! - b.tiempoTranscurrido!;
              }
            });
        },

        getOrdersByStatus: (estado) => {
          const orders = get().getKitchenOrders();
          return orders.filter(pedido => pedido.estado === estado);
        },

        getPriorityOrders: () => {
          const orders = get().getKitchenOrders();
          return orders.filter(pedido => pedido.prioridad !== 'normal');
        }
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
export const useMenu = () => useAppStore((state) => state.menu);
export const usePedidos = () => useAppStore((state) => state.pedidos);
export const useClientes = () => useAppStore((state) => state.clientes);
export const useLoading = () => useAppStore((state) => state.loading);
export const useError = () => useAppStore((state) => state.error);

// Kitchen-specific selectors
export const useKitchenFilter = () => useAppStore((state) => state.kitchenFilter);
export const useKitchenSettings = () => useAppStore((state) => state.kitchenSettings);
export const useAudioSettings = () => useAppStore((state) => state.audioSettings);
export const useOrderTimers = () => useAppStore((state) => state.orderTimers);
export const useKitchenOrders = () => useAppStore((state) => state.getKitchenOrders());
export const useOrdersByStatus = (estado: string) => useAppStore((state) => state.getOrdersByStatus(estado));
export const usePriorityOrders = () => useAppStore((state) => state.getPriorityOrders());