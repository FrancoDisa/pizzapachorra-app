# 🍕 Pizza Pachorra

**Sistema de gestión de pedidos para pizzería** - Aplicación de escritorio offline containerizada con Docker

![Badge](https://img.shields.io/badge/Status-Funcional-brightgreen)
![Badge](https://img.shields.io/badge/Version-1.0.0-blue)
![Badge](https://img.shields.io/badge/License-MIT-green)

## 📋 Descripción

Pizza Pachorra es una aplicación completa de gestión de pedidos diseñada específicamente para pizzerías locales. Funciona completamente offline y utiliza Docker para garantizar una instalación y despliegue sencillo en cualquier sistema.

### ✨ Características Principales

- 🏪 **Gestión completa de pedidos** - Desde la creación hasta la entrega
- 👥 **Base de datos de clientes** - Historial y datos de contacto
- 🍕 **Catálogo personalizable** - Pizzas, extras y precios
- 🔄 **Tiempo real** - Comunicación instantánea con la cocina
- 🌙 **Tema oscuro** - Interfaz moderna y amigable
- 📱 **Responsive** - Funciona en desktop, tablet y móvil
- 🔒 **Offline First** - Funciona sin conexión a internet
- 🐳 **Containerizado** - Instalación con un solo comando

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │────│     Nginx       │────│    Backend      │
│   React + TS    │    │  Proxy Reverso  │    │  Express + TS   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        │
                                              ┌─────────────────┐
                                              │   PostgreSQL    │
                                              │   Base de Datos │
                                              └─────────────────┘
```

## 🚀 Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** para styling
- **Vite** como bundler
- **Socket.io** para tiempo real

### Backend
- **Node.js 22** (LTS)
- **Express.js 4** con TypeScript
- **Socket.io** para WebSockets
- **Joi** para validación

### Base de Datos
- **PostgreSQL 16**
- **Migraciones versionadas**
- **Índices optimizados**

### Infraestructura
- **Docker & Docker Compose**
- **Nginx** como proxy reverso
- **Volúmenes Docker** para persistencia

## 📦 Instalación

### Prerrequisitos

- [Docker](https://www.docker.com/get-started) 20.0+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+
- 4GB de RAM disponible
- 2GB de espacio en disco

### Instalación Rápida

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/FrancoDisa/pizzapachorra-app.git
   cd pizzapachorra-app
   ```

2. **Levanta la aplicación**
   ```bash
   docker-compose up -d
   ```

3. **Espera a que todos los servicios estén listos** (2-3 minutos)
   ```bash
   docker-compose logs -f
   ```

4. **Accede a la aplicación**
   - **Aplicación principal**: http://localhost
   - **Panel de administración**: http://localhost/admin
   - **API Backend**: http://localhost:3001/api

### Verificar Instalación

```bash
# Verificar que todos los servicios estén corriendo
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Verificar salud de los servicios
curl http://localhost/health
```

## 🎯 Uso

### 📊 Dashboard - Vista General
- **Estadísticas en tiempo real** de pedidos y ventas
- **Estado de servicios** y conectividad
- **Métricas del día** con gráficos interactivos
- **Acceso rápido** a todas las funcionalidades

### 📝 Pantalla Principal - Pedidos
1. **Buscar cliente** por teléfono o crear uno nuevo
2. **Seleccionar pizzas** del catálogo con precios en tiempo real
3. **Añadir extras** con cálculo automático de precios
4. **Gestionar cantidades** con controles intuitivos (+/-)
5. **Ver ticket dinámico** con totales actualizados
6. **Confirmar pedido** y enviarlo automáticamente a cocina

### 🎯 Sistema de Dashboards Profesionales - **OPTIMIZADO**

**3 Interfaces de Pedidos Completamente Optimizadas** para diferentes casos de uso operacionales:

#### **⚡ Model1 Quick Entry** (Operadores Expertos)
- **Shortcuts F1-F5**: Selección directa de pizzas principales
- **Ingredientes Completos**: Lista completa visible en cada pizza
- **Header Optimizado**: Información esencial únicamente  
- **Ticket Refinado**: Diseño profesional con jerarquía visual mejorada
- **Usuarios objetivo**: Personal experimentado, alta velocidad, pedidos telefónicos

#### **🧙‍♂️ Model5 Wizard** (Usuarios Nuevos/Entrenamiento)  
- **Progress Indicator Compacto**: Navegación eficiente en 3 pasos
- **Personalización Inline**: Cards individuales sin modals complejos
- **Flujo Guiado**: Seleccionar → Personalizar → Cliente → Confirmar
- **Navegación Optimizada**: Controles claros con feedback visual
- **Usuarios objetivo**: Personal nuevo, entrenamiento, reducción de errores

#### **🍕 Model15 Pachorra Tradicional** (Identidad de Marca)
- **100% Español**: Completamente traducido, sin rastros de italiano
- **Identidad Correcta**: "Pizza Pachorra" tradicional (no italiana)
- **Header Compacto**: Eficiente pero manteniendo elegancia 
- **Desktop Optimizado**: Sin restricciones mobile, aprovecha pantallas grandes
- **Usuarios objetivo**: Presentación al cliente, identidad de marca

**Características Profesionales Unificadas:**
- ✅ **Sistema de clientes demo** con datos uruguayos realistas
- ✅ **Precios sin decimales** (formato $390, no $390.00)
- ✅ **Ingredientes completos** visibles en todas las pizzas
- ✅ **Modal responsive** con tema apropiado por interfaz
- ✅ **Design System global** con componentes consistentes
- ✅ **UX optimizada** para evaluación de interfaces

**Acceso:** `http://localhost:3000/pedidos-new` → Selector permite cambiar entre los 3 modelos
**Navegación Rápida:**
- **Ctrl+1**: Quick Entry Dashboard
- **Ctrl+5**: Wizard de 3 Pasos
- **Ctrl+Shift+5**: Pachorra Tradicional
- **Ctrl+M**: Toggle selector de modelos

### 👨‍🍳 Pantalla de Cocina
- **Vista en tiempo real** de pedidos pendientes
- **Cambio de estados**: *Nuevo → En Preparación → Listo → Entregado*
- **Notificaciones automáticas** de nuevos pedidos
- **Temporizadores** para control de tiempos de preparación
- **Conexión WebSocket** para actualizaciones instantáneas

### 👥 Gestión de Clientes
- **Búsqueda inteligente** por teléfono o nombre
- **Creación rápida** de nuevos clientes
- **Validación de datos** automática
- **Integración completa** con sistema de pedidos

## 🛠️ Desarrollo

### Estructura del Proyecto

```
pizzapachorra-app/
├── backend/                 # API Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Definición de rutas
│   │   ├── services/       # Lógica de negocio
│   │   └── utils/          # Utilidades y helpers
│   └── package.json
├── frontend/               # React + TypeScript
│   └── src/
├── database/               # Scripts SQL y migraciones
│   ├── init.sql           # Schema inicial
│   └── migrations/        # Migraciones versionadas
├── nginx/                  # Configuración del proxy
└── docker-compose.yml     # Orquestación de servicios
```

### Comandos de Desarrollo

```bash
# Desarrollo con hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend

# Ejecutar tests
docker-compose exec backend npm test

# Acceder al contenedor
docker-compose exec backend bash
```

### Variables de Entorno

Crea un archivo `.env` para personalizar la configuración:

```env
# Base de datos
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_DB=pizzapachorra

# Backend
JWT_SECRET=tu_jwt_secret_seguro
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001/api
```

## 📊 API Endpoints

### Pedidos
```http
GET    /api/pedidos              # Lista de pedidos
POST   /api/pedidos              # Crear pedido
PUT    /api/pedidos/:id          # Actualizar pedido
DELETE /api/pedidos/:id          # Cancelar pedido
```

### Clientes
```http
GET    /api/clientes             # Lista de clientes
POST   /api/clientes             # Crear cliente
GET    /api/clientes/buscar/:tel # Buscar por teléfono
```

### Catálogo
```http
GET    /api/pizzas               # Lista de pizzas
GET    /api/extras               # Lista de extras
POST   /api/precios/calcular     # Calcular precio
```

## 🔧 Configuración

### Personalizar Catálogo

Edita el archivo `database/init.sql` para modificar:
- Lista de pizzas disponibles
- Extras e ingredientes
- Precios base

### Configurar Nginx

Modifica `nginx/nginx.conf` para:
- Cambiar puertos de acceso
- Configurar SSL/HTTPS
- Añadir autenticación básica

## 🐛 Troubleshooting

### Problemas Comunes

**Error: Puerto ya en uso**
```bash
# Cambiar puertos en docker-compose.yml
ports:
  - "8080:80"  # En lugar de "80:80"
```

**Base de datos no conecta**
```bash
# Verificar logs de PostgreSQL
docker-compose logs database

# Resetear volúmenes si es necesario
docker-compose down -v
docker-compose up -d
```

**Frontend no carga**
```bash
# Rebuilder contenedores
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Logs y Debugging

```bash
# Ver todos los logs
docker-compose logs

# Logs en tiempo real de un servicio
docker-compose logs -f backend

# Acceder al contenedor para debugging
docker-compose exec backend bash
```

## 🤝 Contribuir

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

### Coding Standards

- **TypeScript** estricto habilitado
- **ESLint** para linting
- **Prettier** para formateo
- **Conventional Commits** para mensajes
- **Tests** requeridos para nuevas funcionalidades

## 📝 Roadmap

- [ ] **v1.1**: Reportes y estadísticas
- [ ] **v1.2**: Integración con impresoras térmicas
- [ ] **v1.3**: App móvil para repartidores
- [ ] **v1.4**: Integración con sistemas de pago
- [ ] **v2.0**: Multi-sucursal y franquicias

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Franco Disa** - *Desarrollo principal* - [@FrancoDisa](https://github.com/FrancoDisa)

## 🙏 Agradecimientos

- Inspirado en las necesidades reales de pizzerías locales
- Comunidad open source por las herramientas utilizadas
- Beta testers por el feedback valioso

---

**🍕 ¡Hecho con amor para las pizzerías que alimentan nuestras comunidades!**

## 📞 Soporte

¿Necesitas ayuda? 

- 🐛 [Reportar un bug](https://github.com/FrancoDisa/pizzapachorra-app/issues)
- 💡 [Solicitar una funcionalidad](https://github.com/FrancoDisa/pizzapachorra-app/issues)
- 📧 [Contacto directo](mailto:tu-email@example.com)

⭐ **¡Si te gusta este proyecto, dale una estrella en GitHub!** 