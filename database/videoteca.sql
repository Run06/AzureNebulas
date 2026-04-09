-- ============================================
-- BASE DE DATOS: SISTEMA DE VIDEOTECA
-- ============================================
-- Autor: Sistema de diseño de BD
-- Fecha: 2026-04-09
-- Descripción: Sistema de gestión de videoteca con usuarios y administradores
-- ============================================

-- Eliminar la base de datos si existe (solo para desarrollo/testing)
DROP DATABASE IF EXISTS videoteca_db;

-- Crear la base de datos
CREATE DATABASE videoteca_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Seleccionar la base de datos
USE videoteca_db;

-- ============================================
-- TABLA: tipos_usuario
-- ============================================
-- Descripción: Catálogo de tipos de usuarios del sistema
-- Valores esperados: 'ADMINISTRADOR', 'USUARIO'
-- ============================================
CREATE TABLE tipos_usuario (
    id_tipo_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para optimización
    INDEX idx_nombre_tipo (nombre_tipo)
) ENGINE=InnoDB COMMENT='Catálogo de tipos de usuario del sistema';

-- ============================================
-- TABLA: usuarios
-- ============================================
-- Descripción: Almacena todos los usuarios del sistema (normales y administradores)
-- Relaciones: tipos_usuario (FK)
-- ============================================
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Hash de la contraseña (nunca en texto plano)
    id_tipo_usuario INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE, -- Permite desactivar usuarios sin eliminarlos
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (id_tipo_usuario) REFERENCES tipos_usuario(id_tipo_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT, -- No permitir eliminar tipos si hay usuarios asociados
    
    -- Índices para optimización de consultas
    INDEX idx_nombre_usuario (nombre_usuario),
    INDEX idx_email (email),
    INDEX idx_tipo_usuario (id_tipo_usuario),
    INDEX idx_activo (activo)
) ENGINE=InnoDB COMMENT='Usuarios del sistema (administradores y usuarios normales)';

-- ============================================
-- TABLA: generos
-- ============================================
-- Descripción: Catálogo de géneros cinematográficos
-- Ejemplos: Acción, Drama, Comedia, Terror, Ciencia Ficción
-- ============================================
CREATE TABLE generos (
    id_genero INT PRIMARY KEY AUTO_INCREMENT,
    nombre_genero VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_nombre_genero (nombre_genero)
) ENGINE=InnoDB COMMENT='Catálogo de géneros cinematográficos';

-- ============================================
-- TABLA: directores
-- ============================================
-- Descripción: Información de directores de películas
-- ============================================
CREATE TABLE directores (
    id_director INT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(200) NOT NULL,
    fecha_nacimiento DATE,
    nacionalidad VARCHAR(100),
    biografia TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_nombre_director (nombre_completo)
) ENGINE=InnoDB COMMENT='Directores de películas';

-- ============================================
-- TABLA: peliculas
-- ============================================
-- Descripción: Catálogo principal de películas de la videoteca
-- Relaciones: generos (FK), directores (FK)
-- ============================================
CREATE TABLE peliculas (
    id_pelicula INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    titulo_original VARCHAR(255),
    anio_produccion YEAR,
    duracion_minutos INT,
    id_genero INT,
    id_director INT,
    sinopsis TEXT,
    clasificacion_edad VARCHAR(10), -- G, PG, PG-13, R, etc.
    pais_origen VARCHAR(100),
    idioma_original VARCHAR(50),
    formato VARCHAR(50), -- DVD, Blu-ray, 4K, etc.
    numero_copias_disponibles INT DEFAULT 0,
    numero_copias_total INT DEFAULT 0,
    precio_alquiler DECIMAL(10, 2),
    portada_url VARCHAR(500), -- URL de la imagen de portada
    activa BOOLEAN DEFAULT TRUE, -- Para baja lógica
    fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (id_genero) REFERENCES generos(id_genero)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (id_director) REFERENCES directores(id_director)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    
    -- Restricciones de integridad
    CHECK (numero_copias_disponibles >= 0),
    CHECK (numero_copias_disponibles <= numero_copias_total),
    CHECK (duracion_minutos > 0),
    CHECK (precio_alquiler >= 0),
    
    -- Índices
    INDEX idx_titulo (titulo),
    INDEX idx_anio (anio_produccion),
    INDEX idx_genero (id_genero),
    INDEX idx_director (id_director),
    INDEX idx_activa (activa)
) ENGINE=InnoDB COMMENT='Catálogo de películas de la videoteca';

