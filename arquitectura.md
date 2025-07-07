# Arquitectura - Pizza Pachorra

## Stack Tecnológico

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** para estilos
- **Zustand** para estado global
- **Socket.IO Client** para tiempo real

### Backend
- **Node.js 22** + **Express** + **TypeScript**
- **Socket.IO** para WebSocket
- **PostgreSQL 16** con conexión nativa

### Infraestructura
- **Docker Compose** para desarrollo (simplificado 2025)
- **Conexión directa** Frontend ↔ Backend (Nginx eliminado)

## URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Database**: localhost:5432

## Rutas Principales (Simplificadas 2025)

- `/` - Dashboard principal
- `/pedidos` - Interfaz de pedidos (Quick Entry + Wizard configurable)
- `/cocina` - Vista de cocina en tiempo real

## Modelos de Datos

### Pizzas
- ID, nombre, precio_base, ingredientes[], activa

### Extras  
- ID, nombre, precio, categoria, activo

### Clientes
- ID, telefono, nombre, direccion, notas

### Pedidos
- ID, cliente_id, estado, total, fecha_pedido, items[]

## Comandos Útiles

```bash
# Iniciar aplicación
docker-compose up -d

# Ver logs
docker-compose logs -f [service]

# Rebuild
docker-compose build --no-cache

# Health check
curl http://localhost:3001/api/health
```