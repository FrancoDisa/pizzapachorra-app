// Propuesta 5: Interfaz E-commerce
// Diseño como tienda online moderna, paleta cálida naranja/dorado

export default function PedidosPropuesta5() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      
      {/* Header e-commerce */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">🍕</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Pizza Pachorra</h1>
                <p className="text-orange-600 text-sm">Auténtica pizza italiana</p>
              </div>
            </div>
            
            {/* Breadcrumb e-commerce */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Inicio</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Menú</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-orange-600 font-medium">Crear Pedido</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Panel izquierdo - Catálogo como e-commerce */}
          <div className="col-span-8">
            
            {/* Filtros y búsqueda como e-commerce */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Nuestro Menú</h2>
                <div className="text-sm text-gray-500">24 productos disponibles</div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-4 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Buscar pizzas, ingredientes..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <select className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Ordenar por</option>
                  <option>Precio: menor a mayor</option>
                  <option>Precio: mayor a menor</option>
                  <option>Más populares</option>
                  <option>Mejor valoradas</option>
                </select>
              </div>
              
              {/* Filtros como tags */}
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-orange-500 text-white rounded-full font-medium shadow-sm">
                  🍕 Pizzas
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition-colors">
                  🧀 Extras
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition-colors">
                  🥤 Bebidas
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition-colors">
                  🍰 Postres
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition-colors">
                  ⭐ Mejor valoradas
                </button>
              </div>
            </div>

            {/* Grid de productos como e-commerce */}
            <div className="grid grid-cols-2 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-lg transition-all group">
                  
                  {/* Imagen del producto */}
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                      <span className="text-6xl">🍕</span>
                    </div>
                    
                    {/* Badges como e-commerce */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        Bestseller
                      </span>
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        Fresh
                      </span>
                    </div>
                    
                    {/* Acción rápida */}
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Información del producto */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Pizza Margherita</h3>
                      <p className="text-gray-600 text-sm">Tomate San Marzano, mozzarella di bufala, albahaca fresca, aceite de oliva extra virgen</p>
                    </div>
                    
                    {/* Rating como e-commerce */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map(star => (
                          <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">(4.8) • 124 reseñas</span>
                    </div>
                    
                    {/* Precio y CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-800">$890</span>
                        <span className="text-gray-500 text-sm ml-2 line-through">$990</span>
                      </div>
                      <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                        Agregar al Carrito
                      </button>
                    </div>
                    
                    {/* Información adicional */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                      <span>🕒 15-20 min</span>
                      <span>🔥 Muy popular</span>
                      <span>🍃 Vegetariana</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho - Carrito + Checkout */}
          <div className="col-span-4 space-y-6">
            
            {/* Carrito como e-commerce */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Tu Pedido</h2>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <span className="text-sm text-gray-500">artículos</span>
                </div>
              </div>

              {/* Items del carrito */}
              <div className="space-y-4 mb-6">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-200 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🍕</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">Pizza Pepperoni</h3>
                      <p className="text-sm text-gray-600">Extra queso, sin cebolla</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
                          <span className="text-gray-600">−</span>
                        </button>
                        <span className="font-bold text-gray-800">2</span>
                        <button className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
                          <span className="text-gray-600">+</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">$1,780</div>
                      <button className="text-red-500 text-sm hover:text-red-700">
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cupón de descuento */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Código de descuento"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Resumen de precio */}
              <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>$3,200</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Descuento</span>
                  <span className="text-green-600">-$200</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>$3,000</span>
                </div>
              </div>

              {/* Información del cliente */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">JP</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Juan Pérez</h3>
                    <p className="text-sm text-gray-600">Cliente frecuente</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div>📱 +54 11 2345-6789</div>
                  <div>📍 Sarandí 1234, CABA</div>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Método de pago</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" className="text-orange-500" defaultChecked />
                    <span>💳 Tarjeta de crédito/débito</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" className="text-orange-500" />
                    <span>💵 Efectivo</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" className="text-orange-500" />
                    <span>📱 Mercado Pago</span>
                  </label>
                </div>
              </div>

              {/* Botón de checkout */}
              <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                Confirmar Pedido
              </button>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Al confirmar aceptas nuestros términos y condiciones
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}