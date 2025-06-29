import { useState, useEffect, useRef, useMemo } from 'react';
import { useClientes, useLoading, useCurrentOrderCustomer, useAppStore } from '@/stores';
import Section from '@/components/ui/Section';
import type { Cliente } from '@/types';

export default function ClienteSection() {
  const clientes = useClientes();
  const isLoading = useLoading();
  const clienteSeleccionado = useCurrentOrderCustomer();
  const setOrderCustomer = useAppStore((state) => state.setOrderCustomer);
  const addCliente = useAppStore((state) => state.addCliente);
  
  const [searchResults, setSearchResults] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newClienteForm, setNewClienteForm] = useState({
    nombre: '',
    telefono: ''
  });
  const searchRef = useRef<HTMLInputElement>(null);

  // Obtener clientes recientes (simulado - últimos 5)
  const recentClientes = useMemo(() => {
    return clientes
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [clientes]);

  // Buscar clientes desde 1 carácter
  useEffect(() => {
    if (searchTerm.length >= 1) {
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
    setOrderCustomer(cliente);
    setSearchTerm(`${cliente.nombre} - ${cliente.telefono}`);
    setShowResults(false);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setShowResults(false);
    // Limpiar formulario
    setNewClienteForm({
      nombre: '',
      telefono: searchTerm.match(/^\d+$/) ? searchTerm : '' // Si el término de búsqueda es solo números, usarlo como teléfono
    });
  };

  const handleSubmitNewCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClienteForm.telefono.trim()) {
      alert('El teléfono es obligatorio');
      return;
    }

    try {
      // TODO: Implementar API call para crear cliente
      // Por ahora, simulamos la creación
      const newCliente: Cliente = {
        id: Math.max(...clientes.map(c => c.id), 0) + 1,
        nombre: newClienteForm.nombre.trim() || 'Cliente',
        telefono: newClienteForm.telefono.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Añadir al store
      addCliente(newCliente);
      
      // Seleccionar el nuevo cliente
      setOrderCustomer(newCliente);
      
      // Limpiar formulario y estado
      setIsCreating(false);
      setSearchTerm(`${newCliente.nombre} - ${newCliente.telefono}`);
      setNewClienteForm({ nombre: '', telefono: '' });
      
    } catch (error) {
      console.error('Error creating cliente:', error);
      alert('Error al crear el cliente');
    }
  };

  const handleQuickCustomer = () => {
    const quickCustomer: Cliente = {
      id: -1, // ID temporal
      nombre: 'Cliente Walk-in',
      telefono: '000000000',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setOrderCustomer(quickCustomer);
    setSearchTerm('Cliente Walk-in - 000000000');
  };

  const headerAction = clienteSeleccionado ? (
    <button
      onClick={() => {
        setOrderCustomer({} as Cliente);
        setSearchTerm('');
        setIsCreating(false);
      }}
      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
    >
      Cambiar
    </button>
  ) : (
    <button
      onClick={handleQuickCustomer}
      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
      title="Cliente rápido para pedidos walk-in"
    >
      🚶 Walk-in
    </button>
  );

  return (
    <Section title="Cliente" headerAction={headerAction}>
      <div className="space-y-4">
        
        {/* Clientes recientes (si no hay búsqueda activa y no hay cliente seleccionado) */}
        {!searchTerm && !clienteSeleccionado && recentClientes.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Clientes Recientes</h4>
            <div className="space-y-1">
              {recentClientes.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => handleSelectCliente(cliente)}
                  className="w-full p-2 text-left bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{cliente.nombre}</span>
                    <span className="text-gray-400 text-xs">{cliente.telefono}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buscador de clientes */}
        <div className="relative">
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar cliente (nombre o teléfono)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
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


        {/* Formulario de cliente nuevo simplificado */}
        {isCreating && (
          <form onSubmit={handleSubmitNewCliente} className="space-y-3 border-t border-gray-600 pt-4">
            <h4 className="text-lg font-medium text-white">Nuevo Cliente Rápido</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={newClienteForm.nombre}
                onChange={(e) => setNewClienteForm(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                autoFocus
              />
              <input
                type="tel"
                placeholder="Teléfono *"
                value={newClienteForm.telefono}
                onChange={(e) => setNewClienteForm(prev => ({ ...prev, telefono: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                required
              />
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                >
                  ✓ Crear
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </Section>
  );
}