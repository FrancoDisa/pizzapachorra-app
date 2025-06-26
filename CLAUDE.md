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

[... rest of the existing content remains unchanged ...]