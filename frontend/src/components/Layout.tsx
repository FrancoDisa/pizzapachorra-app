import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { useWebSocket } from '@/services/websocket';
import { useState, useEffect, useRef } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Pizza Pachorra' }: LayoutProps) {
  const location = useLocation();
  const { isConnected } = useWebSocket();
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

  const navigation = [
    { name: 'Dashboard', href: '/', current: location.pathname === '/' },
    { name: 'Pedidos', href: '/pedidos', current: location.pathname.startsWith('/pedidos') },
    { name: 'Cocina', href: '/cocina', current: location.pathname === '/cocina' },
    { name: 'Clientes', href: '/clientes', current: location.pathname.startsWith('/clientes') },
    { name: 'Menú', href: '/menu', current: location.pathname.startsWith('/menu') },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-500">🍕 {title}</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Status indicator y configuración */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-300">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              
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

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  item.current
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}