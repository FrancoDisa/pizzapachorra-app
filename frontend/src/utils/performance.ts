/**
 * Utilidades básicas de performance monitoring
 */

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    apiResponseTime: 0
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Medir tiempo de carga inicial
  measureLoadTime(): void {
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      this.metrics.loadTime = loadTime;
    }
  }

  // Medir tiempo de respuesta de API
  measureApiResponse<T>(apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    return apiCall().finally(() => {
      const endTime = performance.now();
      this.metrics.apiResponseTime = endTime - startTime;
    });
  }

  // Obtener métricas actuales
  getMetrics(): PerformanceMetrics {
    if (typeof window !== 'undefined' && (window.performance as any).memory) {
      this.metrics.memoryUsage = (window.performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    
    return { ...this.metrics };
  }

  // Log de métricas (solo en desarrollo)
  logMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      const metrics = this.getMetrics();
      console.table({
        'Load Time (ms)': metrics.loadTime,
        'API Response (ms)': Math.round(metrics.apiResponseTime),
        'Memory Usage (MB)': metrics.memoryUsage ? Math.round(metrics.memoryUsage) : 'N/A'
      });
    }
  }
}

// Hook para usar métricas de performance
export const usePerformanceMetrics = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    measureApiResponse: monitor.measureApiResponse.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    logMetrics: monitor.logMetrics.bind(monitor)
  };
};

// Inicializar monitor
export const initPerformanceMonitoring = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  // Medir tiempo de carga cuando la página esté lista
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      monitor.measureLoadTime();
    });
  }
};

export default PerformanceMonitor;