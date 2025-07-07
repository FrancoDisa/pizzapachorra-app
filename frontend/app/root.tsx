import { Outlet, Link, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import "./globals.css";

export default function Root() {
  const location = useLocation();
  const [showConfig, setShowConfig] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setShowConfig(false);
      }
    };

    if (showConfig) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConfig]);
  
  return (
    <div className="min-h-screen bg-slate-900 text-amber-50 font-sans antialiased">
      {/* Header/Navigation */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-500">🍕 Pizza Pachorra</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <Link 
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/' 
                      ? 'bg-orange-600 text-white' 
                      : 'text-amber-50 hover:text-orange-400'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/pedidos"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/pedidos' 
                      ? 'bg-orange-600 text-white' 
                      : 'text-amber-50 hover:text-orange-400'
                  }`}
                >
                  Pedidos
                </Link>
                <Link 
                  to="/cocina"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/cocina' 
                      ? 'bg-orange-600 text-white' 
                      : 'text-amber-50 hover:text-orange-400'
                  }`}
                >
                  Cocina
                </Link>
              </nav>

              {/* Botón de configuración */}
              <div className="relative" ref={configRef}>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Configuración"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* Panel de configuración */}
                {showConfig && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-3">Configuración</h3>
                      
                      {/* Solo mostrar selector si estamos en pedidos */}
                      {location.pathname.startsWith('/pedidos') && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-slate-300 block mb-2">Estilo de interfaz:</label>
                            <select 
                              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                              defaultValue={localStorage.getItem('pizza-pachorra-selected-model') || 'model1'}
                              onChange={(e) => {
                                localStorage.setItem('pizza-pachorra-selected-model', e.target.value);
                                window.location.reload();
                              }}
                            >
                              <option value="model1">Quick Entry (Experto)</option>
                              <option value="model5">Wizard (Guiado)</option>
                            </select>
                          </div>
                          <div className="text-xs text-slate-400">
                            Quick Entry es más rápido para usuarios experimentados.
                            Wizard guía paso a paso para nuevos usuarios.
                          </div>
                        </div>
                      )}
                      
                      {!location.pathname.startsWith('/pedidos') && (
                        <div className="text-sm text-slate-400">
                          Las opciones de configuración están disponibles en la sección de Pedidos.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}