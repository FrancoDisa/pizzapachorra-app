// Propuesta 3: Interfaz Tipo Mobile App
// Cards estilo aplicación móvil moderna, degradados y colores vivos

export default function PedidosPropuesta3() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      
      {/* Header tipo app móvil */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🍕</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Pizza Pachorra</h1>
              <p className="text-purple-200 text-sm">Crear nuevo pedido</p>
            </div>
          </div>
          <button className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5h5m-5-5H9m6 0V9" />
            </svg>
          </button>
        </div>

        {/* Tabs como en apps móviles */}
        <div className="flex bg-white/10 backdrop-blur-lg rounded-2xl p-1">
          <button className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl font-medium shadow-lg">
            Menú
          </button>
          <button className="flex-1 py-3 px-4 text-white/70 font-medium">
            Carrito
          </button>
          <button className="flex-1 py-3 px-4 text-white/70 font-medium">
            Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* Panel izquierdo - Menú como feed de app */}
        <div className="col-span-2 space-y-4">
          
          {/* Búsqueda estilo app */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Buscar tu pizza favorita..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            />
          </div>

          {/* Categorías como stories */}
          <div className="flex gap-4 pb-4">
            {['🍕 Pizzas', '🧀 Extras', '🥤 Bebidas', '🍰 Postres'].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                  i === 0 ? 'bg-gradient-to-r from-orange-400 to-pink-400' : 'bg-white/10 backdrop-blur-lg'
                }`}>
                  {cat.split(' ')[0]}
                </div>
                <span className="text-white/70 text-xs text-center">{cat.split(' ')[1]}</span>
              </div>
            ))}
          </div>

          {/* Grid de productos como cards de redes sociales */}
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 hover:bg-white/20 transition-all group cursor-pointer">
                <div className="relative mb-4">
                  <div className="w-full h-32 bg-gradient-to-br from-orange-300 to-red-400 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-4xl">🍕</span>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur-lg rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h3 className="text-white font-bold text-lg mb-1">Margherita</h3>
                  <p className="text-white/60 text-sm">Tomate, mozzarella fresca, albahaca</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-white font-bold text-xl">$890</div>
                  <button className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho - Carrito + Cliente */}
        <div className="space-y-6">
          
          {/* Carrito como chat */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Mi Pedido</h2>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
            </div>

            {/* Items como mensajes de chat */}
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white/10 rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-red-400 rounded-xl flex items-center justify-center text-lg">
                      🍕
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">Pizza Pepperoni</h3>
                      <p className="text-white/60 text-sm">Extra queso</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <button className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">-</span>
                        </button>
                        <span className="text-white font-bold">2</span>
                        <button className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">+</span>
                        </button>
                      </div>
                      <div className="text-white font-bold">$1,780</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total con animación */}
            <div className="bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-white font-bold text-2xl">$3,450</span>
              </div>
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              Confirmar Pedido
            </button>
          </div>

          {/* Cliente como perfil de app */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <h2 className="text-white font-bold text-lg mb-4">Cliente</h2>
            
            {/* Cliente seleccionado como card de perfil */}
            <div className="bg-white/10 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">JP</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Juan Pérez</h3>
                  <p className="text-white/60 text-sm">Cliente VIP</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">📱 Teléfono</span>
                  <span className="text-white">11 2345-6789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">📍 Ubicación</span>
                  <span className="text-white">Cercano</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">🍕 Pedidos</span>
                  <span className="text-white">47 pedidos</span>
                </div>
              </div>
            </div>

            {/* Acciones como botones de app */}
            <div className="space-y-3">
              <button className="w-full py-3 bg-white/10 text-white rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-colors">
                🔍 Buscar Cliente
              </button>
              <button className="w-full py-3 bg-white/10 text-white rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-colors">
                ➕ Nuevo Cliente
              </button>
              <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-medium shadow-lg">
                🚶 Cliente Walk-in
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}