-- ============================================
-- TABLA: historial_peliculas
-- ============================================
-- Descripción: Auditoría de cambios en películas (altas, bajas, modificaciones)
-- Propósito: Trazabilidad de quién hizo qué cambio y cuándo
-- ============================================
CREATE TABLE historial_peliculas (
    id_historial INT PRIMARY KEY AUTO_INCREMENT,
    id_pelicula INT NOT NULL,
    id_administrador INT NOT NULL, -- Usuario que realizó la acción
    tipo_operacion ENUM('ALTA', 'BAJA', 'MODIFICACION') NOT NULL,
    descripcion_cambio TEXT, -- Detalle de qué se modificó
    datos_anteriores JSON, -- Estado anterior en formato JSON
    datos_nuevos JSON, -- Estado nuevo en formato JSON
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (id_pelicula) REFERENCES peliculas(id_pelicula)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (id_administrador) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT, -- No eliminar usuario si tiene historial
    
    -- Índices
    INDEX idx_pelicula (id_pelicula),
    INDEX idx_administrador (id_administrador),
    INDEX idx_tipo_operacion (tipo_operacion),
    INDEX idx_fecha (fecha_operacion)
) ENGINE=InnoDB COMMENT='Historial de operaciones sobre películas (auditoría)';

-- ============================================
-- TABLA: alquileres
-- ============================================
-- Descripción: Registro de alquileres de películas por usuarios
-- Relaciones: usuarios (FK), peliculas (FK)
-- ============================================
CREATE TABLE alquileres (
    id_alquiler INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_pelicula INT NOT NULL,
    fecha_alquiler TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion_prevista DATE NOT NULL,
    fecha_devolucion_real DATE,
    precio_cobrado DECIMAL(10, 2) NOT NULL,
    estado ENUM('ACTIVO', 'DEVUELTO', 'RETRASADO', 'PERDIDO') DEFAULT 'ACTIVO',
    observaciones TEXT,
    
    -- Claves foráneas
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_pelicula) REFERENCES peliculas(id_pelicula)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_usuario (id_usuario),
    INDEX idx_pelicula (id_pelicula),
    INDEX idx_estado (estado),
    INDEX idx_fecha_alquiler (fecha_alquiler),
    INDEX idx_fecha_devolucion (fecha_devolucion_prevista)
) ENGINE=InnoDB COMMENT='Registro de alquileres de películas';

-- ============================================
-- DATOS INICIALES (SEED DATA)
-- ============================================

-- Insertar tipos de usuario
INSERT INTO tipos_usuario (nombre_tipo, descripcion) VALUES
    ('ADMINISTRADOR', 'Usuario con permisos completos para gestionar el catálogo de películas'),
    ('USUARIO', 'Usuario normal que puede alquilar películas');

-- Insertar géneros cinematográficos
INSERT INTO generos (nombre_genero, descripcion) VALUES
    ('Acción', 'Películas con secuencias de acción y aventuras'),
    ('Drama', 'Películas dramáticas con enfoque en emociones y conflictos'),
    ('Comedia', 'Películas humorísticas y ligeras'),
    ('Terror', 'Películas de miedo y suspense'),
    ('Ciencia Ficción', 'Películas con elementos futuristas y tecnológicos'),
    ('Romance', 'Películas centradas en historias de amor'),
    ('Thriller', 'Películas de suspenso y tensión'),
    ('Animación', 'Películas animadas para todos los públicos');

-- Insertar algunos directores de ejemplo
INSERT INTO directores (nombre_completo, nacionalidad) VALUES
    ('Christopher Nolan', 'Británico'),
    ('Steven Spielberg', 'Estadounidense'),
    ('Quentin Tarantino', 'Estadounidense'),
    ('Martin Scorsese', 'Estadounidense');

-- Insertar usuario administrador por defecto
-- NOTA: En producción, el password debe hashearse con un algoritmo seguro (bcrypt, argon2, etc.)
INSERT INTO usuarios (nombre, apellidos, email, nombre_usuario, password_hash, id_tipo_usuario) VALUES
    ('Admin', 'Sistema', 'admin@videoteca.com', 'admin', 
     'hash_password_seguro_aqui', 1);

-- Insertar algunos usuarios normales de ejemplo
INSERT INTO usuarios (nombre, apellidos, email, telefono, nombre_usuario, password_hash, id_tipo_usuario) VALUES
    ('Juan', 'García López', 'juan.garcia@email.com', '600123456', 'jgarcia', 
     'hash_password_aqui', 2),
    ('María', 'Rodríguez Pérez', 'maria.rodriguez@email.com', '610987654', 'mrodriguez', 
     'hash_password_aqui', 2);

