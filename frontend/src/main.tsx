import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './router';
// import { wsService } from '@/services/websocket';

// TODO: Habilitar WebSocket cuando el backend tenga servidor WS configurado
// wsService.connect();

// document.addEventListener('visibilitychange', () => {
//   if (document.visibilityState === 'visible' && !wsService.isConnected) {
//     wsService.connect();
//   }
// });

// window.addEventListener('beforeunload', () => {
//   wsService.disconnect();
// });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);