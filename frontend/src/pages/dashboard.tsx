import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAppStore, usePedidos, useLoading, useError } from '@/stores';
import { pedidosApi, menuApi, clientesApi } from '@/services/api';

export default function Dashboard() {
  const pedidos = usePedidos();
  const loading = useLoading();
  const error = useError();
  const { setLoading, setError, setPedidos, setMenu, setClientes } = useAppStore();

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setError(null);

      try {
        // Cargar datos iniciales en paralelo
        const [pedidosData, pizzasData, extrasData, clientesData] = await Promise.all([
          pedidosApi.getPedidos(),
          menuApi.getPizzas(),
          menuApi.getExtras(),
          clientesApi.getClientes()
        ]);

        setPedidos(pedidosData);
        setMenu({ pizzas: pizzasData, extras: extrasData });
        setClientes(clientesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [setLoading, setError, setPedidos, setMenu, setClientes]);

  // Estadísticas rápidas
  const estadisticas = {
    total: pedidos.length,
    nuevos: pedidos.filter(p => p.estado === 'nuevo').length,
    enPreparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
    listos: pedidos.filter(p => p.estado === 'listo').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-400 mb-2">Error</h3>
          <p className="text-red-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn-primary"
          >
            Recargar
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-amber-50">Dashboard</h2>
          <p className="text-slate-300 mt-1">
            Resumen general del estado de pedidos
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total</p>
                <p className="text-2xl font-semibold text-amber-50">{estadisticas.total}</p>
              </div>
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                📊
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Nuevos</p>
                <p className="text-2xl font-semibold text-blue-400">{estadisticas.nuevos}</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center">
                🆕
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">En Preparación</p>
                <p className="text-2xl font-semibold text-yellow-400">{estadisticas.enPreparacion}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-900/50 rounded-full flex items-center justify-center">
                👨‍🍳
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Listos</p>
                <p className="text-2xl font-semibold text-green-400">{estadisticas.listos}</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center">
                ✅
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Entregados</p>
                <p className="text-2xl font-semibold text-gray-400">{estadisticas.entregados}</p>
              </div>
              <div className="w-12 h-12 bg-gray-900/50 rounded-full flex items-center justify-center">
                📦
              </div>
            </div>
          </div>
        </div>

        {/* Pedidos recientes */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-amber-50 mb-4">Pedidos Recientes</h3>
          
          {pedidos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No hay pedidos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-2 text-slate-300">ID</th>
                    <th className="text-left py-2 text-slate-300">Cliente</th>
                    <th className="text-left py-2 text-slate-300">Estado</th>
                    <th className="text-left py-2 text-slate-300">Total</th>
                    <th className="text-left py-2 text-slate-300">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.slice(0, 5).map((pedido) => (
                    <tr key={pedido.id} className="border-b border-slate-700">
                      <td className="py-2 text-amber-50">#{pedido.id}</td>
                      <td className="py-2 text-amber-50">{pedido.cliente.nombre || pedido.cliente.telefono}</td>
                      <td className="py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full status-${pedido.estado}`}>
                          {pedido.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2 text-amber-50">${pedido.total}</td>
                      <td className="py-2 text-slate-300">
                        {new Date(pedido.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}