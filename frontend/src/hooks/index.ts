// Kitchen-specific hooks
export {
  useKitchenOrders,
  useOrderTimer,
  useAudioNotifications,
  useOrderStatusUpdate,
  useKitchenFilters,
  useKitchenFullscreen
} from './useKitchen';

// Re-export store hooks for convenience
export {
  useAppStore,
  useMenu,
  usePedidos,
  useClientes,
  useLoading,
  useError,
  useKitchenFilter,
  useKitchenSettings,
  useAudioSettings,
  useOrderTimers
} from '@/stores';

// Re-export WebSocket hook
export { useWebSocket } from '@/services/websocket';