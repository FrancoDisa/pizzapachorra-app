# Multi-stage Dockerfile para Backend Node.js + TypeScript

# Argumentos de construcción
ARG NODE_VERSION=22-alpine

# ========================================
# Etapa base: Configuración común
# ========================================
FROM node:${NODE_VERSION} AS base

# Metadatos
LABEL maintainer="Pizza Pachorra Dev Team"
LABEL description="Backend API para gestión de pedidos de pizzería"

# Instalar dependencias del sistema
RUN apk add --no-cache \
    curl \
    postgresql-client \
    tzdata

# Configurar zona horaria para Argentina
ENV TZ=America/Argentina/Buenos_Aires

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Configurar directorio de trabajo
WORKDIR /app

# Configurar permisos
RUN chown -R nextjs:nodejs /app
USER nextjs

# ========================================
# Etapa de dependencias: Instalar paquetes
# ========================================
FROM base AS deps

# Copiar archivos de configuración de paquetes
COPY --chown=nextjs:nodejs package*.json ./

# Instalar dependencias con cache optimizado
RUN --mount=type=cache,target=/home/nextjs/.npm \
    npm ci --only=production && \
    npm cache clean --force

# ========================================
# Etapa de desarrollo: Para desarrollo local
# ========================================
FROM base AS development

# Copiar archivos de configuración
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs tsconfig.json ./

# Instalar todas las dependencias (incluidas las de desarrollo)
RUN --mount=type=cache,target=/home/nextjs/.npm \
    npm ci

# Copiar código fuente
COPY --chown=nextjs:nodejs . .

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=development
ENV PORT=3001

# Comando de desarrollo con hot reload
CMD ["npm", "run", "dev"]

# ========================================
# Etapa de construcción: Compilar TypeScript
# ========================================
FROM development AS builder

# Compilar TypeScript a JavaScript
RUN npm run build

# ========================================
# Etapa de producción: Imagen final optimizada
# ========================================
FROM base AS production

# Copiar dependencias de producción desde etapa deps
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copiar código compilado desde etapa builder
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copiar archivos de configuración necesarios
COPY --chown=nextjs:nodejs package.json ./

# Exponer puerto
EXPOSE 3001

# Variables de entorno de producción
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Comando de producción
CMD ["node", "dist/server.js"]