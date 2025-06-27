# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pizza Pachorra** is an offline desktop application for managing daily orders at a pizzeria located in Sarandí, esquina Chiquito Perrini. It's built as a containerized multi-service application using Docker with React frontend, Express backend, and PostgreSQL database.

[... existing content remains unchanged ...]

## Development Workflow Added Memory

### Memory: ESM Migration Best Practices (2025-06-24)

- Always regenerate `package-lock.json` after version changes in dependencies
- Verify Docker builds after ESM migration
- Use relative imports when `@/` path aliases cause issues
- Prefer ESM syntax with explicit file extensions (`.js`)
- Test WebSocket and Docker stack thoroughly after ESM updates
- Remove CommonJS-specific patterns like `require.main` and `__dirname`
- Configure import maps or bundler path resolution for complex projects

### Memory: TodoList Management Best Practices (2025-06-25)

- **ALWAYS mark todolist.md tasks as completed when finishing work** - Update status from pending/in_progress to completed with checkmarks and completion notes
- Track actual time spent vs estimated time for better planning
- Document solution details in todolist for future reference
- Include validation steps and final verification in completion notes
- Mark completion date and contributor for audit trail
- Move completed critical tasks to a "COMPLETADA" section with full documentation

### Memory: React Router v7 HydratedRouter Error Solution (2025-06-25)

- **Error**: `You must render this element inside a <HydratedRouter> element` caused by mixing client-side routing (`createBrowserRouter`) with SSR components (`<Meta>`, `<Links>`, `<Scripts>`)
- **Solution**: Convert to pure client-side routing pattern according to official React Router v7 docs
- **Key Fix**: Remove SSR components from root.tsx and convert to standard React component layout
- **Pattern**: Use `createBrowserRouter` + `RouterProvider` in main.tsx with simplified root layout
- **Result**: Compatible with Vite SPA setup without requiring complex SSR configuration
- **Documentation**: Solution verified using Context7 official React Router documentation

### Memory: React Infinite Loop Debugging and Solutions (2025-06-25)

- **Error**: `Maximum update depth exceeded` caused by useEffect dependency loops and WebSocket connection failures
- **Root Causes**: 
  1. WebSocket reconnection loops when backend server doesn't support WS
  2. useEffect with timer dependencies causing state update loops
  3. Store updates within useEffect triggering dependency re-runs
- **Solutions Applied**:
  1. Temporarily disable WebSocket until backend WS server is configured
  2. Remove problematic dependencies from useEffect arrays
  3. Use getState() calls instead of reactive hooks in intervals
  4. Add conditional checks to prevent unnecessary state updates
- **Pattern**: Always check if state actually changed before updating to prevent infinite loops
- **Prevention**: Avoid putting frequently changing values as useEffect dependencies

### Memory: Socket.IO vs WebSocket Client Compatibility Issue (2025-06-26)

- **Error**: Kitchen view showing "Desconectado" despite backend WebSocket server running properly
- **Root Cause**: Frontend using generic WebSocket client (`new WebSocket()`) trying to connect to Socket.IO server
- **Technical Issue**: Socket.IO uses a different protocol than standard WebSocket - requires `socket.io-client` library
- **Solution Pattern**:
  1. Replace `new WebSocket(url)` with `io(url, options)` from socket.io-client
  2. Change URL from `ws://localhost:3001` to `http://localhost:3001` for Socket.IO
  3. Use Socket.IO specific events: `connect`, `disconnect`, `connect_error` instead of WebSocket events
  4. Implement Socket.IO rooms with `socket.emit('join_cocina')` for targeted messaging
- **Backend Verification**: Always test Socket.IO endpoint with `curl "http://host/socket.io/?EIO=4&transport=polling"`
- **Connection Testing**: Create manual test script with Socket.IO client before debugging frontend
- **Key Insight**: Socket.IO and WebSocket are NOT interchangeable - client must match server implementation

### Memory: Modern React Layout Implementation with Context7 Best Practices (2025-06-27)

- **Objective**: Implement responsive 3-column layout for Pizza Pachorra pedidos page using modern React + Tailwind CSS patterns
- **Research Approach**: Used Context7 to get latest React and Tailwind CSS best practices from official documentation
- **Key Insights from Context7**:
  1. **Component Composition**: Use explicit composition instead of `React.Children.map` for better scalability
  2. **Grid Patterns**: Modern responsive grid with `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` mobile-first approach
  3. **Layout Strategy**: Use container/section pattern with reusable components
- **Implementation Pattern**:
  ```typescript
  // Modern composition pattern
  <PedidosPage>
    <MenuSection />      // Column 1: Pizza/Extra selection
    <TicketSection />    // Column 2: Order ticket
    <ClienteSection />   // Column 3: Customer info
  </PedidosPage>
  ```
