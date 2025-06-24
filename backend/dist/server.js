"use strict";
/**
 * Servidor principal de Pizza Pachorra
 * Sistema de gestión de pedidos para pizzería
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("@/config/database");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const validateEnv_1 = require("@/utils/validateEnv");
// Importar rutas
const pizzas_1 = require("@/routes/pizzas");
const extras_1 = require("@/routes/extras");
const clientes_1 = require("@/routes/clientes");
const pedidos_1 = require("@/routes/pedidos");
const health_1 = require("@/routes/health");
// Configurar variables de entorno
dotenv_1.default.config();
// Validar variables de entorno requeridas
(0, validateEnv_1.validateEnv)();
// Crear aplicación Express
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
// Configurar Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});
exports.io = io;
// Middleware de seguridad
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Middleware general
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
const logFormat = process.env.NODE_ENV === 'production'
    ? 'combined'
    : 'dev';
app.use((0, morgan_1.default)(logFormat, {
    stream: {
        write: (message) => logger_1.logger.info(message.trim())
    }
}));
// Middleware para inyectar io en req
app.use((req, _res, next) => {
    req.io = io;
    next();
});
// Rutas de la API
app.use('/api/health', health_1.healthRouter);
app.use('/api/pizzas', pizzas_1.pizzasRouter);
app.use('/api/extras', extras_1.extrasRouter);
app.use('/api/clientes', clientes_1.clientesRouter);
app.use('/api/pedidos', pedidos_1.pedidosRouter);
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
app.use(errorHandler_1.errorHandler);
// Configuración de Socket.IO para tiempo real
io.on('connection', (socket) => {
    logger_1.logger.info(`Cliente conectado: ${socket.id}`);
    // Unirse a sala de cocina
    socket.on('join_cocina', () => {
        socket.join('cocina');
        logger_1.logger.info(`Socket ${socket.id} se unió a cocina`);
    });
    // Unirse a sala de administración
    socket.on('join_admin', () => {
        socket.join('admin');
        logger_1.logger.info(`Socket ${socket.id} se unió a admin`);
    });
    // Manejar desconexión
    socket.on('disconnect', (reason) => {
        logger_1.logger.info(`Cliente desconectado: ${socket.id}, razón: ${reason}`);
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
        await database_1.config.testConnection();
        logger_1.logger.info('Conexión a base de datos establecida');
        // Iniciar servidor
        server.listen(PORT, () => {
            logger_1.logger.info(`🍕 Servidor Pizza Pachorra iniciado`);
            logger_1.logger.info(`🚀 Puerto: ${PORT}`);
            logger_1.logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            logger_1.logger.info(`📡 Socket.IO configurado para tiempo real`);
            if (process.env.NODE_ENV === 'development') {
                logger_1.logger.info(`📱 API disponible en: http://localhost:${PORT}/api`);
                logger_1.logger.info(`🔍 Health check: http://localhost:${PORT}/api/health`);
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}
// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Error no capturado:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Promise rechazada no manejada:', { reason, promise });
    process.exit(1);
});
// Manejo de señales de terminación
process.on('SIGTERM', () => {
    logger_1.logger.info('Señal SIGTERM recibida, cerrando servidor...');
    server.close(() => {
        logger_1.logger.info('Servidor cerrado');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('Señal SIGINT recibida, cerrando servidor...');
    server.close(() => {
        logger_1.logger.info('Servidor cerrado');
        process.exit(0);
    });
});
// Iniciar el servidor solo si este archivo es ejecutado directamente
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=server.js.map