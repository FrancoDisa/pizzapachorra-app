# Arquitectura Técnica - Pizza Pachorra

## 🏗️ Visión General

Pizza Pachorra es una aplicación de escritorio offline containerizada con Docker, diseñada para gestionar pedidos de una pizzería local. La arquitectura sigue un patrón de microservicios con separación clara entre frontend, backend y base de datos.

## 📊 Stack Tecnológico

### Frontend
- **React 18** con hooks modernos
- **TypeScript** para tipado estático
- **Tailwind CSS** para styling y tema oscuro
- **Vite** como bundler y servidor de desarrollo
- **Nginx** para servir archivos estáticos en producción

### Backend
- **Node.js 22** (LTS)
- **Express.js 4** con middleware moderno
- **TypeScript** para consistencia de tipos
- **Socket.io** para comunicación en tiempo real
- **Joi/Zod** para validación de datos

### Base de Datos
- **PostgreSQL 16** como motor principal
- **Migraciones versionadas** para evolución del schema
- **Índices optimizados** para consultas frecuentes

### Infraestructura
- **Docker** para containerización
- **Docker Compose** para orquestación
- **Volúmenes Docker** para persistencia
- **Redes Docker** para comunicación segura

## 🎯 Arquitectura de Servicios

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │────│     Nginx       │────│    Backend      │
│   React + TS    │    │  Proxy Reverso  │    │  Express + TS   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        │
                                              ┌─────────────────┐
                                              │                 │
                                              │   PostgreSQL    │
                                              │   Base de Datos │
                                              │                 │
                                              └─────────────────┘
```

## 🗃️ Modelo de Datos

### Entidades Principales

#### Pizzas
```sql
pizzas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio_base DECIMAL(10,2) NOT NULL,
  ingredientes TEXT[],
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### Extras
```sql
extras (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(20) NOT NULL,
  activo BOOLEAN DEFAULT true
)
```

#### Clientes
```sql
clientes (
  id SERIAL PRIMARY KEY,
  telefono VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100),
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### Pedidos
```sql
pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  estado VARCHAR(20) DEFAULT 'nuevo',
  total DECIMAL(10,2) NOT NULL,
  fecha_pedido TIMESTAMP DEFAULT NOW(),
  fecha_entrega TIMESTAMP,
  notas TEXT
)
```

#### Items de Pedido
```sql
pedido_items (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id),
  pizza_id INTEGER REFERENCES pizzas(id),
  mitad1_extras INTEGER[] DEFAULT '{}',
  mitad2_extras INTEGER[] DEFAULT '{}',
  es_mitad_y_mitad BOOLEAN DEFAULT false,
  precio_calculado DECIMAL(10,2) NOT NULL,
  cantidad INTEGER DEFAULT 1
)
```

## 🔄 Flujo de Datos

### Creación de Pedido
1. **Frontend**: Usuario ingresa teléfono
2. **Backend**: Busca cliente existente o crea nuevo
3. **Frontend**: Selecciona pizzas y extras
4. **Backend**: Calcula precios con algoritmo mitad y mitad
5. **Database**: Persiste pedido con items
6. **WebSocket**: Notifica a pantalla de cocina

### Gestión de Estados
```
Nuevo → En Preparación → Listo → Entregado
  ↓           ↓            ↓
Cancelado   Cancelado   Cancelado
```

## 🎨 Interfaz de Usuario

### Paleta de Colores (Tema Oscuro)
- **Fondo Principal**: `#1a1a1a` (gris oscuro)
- **Fondo Secundario**: `#2d2d2d`
- **Texto Principal**: `#f5f5dc` (blanco hueso)
- **Acentos**: `#ff6b35` (naranja), `#8b0000` (rojo oscuro)
- **Estados**: `#28a745` (verde), `#ffc107` (amarillo), `#dc3545` (rojo)

### Componentes Principales
- **PedidoForm**: Formulario principal de pedidos
- **ClienteSearch**: Búsqueda y autocompletado
- **PizzaSelector**: Selección de pizzas con extras
- **PantallaCocina**: Vista en tiempo real para cocina
- **HistorialCliente**: Pedidos anteriores
- **ReporteVentas**: Estadísticas diarias

## 🔧 APIs y Endpoints

### Gestión de Pedidos
```
GET    /api/pedidos              # Lista de pedidos
POST   /api/pedidos              # Crear nuevo pedido
PUT    /api/pedidos/:id          # Actualizar pedido
DELETE /api/pedidos/:id          # Cancelar pedido
GET    /api/pedidos/:id/items    # Items de un pedido
```

### Gestión de Clientes
```
GET    /api/clientes             # Lista de clientes
POST   /api/clientes             # Crear cliente
PUT    /api/clientes/:id         # Actualizar cliente
GET    /api/clientes/buscar/:tel # Buscar por teléfono
GET    /api/clientes/:id/historial # Historial de pedidos
```

### Catálogo
```
GET    /api/pizzas               # Lista de pizzas
GET    /api/extras               # Lista de extras
GET    /api/precios/calcular     # Calcular precio de pedido
```

## 🚀 Comunicación en Tiempo Real

### WebSocket Events
```javascript
// Cliente → Servidor
'nuevo_pedido'        // Nuevo pedido creado
'cambio_estado'       // Cambio de estado de pedido
'cliente_actualizado' // Datos de cliente actualizados

// Servidor → Cliente
'pedido_actualizado'  // Estado de pedido cambió
'nuevo_pedido_cocina' // Notificación para cocina
'cliente_encontrado'  // Resultado de búsqueda
```

## 🔐 Seguridad y Validación

### Validación de Datos
- **Joi/Zod** para validación de esquemas
- **Sanitización** de inputs de usuario
- **Validación** de cálculos de precios
- **Constraints** de base de datos

### Manejo de Errores
- **Middleware global** de manejo de errores
- **Logging estructurado** para debugging
- **Respuestas consistentes** de API
- **Rollback automático** en transacciones

## 📈 Optimizaciones

### Base de Datos
- **Índices** en campos de búsqueda frecuente
- **Paginación** para listas grandes
- **Queries optimizadas** con JOINs eficientes
- **Pool de conexiones** configurado

### Frontend
- **Code splitting** con React.lazy
- **Memoización** de componentes pesados
- **Debouncing** en búsquedas
- **Caching** de datos frecuentes

### Docker
- **Multi-stage builds** para imágenes optimizadas
- **Layer caching** para builds rápidos
- **Health checks** para servicios
- **Resource limits** configurados

## 🔄 Algoritmo de Cálculo de Precios

### Pizza Entera
```typescript
precio_final = precio_base + suma(extras) - suma(ingredientes_removidos)
```

### Mitad y Mitad
```typescript
// Precio base: promedio de ambas mitades
precio_base = (precio_mitad1 + precio_mitad2) / 2

// Extras: precio completo si está en ambas mitades, mitad si está en una sola
extras_completos = extras_en_ambas_mitades * precio_extra
extras_mitad = extras_en_una_mitad * (precio_extra / 2)

precio_final = precio_base + extras_completos + extras_mitad
```

## 📊 Métricas y Monitoreo

### Logs de Aplicación
- **Requests HTTP** con tiempo de respuesta
- **Errores de aplicación** con stack trace
- **Queries de DB** con tiempo de ejecución
- **Eventos de WebSocket**

### Métricas de Negocio
- **Pedidos por hora/día**
- **Pizza más vendida**
- **Cliente más frecuente**
- **Tiempo promedio de preparación**