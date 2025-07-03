# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pizza Pachorra** is an offline desktop application for managing daily orders at a pizzeria located in Sarandí, esquina Chiquito Perrini. It's built as a containerized multi-service application using Docker with React frontend, Express backend, and PostgreSQL database.

## Current Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with pgAdmin
- **State Management**: Zustand
- **Real-time**: Socket.IO
- **Development**: Docker Compose
- **Architecture**: Microservices pattern

## Development Environment

### Starting the Application
```bash
docker-compose up -d
```

### Accessing Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Database Admin**: http://localhost:8080 (pgAdmin)
- **Backend Health**: http://localhost:3001/api/health

### Key URLs
- **Dashboard Selection**: http://localhost:3000/pedidos-new
- **Kitchen View**: http://localhost:3000/cocina
- **Dashboard**: http://localhost:3000/dashboard

## Architecture Guidelines

### Frontend Structure
- **Components**: `/src/components/` - Reusable UI components
- **Pages**: `/src/pages/` - Route-level components
- **Store**: `/src/store/` - Zustand state management
- **Types**: `/src/types/` - TypeScript definitions
- **Services**: `/src/services/` - API calls and external services

### Current Working Models
1. **Model1QuickEntry**: Expert interface with keyboard shortcuts (F1-F5)
2. **Model5Wizard**: Guided step-by-step workflow with inline customization
3. **Model15PachorraTradicional**: Traditional brand-themed interface

## Development Standards

### Code Quality
- **TypeScript strict mode** - All code must be fully typed
- **ESLint + Prettier** - Automated code formatting
- **No commented code** - Remove unused code instead of commenting
- **Consistent imports** - Use absolute imports with path aliases

### State Management (Zustand)
```typescript
// ✅ GOOD - Primitive selectors
export const usePizzas = () => useAppStore((state) => 
  Array.isArray(state.menu?.pizzas) ? state.menu.pizzas : []
);

// ❌ BAD - Object selectors (cause infinite loops)
export const useMenu = () => useAppStore((state) => ({
  pizzas: state.menu.pizzas || [],
  extras: state.menu.extras || []
}));
```

### Price Formatting (Uruguay)
- **No decimals**: $390 (not $390.00)
- **Consistent formatting**: `Math.round(parseFloat(precio_base))`

### Customer Management
- **Demo data**: 8 realistic Uruguayan customers included
- **Search functionality**: By phone OR name
- **Phone format**: 099XXXXXX (Uruguayan mobile format)

## Current Operational Status

### Working Features
- ✅ Complete order creation workflow
- ✅ Pizza customization with half-and-half support
- ✅ Real-time price calculation
- ✅ Customer search and creation
- ✅ Professional keyboard shortcuts
- ✅ Socket.IO real-time updates

### Key Components
- **PizzaCustomizationModal**: Reusable pizza customization interface
- **CustomerSearch**: Advanced search with dropdown results
- **TicketSection**: Real-time order display with edit capabilities
- **Dashboard Models**: 3 optimized interfaces for different operational needs

### Database Schema
- **pizzas**: Base pizza products with ingredients and pricing
- **extras**: Additional toppings and modifications
- **pedidos**: Customer orders with items and status
- **clientes**: Customer information and history

## Important Development Notes

### Docker Environment
- **Frontend environment variables** must point to `http://localhost:3001` (browser accessible)
- **Container rebuilding** required when adding new dependencies
- **Volume mounts** can override node_modules - rebuild containers when needed

### Socket.IO Integration
- **Client library**: socket.io-client (not generic WebSocket)
- **Server endpoint**: http://localhost:3001 (not ws://)
- **Room system**: Use `socket.emit('join_cocina')` for kitchen updates

### Performance Optimization
- **Zustand selectors**: Use primitive selectors to prevent infinite loops
- **React optimization**: Avoid creating new objects in render cycles
- **State updates**: Check if state actually changed before updating

## Testing and Verification

### Health Checks
```bash
# Backend health
curl http://localhost:3001/api/health

# Socket.IO connectivity  
curl "http://localhost:3001/socket.io/?EIO=4&transport=polling"

# Data availability
curl http://localhost:3001/api/pizzas
```

### Container Status
```bash
docker-compose ps
docker-compose logs --tail=10 frontend
docker-compose logs --tail=10 backend
```

## Deployment Notes

- **Environment**: Development setup with Docker Compose
- **Production URLs**: Would need to be updated for production deployment
- **Database**: PostgreSQL with persistent volumes
- **Assets**: Vite build process for frontend optimization

This setup provides a complete pizzeria management system optimized for real-world operations with professional UX standards.