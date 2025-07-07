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
- **Pedidos (Main Interface)**: http://localhost:3000/pedidos
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
1. **Model1QuickEntry**: Expert interface optimized for speed and efficiency (Default)
2. **Model5Wizard**: Guided step-by-step workflow for new users with validations

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
- ✅ Ultra-optimized pizza customization with half-and-half support
- ✅ Detailed real-time price calculation with complete breakdown
- ✅ Compact ingredient/extra selection without scroll
- ✅ Customer search and creation
- ✅ Professional keyboard shortcuts
- ✅ Socket.IO real-time updates

### Key Components
- **PizzaCustomizationModal**: Ultra-optimized pizza customization interface with detailed pricing
- **CustomerSearch**: Advanced search with dropdown results
- **TicketSection**: Real-time order display with edit capabilities
- **Interface Models**: 2 streamlined interfaces optimized for different user types
- **Configuration System**: Built-in interface switching through settings menu

### PizzaCustomizationModal - Ultra-Optimized Design

#### **🎯 Optimizations Achieved:**
- **Ultra-compact header**: 3 lines instead of 6, essential info only
- **Single-line controls**: Quantity, half-and-half, and pizza selection in one row
- **Horizontal price/notes layout**: Side-by-side for maximum space efficiency
- **No-scroll ingredients/extras**: 4×6 and 3×4 grids fit all content without scrolling
- **Detailed price breakdown**: Complete transparency with extras added/removed tracking

#### **💰 Price Detail Features:**
- **Base price**: Shows individual or average for half-and-half pizzas
- **Extras tracking**: Real-time count and total cost (+X extras: +$Y)
- **Removals tracking**: Shows discount for removed ingredients (-X ingredients: -$Y)
- **Subtotal calculation**: Clear unit price × quantity display
- **Final total**: Prominently displayed with color coding

#### **🚀 Operational Benefits:**
- **70% less vertical space**: Fits more content in less screen real estate
- **No scrolling required**: All ingredients and extras visible at once
- **Faster workflows**: Optimized for high-speed pizzeria operations
- **Complete transparency**: Customers see exact price breakdown
- **Professional UX**: Clean, efficient interface suitable for business use

#### **🎨 UI Design Principles:**
- **Compact but readable**: text-xs with proper spacing and contrast
- **Visual hierarchy**: Icons, colors, and typography guide user attention
- **Touch-friendly**: Adequate button sizes despite compact layout
- **Responsive design**: Works on mobile and desktop with appropriate adjustments
- **Theme support**: Traditional and default themes with consistent styling

### Interface Configuration System

#### **⚙️ Settings Menu Integration:**
- **Location**: Configuration icon (⚙️) in the main header navigation
- **Access**: Available in all sections, with contextual options in Pedidos
- **Persistence**: Settings stored in localStorage for user preferences
- **Live switching**: Interface changes apply immediately with page reload

#### **🔧 Available Interface Options:**
1. **Quick Entry (Default)**:
   - Optimized for expert users and high-speed operations
   - Minimal visual elements, maximum space efficiency
   - Direct pizza selection with streamlined workflows
   - Ideal for experienced staff during busy periods

2. **Wizard (Guided)**:
   - Step-by-step guided workflow with validation
   - User-friendly for new staff or complex orders
   - Built-in error prevention and progress tracking
   - Ideal for training and reducing order mistakes

#### **🚀 Optimizations Applied:**
- **Space efficiency**: Removed decorative headers, emojis, and unnecessary visual elements
- **Streamlined navigation**: Eliminated redundant menu options and floating selectors
- **Clean interface**: No F1-F5 badges, quantity counters moved to ticket section
- **Professional appearance**: Focus on operational efficiency over branding elements

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

### Navigation & Routing
- **Main Layout**: `app/root.tsx` - Primary navigation and configuration system
- **Simplified Routing**: Direct access to interfaces without intermediate selectors
- **Route Structure**:
  - `/` - Dashboard
  - `/pedidos` - Main order interface (Quick Entry by default)
  - `/cocina` - Kitchen view
- **Configuration**: Settings accessible via ⚙️ icon in header navigation

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

## Documentation

### Additional Documentation Files
- **PizzaCustomizationModal Optimization Guide**: `/docs/PizzaCustomizationModal-OptimizationGuide.md`
  - Complete optimization details and architectural decisions
  - Performance metrics and design principles
  - Development guidelines and best practices

- **Modal Design Principles**: `/docs/Modal-DesignPrinciples.md`
  - Comprehensive modal design system
  - Layout patterns and visual design guidelines
  - Quality checklist and performance targets

## Deployment Notes

- **Environment**: Development setup with Docker Compose
- **Production URLs**: Would need to be updated for production deployment
- **Database**: PostgreSQL with persistent volumes
- **Assets**: Vite build process for frontend optimization

This setup provides a complete pizzeria management system optimized for real-world operations with professional UX standards. The interface has been streamlined for maximum operational efficiency:

## Key Achievements

### ✅ **Streamlined Interface Design**
- **Space-optimized**: Removed decorative elements, headers, and unnecessary visual clutter
- **Direct access**: Simplified navigation eliminates intermediate selection screens
- **Professional focus**: Clean, efficient interface prioritizing operational speed

### ✅ **Flexible Configuration System** 
- **Built-in settings**: Configuration accessible via header ⚙️ icon
- **User preference persistence**: Interface choices saved automatically
- **Context-aware options**: Relevant settings shown based on current section

### ✅ **Dual Interface Strategy**
- **Quick Entry**: Default expert interface for experienced users
- **Wizard Mode**: Guided workflow for training and complex orders
- **Seamless switching**: Change interfaces without losing work progress

The system now provides maximum operational efficiency while maintaining flexibility for different user skill levels and operational contexts.