-- Insertar películas de ejemplo
INSERT INTO peliculas (titulo, titulo_original, anio_produccion, duracion_minutos, id_genero, 
                       id_director, sinopsis, clasificacion_edad, formato, 
                       numero_copias_total, numero_copias_disponibles, precio_alquiler) VALUES
    ('El Caballero Oscuro', 'The Dark Knight', 2008, 152, 1, 1, 
     'Batman debe aceptar una de las pruebas psicológicas y físicas más grandes de su habilidad para luchar contra la injusticia.',
     'PG-13', 'Blu-ray', 3, 3, 3.50),
    ('Origen', 'Inception', 2010, 148, 5, 1,
     'Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños.',
     'PG-13', 'Blu-ray', 2, 2, 4.00),
    ('Pulp Fiction', 'Pulp Fiction', 1994, 154, 7, 3,
     'Las vidas de dos sicarios, un boxeador, la esposa de un gángster y dos bandidos se entrelazan.',
     'R', 'DVD', 2, 1, 3.00);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Películas disponibles con información completa
CREATE OR REPLACE VIEW v_peliculas_disponibles AS
SELECT 
    p.id_pelicula,
    p.titulo,
    p.titulo_original,
    p.anio_produccion,
    p.duracion_minutos,
    g.nombre_genero AS genero,
    d.nombre_completo AS director,
    p.clasificacion_edad,
    p.formato,
    p.numero_copias_disponibles,
    p.precio_alquiler,
    p.portada_url
FROM peliculas p
LEFT JOIN generos g ON p.id_genero = g.id_genero
LEFT JOIN directores d ON p.id_director = d.id_director
WHERE p.activa = TRUE AND p.numero_copias_disponibles > 0
ORDER BY p.titulo;

-- Vista: Alquileres activos con información de usuario y película
CREATE OR REPLACE VIEW v_alquileres_activos AS
SELECT 
    a.id_alquiler,
    u.nombre_usuario,
    CONCAT(u.nombre, ' ', u.apellidos) AS nombre_completo_usuario,
    p.titulo AS titulo_pelicula,
    a.fecha_alquiler,
    a.fecha_devolucion_prevista,
    DATEDIFF(a.fecha_devolucion_prevista, CURDATE()) AS dias_restantes,
    a.estado
FROM alquileres a
INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
INNER JOIN peliculas p ON a.id_pelicula = p.id_pelicula
WHERE a.estado = 'ACTIVO'
ORDER BY a.fecha_devolucion_prevista;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

-- Procedimiento: Registrar alta de película (con auditoría)
DELIMITER //
CREATE PROCEDURE sp_alta_pelicula(
    IN p_id_admin INT,
    IN p_titulo VARCHAR(255),
    IN p_titulo_original VARCHAR(255),
    IN p_anio YEAR,
    IN p_duracion INT,
    IN p_id_genero INT,
    IN p_id_director INT,
    IN p_sinopsis TEXT,
    IN p_clasificacion VARCHAR(10),
    IN p_formato VARCHAR(50),
    IN p_copias INT,
    IN p_precio DECIMAL(10,2)
)
BEGIN
    DECLARE v_id_pelicula INT;
    
    -- Verificar que el usuario es administrador
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id_usuario = p_id_admin AND id_tipo_usuario = 1
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: El usuario no tiene permisos de administrador';
    END IF;
    
    -- Insertar la película
    INSERT INTO peliculas (
        titulo, titulo_original, anio_produccion, duracion_minutos,
        id_genero, id_director, sinopsis, clasificacion_edad,
        formato, numero_copias_total, numero_copias_disponibles, precio_alquiler
    ) VALUES (
        p_titulo, p_titulo_original, p_anio, p_duracion,
        p_id_genero, p_id_director, p_sinopsis, p_clasificacion,
        p_formato, p_copias, p_copias, p_precio
    );
    
    SET v_id_pelicula = LAST_INSERT_ID();
    
    -- Registrar en historial
    INSERT INTO historial_peliculas (
        id_pelicula, id_administrador, tipo_operacion, descripcion_cambio
    ) VALUES (
        v_id_pelicula, p_id_admin, 'ALTA', 
        CONCAT('Alta de película: ', p_titulo)
    );
    
    SELECT v_id_pelicula AS id_pelicula_creada;
END //
DELIMITER ;

