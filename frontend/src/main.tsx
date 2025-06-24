import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Comentamos WebSocket temporalmente hasta que tengamos el servicio configurado
// import { wsService } from '@/services/websocket';

// TODO: Reconectar WebSocket cuando el servicio esté listo
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
    <App />
  </StrictMode>,
);