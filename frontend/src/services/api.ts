import type { 
  Pizza, 
  Extra, 
  Cliente, 
  Pedido, 
  CrearPedidoForm, 
  CrearClienteForm,
  EstadoPedido 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// API de Menu
export const menuApi = {
  async getPizzas(): Promise<Pizza[]> {
    return fetchApi<Pizza[]>('/pizzas');
  },

  async getExtras(): Promise<Extra[]> {
    return fetchApi<Extra[]>('/extras');
  },

  async updatePizza(id: number, pizza: Partial<Pizza>): Promise<Pizza> {
    return fetchApi<Pizza>(`/pizzas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pizza),
    });
  },

  async updateExtra(id: number, extra: Partial<Extra>): Promise<Extra> {
    return fetchApi<Extra>(`/extras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(extra),
    });
  }
};

// API de Clientes
export const clientesApi = {
  async getClientes(): Promise<Cliente[]> {
    return fetchApi<Cliente[]>('/clientes');
  },

  async getClienteById(id: number): Promise<Cliente> {
    return fetchApi<Cliente>(`/clientes/${id}`);
  },

  async getClienteByTelefono(telefono: string): Promise<Cliente | null> {
    try {
      return await fetchApi<Cliente>(`/clientes/telefono/${telefono}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async crearCliente(cliente: CrearClienteForm): Promise<Cliente> {
    return fetchApi<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  },

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    return fetchApi<Cliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    });
  }
};

// API de Pedidos
export const pedidosApi = {
  async getPedidos(): Promise<Pedido[]> {
    return fetchApi<Pedido[]>('/pedidos');
  },

  async getPedidoById(id: number): Promise<Pedido> {
    return fetchApi<Pedido>(`/pedidos/${id}`);
  },

  async crearPedido(pedido: CrearPedidoForm): Promise<Pedido> {
    return fetchApi<Pedido>('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedido),
    });
  },

  async updateEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
    return fetchApi<Pedido>(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  },

  async deletePedido(id: number): Promise<void> {
    await fetchApi<void>(`/pedidos/${id}`, {
      method: 'DELETE',
    });
  }
};

// Health Check
export const healthApi = {
  async check(): Promise<{ status: string; timestamp: string }> {
    return fetchApi<{ status: string; timestamp: string }>('/health');
  }
};