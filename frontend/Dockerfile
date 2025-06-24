# Multi-stage Dockerfile para Frontend React + TypeScript + Vite

# Argumentos de construcción
ARG NODE_VERSION=22-alpine
ARG NGINX_VERSION=alpine3.21

# ========================================
# Etapa base: Configuración común
# ========================================
FROM node:${NODE_VERSION} AS base

# Metadatos
LABEL maintainer="Pizza Pachorra Dev Team"
LABEL description="Frontend React para gestión de pedidos de pizzería"

# Instalar dependencias del sistema
RUN apk add --no-cache curl

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

# Instalar dependencias de producción
RUN npm install --only=production && \
    npm cache clean --force

# ========================================
# Etapa de desarrollo: Para desarrollo local
# ========================================
FROM base AS development

# Copiar archivos de configuración
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs vite.config.ts ./
COPY --chown=nextjs:nodejs tsconfig*.json ./
COPY --chown=nextjs:nodejs tailwind.config.js ./
# PostCSS no necesario con Tailwind CSS v4 + Vite plugin

# Instalar todas las dependencias (incluidas las de desarrollo)
RUN npm install

# Copiar código fuente
COPY --chown=nextjs:nodejs . .

# Exponer puerto de Vite
EXPOSE 5173

# Variables de entorno por defecto
ENV NODE_ENV=development

# Comando de desarrollo con hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ========================================
# Etapa de construcción: Build para producción
# ========================================
FROM development AS builder

# Variables de entorno para build
ENV NODE_ENV=production

# Construir aplicación React
RUN npm run build

# Verificar que el build se completó correctamente
RUN ls -la dist/

# ========================================
# Etapa de producción: Nginx para servir archivos estáticos
# ========================================
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS production

# Metadatos para imagen de producción
LABEL maintainer="Pizza Pachorra Dev Team"
LABEL description="Frontend React servido por Nginx"

# Usar usuario no-root para seguridad
USER nginx

# Copiar archivos construidos desde la etapa builder
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

# Crear directorio para logs
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log

# Exponer puerto 8080 (usuario no-root no puede usar puerto 80)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]