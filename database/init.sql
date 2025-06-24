-- Schema inicial para Pizza Pachorra
-- Base de datos PostgreSQL

-- Configurar timezone para Argentina
SET timezone = 'America/Argentina/Buenos_Aires';

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- TABLA: pizzas
-- ========================================
CREATE TABLE pizzas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    precio_base DECIMAL(10,2) NOT NULL CHECK (precio_base > 0),
    ingredientes TEXT[] NOT NULL DEFAULT '{}',
    descripcion TEXT,
    activa BOOLEAN NOT NULL DEFAULT true,
    orden_menu INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para pizzas
CREATE INDEX idx_pizzas_activa ON pizzas(activa);
CREATE INDEX idx_pizzas_orden ON pizzas(orden_menu);

-- ========================================
-- TABLA: extras
-- ========================================
CREATE TABLE extras (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    categoria VARCHAR(20) NOT NULL DEFAULT 'general',
    activo BOOLEAN NOT NULL DEFAULT true,
    orden_categoria INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para extras
CREATE INDEX idx_extras_activo ON extras(activo);
CREATE INDEX idx_extras_categoria ON extras(categoria);
CREATE INDEX idx_extras_precio ON extras(precio);

-- ========================================
-- TABLA: clientes
-- ========================================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    telefono VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100),
    direccion TEXT,
    referencias TEXT,
    notas TEXT,
    total_pedidos INTEGER DEFAULT 0,
    total_gastado DECIMAL(10,2) DEFAULT 0,
    ultimo_pedido TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_nombre ON clientes USING gin(nombre gin_trgm_ops);
CREATE INDEX idx_clientes_ultimo_pedido ON clientes(ultimo_pedido);

