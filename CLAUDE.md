# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pizza Pachorra** is an offline desktop application for managing daily orders at a pizzeria located in Sarandí, esquina Chiquito Perrini. It's built as a containerized multi-service application using Docker with React frontend, Express backend, and PostgreSQL database.

## Development Commands

### Docker Operations
```bash
# Start all services in development mode
docker compose up -d --build

# View logs from all services
docker compose logs -f

# View logs from specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f database

# Stop all services
docker compose down

# Rebuild specific service
docker compose up --build backend

# Execute commands in containers
docker compose exec backend /bin/bash
docker compose exec database psql -U postgres -d pizzapachorra
```

### Backend Development
```bash
# Inside backend container
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix

# Database operations
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with initial data
npm run db:reset     # Reset database to initial state
```

### Frontend Development
```bash
# Inside frontend container (when implemented)
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
```

## Architecture Overview

### Service Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS (port 3000 → 5173)
- **Backend**: Node.js 22 + Express 4 + TypeScript + Socket.io (port 3001)
- **Database**: PostgreSQL 16 with custom schema (port 5432)
- **Nginx**: Reverse proxy serving frontend and routing API calls (port 80)

### Backend Structure
```
backend/src/
├── config/          # Database and app configuration
├── controllers/     # Request handlers
├── middleware/      # Express middleware (error handling, validation)
├── models/          # Data models and database interactions
├── routes/          # API route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utilities (logger, env validation)
└── server.ts        # Main application entry point
```

### Key Backend Features
- **Database Connection**: PostgreSQL pool with health checks and connection management
- **Error Handling**: Centralized error middleware with custom error types (ValidationError, DatabaseError, BusinessError)
- **Logging**: Winston-based structured logging with different levels
- **Real-time**: Socket.io for kitchen notifications and order updates
- **Validation**: Environment variable validation and Joi schema validation
- **Security**: Helmet, CORS, compression middleware

### Database Schema
Key entities with relationships:
- **pizzas**: Menu items with base prices and ingredients
- **extras**: Additional ingredients with prices by category
- **clientes**: Customer data with phone-based lookup
- **pedidos**: Orders with status tracking and timestamps
- **pedido_items**: Order line items supporting half-and-half pizzas
- **historial_estados**: Order status change audit trail

## Business Logic

### Pizza Pricing Algorithm
- **Whole Pizza**: `base_price + extras - removed_ingredients`
- **Half & Half**: Complex calculation where extras on both halves cost full price, extras on one half cost half price

### Order States
```
nuevo → en_preparacion → listo → entregado
  ↓           ↓           ↓
cancelado   cancelado   cancelado
```

### WebSocket Events
- `nuevo_pedido`: New order created
- `cambio_estado`: Order status changed
- `pedido_actualizado`: Order updated
- `cliente_actualizado`: Customer data updated

## Key URLs
- Frontend: http://localhost:3000 (dev) / http://localhost:80 (production)
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/api/health
- Database: postgresql://postgres:pizzapachorra2025@localhost:5432/pizzapachorra

## Environment Variables
Required:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: development/production/test
- `PORT`: Backend server port (default: 3001)
- `CORS_ORIGIN`: Frontend URL (default: http://localhost:3000)
- `JWT_SECRET`: For future authentication (optional)

## Business Data
### Menu Items
- Pachorra Extrem: $390 (bacon, huevo frito, papas fritas, cheddar)
- Pachorra Extrem Veggie: $370 (huevo frito, papas fritas, doble muzzarella)
- Pachorra Extrem Cheese: $340 (doble muzzarella, cheddar, parmesano, queso blanco)
- Pachorra Muzzarella: $260 (doble muzzarella)
- Pachorra Base: $230 (muzzarella + customizable)

### Extras Pricing
- $40: aceite de oliva, aceitunas, albahaca, cebolla, huevo duro, jamón, morrón, panceta, parmesano, pesto, rúcula, tomate, choclo
- $50: bondiola, lomito, papas fritas, peperoni, huevo frito
- $80: ananá, roquefort, champiñones, palmitos, panchos

## Development Notes
- Application must work completely offline
- Dark theme with specified color palette: #1a1a1a background, #f5f5dc text, #ff6b35/#8b0000 accents
- Customer phone-based autocomplete is critical
- Real-time kitchen display without interactive elements
- All logging goes through Winston with structured format
- Database operations use connection pooling with health checks