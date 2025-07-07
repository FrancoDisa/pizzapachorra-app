import { usePedidos } from '@/stores';

export default function PedidosIndex() {
  const pedidos = usePedidos();
  
  // Asegurar que pedidos sea un array
  const pedidosArray = Array.isArray(pedidos) ? pedidos : [];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-amber-50">Gestión de Pedidos</h1>
        <button className="btn-primary">
          + Nuevo Pedido
        </button>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-amber-50 mb-4">Lista de Pedidos</h2>
        
        {pedidosArray.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No hay pedidos registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosArray.map((pedido) => (
              <div key={pedido.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-amber-50">Pedido #{pedido.id}</h3>
                    <p className="text-slate-300">
                      Cliente: {pedido.cliente.nombre || pedido.cliente.telefono}
                    </p>
                    <p className="text-slate-300">Total: ${pedido.total}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full status-${pedido.estado}`}>
                    {pedido.estado.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}