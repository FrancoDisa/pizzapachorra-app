# Dockerfile para Nginx como Proxy Reverso

ARG NGINX_VERSION=alpine3.21

FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}

# Metadatos
LABEL maintainer="Pizza Pachorra Dev Team"
LABEL description="Nginx proxy reverso para Pizza Pachorra"

# Usar usuario no-root para seguridad
USER nginx

# Crear directorios necesarios
RUN mkdir -p /var/log/nginx /var/cache/nginx /etc/nginx/conf.d

# Copiar configuración personalizada
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx conf.d/ /etc/nginx/conf.d/

# Exponer puertos
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]