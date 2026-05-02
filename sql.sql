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