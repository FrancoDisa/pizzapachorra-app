import { io, Socket } from 'socket.io-client';
import type { WebSocketMessage, Pedido, Cliente } from '@/types';
import { useAppStore } from '@/stores';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageQueue: WebSocketMessage[] = [];
  private isProcessingQueue = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private url: string) {}

  connect(): void {
    try {
      // Disconnect existing connection if any
      if (this.socket) {
        this.socket.disconnect();
      }

      // Create Socket.IO connection
      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        forceNew: true
      });
      
      this.socket.on('connect', () => {
        console.log('✅ Socket.IO conectado:', this.socket?.id);
        console.log('🔗 URL:', this.url);
        this.reconnectAttempts = 0;
        
        // Join cocina room for kitchen updates
        this.socket?.emit('join_cocina');
        console.log('🏠 Unido a sala cocina');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket.IO desconectado:', reason);
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          this.socket?.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('🚨 Error de conexión Socket.IO:', error);
        console.error('🔍 Detalles:', {
          url: this.url,
          transport: this.socket?.io?.engine?.transport?.name,
          attemps: this.reconnectAttempts
        });
        this.reconnectAttempts++;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket.IO reconectado en intento:', attemptNumber);
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Intento de reconexión:', attemptNumber);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('🚨 Error de reconexión:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Falló la reconexión después de todos los intentos');
      });

      // Listen for order events
      this.socket.on('nuevo_pedido', (data: Pedido) => {
        console.log('📦 Nuevo pedido recibido:', data.id);
        this.queueMessage({ type: 'nuevo_pedido', data });
      });

      this.socket.on('pedido_actualizado', (data: Pedido) => {
        console.log('📝 Pedido actualizado:', data.id);
        this.queueMessage({ type: 'pedido_actualizado', data });
      });

      this.socket.on('cambio_estado', (data: Pedido) => {
        console.log('🔄 Cambio de estado:', data.id, '→', data.estado);
        this.queueMessage({ type: 'cambio_estado', data });
      });

      this.socket.on('cliente_actualizado', (data: Cliente) => {
        console.log('👤 Cliente actualizado:', data.id);
        this.queueMessage({ type: 'cliente_actualizado', data });
      });

    } catch (error) {
      console.error('Error creando conexión Socket.IO:', error);
    }
  }

  disconnect(): void {
    this.clearDebounceTimer();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message);
    this.debounceProcessQueue();
  }

  private debounceProcessQueue(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.processMessageQueue();
    }, 100); // 100ms debounce
  }

  private clearDebounceTimer(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  private async processMessageQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const messagesToProcess = [...this.messageQueue];
    this.messageQueue = [];

    try {
      // Agrupar mensajes por tipo para batch updates
      const messagesByType = messagesToProcess.reduce((groups, message) => {
        if (!groups[message.type]) {
          groups[message.type] = [];
        }
        groups[message.type].push(message);
        return groups;
      }, {} as Record<string, WebSocketMessage[]>);

      // Procesar mensajes en batch para evitar múltiples re-renders
      for (const [type, messages] of Object.entries(messagesByType)) {
        await this.processBatchedMessages(type, messages);
      }
    } catch (error) {
      console.error('Error processing message queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }


  private async processBatchedMessages(type: string, messages: WebSocketMessage[]): Promise<void> {
    if (messages.length === 0) return;

    try {
      const store = useAppStore.getState();

      switch (type) {
        case 'nuevo_pedido': {
          // Procesar todos los nuevos pedidos en batch
          const nuevoPedidos = messages.map(msg => msg.data as Pedido);
          
          // Batch update de pedidos
          for (const pedido of nuevoPedidos) {
            store.addPedido(pedido);
            
            if (['nuevo', 'en_preparacion'].includes(pedido.estado)) {
              // Mostrar notificación solo del último pedido para evitar spam
              if (pedido === nuevoPedidos[nuevoPedidos.length - 1]) {
                this.showNotification('Nuevo pedido', `${nuevoPedidos.length} pedido(s) recibido(s)`);
                this.playAudioNotification('nuevo_pedido');
              }
              
              // Crear timer
              store.addOrderTimer({
                orderId: pedido.id,
                startTime: new Date(),
                elapsed: 0,
                status: 'running'
              });
            }
          }
          break;
        }

        case 'cambio_estado': {
          const pedidosActualizados = messages.map(msg => msg.data as Pedido);
          
          for (const pedido of pedidosActualizados) {
            store.updatePedido(pedido);
            
            // Manejar transiciones de estado
            if (pedido.estado === 'en_preparacion') {
              store.updateOrderTimer(pedido.id, { 
                status: 'running',
                startTime: new Date()
              });
            } else if (pedido.estado === 'listo') {
              store.updateOrderTimer(pedido.id, { status: 'completed' });
            } else if (['entregado', 'cancelado'].includes(pedido.estado)) {
              store.removeOrderTimer(pedido.id);
            }
          }
          
          // Notificación solo del último cambio
          const lastPedido = pedidosActualizados[pedidosActualizados.length - 1];
          this.showNotification(
            'Estado actualizado', 
            `Pedido #${lastPedido.id} - ${lastPedido.estado}`
          );
          this.playAudioNotification('cambio_estado');
          break;
        }

        case 'pedido_actualizado': {
          const pedidosModificados = messages.map(msg => msg.data as Pedido);
          for (const pedido of pedidosModificados) {
            store.updatePedido(pedido);
          }
          break;
        }

        case 'cliente_actualizado': {
          const clientesActualizados = messages.map(msg => msg.data as Cliente);
          for (const cliente of clientesActualizados) {
            store.updateCliente(cliente);
          }
          break;
        }

        default:
          console.log(`Mensajes WebSocket no manejados (${type}):`, messages);
      }
    } catch (error) {
      console.error(`Error processing batch messages for type ${type}:`, error);
    }
  }


  private showNotification(title: string, body: string): void {
    // Verificar si el navegador soporta notificaciones
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission === 'default') {
      // Solicitar permiso para notificaciones
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }
      });
    }

    // También mostrar notificación en pantalla (toast)
    console.log(`🔔 ${title}: ${body}`);
  }

  private lastAudioPlay: { [key: string]: number } = {};
  private minAudioInterval = 1000; // Mínimo 1 segundo entre reproducciones del mismo tipo

  private playAudioNotification(type: 'nuevo_pedido' | 'cambio_estado' | 'alerta_tiempo'): void {
    const now = Date.now();
    const lastPlay = this.lastAudioPlay[type] || 0;
    
    // Prevenir reproducciones muy frecuentes del mismo tipo
    if (now - lastPlay < this.minAudioInterval) {
      return;
    }
    
    const store = useAppStore.getState();
    const { audioSettings, kitchenSettings } = store;
    
    if (!kitchenSettings.notificacionesAudio) return;
    
    let notification;
    switch (type) {
      case 'nuevo_pedido':
        notification = audioSettings.nuevoPedido;
        break;
      case 'cambio_estado':
        notification = audioSettings.cambioEstado;
        break;
      case 'alerta_tiempo':
        notification = audioSettings.alertaTiempo;
        break;
    }
    
    if (!notification.enabled) return;
    
    try {
      const audio = new Audio(notification.audioFile);
      audio.volume = (audioSettings.volumenGeneral / 100) * (kitchenSettings.volumenAudio / 100);
      audio.play().catch(error => {
        console.warn('Error playing audio notification:', error);
      });
      
      this.lastAudioPlay[type] = now;
    } catch (error) {
      console.warn('Error creating audio notification:', error);
    }
  }

  send(message: Record<string, unknown>): void {
    if (this.socket?.connected) {
      this.socket.emit('message', message);
    } else {
      console.warn('Socket.IO no está conectado');
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  playNotificationSound(type: 'nuevo_pedido' | 'cambio_estado' | 'alerta_tiempo'): void {
    this.playAudioNotification(type);
  }
}

// Instancia singleton del servicio WebSocket
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
export const wsService = new WebSocketService(WS_URL);

// Hook para usar WebSocket en componentes React
export function useWebSocket() {
  return {
    connect: () => wsService.connect(),
    disconnect: () => wsService.disconnect(),
    send: (message: Record<string, unknown>) => wsService.send(message),
    playSound: (type: 'nuevo_pedido' | 'cambio_estado' | 'alerta_tiempo') => wsService.playNotificationSound(type),
    isConnected: wsService.isConnected
  };
}