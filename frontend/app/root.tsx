import { Outlet, Link, useLocation } from "react-router";
import "./globals.css";

export default function Root() {
  const location = useLocation();
  
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
                  location.pathname.startsWith('/pedidos') 
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