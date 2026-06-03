-- MYSQL Script to create the database and tables for the SaludYa application.

CREATE DATABASE saludya_db;
USE saludya_db;

CREATE TABLE usuarios (
    id_usuario VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'paciente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- alteracion de tabla para el reset de contraseña
ALTER TABLE usuarios ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL;
ALTER TABLE usuarios ADD COLUMN reset_expires TIMESTAMP NULL DEFAULT NULL;


-- Usuario de prueba
-- user: gmzqzvz@gmailcom 
-- password: Va270300*

-- Email: medico@saludya.com
-- Password temporal: Medico123*

CREATE TABLE citas (
    id_cita VARCHAR(36) PRIMARY KEY,
    id_usuario VARCHAR(36),
    fecha_hora DATETIME NOT NULL,
    motivo TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);


-- postgres script to create the database and tables for the SaludYa application.

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

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS numero_contacto VARCHAR(30);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS edad INTEGER;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS direccion TEXT;


