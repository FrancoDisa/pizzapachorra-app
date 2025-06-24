import type { WebSocketMessage, Pedido, Cliente } from '@/types';
import { useAppStore } from '@/stores';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

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
          this.handleMessage(message);
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
    if (this.ws) {
      this.ws.close(1000, 'Desconexión manual');
      this.ws = null;
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

  private handleMessage(message: WebSocketMessage): void {
    const store = useAppStore.getState();

    switch (message.type) {
      case 'nuevo_pedido': {
        const nuevoPedido = message.data as Pedido;
        store.addPedido(nuevoPedido);
        this.showNotification('Nuevo pedido', `Pedido #${nuevoPedido.id} recibido`);
        break;
      }

      case 'cambio_estado': {
        const pedidoActualizado = message.data as Pedido;
        store.updatePedido(pedidoActualizado);
        this.showNotification(
          'Estado actualizado', 
          `Pedido #${pedidoActualizado.id}: ${pedidoActualizado.estado}`
        );
        break;
      }

      case 'pedido_actualizado': {
        const pedidoModificado = message.data as Pedido;
        store.updatePedido(pedidoModificado);
        break;
      }

      case 'cliente_actualizado': {
        const clienteActualizado = message.data as Cliente;
        store.updateCliente(clienteActualizado);
        break;
      }

      default:
        console.log('Mensaje WebSocket no manejado:', message);
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
    isConnected: wsService.isConnected
  };
}