import Layout from '@/components/Layout';
import { usePedidos } from '@/stores';

export default function Cocina() {
  const pedidos = usePedidos();
  
  // Filtrar pedidos activos para cocina
  const pedidosActivos = pedidos.filter(p => 
    ['nuevo', 'en_preparacion'].includes(p.estado)
  );

  return (
    <Layout title="Vista de Cocina">
      <div>
        <h1 className="text-3xl font-bold text-amber-50 mb-6">Vista de Cocina</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidosActivos.map((pedido) => (
            <div key={pedido.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-amber-50">#{pedido.id}</h2>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full status-${pedido.estado}`}>
                  {pedido.estado.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-2">
                {pedido.items.map((item, index) => (
                  <div key={index} className="bg-slate-700 rounded p-3">
                    <p className="font-medium text-amber-50">{item.cantidad}x Pizza</p>
                    {item.notas && (
                      <p className="text-sm text-slate-300 mt-1">Nota: {item.notas}</p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-slate-400">
                Cliente: {pedido.cliente.nombre || pedido.cliente.telefono}
              </div>
            </div>
          ))}
        </div>
        
        {pedidosActivos.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-slate-400">No hay pedidos pendientes en cocina</p>
          </div>
        )}
      </div>
    </Layout>
  );
}