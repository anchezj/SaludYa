CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'paciente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_expires TIMESTAMP NULL DEFAULT NULL,
    numero_contacto VARCHAR(30),
    edad INTEGER,
    fecha_nacimiento DATE,
    direccion TEXT
);

CREATE TABLE IF NOT EXISTS citas (
    id_cita VARCHAR(36) PRIMARY KEY,
    id_usuario VARCHAR(36) REFERENCES usuarios(id_usuario),
    fecha_hora TIMESTAMP NOT NULL,
    motivo TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
