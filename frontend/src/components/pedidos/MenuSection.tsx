import { useState } from 'react';
import { usePizzas, useExtras, useLoading, useAppStore } from '@/stores';
import Section from '@/components/ui/Section';

export default function MenuSection() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const isLoading = useLoading();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPizzaForExtras, setSelectedPizzaForExtras] = useState<number | null>(null);
  const addItemToOrder = useAppStore((state) => state.addItemToOrder);

  const handleAddPizza = (pizza: import('@/types').Pizza) => {
    addItemToOrder(pizza);
  };

  const handleAddExtra = (extra: import('@/types').Extra) => {
    // TODO: Implementar lógica para agregar extra a pizza actual o última pizza en el ticket
    console.log('Agregando extra:', extra);
  };

  // Filtrar pizzas y extras según el término de búsqueda
  const filteredPizzas = pizzas.filter(pizza => 
    pizza.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pizza.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredExtras = extras.filter(extra => 
    extra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    extra.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headerAction = (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Buscar pizzas y extras..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <div className="text-sm text-gray-400">
        {filteredPizzas.length} pizzas • {filteredExtras.length} extras
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Section title="Menú" headerAction={headerAction}>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-400">Cargando menú...</span>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Menú" headerAction={headerAction}>
      <div className="space-y-6 h-full overflow-y-auto">
        
        {/* Sección de Pizzas */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            🍕 Pizzas ({filteredPizzas.length})
          </h3>
          
          {!Array.isArray(filteredPizzas) || filteredPizzas.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p>{searchTerm ? 'No se encontraron pizzas' : 'No hay pizzas disponibles'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPizzas.map((pizza: import('@/types').Pizza) => (
                <div
                  key={pizza.id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors border border-gray-600"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{pizza.nombre}</h4>
                      <p className="text-sm text-gray-300 mb-2">{pizza.descripcion}</p>
                      
                      {/* Ingredientes */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pizza.ingredientes.map((ingrediente, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                            {ingrediente}
                          </span>
                        ))}
                      </div>
                      
                      {/* Precio base */}
                      <div className="text-green-400 font-medium">
                        Desde: ${pizza.precio_base}
                      </div>
                    </div>
                    
                    {/* Botón agregar */}
                    <button 
                      onClick={() => handleAddPizza(pizza)}
                      className="ml-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded transition-colors flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Extras */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            ➕ Extras ({filteredExtras.length})
          </h3>
          
          {!Array.isArray(filteredExtras) || filteredExtras.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p>{searchTerm ? 'No se encontraron extras' : 'No hay extras disponibles'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredExtras.map((extra: import('@/types').Extra) => (
                <div
                  key={extra.id}
                  className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors border border-gray-600"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{extra.nombre}</h4>
                      <p className="text-xs text-gray-400">{extra.categoria}</p>
                    </div>
                    <div className="text-sm text-green-400 font-medium">
                      ${extra.precio}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddExtra(extra)}
                    className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors flex items-center justify-center gap-1"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </Section>
  );
}