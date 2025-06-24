import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { wsService } from '@/services/websocket';

// Importar configuración del router
import { router } from './router';

// Crear router (implementaremos después)

// Conectar WebSocket al iniciar la aplicación
wsService.connect();

// Manejar la visibilidad de la página para reconectar WebSocket
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !wsService.isConnected) {
    wsService.connect();
  }
});

// Cleanup al cerrar la página
window.addEventListener('beforeunload', () => {
  wsService.disconnect();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);