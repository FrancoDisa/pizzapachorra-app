import { useState } from 'react';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-900 text-amber-50 font-sans antialiased">
      {/* Header/Navigation */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-500">🍕 Pizza Pachorra</h1>
            </div>
            <nav className="flex space-x-4">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'dashboard' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-amber-50 hover:text-orange-400'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentPage('pedidos')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'pedidos' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-amber-50 hover:text-orange-400'
                }`}
              >
                Pedidos
              </button>
              <button 
                onClick={() => setCurrentPage('cocina')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'cocina' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-amber-50 hover:text-orange-400'
                }`}
              >
                Cocina
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'pedidos' && <Pedidos />}
        {currentPage === 'cocina' && <Cocina />}
      </main>
    </div>
  );
}

// Componentes temporales para mostrar contenido
function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-orange-500">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold mb-2">Pedidos Hoy</h3>
          <p className="text-3xl font-bold text-orange-500">12</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold mb-2">Ventas del Día</h3>
          <p className="text-3xl font-bold text-green-500">$45,600</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold mb-2">En Preparación</h3>
          <p className="text-3xl font-bold text-yellow-500">3</p>
        </div>
      </div>
    </div>
  );
}

function Pedidos() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-orange-500">Gestión de Pedidos</h2>
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <p className="text-gray-300">Aquí irá la interfaz completa de pedidos...</p>
        <p className="text-sm text-gray-500 mt-2">Backend API funcionando en puerto 3001</p>
      </div>
    </div>
  );
}

function Cocina() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-orange-500">Vista de Cocina</h2>
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <p className="text-gray-300">Aquí se mostrarán los pedidos en tiempo real...</p>
        <p className="text-sm text-gray-500 mt-2">WebSocket conectado para actualizaciones automáticas</p>
      </div>
    </div>
  );
}

export default App; 