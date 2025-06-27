import { useEffect } from 'react';
import { useAppStore } from '@/stores';
import { menuApi, clientesApi, pedidosApi } from '@/services/api';
import MenuSection from '@/components/pedidos/MenuSection';
import TicketSection from '@/components/pedidos/TicketSection';
import ClienteSection from '@/components/pedidos/ClienteSection';

export default function PedidosPage() {
  const { setMenu, setClientes, setPedidos, setLoading, setError } = useAppStore();

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
      {/* Layout Grid Responsivo - Mobile First */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-2rem)]">
        
        {/* Columna 1: Menú de Pizzas y Extras */}
        <div className="md:col-span-2 lg:col-span-1">
          <MenuSection />
        </div>

        {/* Columna 2: Ticket del Pedido Actual */}
        <div className="order-first md:order-none lg:order-none">
          <TicketSection />
        </div>

        {/* Columna 3: Información del Cliente */}
        <div className="md:col-start-1 lg:col-start-3">
          <ClienteSection />
        </div>

      </div>
    </div>
  );
}