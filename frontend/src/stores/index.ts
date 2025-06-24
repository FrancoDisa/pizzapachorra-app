import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { MenuData, Pedido, Cliente, AppState, Pizza, Extra } from '@/types';

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
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        // Estado inicial
        menu: { pizzas: [], extras: [] },
        pedidos: [],
        clientes: [],
        loading: false,
        error: null,

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
        clearError: () => set({ error: null })
      }),
      {
        name: 'pizza-pachorra-storage',
        partialize: (state) => ({
          menu: state.menu,
          clientes: state.clientes
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