import { useState } from 'react';
import { usePizzas, useExtras, useLoading } from '@/stores';
import Section from '@/components/ui/Section';

export default function MenuSection() {
  const pizzas = usePizzas();
  const extras = useExtras();
  const isLoading = useLoading();
  const [activeTab, setActiveTab] = useState<'pizzas' | 'extras'>('pizzas');

  const TabButton = ({ 
    tab, 
    label, 
    count 
  }: { 
    tab: 'pizzas' | 'extras'; 
    label: string; 
    count: number;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        activeTab === tab
          ? 'bg-orange-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label} ({count})
    </button>
  );

  const headerAction = (
    <div className="flex gap-2">
      <TabButton tab="pizzas" label="Pizzas" count={pizzas.length} />
      <TabButton tab="extras" label="Extras" count={extras.length} />
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
      <div className="space-y-3">
        {activeTab === 'pizzas' && (
          <>
            {!Array.isArray(pizzas) || pizzas.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No hay pizzas disponibles</p>
              </div>
            ) : (
              pizzas.map((pizza: import('@/types').Pizza) => (
                <div
                  key={pizza.id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer border border-gray-600"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{pizza.nombre}</h3>
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
                    <button className="ml-3 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors">
                      Agregar
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'extras' && (
          <>
            {!Array.isArray(extras) || extras.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No hay extras disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {extras.map((extra: import('@/types').Extra) => (
                  <div
                    key={extra.id}
                    className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors cursor-pointer border border-gray-600"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{extra.nombre}</h4>
                        <p className="text-xs text-gray-400">{extra.categoria}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-400 font-medium">
                          ${extra.precio}
                        </span>
                        <button className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors">
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  );
}