-- Procedimiento: Registrar baja lógica de película
DELIMITER //
CREATE PROCEDURE sp_baja_pelicula(
    IN p_id_admin INT,
    IN p_id_pelicula INT,
    IN p_motivo TEXT
)
BEGIN
    -- Verificar permisos de administrador
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id_usuario = p_id_admin AND id_tipo_usuario = 1
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: El usuario no tiene permisos de administrador';
    END IF;
    
    -- Actualizar película (baja lógica)
    UPDATE peliculas 
    SET activa = FALSE,
        fecha_ultima_modificacion = CURRENT_TIMESTAMP
    WHERE id_pelicula = p_id_pelicula;
    
    -- Registrar en historial
    INSERT INTO historial_peliculas (
        id_pelicula, id_administrador, tipo_operacion, descripcion_cambio
    ) VALUES (
        p_id_pelicula, p_id_admin, 'BAJA', p_motivo
    );
    
    SELECT CONCAT('Película ID ', p_id_pelicula, ' dada de baja correctamente') AS resultado;
END //
DELIMITER ;

-- Procedimiento: Modificar película
DELIMITER //
CREATE PROCEDURE sp_modificar_pelicula(
    IN p_id_admin INT,
    IN p_id_pelicula INT,
    IN p_titulo VARCHAR(255),
    IN p_anio YEAR,
    IN p_precio DECIMAL(10,2),
    IN p_descripcion_cambio TEXT
)
BEGIN
    -- Verificar permisos
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id_usuario = p_id_admin AND id_tipo_usuario = 1
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: El usuario no tiene permisos de administrador';
    END IF;
    
    -- Actualizar película
    UPDATE peliculas 
    SET titulo = COALESCE(p_titulo, titulo),
        anio_produccion = COALESCE(p_anio, anio_produccion),
        precio_alquiler = COALESCE(p_precio, precio_alquiler),
        fecha_ultima_modificacion = CURRENT_TIMESTAMP
    WHERE id_pelicula = p_id_pelicula;
    
    -- Registrar en historial
    INSERT INTO historial_peliculas (
        id_pelicula, id_administrador, tipo_operacion, descripcion_cambio
    ) VALUES (
        p_id_pelicula, p_id_admin, 'MODIFICACION', p_descripcion_cambio
    );
    
    SELECT CONCAT('Película ID ', p_id_pelicula, ' modificada correctamente') AS resultado;
END //
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Actualizar copias disponibles al crear alquiler
DELIMITER //
CREATE TRIGGER tr_alquiler_insert AFTER INSERT ON alquileres
FOR EACH ROW
BEGIN
    IF NEW.estado = 'ACTIVO' THEN
        UPDATE peliculas 
        SET numero_copias_disponibles = numero_copias_disponibles - 1
        WHERE id_pelicula = NEW.id_pelicula;
    END IF;
END //
DELIMITER ;

-- Trigger: Actualizar copias disponibles al devolver película
DELIMITER //
CREATE TRIGGER tr_alquiler_update AFTER UPDATE ON alquileres
FOR EACH ROW
BEGIN
    IF OLD.estado = 'ACTIVO' AND NEW.estado = 'DEVUELTO' THEN
        UPDATE peliculas 
        SET numero_copias_disponibles = numero_copias_disponibles + 1
        WHERE id_pelicula = NEW.id_pelicula;
    END IF;
END //
DELIMITER ;

-- ============================================
-- CONSULTAS DE EJEMPLO Y VERIFICACIÓN
-- ============================================

-- Consulta: Ver todas las películas disponibles
SELECT * FROM v_peliculas_disponibles;

-- Consulta: Ver historial de operaciones
SELECT 
    h.fecha_operacion,
    h.tipo_operacion,
    p.titulo AS pelicula,
    u.nombre_usuario AS administrador,
    h.descripcion_cambio
FROM historial_peliculas h
INNER JOIN peliculas p ON h.id_pelicula = p.id_pelicula
INNER JOIN usuarios u ON h.id_administrador = u.id_usuario
ORDER BY h.fecha_operacion DESC;

-- Consulta: Estadísticas de películas por género
SELECT 
    g.nombre_genero,
    COUNT(p.id_pelicula) AS total_peliculas,
    SUM(p.numero_copias_total) AS total_copias
FROM generos g
LEFT JOIN peliculas p ON g.id_genero = p.id_genero AND p.activa = TRUE
GROUP BY g.id_genero, g.nombre_genero
ORDER BY total_peliculas DESC;