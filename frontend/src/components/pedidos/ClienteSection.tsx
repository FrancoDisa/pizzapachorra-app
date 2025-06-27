import { useState, useEffect, useRef } from 'react';
import { useClientes, useLoading } from '@/stores';
import Section from '@/components/ui/Section';
import type { Cliente } from '@/types';

export default function ClienteSection() {
  const clientes = useClientes();
  const isLoading = useLoading();
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [searchResults, setSearchResults] = useState<Cliente[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Buscar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.length >= 2) {
      // Filtrar clientes localmente por nombre o teléfono
      const filtered = clientes.filter(cliente => 
        cliente.telefono.includes(searchTerm) ||
        (cliente.nombre && cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  }, [searchTerm, clientes]);

  const handleSelectCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setSearchTerm(`${cliente.nombre} - ${cliente.telefono}`);
    setShowResults(false);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setShowResults(false);
    // TODO: Abrir modal de crear cliente
  };

  const headerAction = clienteSeleccionado ? (
    <button
      onClick={() => {
        setClienteSeleccionado(null);
        setSearchTerm('');
        setIsCreating(false);
      }}
      className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors"
    >
      Cambiar
    </button>
  ) : null;

  return (
    <Section title="Cliente" headerAction={headerAction}>
      <div className="space-y-4">
        
        {/* Buscador de clientes */}
        <div className="relative">
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar por teléfono o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={!!clienteSeleccionado}
          />

          {/* Resultados de búsqueda */}
          {showResults && !clienteSeleccionado && (
            <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto mb-2"></div>
                  Buscando...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-3">
                  <p className="text-gray-400 text-sm mb-2">No se encontraron clientes</p>
                  <button
                    onClick={handleCreateNew}
                    className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors"
                  >
                    Crear nuevo cliente
                  </button>
                </div>
              ) : (
                <>
                  {searchResults.map((cliente) => (
                    <button
                      key={cliente.id}
                      onClick={() => handleSelectCliente(cliente)}
                      className="w-full p-3 text-left hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">{cliente.nombre}</p>
                          <p className="text-sm text-gray-400">{cliente.telefono}</p>
                          {cliente.direccion && (
                            <p className="text-xs text-gray-500 mt-1">{cliente.direccion}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  <button
                    onClick={handleCreateNew}
                    className="w-full p-3 text-left bg-gray-800 hover:bg-gray-600 transition-colors border-t border-gray-600 text-orange-400"
                  >
                    + Crear nuevo cliente
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Cliente seleccionado */}
        {clienteSeleccionado && (
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-white">{clienteSeleccionado.nombre}</h3>
                <p className="text-sm text-gray-400">{clienteSeleccionado.telefono}</p>
              </div>
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                Seleccionado
              </span>
            </div>

            {/* Información del cliente */}
            <div className="space-y-2 text-sm">
              {clienteSeleccionado.direccion && (
                <div>
                  <span className="text-gray-400">Dirección: </span>
                  <span className="text-white">{clienteSeleccionado.direccion}</span>
                </div>
              )}
              
              {/* Cliente básico - solo mostrar fechas */}
              <div className="grid grid-cols-1 gap-2 mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
                <div>Registrado: {new Date(clienteSeleccionado.created_at).toLocaleDateString()}</div>
                <div>Actualizado: {new Date(clienteSeleccionado.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}


        {/* Formulario de cliente nuevo */}
        {isCreating && (
          <div className="space-y-3 border-t border-gray-600 pt-4">
            <h4 className="text-sm font-medium text-white">Nuevo Cliente</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <textarea
                placeholder="Dirección (opcional)"
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
                >
                  Cancelar
                </button>
                <button className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors">
                  Crear
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Section>
  );
}