// Propuesta 2: POS Terminal Profesional
// Diseño tipo terminal de punto de venta, paleta negro/blanco/verde neón

export default function PedidosPropuesta2() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header tipo terminal */}
      <div className="bg-gray-900 border-b border-green-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-green-300 text-xl font-bold">PIZZA PACHORRA POS v2.1</div>
            <div className="text-gray-500">|</div>
            <div className="text-green-400">TERMINAL 001</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-green-400">OPERADOR: ADMIN</div>
            <div className="text-green-400">{new Date().toLocaleTimeString()}</div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        
        {/* Panel izquierdo - Menú */}
        <div className="w-1/2 bg-gray-900 border-r border-green-400 p-4">
          <div className="mb-4">
            <h2 className="text-green-300 text-lg font-bold mb-2">═══ MENU PRODUCTOS ═══</h2>
            <div className="text-gray-500 text-sm">Seleccione producto para agregar al ticket</div>
          </div>

          {/* Categorías como botones de terminal */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button className="bg-green-400 text-black py-2 px-3 font-bold hover:bg-green-300 transition-colors">
              [F1] PIZZAS
            </button>
            <button className="bg-gray-700 text-green-400 py-2 px-3 font-bold border border-green-400 hover:bg-gray-600 transition-colors">
              [F2] EXTRAS
            </button>
            <button className="bg-gray-700 text-green-400 py-2 px-3 font-bold border border-green-400 hover:bg-gray-600 transition-colors">
              [F3] BEBIDAS
            </button>
          </div>

          {/* Grid de productos tipo terminal */}
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
              <button key={i} className="bg-gray-800 border border-green-400 p-4 text-left hover:bg-gray-700 transition-colors group">
                <div className="mb-2">
                  <div className="w-full h-16 bg-gray-700 border border-gray-600 flex items-center justify-center mb-2">
                    <div className="text-gray-500 text-xs">[IMG]</div>
                  </div>
                </div>
                <div className="text-green-300 font-bold text-sm mb-1">MARGHERITA</div>
                <div className="text-gray-400 text-xs mb-2">Tomate, mozzarella, albahaca</div>
                <div className="text-green-400 font-bold">$890.00</div>
                <div className="text-gray-500 text-xs mt-1 group-hover:text-green-400">
                  [ENTER] AGREGAR
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel derecho - Ticket + Cliente */}
        <div className="w-1/2 flex flex-col">
          
          {/* Ticket superior */}
          <div className="flex-1 bg-black p-4 border-b border-green-400">
            <div className="mb-4">
              <h2 className="text-green-300 text-lg font-bold mb-2">═══ TICKET DE VENTA ═══</h2>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ORDEN: #0001</span>
                <span className="text-gray-500">FECHA: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Simulación de recibo térmico */}
            <div className="bg-white text-black p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
              <div className="text-center border-b border-gray-300 pb-2 mb-2">
                <div className="font-bold">PIZZA PACHORRA</div>
                <div className="text-xs">Sarandí esq. Chiquito Perrini</div>
                <div className="text-xs">Tel: (011) 1234-5678</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>1x MARGHERITA</span>
                  <span>$890.00</span>
                </div>
                <div className="text-xs text-gray-600 ml-2">  + Extra queso</div>
                <div className="flex justify-between">
                  <span>2x PEPPERONI</span>
                  <span>$1780.00</span>
                </div>
                <div className="text-xs text-gray-600 ml-2">  - Sin cebolla</div>
                <div className="border-t border-gray-300 my-2"></div>
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>$2670.00</span>
                </div>
                <div className="flex justify-between">
                  <span>DESCUENTO:</span>
                  <span>-$100.00</span>
                </div>
                <div className="border-t border-gray-300 my-1"></div>
                <div className="flex justify-between font-bold">
                  <span>TOTAL:</span>
                  <span>$2570.00</span>
                </div>
              </div>
            </div>

            {/* Controles de ticket */}
            <div className="mt-4 space-y-2">
              <button className="w-full bg-yellow-500 text-black py-2 font-bold hover:bg-yellow-400 transition-colors">
                [F9] DESCUENTO
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-gray-700 text-green-400 py-2 font-bold border border-green-400 hover:bg-gray-600 transition-colors">
                  [F10] GUARDAR
                </button>
                <button className="bg-green-400 text-black py-2 font-bold hover:bg-green-300 transition-colors">
                  [F12] PROCESAR
                </button>
              </div>
            </div>
          </div>

          {/* Cliente inferior */}
          <div className="h-48 bg-gray-900 p-4">
            <h2 className="text-green-300 text-lg font-bold mb-2">═══ DATOS CLIENTE ═══</h2>
            
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Buscar cliente [F4]..."
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:bg-gray-800"
              />
            </div>

            <div className="bg-black border border-green-400 p-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">NOMBRE:</div>
                  <div className="text-green-400 font-bold">JUAN PEREZ</div>
                </div>
                <div>
                  <div className="text-gray-500">TELEFONO:</div>
                  <div className="text-green-400 font-bold">11-2345-6789</div>
                </div>
                <div>
                  <div className="text-gray-500">PEDIDOS:</div>
                  <div className="text-green-400 font-bold">47</div>
                </div>
                <div>
                  <div className="text-gray-500">ESTADO:</div>
                  <div className="text-green-400 font-bold">ACTIVO</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="bg-gray-700 text-green-400 py-1 text-sm font-bold border border-green-400 hover:bg-gray-600 transition-colors">
                [F5] NUEVO
              </button>
              <button className="bg-gray-700 text-green-400 py-1 text-sm font-bold border border-green-400 hover:bg-gray-600 transition-colors">
                [F6] WALK-IN
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer con teclas de acceso rápido */}
      <div className="bg-gray-900 border-t border-green-400 p-2">
        <div className="flex justify-center space-x-6 text-xs text-gray-500">
          <span>F1-Pizzas</span>
          <span>F2-Extras</span>
          <span>F3-Bebidas</span>
          <span>F4-Cliente</span>
          <span>F5-Nuevo</span>
          <span>F6-Walk-in</span>
          <span>F9-Desc</span>
          <span>F10-Guardar</span>
          <span>F12-Procesar</span>
          <span>ESC-Cancelar</span>
        </div>
      </div>
    </div>
  );
}