-- ========================================
-- TABLA: pedidos
-- ========================================
CREATE TYPE estado_pedido AS ENUM ('nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado');

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    estado estado_pedido NOT NULL DEFAULT 'nuevo',
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    descuento DECIMAL(10,2) DEFAULT 0 CHECK (descuento >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    metodo_pago VARCHAR(20) DEFAULT 'efectivo',
    notas TEXT,
    tiempo_estimado INTEGER, -- minutos
    fecha_pedido TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_preparacion TIMESTAMP,
    fecha_listo TIMESTAMP,
    fecha_entrega TIMESTAMP,
    fecha_cancelacion TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para pedidos
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX idx_pedidos_fecha_estado ON pedidos(fecha_pedido, estado);

-- ========================================
-- TABLA: pedido_items
-- ========================================
CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    pizza_id INTEGER NOT NULL REFERENCES pizzas(id),
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    es_mitad_y_mitad BOOLEAN NOT NULL DEFAULT false,
    
    -- Para pizza entera o primera mitad
    extras_principales INTEGER[] DEFAULT '{}',
    ingredientes_removidos TEXT[] DEFAULT '{}',
    
    -- Para segunda mitad (solo si es_mitad_y_mitad = true)
    pizza_id_mitad2 INTEGER REFERENCES pizzas(id),
    extras_mitad2 INTEGER[] DEFAULT '{}',
    ingredientes_removidos_mitad2 TEXT[] DEFAULT '{}',
    
    -- Precios calculados
    precio_base DECIMAL(10,2) NOT NULL,
    precio_extras DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_total DECIMAL(10,2) NOT NULL,
    
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para pedido_items
CREATE INDEX idx_pedido_items_pedido ON pedido_items(pedido_id);
CREATE INDEX idx_pedido_items_pizza ON pedido_items(pizza_id);

-- ========================================
-- TABLA: historial_estados
-- ========================================
CREATE TABLE historial_estados (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    estado_anterior estado_pedido,
    estado_nuevo estado_pedido NOT NULL,
    motivo TEXT,
    usuario VARCHAR(50) DEFAULT 'sistema',
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para historial_estados
CREATE INDEX idx_historial_pedido ON historial_estados(pedido_id);
CREATE INDEX idx_historial_timestamp ON historial_estados(timestamp);

-- ========================================
-- FUNCIONES Y TRIGGERS
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_pizzas_updated_at BEFORE UPDATE ON pizzas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de pedido
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_pedido = 'PP' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(NEW.id::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar número de pedido
CREATE TRIGGER trigger_generar_numero_pedido
    BEFORE INSERT ON pedidos
    FOR EACH ROW EXECUTE FUNCTION generar_numero_pedido();

-- Función para registrar cambios de estado
CREATE OR REPLACE FUNCTION registrar_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO historial_estados (pedido_id, estado_anterior, estado_nuevo)
        VALUES (NEW.id, OLD.estado, NEW.estado);
        
        -- Actualizar timestamps según el estado
        CASE NEW.estado
            WHEN 'en_preparacion' THEN
                NEW.fecha_preparacion = NOW();
            WHEN 'listo' THEN
                NEW.fecha_listo = NOW();
            WHEN 'entregado' THEN
                NEW.fecha_entrega = NOW();
            WHEN 'cancelado' THEN
                NEW.fecha_cancelacion = NOW();
            ELSE
                -- No hacer nada para 'nuevo'
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para cambios de estado
CREATE TRIGGER trigger_cambio_estado
    BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION registrar_cambio_estado();

-- Función para actualizar estadísticas de cliente
CREATE OR REPLACE FUNCTION actualizar_stats_cliente()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clientes SET
            total_pedidos = total_pedidos + 1,
            total_gastado = total_gastado + NEW.total,
            ultimo_pedido = NEW.fecha_pedido
        WHERE id = NEW.cliente_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.estado != 'entregado' AND NEW.estado = 'entregado' THEN
        UPDATE clientes SET
            ultimo_pedido = NEW.fecha_entrega
        WHERE id = NEW.cliente_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.estado = 'entregado' AND NEW.estado = 'cancelado' THEN
        UPDATE clientes SET
            total_pedidos = GREATEST(total_pedidos - 1, 0),
            total_gastado = GREATEST(total_gastado - OLD.total, 0)
        WHERE id = NEW.cliente_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para estadísticas de cliente
CREATE TRIGGER trigger_stats_cliente
    AFTER INSERT OR UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION actualizar_stats_cliente();

-- ========================================
-- DATOS INICIALES
-- ========================================

-- Insertar pizzas del menú
INSERT INTO pizzas (nombre, precio_base, ingredientes, descripcion, orden_menu) VALUES
('Pachorra Extrem', 390.00, ARRAY['muzzarella', 'bacon', 'huevo frito', 'papas fritas', 'cheddar'], 'La más completa con bacon, huevo frito, papas fritas y cheddar', 1),
('Pachorra Extrem Veggie', 370.00, ARRAY['doble muzzarella', 'huevo frito', 'papas fritas'], 'Versión vegetariana con huevo frito y papas fritas', 2),
('Pachorra Extrem Cheese', 340.00, ARRAY['doble muzzarella', 'cheddar', 'parmesano', 'queso blanco'], 'Para los amantes del queso - cuatro quesos', 3),
('Pachorra Muzzarella', 260.00, ARRAY['doble muzzarella'], 'Clásica con doble muzzarella', 4),
('Pachorra Base', 230.00, ARRAY['muzzarella'], 'Base para personalizar a tu gusto', 5);

-- Insertar extras
-- Extras de $40
INSERT INTO extras (nombre, precio, categoria, orden_categoria) VALUES
('Aceite de oliva', 40.00, 'condimentos', 1),
('Aceitunas', 40.00, 'vegetales', 2),
('Albahaca', 40.00, 'condimentos', 3),
('Cebolla', 40.00, 'vegetales', 4),
('Huevo duro', 40.00, 'proteinas', 5),
('Jamón', 40.00, 'carnes', 6),
('Morrón', 40.00, 'vegetales', 7),
('Panceta', 40.00, 'carnes', 8),
('Parmesano', 40.00, 'quesos', 9),
('Pesto', 40.00, 'condimentos', 10),
('Rúcula', 40.00, 'vegetales', 11),
('Tomate', 40.00, 'vegetales', 12),
('Choclo', 40.00, 'vegetales', 13);

-- Extras de $50
INSERT INTO extras (nombre, precio, categoria, orden_categoria) VALUES
('Bondiola', 50.00, 'carnes', 14),
('Lomito', 50.00, 'carnes', 15),
('Papas fritas', 50.00, 'especiales', 16),
('Peperoni', 50.00, 'carnes', 17),
('Huevo frito', 50.00, 'proteinas', 18);

-- Extras de $80
INSERT INTO extras (nombre, precio, categoria, orden_categoria) VALUES
('Ananá', 80.00, 'especiales', 19),
('Roquefort', 80.00, 'quesos', 20),
('Champiñones', 80.00, 'vegetales', 21),
('Palmitos', 80.00, 'especiales', 22),
('Panchos', 80.00, 'especiales', 23);

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista de pedidos con información de cliente
CREATE VIEW vista_pedidos_completa AS
SELECT 
    p.id,
    p.numero_pedido,
    p.estado,
    p.total,
    p.fecha_pedido,
    p.fecha_entrega,
    c.telefono,
    c.nombre as cliente_nombre,
    c.direccion,
    COUNT(pi.id) as cantidad_items
FROM pedidos p
LEFT JOIN clientes c ON p.cliente_id = c.id
LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
GROUP BY p.id, c.id;

-- Vista de estadísticas diarias
CREATE VIEW vista_stats_diarias AS
SELECT 
    DATE(fecha_pedido) as fecha,
    COUNT(*) as total_pedidos,
    COUNT(CASE WHEN estado = 'entregado' THEN 1 END) as pedidos_entregados,
    COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as pedidos_cancelados,
    SUM(CASE WHEN estado = 'entregado' THEN total ELSE 0 END) as ingresos_total,
    AVG(CASE WHEN estado = 'entregado' THEN total END) as ticket_promedio
FROM pedidos
GROUP BY DATE(fecha_pedido)
ORDER BY fecha DESC;

-- ========================================
-- COMENTARIOS DE TABLAS
-- ========================================

COMMENT ON TABLE pizzas IS 'Catálogo de pizzas disponibles en el menú';
COMMENT ON TABLE extras IS 'Ingredientes extra disponibles para agregar a las pizzas';
COMMENT ON TABLE clientes IS 'Registro de clientes con historial de compras';
COMMENT ON TABLE pedidos IS 'Pedidos realizados por los clientes';
COMMENT ON TABLE pedido_items IS 'Items individuales de cada pedido con detalles de personalización';
COMMENT ON TABLE historial_estados IS 'Seguimiento de cambios de estado de los pedidos';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos Pizza Pachorra inicializada correctamente';
    RAISE NOTICE 'Pizzas registradas: %', (SELECT COUNT(*) FROM pizzas);
    RAISE NOTICE 'Extras registrados: %', (SELECT COUNT(*) FROM extras);
END $$;