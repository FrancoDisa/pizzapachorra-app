import { useEffect } from 'react';
import { useAppStore } from '@/stores';
import { menuApi, clientesApi, pedidosApi } from '@/services/api';
import MenuSection from '@/components/pedidos/MenuSection';
import TicketSection from '@/components/pedidos/TicketSection';
import ClienteSection from '@/components/pedidos/ClienteSection';

// Agregar shortcuts de teclado para navegación rápida
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Solo activar shortcuts si no estamos en un input
      if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'f':
          // Focus en búsqueda de menú
          event.preventDefault();
          const menuSearch = document.querySelector('input[placeholder*="Buscar pizzas"]') as HTMLInputElement;
          if (menuSearch) menuSearch.focus();
          break;
        case 'c':
          // Focus en búsqueda de cliente
          event.preventDefault();
          const clientSearch = document.querySelector('input[placeholder*="Buscar cliente"]') as HTMLInputElement;
          if (clientSearch) clientSearch.focus();
          break;
        case 'w':
          // Activar cliente walk-in
          event.preventDefault();
          const walkInButton = document.querySelector('button[title*="walk-in"]') as HTMLButtonElement;
          if (walkInButton) walkInButton.click();
          break;
        case 'escape':
          // Limpiar búsquedas y focus
          event.preventDefault();
          const inputs = document.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
          inputs.forEach(input => input.blur());
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
};

export default function PedidosPage() {
  const { setMenu, setClientes, setPedidos, setLoading, setError } = useAppStore();
  
  // Activar shortcuts de teclado
  useKeyboardShortcuts();

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [pizzas, extras, clientes, pedidos] = await Promise.all([
          menuApi.getPizzas(),
          menuApi.getExtras(),
          clientesApi.getClientes(),
          pedidosApi.getPedidos()
        ]);

        setMenu({ pizzas, extras });
        setClientes(clientes);
        setPedidos(pedidos);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error instanceof Error ? error.message : 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Sin dependencias - solo ejecutar una vez al montar

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Ayuda de shortcuts de teclado */}
      <div className="mb-2 text-xs text-gray-500 text-center">
        Shortcuts: <kbd className="px-1 py-0.5 bg-gray-800 rounded">F</kbd> = Buscar menú • 
        <kbd className="px-1 py-0.5 bg-gray-800 rounded mx-1">C</kbd> = Buscar cliente • 
        <kbd className="px-1 py-0.5 bg-gray-800 rounded">W</kbd> = Walk-in • 
        <kbd className="px-1 py-0.5 bg-gray-800 rounded mx-1">Esc</kbd> = Limpiar focus
      </div>
      
      {/* Layout Desktop Optimizado - 2 Paneles */}
      <div className="flex gap-6 h-[calc(100vh-4rem)]">
        
        {/* Panel Izquierdo: Menú Unificado (60% ancho) */}
        <div className="flex-1 w-[60%]">
          <MenuSection />
        </div>

        {/* Panel Derecho: Ticket + Cliente (40% ancho) */}
        <div className="w-[40%] flex flex-col gap-4">
          
          {/* Ticket del Pedido Actual (60% altura) */}
          <div className="flex-1 h-[60%]">
            <TicketSection />
          </div>

          {/* Información del Cliente (40% altura) */}
          <div className="h-[40%]">
            <ClienteSection />
          </div>

        </div>

      </div>
    </div>
  );
}