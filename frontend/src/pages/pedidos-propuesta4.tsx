// Propuesta 4: Dashboard Analytics
// Estilo empresarial moderno con glassmorphism, paleta púrpura/azul

export default function PedidosPropuesta4() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      
      {/* Header empresarial */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center shadow-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Order Management</h1>
              <p className="text-purple-200">Pizza Pachorra - Sistema de Pedidos v3.0</p>
            </div>
          </div>
          
          {/* Stats cards en header */}
          <div className="flex gap-4">
            {[
              { label: 'Pedidos Hoy', value: '47', change: '+12%' },
              { label: 'Ingresos', value: '$23.4K', change: '+8%' },
              { label: 'Promedio', value: '15min', change: '-3%' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 min-w-[120px]">
                <div className="text-purple-200 text-sm">{stat.label}</div>
                <div className="text-white text-2xl font-bold">{stat.value}</div>
                <div className="text-green-400 text-sm">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Panel izquierdo - Menú con analytics */}
        <div className="col-span-7 space-y-6">
          
          {/* Búsqueda avanzada */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-4 h-5 w-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Buscar productos, categorías o ingredientes..."
                  className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
              <button className="px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </button>
            </div>
            
            {/* Filtros como chips */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-purple-500/50 text-purple-100 rounded-full text-sm border border-purple-400/50">
                🍕 Pizzas (24)
              </button>
              <button className="px-4 py-2 bg-white/10 text-white/70 rounded-full text-sm border border-white/20 hover:bg-white/20">
                🧀 Extras (12)
              </button>
              <button className="px-4 py-2 bg-white/10 text-white/70 rounded-full text-sm border border-white/20 hover:bg-white/20">
                🥤 Bebidas (8)
              </button>
              <button className="px-4 py-2 bg-white/10 text-white/70 rounded-full text-sm border border-white/20 hover:bg-white/20">
                Más vendidos
              </button>
            </div>
          </div>

          {/* Grid de productos con métricas */}
          <div className="space-y-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all group">
                <div className="flex items-center gap-6">
                  
                  {/* Imagen con overlay de métricas */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-white text-3xl">🍕</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{i}</span>
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Pizza Margherita</h3>
                        <p className="text-purple-200">Tomate, mozzarella fresca, albahaca, aceite de oliva</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">$890</div>
                        <div className="text-green-400 text-sm">+15% esta semana</div>
                      </div>
                    </div>
                    
                    {/* Métricas del producto */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-purple-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>47 vendidas hoy</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>12min prep.</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>4.8/5 rating</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de acción con contador */}
                  <div className="flex flex-col items-center gap-2">
                    <button className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all group-hover:from-purple-400 group-hover:to-blue-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <span className="text-purple-300 text-xs">Agregar</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho - Ticket + Cliente con analytics */}
        <div className="col-span-5 space-y-6">
          
          {/* Ticket con análisis en tiempo real */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Orden #0001</h2>
                <p className="text-purple-200">Iniciada hace 2 minutos</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">En vivo</span>
              </div>
            </div>

            {/* Items con métricas */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🍕</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold">Pizza Pepperoni</h3>
                      <p className="text-purple-200 text-sm">Extra queso, sin cebolla</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-purple-300">
                        <span>⏱️ 10min prep</span>
                        <span>🔥 Popular</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/20">
                          <span className="text-white text-lg">−</span>
                        </button>
                        <span className="text-white font-bold text-lg">2</span>
                        <button className="w-8 h-8 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/20">
                          <span className="text-white text-lg">+</span>
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">$1,780</div>
                        <div className="text-green-400 text-xs">−5% desc.</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen con análisis */}
            <div className="border-t border-white/20 pt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-purple-200 text-sm">Tiempo estimado</div>
                  <div className="text-white font-bold text-lg">18 minutos</div>
                  <div className="text-green-400 text-xs">✓ En tiempo</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-purple-200 text-sm">Margen</div>
                  <div className="text-white font-bold text-lg">68%</div>
                  <div className="text-green-400 text-xs">+3% promedio</div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-purple-200">
                  <span>Subtotal</span>
                  <span>$3,200</span>
                </div>
                <div className="flex justify-between text-purple-200">
                  <span>Descuento cliente VIP</span>
                  <span className="text-green-400">-$160</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-white">
                  <span>Total</span>
                  <span>$3,040</span>
                </div>
              </div>
              
              <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                Procesar Orden
              </button>
            </div>
          </div>

          {/* Cliente con perfil empresarial */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Cliente</h2>
            
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-500 rounded-xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-xl">JP</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">Juan Pérez</h3>
                  <p className="text-purple-200">Cliente VIP - Nivel Gold</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Activo desde 2021</span>
                  </div>
                </div>
              </div>
              
              {/* Métricas del cliente */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-xl">47</div>
                  <div className="text-purple-200 text-xs">Pedidos totales</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-xl">$23.4K</div>
                  <div className="text-purple-200 text-xs">Total gastado</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-xl">4.9</div>
                  <div className="text-purple-200 text-xs">Rating promedio</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-xl">92%</div>
                  <div className="text-purple-200 text-xs">Satisfacción</div>
                </div>
              </div>
              
              <div className="text-sm text-purple-200">
                <div className="flex justify-between mb-1">
                  <span>📱 +54 11 2345-6789</span>
                </div>
                <div className="flex justify-between">
                  <span>📍 Sarandí 1234, CABA</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="py-3 px-4 bg-white/10 text-white rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-colors">
                Cambiar Cliente
              </button>
              <button className="py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium shadow-lg">
                Walk-in
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}