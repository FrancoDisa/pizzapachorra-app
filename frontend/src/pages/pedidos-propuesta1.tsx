// Propuesta 1: Dashboard Minimalista
// Layout limpio con cards flotantes, paleta blanco/gris/azul

export default function PedidosPropuesta1() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header minimalista */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-slate-800 mb-2">Nuevo Pedido</h1>
        <div className="w-20 h-1 bg-blue-500 rounded-full"></div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
        
        {/* Sidebar Menú - 3 columnas */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-700 mb-4">Menú</h2>
            
            {/* Búsqueda elegante */}
            <div className="relative mb-6">
              <svg className="absolute left-3 top-3 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Categorías como pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium">Pizzas</button>
              <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200">Extras</button>
              <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200">Bebidas</button>
            </div>

            {/* Lista de productos minimalista */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="group p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 mb-1">Pizza Margherita</h3>
                      <p className="text-sm text-slate-500 mb-2">Tomate, mozzarella, albahaca fresca</p>
                      <span className="text-lg font-semibold text-blue-600">$890</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center transition-opacity">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket Central - 6 columnas */}
        <div className="col-span-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-slate-700">Orden #0001</h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Nuevo</span>
            </div>

            {/* Items del pedido */}
            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg"></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800">Pizza Pepperoni</h3>
                    <p className="text-sm text-slate-500">Extra queso, sin cebolla</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50">
                      <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center font-medium text-slate-700">2</span>
                    <button className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50">
                      <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">$1,780</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen y total */}
            <div className="border-t border-slate-200 pt-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>$3,200</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Descuento</span>
                  <span>-$200</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-semibold text-slate-800 mb-6">
                <span>Total</span>
                <span>$3,000</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 px-6 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                  Guardar
                </button>
                <button className="py-3 px-6 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
                  Confirmar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cliente - 3 columnas */}
        <div className="col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-700 mb-4">Cliente</h2>
            
            {/* Búsqueda de cliente */}
            <div className="relative mb-4">
              <svg className="absolute left-3 top-3 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar cliente..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Cliente seleccionado */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">Juan Pérez</h3>
                  <p className="text-sm text-slate-500">Cliente frecuente</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Teléfono:</span>
                  <span className="text-slate-700">+54 11 2345-6789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pedidos:</span>
                  <span className="text-slate-700">47</span>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                + Nuevo Cliente
              </button>
              <button className="w-full py-3 px-4 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors">
                Cliente Walk-in
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="font-medium text-slate-700 mb-3">Historial Reciente</h3>
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <div key={i} className="text-sm text-slate-500">
                    <span className="font-medium">Pedido #{1000 + i}</span> - $1,200
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}