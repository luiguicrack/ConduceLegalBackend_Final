-- Migración inicial basada en tu BD actual de phpMyAdmin
SET FOREIGN_KEY_CHECKS=0;

-- Tabla: rol (como la tienes actualmente)
CREATE TABLE IF NOT EXISTS rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla: usuarios (con tu estructura actual)
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuarios INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    correo VARCHAR(50),
    estado TINYINT(1) NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- Insertar roles EXACTAMENTE como los tienes
INSERT IGNORE INTO rol (id_rol, nombre_rol) VALUES 
(1, 'admin'),
(2, 'conductor'),
(3, 'analista'),
(4, 'consultor_legal');

SET FOREIGN_KEY_CHECKS=1;