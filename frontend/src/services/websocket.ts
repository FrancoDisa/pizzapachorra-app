import type { WebSocketMessage, Pedido, Cliente } from '@/types';
import { useAppStore } from '@/stores';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private isProcessingQueue = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private url: string) {}

  connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket conectado');
        this.reconnectAttempts = 0;
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.queueMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket desconectado:', event.code, event.reason);
        this.stopPing();
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Reintentando conexión WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect();
          }, this.reconnectInterval);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
      };

    } catch (error) {
      console.error('Error creando WebSocket:', error);
    }
  }

  disconnect(): void {
    this.stopPing();
    this.clearDebounceTimer();
    if (this.ws) {
      this.ws.close(1000, 'Desconexión manual');
      this.ws = null;
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

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping cada 30 segundos
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
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
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket no está conectado');
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  playNotificationSound(type: 'nuevo_pedido' | 'cambio_estado' | 'alerta_tiempo'): void {
    this.playAudioNotification(type);
  }
}

// Instancia singleton del servicio WebSocket
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
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