import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error | undefined;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Prevenir infinite loops en store updates
    if (error.message.includes('Maximum update depth exceeded')) {
      console.error('Infinite loop detected in store updates');
      // Limpiar timers y resetear estado si es necesario
      this.resetStoreState();
    }
    
    this.props.onError?.(error, errorInfo);
  }

  private resetStoreState = async () => {
    try {
      // Si hay access al store, limpiar estados problemáticos
      const { useAppStore } = await import('@/stores');
      const store = useAppStore.getState();
      
      // Limpiar timers que puedan estar causando loops
      store.clearOrderTimers();
      
      // Reset de arrays corruptos
      if (!Array.isArray(store.pedidos)) {
        store.setPedidos([]);
        console.log('Reset corrupted pedidos array');
      }
      
      if (!Array.isArray(store.clientes)) {
        store.setClientes([]);
        console.log('Reset corrupted clientes array');
      }
      
      // Reset de estados que puedan estar causando problemas
      console.log('Store state reset to prevent infinite loops');
    } catch (error) {
      console.error('Failed to reset store state:', error);
    }
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-slate-900 text-amber-50 flex items-center justify-center">
          <div className="bg-slate-800 p-8 rounded-lg border border-red-500 max-w-md">
            <h2 className="text-xl font-bold text-red-400 mb-4">Error en la aplicación</h2>
            <p className="text-slate-300 mb-4">
              Se produjo un error inesperado. La aplicación se reiniciará automáticamente.
            </p>
            <details className="mb-4">
              <summary className="text-sm text-slate-400 cursor-pointer">
                Detalles técnicos
              </summary>
              <pre className="text-xs text-slate-500 mt-2 overflow-auto">
                {this.state.error?.message}
              </pre>
            </details>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Reiniciar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;