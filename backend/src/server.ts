/**
 * Servidor principal de Pizza Pachorra
 * Sistema de gestión de pedidos para pizzería
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { config } from '@/config/database';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { validateEnv } from '@/utils/validateEnv';

// Importar rutas
import { pizzasRouter } from '@/routes/pizzas';
import { extrasRouter } from '@/routes/extras';
import { clientesRouter } from '@/routes/clientes';
import { pedidosRouter } from '@/routes/pedidos';
import { healthRouter } from '@/routes/health';

// Configurar variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
validateEnv();

// Crear aplicación Express
const app = express();
const server = createServer(app);

// Configurar Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configurado
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware general
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
const logFormat = process.env.NODE_ENV === 'production' 
  ? 'combined' 
  : 'dev';

app.use(morgan(logFormat, {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Middleware para inyectar io en req
app.use((req, _res, next) => {
  (req as any).io = io;
  next();
});

// Rutas de la API
app.use('/api/health', healthRouter);
app.use('/api/pizzas', pizzasRouter);
app.use('/api/extras', extrasRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/pedidos', pedidosRouter);

// Ruta raíz
app.get('/', (_req, res) => {
  res.json({
    message: 'Pizza Pachorra API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Configuración de Socket.IO para tiempo real
io.on('connection', (socket) => {
  logger.info(`Cliente conectado: ${socket.id}`);

  // Unirse a sala de cocina
  socket.on('join_cocina', () => {
    socket.join('cocina');
    logger.info(`Socket ${socket.id} se unió a cocina`);
  });

  // Unirse a sala de administración
  socket.on('join_admin', () => {
    socket.join('admin');
    logger.info(`Socket ${socket.id} se unió a admin`);
  });

  // Manejar desconexión
  socket.on('disconnect', (reason) => {
    logger.info(`Cliente desconectado: ${socket.id}, razón: ${reason}`);
  });

  // Eventos de pedidos
  socket.on('pedido_actualizado', (data) => {
    socket.to('cocina').emit('pedido_actualizado', data);
    socket.to('admin').emit('pedido_actualizado', data);
  });

  socket.on('nuevo_pedido', (data) => {
    socket.to('cocina').emit('nuevo_pedido', data);
    socket.to('admin').emit('nuevo_pedido', data);
  });

  socket.on('cambio_estado', (data) => {
    socket.to('cocina').emit('cambio_estado', data);
    socket.to('admin').emit('cambio_estado', data);
  });
});

// Configurar puerto
const PORT = process.env.PORT || 3001;

// Función para iniciar el servidor
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await config.testConnection();
    logger.info('Conexión a base de datos establecida');

    // Iniciar servidor
    server.listen(PORT, () => {
      logger.info(`🍕 Servidor Pizza Pachorra iniciado`);
      logger.info(`🚀 Puerto: ${PORT}`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📡 Socket.IO configurado para tiempo real`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`📱 API disponible en: http://localhost:${PORT}/api`);
        logger.info(`🔍 Health check: http://localhost:${PORT}/api/health`);
      }
    });

  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rechazada no manejada:', { reason, promise });
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('Señal SIGTERM recibida, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Señal SIGINT recibida, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

// Iniciar el servidor solo si este archivo es ejecutado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, server, io };