- **Responsive Breakpoints Applied**:
  - Mobile: `grid-cols-1` (vertical stack)
  - Tablet: `md:grid-cols-2` (menu + ticket combined)
  - Desktop: `lg:grid-cols-3` (full 3-column layout)
- **Gap Strategy**: `gap-4 lg:gap-6` for optimal spacing across screen sizes

### Memory: Zustand Store Selector Infinite Loop Prevention (2025-06-27)

- **Critical Error**: "Maximum update depth exceeded" and "getSnapshot should be cached to avoid infinite loop"
- **Root Cause**: Zustand selector creating new objects on every call, causing React to detect false state changes
- **Problematic Pattern**:
  ```typescript
  // ❌ BAD - Creates new object every time
  export const useMenu = () => useAppStore((state) => ({
    pizzas: state.menu.pizzas || [],
    extras: state.menu.extras || []
  }));
  ```
- **Solution Pattern**:
  ```typescript
  // ✅ GOOD - Primitive selectors with stable references
  export const usePizzas = () => useAppStore((state) => 
    Array.isArray(state.menu?.pizzas) ? state.menu.pizzas : []
  );
  export const useExtras = () => useAppStore((state) => 
    Array.isArray(state.menu?.extras) ? state.menu.extras : []
  );
  ```
- **Prevention Rules**:
  1. Never return new objects/arrays from Zustand selectors unless data actually changed
  2. Use primitive selectors (returning direct values) instead of composite selectors
  3. Add Array.isArray() validation in selectors to prevent runtime errors
  4. Remove store setter functions from useEffect dependencies (they're stable)
- **Debugging**: Look for "getSnapshot should be cached" warning - indicates selector caching issues

### Memory: Backend API Response Structure Alignment (2025-06-27)

- **Problem**: Frontend expecting direct arrays but backend returning `{success: true, data: [...]}` structure
- **Error Manifestation**: `pizzas.map is not a function` because `pizzas` was an object, not an array
- **Solution Pattern**:
  ```typescript
  // Extract data field from backend response structure
  async getPizzas(): Promise<Pizza[]> {
    const response = await fetchApi<{success: boolean, data: Pizza[]}>('/pizzas');
    return response.data; // Extract actual data
  }
  ```
- **Type Alignment Issues Fixed**:
  - `precio_base`: Backend sends string ("390.00"), not number
  - `ingredientes`: Backend field name, not `ingredientes_incluidos`
  - `activa`: Backend field name, not `activo`
  - `categoria`: Backend sends any string, not limited enum values
- **Validation Strategy**: Always validate array types in selectors: `Array.isArray(data) ? data : []`
- **Testing Approach**: Use `curl` to verify backend response structure before implementing frontend

### Memory: React Component Error Boundary and Infinite Loop Recovery (2025-06-27)

- **Error Context**: MenuSection component causing infinite loops due to store selector issues
- **React Behavior**: Error boundaries catch infinite loop errors and attempt component tree recreation
- **Debugging Approach**:
  1. Check browser console for "getSnapshot should be cached" warnings
  2. Look for "Maximum update depth exceeded" errors pointing to specific components
  3. Identify store selectors that might be creating new references
  4. Test with empty dependency arrays in useEffect to isolate dependency issues
- **Prevention in Components**:
  ```typescript
  // Safe component pattern
  const Component = () => {
    const stablePrimitive = useStableSelector(); // Never creates new objects
    
    useEffect(() => {
      // Load data only once
    }, []); // Empty dependencies for mount-only effects
    
    return <div>{/* Render logic */}</div>;
  };
  ```
- **Recovery Strategy**: When infinite loops occur, fix selectors first, then restart Docker containers
- **Verification**: After fixes, check that page loads without console errors and Docker logs show clean Vite startup

### Memory: Modern Tailwind CSS v4 Layout Patterns (2025-06-27)

- **Grid System**: Use CSS Grid instead of Flexbox for complex layouts
- **Responsive Strategy**: Mobile-first with logical breakpoint progression
- **Spacing System**: Consistent gap patterns with responsive adjustments
- **Applied Pattern for 3-Column Layout**:
  ```css
  /* Container */
  .grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-4.lg:gap-6
  
  /* Individual sections */
  .bg-gray-800.rounded-lg.border.border-gray-700.h-full.flex.flex-col
  ```
- **Height Management**: Use `h-[calc(100vh-2rem)]` for full-height layouts accounting for padding
- **Order Control**: Use `order-first md:order-none lg:order-none` for mobile-first column reordering
- **Section Architecture**: Header (flex-shrink-0) + Scrollable content (flex-1 overflow-y-auto)
- **Dark Theme**: Consistent gray-800/gray-900 color scheme for pizzeria environment
- **Performance**: All utilities compile to minimal CSS with Tailwind v4's Vite plugin

[... rest of the existing content remains unchanged ...]